from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.api import deps
from app.crud.hotel import financial_transaction, booking
from app.schemas.hotel import FinancialTransaction, FinancialTransactionCreate, FinancialTransactionUpdate

router = APIRouter()

@router.get("/", response_model=List[FinancialTransaction])
def read_transactions(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    booking_id: Optional[int] = None,
):
    """
    Retrieve financial transactions.
    """
    if booking_id:
        transactions = financial_transaction.get_by_booking(
            db, booking_id=booking_id, skip=skip, limit=limit
        )
    else:
        transactions = financial_transaction.get_multi(db, skip=skip, limit=limit)
    return transactions

@router.post("/", response_model=FinancialTransaction)
def create_transaction(
    *,
    db: Session = Depends(deps.get_db),
    transaction_in: FinancialTransactionCreate,
):
    """
    Create new financial transaction.
    """
    # If transaction is linked to a booking, verify the booking exists
    if transaction_in.booking_id:
        booking_obj = booking.get(db, id=transaction_in.booking_id)
        if not booking_obj:
            raise HTTPException(
                status_code=404,
                detail="Booking not found",
            )

    transaction_obj = financial_transaction.create(db, obj_in=transaction_in)
    return transaction_obj

@router.get("/{transaction_id}", response_model=FinancialTransaction)
def read_transaction(
    *,
    db: Session = Depends(deps.get_db),
    transaction_id: int,
):
    """
    Get financial transaction by ID.
    """
    transaction_obj = financial_transaction.get(db, id=transaction_id)
    if not transaction_obj:
        raise HTTPException(
            status_code=404,
            detail="Financial transaction not found",
        )
    return transaction_obj

@router.put("/{transaction_id}", response_model=FinancialTransaction)
def update_transaction(
    *,
    db: Session = Depends(deps.get_db),
    transaction_id: int,
    transaction_in: FinancialTransactionUpdate,
):
    """
    Update financial transaction.
    """
    transaction_obj = financial_transaction.get(db, id=transaction_id)
    if not transaction_obj:
        raise HTTPException(
            status_code=404,
            detail="Financial transaction not found",
        )

    # If transaction is being linked to a booking, verify the booking exists
    if transaction_in.booking_id:
        booking_obj = booking.get(db, id=transaction_in.booking_id)
        if not booking_obj:
            raise HTTPException(
                status_code=404,
                detail="Booking not found",
            )

    transaction_obj = financial_transaction.update(
        db, db_obj=transaction_obj, obj_in=transaction_in
    )
    return transaction_obj

@router.delete("/{transaction_id}", response_model=FinancialTransaction)
def delete_transaction(
    *,
    db: Session = Depends(deps.get_db),
    transaction_id: int,
):
    """
    Delete financial transaction.
    """
    transaction_obj = financial_transaction.get(db, id=transaction_id)
    if not transaction_obj:
        raise HTTPException(
            status_code=404,
            detail="Financial transaction not found",
        )
    transaction_obj = financial_transaction.remove(db, id=transaction_id)
    return transaction_obj 