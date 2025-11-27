# routers/vehicles.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from backend.data.database import get_db
from backend.models.vehicle import Vehicle
from backend.schemas.vehicle_schemas import VehicleCreate, VehicleResponse, VehicleUpdate, VehicleStatusUpdate

router = APIRouter(
    prefix="/vehiculos",
    tags=["vehiculos"],
)


@router.get("/", response_model=list[VehicleResponse])
def read_vehicles(
        skip: int = 0,
        limit: int = 100,
        estado: Optional[str] = None,
        brand: Optional[str] = None,
        model: Optional[str] = None,
        year: Optional[int] = None,
        fuel: Optional[str] = None,
        db: Session = Depends(get_db)
):
    query = db.query(Vehicle)

    if estado:
        query = query.filter(Vehicle.estado == estado)
    if brand:
        query = query.filter(Vehicle.brand.ilike(f"%{brand}%"))
    if model:
        query = query.filter(Vehicle.model.ilike(f"%{model}%"))
    if year:
        query = query.filter(Vehicle.year == year)
    if fuel:
        query = query.filter(Vehicle.fuel == fuel)

    vehicles = query.offset(skip).limit(limit).all()
    return vehicles


@router.get("/{id_vehiculo}", response_model=VehicleResponse)
def read_vehicle(id_vehiculo: int, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == id_vehiculo).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle


@router.post("/", response_model=VehicleResponse, status_code=status.HTTP_201_CREATED)
def create_vehicle(vehicle: VehicleCreate, db: Session = Depends(get_db)):
    # Verificar patente única
    existing = db.query(Vehicle).filter(Vehicle.patente == vehicle.patente).first()
    if existing:
        raise HTTPException(status_code=400, detail="Patente already registered")

    db_vehicle = Vehicle(
        **vehicle.dict(),
        estado="disponible"  # Nuevo vehículo siempre disponible
    )
    db.add(db_vehicle)
    db.commit()
    db.refresh(db_vehicle)
    return db_vehicle


@router.put("/{id_vehiculo}", response_model=VehicleResponse)
def update_vehicle(id_vehiculo: int, vehicle: VehicleUpdate, db: Session = Depends(get_db)):
    db_vehicle = db.query(Vehicle).filter(Vehicle.id == id_vehiculo).first()
    if not db_vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    update_data = vehicle.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_vehicle, field, value)

    db.commit()
    db.refresh(db_vehicle)
    return db_vehicle


@router.patch("/{id_vehiculo}/estado", response_model=VehicleResponse)
def update_vehicle_status(id_vehiculo: int, status_update: VehicleStatusUpdate, db: Session = Depends(get_db)):
    db_vehicle = db.query(Vehicle).filter(Vehicle.id == id_vehiculo).first()
    if not db_vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    # Validar estado
    valid_states = ["disponible", "alquilado", "mantenimiento"]
    if status_update.estado not in valid_states:
        raise HTTPException(
            status_code=400,
            detail=f"Estado must be one of: {', '.join(valid_states)}"
        )

    db_vehicle.estado = status_update.estado
    db.commit()
    db.refresh(db_vehicle)
    return db_vehicle


@router.delete("/{id_vehiculo}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vehicle(id_vehiculo: int, db: Session = Depends(get_db)):
    db_vehicle = db.query(Vehicle).filter(Vehicle.id == id_vehiculo).first()
    if not db_vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    # Baja lógica: solo si no está alquilado
    if db_vehicle.estado == "no disponible":
        raise HTTPException(
            status_code=400,
            detail="Cannot delete a vehicle that is currently rented"
        )

    #db_vehicle.estado = "baja"
    db.delete(db_vehicle)
    db.commit()
    return