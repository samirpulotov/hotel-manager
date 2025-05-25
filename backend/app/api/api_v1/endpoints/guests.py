from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.api import deps
from app.crud.hotel import guest
from app.schemas.hotel import Guest, GuestCreate, GuestUpdate

router = APIRouter()

@router.get("/", response_model=List[Guest])
def read_guests(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
):
    """
    Retrieve guests.
    """
    guests = guest.get_multi(db, skip=skip, limit=limit)
    return guests

@router.post("/", response_model=Guest)
def create_guest(
    *,
    db: Session = Depends(deps.get_db),
    guest_in: GuestCreate,
):
    """
    Create new guest.
    """
    guest_obj = guest.get_by_email(db, email=guest_in.email)
    if guest_obj:
        raise HTTPException(
            status_code=400,
            detail="A guest with this email already exists",
        )
    guest_obj = guest.create(db, obj_in=guest_in)
    return guest_obj

@router.get("/{guest_id}", response_model=Guest)
def read_guest(
    *,
    db: Session = Depends(deps.get_db),
    guest_id: int,
):
    """
    Get guest by ID.
    """
    guest_obj = guest.get(db, id=guest_id)
    if not guest_obj:
        raise HTTPException(
            status_code=404,
            detail="Guest not found",
        )
    return guest_obj

@router.put("/{guest_id}", response_model=Guest)
def update_guest(
    *,
    db: Session = Depends(deps.get_db),
    guest_id: int,
    guest_in: GuestUpdate,
):
    """
    Update guest.
    """
    guest_obj = guest.get(db, id=guest_id)
    if not guest_obj:
        raise HTTPException(
            status_code=404,
            detail="Guest not found",
        )
    guest_obj = guest.update(db, db_obj=guest_obj, obj_in=guest_in)
    return guest_obj

@router.delete("/{guest_id}", response_model=Guest)
def delete_guest(
    *,
    db: Session = Depends(deps.get_db),
    guest_id: int,
):
    """
    Delete guest.
    """
    guest_obj = guest.get(db, id=guest_id)
    if not guest_obj:
        raise HTTPException(
            status_code=404,
            detail="Guest not found",
        )
    guest_obj = guest.remove(db, id=guest_id)
    return guest_obj 