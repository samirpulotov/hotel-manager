from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.api import deps
from app.crud.hotel import get_tariff, get_tariffs, create_tariff, update_tariff, remove_tariff, get_current_tariff
from app.schemas.hotel import RoomTariff, RoomTariffCreate, RoomTariffUpdate
from app.models.hotel import RoomType
from datetime import date as date_cls

router = APIRouter()

@router.get("/", response_model=List[RoomTariff])
def read_tariffs(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    room_type: Optional[str] = None,
):
    """
    Retrieve room tariffs.
    """
    tariffs = get_tariffs(db, skip=skip, limit=limit, room_type=room_type)
    return tariffs

@router.post("/", response_model=RoomTariff)
def create_room_tariff(
    *,
    db: Session = Depends(deps.get_db),
    tariff_in: RoomTariffCreate,
):
    """
    Create new room tariff.
    """
    if tariff_in.room_type not in [rt.value for rt in RoomType]:
        raise HTTPException(
            status_code=400,
            detail="Invalid room type",
        )
    
    if tariff_in.start_date >= tariff_in.end_date:
        raise HTTPException(
            status_code=400,
            detail="Start date must be before end date",
        )
    
    tariff = create_tariff(db, obj_in=tariff_in)
    return tariff

@router.get("/current", response_model=RoomTariff)
def get_current_tariff_endpoint(
    room_type: str = Query(...),
    date: Optional[date_cls] = Query(None),
    db: Session = Depends(deps.get_db)
):
    if date is None:
        date = date_cls.today()
    tariff = get_current_tariff(db, room_type=room_type, target_date=date)
    if not tariff:
        raise HTTPException(status_code=404, detail="No tariff found for this room type and date.")
    return tariff

@router.get("/{tariff_id}", response_model=RoomTariff)
def read_tariff(
    tariff_id: int,
    db: Session = Depends(deps.get_db)
):
    tariff = get_tariff(db, id=tariff_id)
    if not tariff:
        raise HTTPException(
            status_code=404,
            detail="Room tariff not found",
        )
    return tariff

@router.put("/{tariff_id}", response_model=RoomTariff)
def update_room_tariff(
    *,
    db: Session = Depends(deps.get_db),
    tariff_id: int,
    tariff_in: RoomTariffUpdate,
):
    """
    Update room tariff.
    """
    tariff = get_tariff(db, id=tariff_id)
    if not tariff:
        raise HTTPException(
            status_code=404,
            detail="Room tariff not found",
        )
    
    if tariff_in.start_date and tariff_in.end_date and tariff_in.start_date >= tariff_in.end_date:
        raise HTTPException(
            status_code=400,
            detail="Start date must be before end date",
        )
    
    tariff = update_tariff(db, db_obj=tariff, obj_in=tariff_in)
    return tariff

@router.delete("/{tariff_id}", response_model=RoomTariff)
def delete_tariff(
    *,
    db: Session = Depends(deps.get_db),
    tariff_id: int,
):
    """
    Delete room tariff.
    """
    tariff = get_tariff(db, id=tariff_id)
    if not tariff:
        raise HTTPException(
            status_code=404,
            detail="Room tariff not found",
        )
    tariff = remove_tariff(db, id=tariff_id)
    return tariff 