from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models import Booking
from app.schemas.booking import BookingCreate, BookingUpdate
from app.models.hotel import BookingStatus

class CRUDBooking(CRUDBase[Booking, BookingCreate, BookingUpdate]):
    def get_booking_count(self, db: Session) -> int:
        return self.get_count(db)

    def check_in(self, db: Session, booking_id: int):
        booking_obj = db.query(self.model).filter(self.model.id == booking_id).first()
        if not booking_obj:
            raise Exception("Booking not found")
        booking_obj.status = BookingStatus.checked_in
        if booking_obj.room:
            booking_obj.room.is_available = False
        if booking_obj.guest:
            booking_obj.guest.is_active = True
        db.commit()
        db.refresh(booking_obj)
        return booking_obj

booking = CRUDBooking(Booking) 