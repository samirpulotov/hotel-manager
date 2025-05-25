from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.api import deps
from app.crud.hotel import room
from app.schemas.hotel import Room, RoomCreate, RoomUpdate

router = APIRouter()

@router.get("/", response_model=List[Room])
def read_rooms(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    available_only: bool = False,
):
    """
    Retrieve rooms.
    """
    if available_only:
        rooms = room.get_available_rooms(db, skip=skip, limit=limit)
    else:
        rooms = room.get_multi(db, skip=skip, limit=limit)
    return rooms

@router.post("/", response_model=Room)
def create_room(
    *,
    db: Session = Depends(deps.get_db),
    room_in: RoomCreate,
):
    """
    Create new room.
    """
    room_obj = room.get_by_number(db, number=room_in.number)
    if room_obj:
        raise HTTPException(
            status_code=400,
            detail="A room with this number already exists",
        )
    room_obj = room.create(db, obj_in=room_in)
    return room_obj

@router.get("/{room_id}", response_model=Room)
def read_room(
    *,
    db: Session = Depends(deps.get_db),
    room_id: int,
):
    """
    Get room by ID.
    """
    room_obj = room.get(db, id=room_id)
    if not room_obj:
        raise HTTPException(
            status_code=404,
            detail="Room not found",
        )
    return room_obj

@router.put("/{room_id}", response_model=Room)
def update_room(
    *,
    db: Session = Depends(deps.get_db),
    room_id: int,
    room_in: RoomUpdate,
):
    """
    Update room.
    """
    room_obj = room.get(db, id=room_id)
    if not room_obj:
        raise HTTPException(
            status_code=404,
            detail="Room not found",
        )
    room_obj = room.update(db, db_obj=room_obj, obj_in=room_in)
    return room_obj

@router.delete("/{room_id}", response_model=Room)
def delete_room(
    *,
    db: Session = Depends(deps.get_db),
    room_id: int,
):
    """
    Delete room.
    """
    room_obj = room.get(db, id=room_id)
    if not room_obj:
        raise HTTPException(
            status_code=404,
            detail="Room not found",
        )
    room_obj = room.remove(db, id=room_id)
    return room_obj 