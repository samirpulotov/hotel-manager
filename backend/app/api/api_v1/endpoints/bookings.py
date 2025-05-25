from typing import List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.api import deps
from app.crud.hotel import booking, room, guest, financial_transaction
from app.schemas.hotel import Booking, BookingCreate, BookingUpdate, FinancialTransactionCreate
from app.models.hotel import BookingStatus, Booking as BookingModel, FinancialTransaction, RoomTariff
from datetime import date, timedelta
from app.models.user import User
from app.crud import hotel as crud
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/", response_model=List[Booking])
def read_bookings(
    db: Session = Depends(deps.get_db),
    guest_id: Optional[int] = None,
    room_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve bookings.
    """
    query = db.query(BookingModel)
    if guest_id is not None:
        query = query.filter(BookingModel.guest_id == guest_id)
    if room_id is not None:
        query = query.filter(BookingModel.room_id == room_id)
    bookings = query.offset(skip).limit(limit).all()
    return bookings

@router.post("/", response_model=Booking)
def create_booking(
    *,
    db: Session = Depends(deps.get_db),
    booking_in: BookingCreate,
):
    """
    Create new booking.
    """
    # Check if guest exists
    guest_obj = guest.get(db, id=booking_in.guest_id)
    if not guest_obj:
        raise HTTPException(
            status_code=404,
            detail="Guest not found",
        )

    # Check if room exists and is available
    room_obj = room.get(db, id=booking_in.room_id)
    if not room_obj:
        raise HTTPException(
            status_code=404,
            detail="Room not found",
        )
    if not room_obj.is_available:
        raise HTTPException(
            status_code=400,
            detail="Room is not available",
        )

    # Check if room is already booked for the given dates
    existing_bookings = booking.get_by_room(
        db,
        room_id=booking_in.room_id,
        skip=0,
        limit=100,
    )
    for existing_booking in existing_bookings:
        if (
            existing_booking.status != BookingStatus.cancelled
            and (
                (booking_in.check_in_date <= existing_booking.check_out_date)
                and (booking_in.check_out_date >= existing_booking.check_in_date)
            )
        ):
            raise HTTPException(
                status_code=400,
                detail="Room is already booked for these dates",
            )

    # Calculate number of nights
    nights = (booking_in.check_out_date - booking_in.check_in_date).days

    # Fetch all tariffs for the room type and check-in date
    tariffs = db.query(RoomTariff).filter(
        RoomTariff.room_type == room_obj.type,
        RoomTariff.start_date <= booking_in.check_in_date,
        RoomTariff.end_date >= booking_in.check_in_date
    ).order_by(RoomTariff.min_nights.desc()).all()

    if not tariffs:
        raise HTTPException(
            status_code=400,
            detail="No tariff found for this room type and date"
        )

    # Find the appropriate tariff based on stay duration
    selected_tariff = None
    for tariff in tariffs:
        if nights >= tariff.min_nights:
            selected_tariff = tariff
            break

    if not selected_tariff:
        raise HTTPException(
            status_code=400,
            detail=f"No tariff found for {nights} nights stay"
        )

    # Calculate total price based on selected tariff
    total_price = 0
    current_date = booking_in.check_in_date
    while current_date < booking_in.check_out_date:
        # Check if it's a weekend night (Friday or Saturday)
        is_weekend = current_date.weekday() in [4, 5]  # 4 is Friday, 5 is Saturday
        logger.info(f"Date: {current_date}, is_weekend: {is_weekend}, weekday: {current_date.weekday()}")
        logger.info(f"Weekend price: {selected_tariff.weekend_price_per_night}, Regular price: {selected_tariff.price_per_night}")
        
        if is_weekend and selected_tariff.weekend_price_per_night is not None:
            logger.info(f"Using weekend price: {selected_tariff.weekend_price_per_night}")
            total_price += selected_tariff.weekend_price_per_night
        else:
            logger.info(f"Using regular price: {selected_tariff.price_per_night}")
            total_price += selected_tariff.price_per_night
        # Use timedelta to correctly increment the date
        current_date = current_date + timedelta(days=1)

    logger.info(f"Final total price: {total_price}")

    # Add total_price to booking data
    booking_data = booking_in.model_dump()
    booking_data["total_price"] = total_price

    # Create booking
    booking_obj = booking.create(db, obj_in=BookingCreate(**booking_data))
    
    # Update room availability
    room.update(
        db,
        db_obj=room_obj,
        obj_in={"is_available": False},
    )

    return booking_obj

@router.get("/{booking_id}", response_model=Booking)
def read_booking(
    *,
    db: Session = Depends(deps.get_db),
    booking_id: int,
):
    """
    Get booking by ID.
    """
    booking_obj = booking.get(db, id=booking_id)
    if not booking_obj:
        raise HTTPException(
            status_code=404,
            detail="Booking not found",
        )
    return booking_obj

@router.put("/{booking_id}", response_model=Booking)
def update_booking(
    *,
    db: Session = Depends(deps.get_db),
    booking_id: int,
    booking_in: BookingUpdate,
):
    """
    Update booking.
    """
    booking_obj = booking.get(db, id=booking_id)
    if not booking_obj:
        raise HTTPException(
            status_code=404,
            detail="Booking not found",
        )

    # Get the room
    room_obj = room.get(db, id=booking_obj.room_id)
    if not room_obj:
        raise HTTPException(
            status_code=404,
            detail="Room not found",
        )

    # Create update data
    update_data = booking_in.model_dump(exclude_unset=True)
    
    # Update room availability based on booking status
    if "status" in update_data:
        new_status = update_data["status"]
        if new_status == BookingStatus.cancelled:
            room.update(
                db,
                db_obj=room_obj,
                obj_in={"is_available": True},
            )
        elif new_status == BookingStatus.checked_in:
            room.update(
                db,
                db_obj=room_obj,
                obj_in={"is_available": False},
            )
        elif new_status == BookingStatus.checked_out:
            room.update(
                db,
                db_obj=room_obj,
                obj_in={"is_available": True},
            )
        # Directly update the status
        booking_obj.status = new_status
        db.add(booking_obj)
        db.commit()
        db.refresh(booking_obj)

    # Update other fields if present
    if len(update_data) > 1 or "status" not in update_data:
        other_updates = {k: v for k, v in update_data.items() if k != "status"}
        if other_updates:
            booking_obj = booking.update(db, db_obj=booking_obj, obj_in=BookingUpdate(**other_updates))

    # Create a financial transaction if payment_status is updated to 'paid'
    if update_data.get("payment_status") == "paid":
        # Check if a transaction already exists for this booking
        existing_transaction = db.query(FinancialTransaction).filter(
            FinancialTransaction.booking_id == booking_obj.id,
            FinancialTransaction.transaction_type == "income",
            FinancialTransaction.category == "оплата_бронирования"
        ).first()
        
        if not existing_transaction:
            transaction_in = FinancialTransactionCreate(
                booking_id=booking_obj.id,
                amount=booking_obj.total_price,
                transaction_type="income",
                category="оплата_бронирования",
                description=f"Оплата за бронирование #{booking_obj.id}",
                payment_method="cash",  # or whatever is appropriate
                transaction_date=date.today()
            )
            financial_transaction.create(db, obj_in=transaction_in)

    return booking_obj

@router.delete("/{booking_id}", response_model=dict)
def delete_booking(
    booking_id: int,
    db: Session = Depends(deps.get_db)
):
    booking_obj = booking.get(db, id=booking_id)
    if not booking_obj:
        raise HTTPException(status_code=404, detail="Booking not found")
    booking.remove(db, id=booking_id)
    return {"message": "Booking deleted", "booking_id": booking_id}

@router.post("/{booking_id}/checkin", response_model=Booking)
def check_in_booking(
    *,
    db: Session = Depends(deps.get_db),
    booking_id: int,
):
    """
    Check in a guest for a booking.
    """
    try:
        booking_obj = booking.check_in(db, booking_id=booking_id)
        if not booking_obj:
            raise HTTPException(status_code=404, detail="Booking not found")
        return booking_obj
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 