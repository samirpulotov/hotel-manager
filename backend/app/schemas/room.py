from pydantic import BaseModel
from typing import Optional
from app.models.hotel import RoomType

class RoomBase(BaseModel):
    number: str
    type: RoomType
    floor: int
    capacity: int
    price_per_night: float
    description: Optional[str] = None
    amenities: Optional[str] = None

class RoomCreate(RoomBase):
    pass

class RoomUpdate(BaseModel):
    number: Optional[str] = None
    type: Optional[RoomType] = None
    floor: Optional[int] = None
    capacity: Optional[int] = None
    price_per_night: Optional[float] = None
    is_available: Optional[bool] = None
    description: Optional[str] = None
    amenities: Optional[str] = None

class Room(RoomBase):
    id: int
    is_available: bool

    class Config:
        from_attributes = True 