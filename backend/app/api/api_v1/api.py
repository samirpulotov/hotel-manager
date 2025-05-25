from fastapi import APIRouter
from app.api.api_v1.endpoints import rooms, guests, bookings, employees, financial, dashboard, auth, users, tariffs

api_router = APIRouter()

@api_router.get("/")
async def root():
    return {
        "message": "Welcome to Hotel Manager API",
        "version": "1.0",
        "endpoints": {
            "auth": "/auth",
            "users": "/users",
            "rooms": "/rooms",
            "guests": "/guests",
            "bookings": "/bookings",
            "employees": "/employees",
            "financial": "/financial",
            "dashboard": "/dashboard",
            "tariffs": "/tariffs"
        }
    }

api_router.include_router(rooms.router, prefix="/rooms", tags=["rooms"])
api_router.include_router(guests.router, prefix="/guests", tags=["guests"])
api_router.include_router(bookings.router, prefix="/bookings", tags=["bookings"])
api_router.include_router(employees.router, prefix="/employees", tags=["employees"])
api_router.include_router(financial.router, prefix="/financial", tags=["financial"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(tariffs.router, prefix="/tariffs", tags=["tariffs"]) 