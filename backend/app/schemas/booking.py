from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class BookingBase(BaseModel):
    check_in_date: datetime
    check_out_date: datetime
    status: str
    room_id: int
    guest_id: int

class BookingCreate(BookingBase):
    pass

class BookingUpdate(BaseModel):
    check_in_date: Optional[datetime] = None
    check_out_date: Optional[datetime] = None
    status: Optional[str] = None
    room_id: Optional[int] = None
    guest_id: Optional[int] = None

class Booking(BookingBase):
    id: int

    class Config:
        from_attributes = True 