from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.data.database import get_db
from backend.models.employee import Employee
from backend.schemas.employee_schemas import EmployeeCreate, EmployeeResponse, EmployeeUpdate

router = APIRouter(
    prefix="/empleados",
    tags=["empleados"],
)


@router.get("/", response_model=list[EmployeeResponse])
def read_employees(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    employees = db.query(Employee).offset(skip).limit(limit).all()
    return employees

@router.get("/{id_empleado}", response_model=EmployeeResponse)
def read_employee(id_empleado: int, db: Session = Depends(get_db)):
    employee = db.query(Employee).filter(Employee.id == id_empleado).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee

@router.post("/", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
def create_employee(employee: EmployeeCreate, db: Session = Depends(get_db)):
    db_employee = Employee(**employee.dict()) #** es para desempaquetar los diccionarios(ahorra codigo)

    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee

@router.put("/{id_empleado}", response_model=EmployeeResponse)
def update_employee(id_empleado: int, employee: EmployeeUpdate, db: Session = Depends(get_db)):
    db_employee = db.query(Employee).filter(Employee.id == id_empleado).first()
    if not db_employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    update_data = employee.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_employee, field, value)
    db.commit()
    db.refresh(db_employee)
    return db_employee

@router.delete("/{id_empleado}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee(id_empleado: int, db: Session = Depends(get_db)):
    db_employee = db.query(Employee).filter(Employee.id == id_empleado).first()
    if not db_employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    #todo: cambiar funcionalidad para una soft delete, como en clientes
    db.delete(db_employee)
    db.commit()
    return