from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict

from app.db.session import get_db
from app.crud import room as room_crud
from app.crud import booking as booking_crud
from app.crud import guest as guest_crud

router = APIRouter()

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)) -> Dict:
    total_rooms = room_crud.get_room_count(db)
    occupied_rooms = room_crud.get_occupied_room_count(db)
    total_bookings = booking_crud.get_booking_count(db)
    active_guests = guest_crud.get_active_guest_count(db)

    return {
        "totalRooms": total_rooms,
        "occupiedRooms": occupied_rooms,
        "totalBookings": total_bookings,
        "activeGuests": active_guests
    } 