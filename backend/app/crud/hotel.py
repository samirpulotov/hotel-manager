from typing import List, Optional, Union, Dict, Any
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.hotel import Room, Guest, Booking, Employee, FinancialTransaction, RoomTariff
from app.schemas.hotel import (
    RoomCreate, RoomUpdate,
    GuestCreate, GuestUpdate,
    BookingCreate, BookingUpdate,
    EmployeeCreate, EmployeeUpdate,
    FinancialTransactionCreate, FinancialTransactionUpdate,
    RoomTariffCreate, RoomTariffUpdate
)
from datetime import date

class CRUDRoom(CRUDBase[Room, RoomCreate, RoomUpdate]):
    def get_by_number(self, db: Session, *, number: str) -> Optional[Room]:
        return db.query(Room).filter(Room.number == number).first()

    def get_available_rooms(
        self, db: Session, *, skip: int = 0, limit: int = 100
    ) -> List[Room]:
        return (
            db.query(Room)
            .filter(Room.is_available == True)
            .offset(skip)
            .limit(limit)
            .all()
        )

class CRUDGuest(CRUDBase[Guest, GuestCreate, GuestUpdate]):
    def get_by_email(self, db: Session, *, email: str) -> Optional[Guest]:
        return db.query(Guest).filter(Guest.email == email).first()

class CRUDBooking(CRUDBase[Booking, BookingCreate, BookingUpdate]):
    def get_by_guest(
        self, db: Session, *, guest_id: int, skip: int = 0, limit: int = 100
    ) -> List[Booking]:
        return (
            db.query(Booking)
            .filter(Booking.guest_id == guest_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_room(
        self, db: Session, *, room_id: int, skip: int = 0, limit: int = 100
    ) -> List[Booking]:
        return (
            db.query(Booking)
            .filter(Booking.room_id == room_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def check_in(self, db: Session, *, booking_id: int) -> Optional[Booking]:
        booking = db.query(Booking).filter(Booking.id == booking_id).first()
        if not booking:
            return None
        
        if booking.status != "confirmed":
            raise ValueError("Only confirmed bookings can be checked in")
            
        booking.status = "checked_in"
        db.add(booking)
        
        # Update room availability
        room = db.query(Room).filter(Room.id == booking.room_id).first()
        if room:
            room.is_available = False
            db.add(room)
            
        db.commit()
        db.refresh(booking)
        return booking

class CRUDEmployee(CRUDBase[Employee, EmployeeCreate, EmployeeUpdate]):
    def get_by_email(self, db: Session, *, email: str) -> Optional[Employee]:
        return db.query(Employee).filter(Employee.email == email).first()

    def get_active_employees(
        self, db: Session, *, skip: int = 0, limit: int = 100
    ) -> List[Employee]:
        return (
            db.query(Employee)
            .filter(Employee.is_active == True)
            .offset(skip)
            .limit(limit)
            .all()
        )

class CRUDFinancialTransaction(CRUDBase[FinancialTransaction, FinancialTransactionCreate, FinancialTransactionUpdate]):
    def get_by_booking(
        self, db: Session, *, booking_id: int, skip: int = 0, limit: int = 100
    ) -> List[FinancialTransaction]:
        return (
            db.query(FinancialTransaction)
            .filter(FinancialTransaction.booking_id == booking_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

def get_tariff(db: Session, id: int):
    return db.query(RoomTariff).filter(RoomTariff.id == id).first()

def get_tariffs(
    db: Session, *, skip: int = 0, limit: int = 100, room_type: Optional[str] = None
):
    query = db.query(RoomTariff)
    if room_type:
        query = query.filter(RoomTariff.room_type == room_type)
    return query.offset(skip).limit(limit).all()

def get_current_tariff(db: Session, room_type: str, target_date: date):
    return db.query(RoomTariff).filter(
        RoomTariff.room_type == room_type,
        RoomTariff.start_date <= target_date,
        RoomTariff.end_date >= target_date
    ).first()

def create_tariff(db: Session, *, obj_in: RoomTariffCreate):
    db_obj = RoomTariff(
        room_type=obj_in.room_type,
        price_per_night=obj_in.price_per_night,
        min_nights=obj_in.min_nights,
        start_date=obj_in.start_date,
        end_date=obj_in.end_date,
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update_tariff(
    db: Session, *, db_obj: RoomTariff, obj_in: Union[RoomTariffUpdate, Dict[str, Any]]
):
    if isinstance(obj_in, dict):
        update_data = obj_in
    else:
        update_data = obj_in.dict(exclude_unset=True)
    for field in update_data:
        setattr(db_obj, field, update_data[field])
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def remove_tariff(db: Session, *, id: int):
    obj = db.query(RoomTariff).get(id)
    db.delete(obj)
    db.commit()
    return obj

room = CRUDRoom(Room)
guest = CRUDGuest(Guest)
booking = CRUDBooking(Booking)
employee = CRUDEmployee(Employee)
financial_transaction = CRUDFinancialTransaction(FinancialTransaction) 