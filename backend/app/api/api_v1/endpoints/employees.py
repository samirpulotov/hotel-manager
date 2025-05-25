from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.api import deps
from app.crud.hotel import employee
from app.schemas.hotel import Employee, EmployeeCreate, EmployeeUpdate

router = APIRouter()

@router.get("/", response_model=List[Employee])
def read_employees(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    active_only: bool = False,
):
    """
    Retrieve employees.
    """
    if active_only:
        employees = employee.get_active_employees(db, skip=skip, limit=limit)
    else:
        employees = employee.get_multi(db, skip=skip, limit=limit)
    return employees

@router.post("/", response_model=Employee)
def create_employee(
    *,
    db: Session = Depends(deps.get_db),
    employee_in: EmployeeCreate,
):
    """
    Create new employee.
    """
    employee_obj = employee.get_by_email(db, email=employee_in.email)
    if employee_obj:
        raise HTTPException(
            status_code=400,
            detail="An employee with this email already exists",
        )
    employee_obj = employee.create(db, obj_in=employee_in)
    return employee_obj

@router.get("/{employee_id}", response_model=Employee)
def read_employee(
    *,
    db: Session = Depends(deps.get_db),
    employee_id: int,
):
    """
    Get employee by ID.
    """
    employee_obj = employee.get(db, id=employee_id)
    if not employee_obj:
        raise HTTPException(
            status_code=404,
            detail="Employee not found",
        )
    return employee_obj

@router.put("/{employee_id}", response_model=Employee)
def update_employee(
    *,
    db: Session = Depends(deps.get_db),
    employee_id: int,
    employee_in: EmployeeUpdate,
):
    """
    Update employee.
    """
    employee_obj = employee.get(db, id=employee_id)
    if not employee_obj:
        raise HTTPException(
            status_code=404,
            detail="Employee not found",
        )
    employee_obj = employee.update(db, db_obj=employee_obj, obj_in=employee_in)
    return employee_obj

@router.delete("/{employee_id}", response_model=Employee)
def delete_employee(
    *,
    db: Session = Depends(deps.get_db),
    employee_id: int,
):
    """
    Delete employee.
    """
    employee_obj = employee.get(db, id=employee_id)
    if not employee_obj:
        raise HTTPException(
            status_code=404,
            detail="Employee not found",
        )
    employee_obj = employee.remove(db, id=employee_id)
    return employee_obj 