# routers/maintenances.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime

from backend.data.database import get_db
from backend.models.maintenance import Maintenance
from backend.models.vehicle import Vehicle
from backend.models.employee import Employee
from backend.schemas.maintenance_schemas import MaintenanceCreate, MaintenanceResponse, MaintenanceUpdate

router = APIRouter(
    prefix="/mantenimiento",
    tags=["mantenimiento"],
)


@router.get("/", response_model=list[MaintenanceResponse])
def read_maintenances(
        skip: int = 0,
        limit: int = 100,
        vehicleId: Optional[int] = None,
        employeeId: Optional[int] = None,
        db: Session = Depends(get_db)
):
    query = db.query(Maintenance)

    if vehicleId:
        query = query.filter(Maintenance.vehicleId == vehicleId)
    if employeeId:
        query = query.filter(Maintenance.employeeId == employeeId)

    maintenances = query.offset(skip).limit(limit).all()
    return maintenances


@router.get("/{id_mantenimiento}", response_model=MaintenanceResponse)
def read_maintenance(id_mantenimiento: int, db: Session = Depends(get_db)):
    maintenance = db.query(Maintenance).filter(Maintenance.id == id_mantenimiento).first()
    if not maintenance:
        raise HTTPException(status_code=404, detail="Maintenance not found")
    return maintenance


@router.post("/", response_model=MaintenanceResponse, status_code=status.HTTP_201_CREATED)
def create_maintenance(maintenance: MaintenanceCreate, db: Session = Depends(get_db)):
    # Verificar que el vehículo existe
    vehicle = db.query(Vehicle).filter(Vehicle.id == maintenance.vehicleId).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    # Verificar que el empleado existe
    #employee = db.query(Employee).filter(Employee.id == maintenance.employeeId).first()
    #if not employee:
    #    raise HTTPException(status_code=404, detail="Employee not found")

    # Verificar que el vehículo no esté alquilado
    if vehicle.estado == "alquilado":
        raise HTTPException(status_code=400, detail="Cannot create maintenance for a rented vehicle")

    # Crear mantenimiento
    db_maintenance = Maintenance(
        vehicleId=maintenance.vehicleId,
    #    employeeId=maintenance.employeeId,
        vehicleName=f"{vehicle.brand} {vehicle.model}",  # Auto-generar nombre
        startDate=datetime.now(),
        endDate=maintenance.endDate,
        type=maintenance.type,
        description=maintenance.description,
        cost=maintenance.cost
    )
    db.add(db_maintenance)

    # Cambiar estado del vehículo a "mantenimiento"
    vehicle.estado = "mantenimiento"

    db.commit()
    db.refresh(db_maintenance)
    return db_maintenance


@router.patch("/{id_mantenimiento}/finalizar", response_model=MaintenanceResponse)
def finish_maintenance(id_mantenimiento: int, db: Session = Depends(get_db)):
    maintenance = db.query(Maintenance).filter(Maintenance.id == id_mantenimiento).first()
    if not maintenance:
        raise HTTPException(status_code=404, detail="Maintenance not found")

    # Verificar que no esté ya finalizado
    if maintenance.status == "finalizado":
        raise HTTPException(status_code=400, detail="Maintenance already finished")

    # Finalizar mantenimiento
    maintenance.endDate = datetime.now()

    # Cambiar estado del vehículo a "disponible"
    vehicle = db.query(Vehicle).filter(Vehicle.id == maintenance.vehicleId).first()
    if vehicle:
        vehicle.estado = "disponible"
    maintenance.status = "finalizado"

    db.commit()
    db.refresh(maintenance)
    return maintenance

@router.delete("/{id_mantenimiento}", status_code=status.HTTP_204_NO_CONTENT)
def delete_maintenance(id_mantenimiento: int, db: Session = Depends(get_db)):
    maintenance = db.query(Maintenance).filter(Maintenance.id == id_mantenimiento).first()
    if not maintenance:
        raise HTTPException(status_code=404, detail="Maintenance not found")

    db.delete(maintenance)
    db.commit()
    return