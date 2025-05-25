from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models import Guest
from app.schemas.guest import GuestCreate, GuestUpdate

class CRUDGuest(CRUDBase[Guest, GuestCreate, GuestUpdate]):
    def get_active_guest_count(self, db: Session) -> int:
        return self.get_active_count(db, "is_active")

guest = CRUDGuest(Guest) 