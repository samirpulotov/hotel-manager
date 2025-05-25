from fastapi import APIRouter
from app.api.v1.endpoints import auth, hotels, rooms, bookings, guests

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(hotels.router, prefix="/hotels", tags=["hotels"])
api_router.include_router(rooms.router, prefix="/rooms", tags=["rooms"])
api_router.include_router(bookings.router, prefix="/bookings", tags=["bookings"])
api_router.include_router(guests.router, prefix="/guests", tags=["guests"]) 