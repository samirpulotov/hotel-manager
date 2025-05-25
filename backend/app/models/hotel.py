from sqlalchemy import Column, String, Integer, Float, ForeignKey, Boolean, Enum, Date, DateTime, JSON, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from .base import BaseModel
from datetime import datetime

class RoomType(str, enum.Enum):
    GUEST_HOUSE = "GUEST_HOUSE"
    FRAME = "FRAME"

class BookingStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    checked_in = "checked_in"
    checked_out = "checked_out"
    cancelled = "cancelled"

class Room(BaseModel):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    number = Column(String, unique=True, index=True)
    type = Column(Enum(RoomType), nullable=False)
    floor = Column(Integer)
    capacity = Column(Integer)
    is_available = Column(Boolean, default=True)
    description = Column(Text)
    amenities = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    tariffs = relationship("RoomTariff", back_populates="room", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="room", cascade="all, delete-orphan")

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if not self.created_at:
            self.created_at = datetime.utcnow()
        if not self.updated_at:
            self.updated_at = datetime.utcnow()

class Guest(BaseModel):
    __tablename__ = "guests"

    first_name = Column(String)
    last_name = Column(String)
    email = Column(String, unique=True, index=True)
    phone = Column(String)
    address = Column(String)
    id_type = Column(String)  # Passport, ID card, etc.
    id_number = Column(String)
    preferences = Column(String)  # JSON string of preferences
    is_active = Column(Boolean, default=True)

    bookings = relationship("Booking", back_populates="guest")

class Booking(BaseModel):
    __tablename__ = "bookings"

    guest_id = Column(Integer, ForeignKey("guests.id"))
    room_id = Column(Integer, ForeignKey("rooms.id"))
    check_in_date = Column(Date)
    check_out_date = Column(Date)
    status = Column(Enum(BookingStatus), default=BookingStatus.pending)
    total_price = Column(Float, nullable=True)
    special_requests = Column(String, nullable=True)
    payment_status = Column(String, nullable=True, default="pending")

    guest = relationship("Guest", back_populates="bookings")
    room = relationship("Room", back_populates="bookings")

class Employee(BaseModel):
    __tablename__ = "employees"

    first_name = Column(String)
    last_name = Column(String)
    email = Column(String, unique=True, index=True)
    phone = Column(String)
    position = Column(String)
    department = Column(String)
    hire_date = Column(Date)
    salary = Column(Float)
    is_active = Column(Boolean, default=True)

class FinancialTransaction(BaseModel):
    __tablename__ = "financial_transactions"

    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=True)
    amount = Column(Float)
    transaction_type = Column(String)  # income/expense
    category = Column(String)
    description = Column(String)
    payment_method = Column(String)
    transaction_date = Column(Date)

class RoomTariff(BaseModel):
    __tablename__ = "room_tariffs"

    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=False)
    room_type = Column(String, nullable=False)
    price_per_night = Column(Float, nullable=False)
    weekend_price_per_night = Column(Float, nullable=True)  # Price for Friday and Saturday nights
    min_nights = Column(Integer, nullable=False, default=1)  # Minimum number of nights for this tariff
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    room = relationship("Room", back_populates="tariffs")

    class Config:
        orm_mode = True 