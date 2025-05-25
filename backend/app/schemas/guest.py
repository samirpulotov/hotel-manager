from pydantic import BaseModel, EmailStr
from typing import Optional

class GuestBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: str

class GuestCreate(GuestBase):
    pass

class GuestUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None

class Guest(GuestBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True 