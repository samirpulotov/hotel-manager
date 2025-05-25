from pydantic import BaseModel, EmailStr, constr
from typing import Optional, List
from datetime import date, datetime
from app.models.hotel import RoomType, BookingStatus

class RoomBase(BaseModel):
    number: str
    type: RoomType
    floor: int
    capacity: int
    description: Optional[str] = None
    amenities: Optional[str] = None

class RoomCreate(RoomBase):
    pass

class RoomUpdate(BaseModel):
    number: Optional[str] = None
    type: Optional[RoomType] = None
    floor: Optional[int] = None
    capacity: Optional[int] = None
    description: Optional[str] = None
    amenities: Optional[str] = None
    is_available: Optional[bool] = None

class Room(RoomBase):
    id: int
    is_available: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class GuestBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    address: Optional[str] = None
    id_type: Optional[str] = None
    id_number: Optional[str] = None
    preferences: Optional[str] = None

class GuestCreate(GuestBase):
    pass

class GuestUpdate(GuestBase):
    pass

class Guest(GuestBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class BookingBase(BaseModel):
    guest_id: int
    room_id: int
    check_in_date: date
    check_out_date: date
    special_requests: Optional[str] = None
    total_price: Optional[float] = None
    payment_status: Optional[str] = None

class BookingCreate(BookingBase):
    pass

class BookingUpdate(BaseModel):
    status: Optional[BookingStatus] = None
    total_price: Optional[float] = None
    payment_status: Optional[str] = None
    special_requests: Optional[str] = None

class Booking(BookingBase):
    id: int
    status: BookingStatus
    total_price: Optional[float] = None
    payment_status: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    guest: Guest
    room: Room

    class Config:
        from_attributes = True

class EmployeeBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    position: str
    department: str
    hire_date: date
    salary: float

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeUpdate(EmployeeBase):
    is_active: Optional[bool] = None

class Employee(EmployeeBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class FinancialTransactionBase(BaseModel):
    booking_id: Optional[int] = None
    amount: float
    transaction_type: str
    category: str
    description: str
    payment_method: str
    transaction_date: date

class FinancialTransactionCreate(FinancialTransactionBase):
    pass

class FinancialTransactionUpdate(FinancialTransactionBase):
    pass

class FinancialTransaction(FinancialTransactionBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class RoomTariffBase(BaseModel):
    room_type: str
    price_per_night: float
    weekend_price_per_night: Optional[float] = None
    min_nights: int = 1
    start_date: date
    end_date: date

class RoomTariffCreate(RoomTariffBase):
    pass

class RoomTariffUpdate(BaseModel):
    price_per_night: Optional[float] = None
    weekend_price_per_night: Optional[float] = None
    min_nights: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None

class RoomTariff(RoomTariffBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True 