from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date, datetime
from decimal import Decimal

from backend.data.database import get_db
from backend.models.lease import Lease
from backend.models.vehicle import Vehicle
from backend.models.client import Client
from backend.models.employee import Employee
from backend.schemas.lease_schemas import (
    LeaseCreate, LeaseResponse, LeaseUpdate,
    LeaseConfirm, LeaseCancel, LeaseFinalize
)

router = APIRouter(
    prefix="/alquileres",
    tags=["alquileres"],
)


@router.get("/", response_model=list[LeaseResponse])
def read_leases(
        skip: int = 0,
        limit: int = 100,
        clientId: Optional[int] = Query(None),
        vehicleId: Optional[int] = Query(None),
        state: Optional[str] = Query(None),
        date: Optional[date] = Query(None),
        db: Session = Depends(get_db)
):
    """Lista con filtros por: cliente, vehículo, estado, fecha, etc."""
    query = db.query(Lease)

    # Apply filters
    if clientId:
        query = query.filter(Lease.clientId == clientId)
    if vehicleId:
        query = query.filter(Lease.vehicleId == vehicleId)
    if state:
        query = query.filter(Lease.state == state)
    if date:
        query = query.filter(Lease.date_create == date)

    leases = query.offset(skip).limit(limit).all()

    return [
        {
            "id": lease.id,
            "clientId": lease.clientId,
            "clientName": lease.client.name if lease.client else None,
            "vehicleId": lease.vehicleId,
            "vehicleBrand": lease.vehicle.brand if lease.vehicle else None,
            "vehicleModel": lease.vehicle.model if lease.vehicle else None,
            "vehiclePatente": lease.vehicle.patente if lease.vehicle else None,
            "employeeId": lease.employeeId,
            "employeeName": lease.employee.name if lease.employee else None,
            "date_time_start": lease.date_time_start,
            "date_time_end": lease.date_time_end,
            "amount": lease.amount,
            "state": lease.state,
            "date_create": lease.date_create,
            "date_confirm": lease.date_confirm,
            "date_cancel": lease.date_cancel,
            "start_kilometers": lease.start_kilometers,
            "end_kilometers": lease.end_kilometers,
        }
        for lease in leases
    ]


@router.get("/{id_alquiler}", response_model=LeaseResponse)
def read_lease(id_alquiler: int, db: Session = Depends(get_db)):
    """Detalle del alquiler."""
    lease = db.query(Lease).filter(Lease.id == id_alquiler).first()
    if not lease:
        raise HTTPException(status_code=404, detail="Lease not found")

    return {
        "id": lease.id,
        "clientId": lease.clientId,
        "clientName": lease.client.name if lease.client else None,
        "vehicleId": lease.vehicleId,
        "vehicleBrand": lease.vehicle.brand if lease.vehicle else None,
        "vehicleModel": lease.vehicle.model if lease.vehicle else None,
        "vehiclePatente": lease.vehicle.patente if lease.vehicle else None,
        "employeeId": lease.employeeId,
        "employeeName": lease.employee.name if lease.employee else None,
        "date_time_start": lease.date_time_start,
        "date_time_end": lease.date_time_end,
        "amount": lease.amount,
        "state": lease.state,
        "date_create": lease.date_create,
        "date_confirm": lease.date_confirm,
        "date_cancel": lease.date_cancel,
        "start_kilometers": lease.start_kilometers,
        "end_kilometers": lease.end_kilometers,
    }


@router.post("/", response_model=LeaseResponse, status_code=status.HTTP_201_CREATED)
def create_lease(lease: LeaseCreate, db: Session = Depends(get_db)):
    """Crea un nuevo alquiler. Valida disponibilidad del vehículo."""

    # Validate vehicle exists and is available
    vehicle = db.query(Vehicle).filter(Vehicle.id == lease.vehicleId).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    if vehicle.estado != "disponible":
        raise HTTPException(status_code=400, detail="Vehicle is not available")

    # Validate client exists
    client = db.query(Client).filter(Client.id == lease.clientId and Client.status == "activo").first()    
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    # Validate employee exists
    employee = db.query(Employee).filter(Employee.id == lease.employeeId).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    # Calculate amount (days * price per day)
    days = (lease.date_time_end - lease.date_time_start).days
    if days <= 0:
        raise HTTPException(status_code=400, detail="End date must be after start date")
    amount = Decimal(days) * vehicle.pricePerDay

    # Create lease
    db_lease = Lease(
        clientId=lease.clientId,
        vehicleId=lease.vehicleId,
        employeeId=lease.employeeId,
        date_time_start=lease.date_time_start,
        date_time_end=lease.date_time_end,
        amount=amount,
        #state=lease.state,
        date_create=date.today(),
        start_kilometers=lease.start_kilometers
    )

    vehicle.estado = "no disponible"
    db.add(db_lease)
    db.commit()
    db.refresh(db_lease)
    db.refresh(vehicle)

    return {
        "id": db_lease.id,
        "clientId": db_lease.clientId,
        "clientName": db_lease.client.name,
        "vehicleId": db_lease.vehicleId,
        "vehicleBrand": db_lease.vehicle.brand,
        "vehicleModel": db_lease.vehicle.model,
        "vehiclePatente": db_lease.vehicle.patente,
        "employeeId": db_lease.employeeId,
        "employeeName": db_lease.employee.name,
        "date_time_start": db_lease.date_time_start,
        "date_time_end": db_lease.date_time_end,
        "amount": db_lease.amount,
        "state": db_lease.state,
        "date_create": db_lease.date_create,
        "date_confirm": db_lease.date_confirm,
        "date_cancel": db_lease.date_cancel,
        "start_kilometers": db_lease.start_kilometers,
        "end_kilometers": db_lease.end_kilometers,
    }


@router.put("/{id_alquiler}", response_model=LeaseResponse)
def update_lease(id_alquiler: int, lease: LeaseUpdate, db: Session = Depends(get_db)):
    """Modifica datos si el estado lo permite."""
    db_lease = db.query(Lease).filter(Lease.id == id_alquiler).first()
    if not db_lease:
        raise HTTPException(status_code=404, detail="Lease not found")

    # Only allow updates if state is "creado"
    if db_lease.state != "creado":
        raise HTTPException(
            status_code=400,
            detail=f"Cannot update lease in state '{db_lease.state}'. Only 'creado' leases can be updated."
        )

    # Update fields
    update_data = lease.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_lease, field, value)

    # Recalculate amount if dates changed
    #todo: evaluar el atributo de amount

    # if "date_time_start" in update_data or "date_time_end" in update_data:
    #     days = (db_lease.date_time_end - db_lease.date_time_start).days
    #     if days <= 0:
    #         raise HTTPException(status_code=400, detail="End date must be after start date")
    #     db_lease.amount = Decimal(days) * db_lease.vehicle.pricePerDay

    db.commit()
    db.refresh(db_lease)

    return {
        "id": db_lease.id,
        "clientId": db_lease.clientId,
        "clientName": db_lease.client.name,
        "vehicleId": db_lease.vehicleId,
        "vehicleBrand": db_lease.vehicle.brand,
        "vehicleModel": db_lease.vehicle.model,
        "vehiclePatente": db_lease.vehicle.patente,
        "employeeId": db_lease.employeeId,
        "employeeName": db_lease.employee.name,
        "date_time_start": db_lease.date_time_start,
        "date_time_end": db_lease.date_time_end,
        "amount": db_lease.amount,
        "state": db_lease.state,
        "date_create": db_lease.date_create,
        "date_confirm": db_lease.date_confirm,
        "date_cancel": db_lease.date_cancel,
        "start_kilometers": db_lease.start_kilometers,
        "end_kilometers": db_lease.end_kilometers,
    }


@router.patch("/{id_alquiler}/confirmar", response_model=LeaseResponse)
def confirm_lease(id_alquiler: int, db: Session = Depends(get_db)):
    """Cambia a estado 'confirmado' y setea fecha_confirmacion."""
    db_lease = db.query(Lease).filter(Lease.id == id_alquiler).first()
    if not db_lease:
        raise HTTPException(status_code=404, detail="Lease not found")

    if db_lease.state != "creado":
        raise HTTPException(
            status_code=400,
            detail=f"Cannot confirm lease in state '{db_lease.state}'. Only 'creado' leases can be confirmed."
        )

    db_lease.state = "confirmado"
    db_lease.date_confirm = date.today()

    # Mark vehicle as not available
    vehicle = db.query(Vehicle).filter(Vehicle.id == db_lease.vehicleId).first()
    if vehicle:
        vehicle.estado = "alquilado"

    db.commit()
    db.refresh(db_lease)

    return {
        "id": db_lease.id,
        "clientId": db_lease.clientId,
        "clientName": db_lease.client.name,
        "vehicleId": db_lease.vehicleId,
        "vehicleBrand": db_lease.vehicle.brand,
        "vehicleModel": db_lease.vehicle.model,
        "vehiclePatente": db_lease.vehicle.patente,
        "employeeId": db_lease.employeeId,
        "employeeName": db_lease.employee.name,
        "date_time_start": db_lease.date_time_start,
        "date_time_end": db_lease.date_time_end,
        "amount": db_lease.amount,
        "state": db_lease.state,
        "date_create": db_lease.date_create,
        "date_confirm": db_lease.date_confirm,
        "date_cancel": db_lease.date_cancel,
        "start_kilometers": db_lease.start_kilometers,
        "end_kilometers": db_lease.end_kilometers,
    }


@router.patch("/{id_alquiler}/cancelar", response_model=LeaseResponse)
def cancel_lease(id_alquiler: int, db: Session = Depends(get_db)):
    """Cambia a 'cancelado' y setea fecha_cancelacion."""
    db_lease = db.query(Lease).filter(Lease.id == id_alquiler).first()
    if not db_lease:
        raise HTTPException(status_code=404, detail="Lease not found")

    if db_lease.state in ["cancelado", "finalizado"]:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot cancel lease in state '{db_lease.state}'."
        )

    db_lease.state = "cancelado"
    db_lease.date_cancel = date.today()

    # Make vehicle available again
    vehicle = db.query(Vehicle).filter(Vehicle.id == db_lease.vehicleId).first()
    if vehicle:
        vehicle.estado = "disponible"

    db.commit()
    db.refresh(db_lease)

    return {
        "id": db_lease.id,
        "clientId": db_lease.clientId,
        "clientName": db_lease.client.name,
        "vehicleId": db_lease.vehicleId,
        "vehicleBrand": db_lease.vehicle.brand,
        "vehicleModel": db_lease.vehicle.model,
        "vehiclePatente": db_lease.vehicle.patente,
        "employeeId": db_lease.employeeId,
        "employeeName": db_lease.employee.name,
        "date_time_start": db_lease.date_time_start,
        "date_time_end": db_lease.date_time_end,
        "amount": db_lease.amount,
        "state": db_lease.state,
        "date_create": db_lease.date_create,
        "date_confirm": db_lease.date_confirm,
        "date_cancel": db_lease.date_cancel,
        "start_kilometers": db_lease.start_kilometers,
        "end_kilometers": db_lease.end_kilometers,
    }


@router.patch("/{id_alquiler}/finalizar", response_model=LeaseResponse)
def finalize_lease(id_alquiler: int, data: LeaseFinalize, db: Session = Depends(get_db)):
    """Actualiza kilometraje_fin, calcula monto total y cambia a 'finalizado'."""
    db_lease = db.query(Lease).filter(Lease.id == id_alquiler).first()
    if not db_lease:
        raise HTTPException(status_code=404, detail="Lease not found")

    if db_lease.state != "confirmado":
        raise HTTPException(
            status_code=400,
            detail=f"Cannot finalize lease in state '{db_lease.state}'. Only 'confirmado' leases can be finalized."
        )

    # Validate end kilometers
    if db_lease.start_kilometers and data.end_kilometers < db_lease.start_kilometers:
        raise HTTPException(
            status_code=400,
            detail="End kilometers must be greater than or equal to start kilometers"
        )

    db_lease.end_kilometers = data.end_kilometers
    db_lease.state = "finalizado"

    # Calculate additional charges if needed (e.g., extra kilometers)
    # This is where you'd add business logic for extra charges

    # Make vehicle available again and update its kilometers
    vehicle = db.query(Vehicle).filter(Vehicle.id == db_lease.vehicleId).first()
    if vehicle:
        vehicle.estado = "disponible"
        vehicle.kilometraje_actual = data.end_kilometers

    db.commit()
    db.refresh(db_lease)

    return {
        "id": db_lease.id,
        "clientId": db_lease.clientId,
        "clientName": db_lease.client.name,
        "vehicleId": db_lease.vehicleId,
        "vehicleBrand": db_lease.vehicle.brand,
        "vehicleModel": db_lease.vehicle.model,
        "vehiclePatente": db_lease.vehicle.patente,
        "employeeId": db_lease.employeeId,
        "employeeName": db_lease.employee.name,
        "date_time_start": db_lease.date_time_start,
        "date_time_end": db_lease.date_time_end,
        "amount": db_lease.amount,
        "state": db_lease.state,
        "date_create": db_lease.date_create,
        "date_confirm": db_lease.date_confirm,
        "date_cancel": db_lease.date_cancel,
        "start_kilometers": db_lease.start_kilometers,
        "end_kilometers": db_lease.end_kilometers,
    }

@router.delete("/{id_alquiler}", status_code=status.HTTP_204_NO_CONTENT)
def delete_lease(id_alquiler: int, db: Session = Depends(get_db)):
    """Elimina un alquiler si está en estado 'creado'."""
    db_lease = db.query(Lease).filter(Lease.id == id_alquiler).first()
    if not db_lease:
        raise HTTPException(status_code=404, detail="Lease not found")

    if db_lease.state == "finalizado":
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete lease in state '{db_lease.state}'. Only 'creado' leases can be deleted."
        )

    db.delete(db_lease)
    db.commit()

    return