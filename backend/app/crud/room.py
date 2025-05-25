from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models import Room
from app.schemas.room import RoomCreate, RoomUpdate

class CRUDRoom(CRUDBase[Room, RoomCreate, RoomUpdate]):
    def get_room_count(self, db: Session) -> int:
        return self.get_count(db)
    
    def get_occupied_room_count(self, db: Session) -> int:
        return db.query(self.model).filter(self.model.is_available == False).count()

room = CRUDRoom(Room) 