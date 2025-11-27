# routers/incidents.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date
from decimal import Decimal

from backend.data.database import get_db
from backend.models.incident import Incident
from backend.models.lease import Lease
from backend.models.employee import Employee
from backend.schemas.incident_schemas import (
    IncidentCreate, IncidentResponse, IncidentUpdate
)

router = APIRouter(
    prefix="/incidentes",
    tags=["incidentes"],
)


@router.get("/", response_model=list[IncidentResponse])
def read_incidents(
        skip: int = 0,
        limit: int = 100,
        rentalId: Optional[int] = Query(None, description="Filter by lease ID"),
        employeeId: Optional[int] = Query(None, description="Filter by employee ID"),
        type: Optional[str] = Query(None, description="Filter by incident type"),
        date: Optional[date] = Query(None, description="Filter by date"),
        db: Session = Depends(get_db)
):
    """Lista con filtros por: alquiler, empleado, tipo, fecha."""
    query = db.query(Incident)
    
    # Apply filters
    if rentalId:
        query = query.filter(Incident.rentalId == rentalId)
    if employeeId:
        query = query.filter(Incident.employeeId == employeeId)
    if type:
        query = query.filter(Incident.type.ilike(f"%{type}%"))
    if date:
        query = query.filter(Incident.date == date)
    
    incidents = query.offset(skip).limit(limit).all()
    
    # Convert to response models
    return [
        IncidentResponse(
            id=incident.id,
            rentalId=incident.rentalId,
            employeeId=incident.employeeId,
            clientName=incident.clientName,
            vehicleName=incident.vehicleName,
            type=incident.type,
            description=incident.description,
            cost=incident.cost,
            date=incident.date,
            employeeName=incident.employee.name if incident.employee else None,
            leaseState=incident.lease.state if incident.lease else None
        )
        for incident in incidents
    ]


@router.get("/{id_incidente}", response_model=IncidentResponse)
def read_incident(id_incidente: int, db: Session = Depends(get_db)):
    """Detalle del incidente."""
    incident = db.query(Incident).filter(Incident.id == id_incidente).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    return {
        "id": incident.id,
        "rentalId": incident.rentalId,
        "employeeId": incident.employeeId,
        "clientName": incident.clientName,
        "vehicleName": incident.vehicleName,
        "type": incident.type,
        "description": incident.description,
        "cost": incident.cost,
        "date": incident.date,
        "employeeName": incident.employee.name if incident.employee else None,
        "leaseState": incident.lease.state if incident.lease else None
    }


@router.post("/", response_model=IncidentResponse, status_code=status.HTTP_201_CREATED)
def create_incident(incident: IncidentCreate, db: Session = Depends(get_db)):
    """Registrar incidente (alquiler, empleado, descripción, tipo, monto)."""

    # Validate lease exists
    lease = db.query(Lease).filter(Lease.id == incident.rentalId).first()
    if not lease:
        raise HTTPException(status_code=404, detail="Lease not found")

    # Validate employee exists
    #employee = db.query(Employee).filter(Employee.id == lease.employeeId).first()
    #if not employee:
    #    raise HTTPException(status_code=404, detail="Employee not found")

    # Get client and vehicle names from lease
    client_name = lease.client.name if lease.client else "Unknown"
    vehicle_name = (
        f"{lease.vehicle.brand} {lease.vehicle.model} - {lease.vehicle.patente}"
        if lease.vehicle else "Unknown"
    )

    # Create incident
    db_incident = Incident(
        rentalId=incident.rentalId,
    #   employeeId=employee.id,
        clientName=client_name,
        vehicleName=vehicle_name,
        type=incident.type,
        description=incident.description,
        cost=incident.cost,
        date=date.today()
    )

    db.add(db_incident)
    db.commit()
    db.refresh(db_incident)

    return {
        "id": db_incident.id,
        "rentalId": db_incident.rentalId,
        "employeeId": db_incident.employeeId,
        "clientName": db_incident.clientName,
        "vehicleName": db_incident.vehicleName,
        "type": db_incident.type,
        "description": db_incident.description,
        "cost": db_incident.cost,
        "date": db_incident.date,
        "employeeName": db_incident.employee.name if db_incident.employee else None,
        "leaseState": db_incident.lease.state if db_incident.lease else None
    }


@router.put("/{id_incidente}", response_model=IncidentResponse)
def update_incident(id_incidente: int, incident: IncidentUpdate, db: Session = Depends(get_db)):
    """Actualizar descripción o monto."""
    db_incident = db.query(Incident).filter(Incident.id == id_incidente).first()
    if not db_incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    # Check if the related lease is finalized (can't modify incidents after finalization)
    if db_incident.lease and db_incident.lease.state == "finalizado":
        # Check if invoice exists
        if db_incident.lease.invoice:
            raise HTTPException(
                status_code=400,
                detail="Cannot update incident for a lease with an existing invoice"
            )

    # Update fields
    update_data = incident.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_incident, field, value)

    db.commit()
    db.refresh(db_incident)

    return {
        "id": db_incident.id,
        "rentalId": db_incident.rentalId,
        "employeeId": db_incident.employeeId,
        "clientName": db_incident.clientName,
        "vehicleName": db_incident.vehicleName,
        "type": db_incident.type,
        "description": db_incident.description,
        "cost": db_incident.cost,
        "date": db_incident.date,
        "employeeName": db_incident.employee.name if db_incident.employee else None,
        "leaseState": db_incident.lease.state if db_incident.lease else None
    }

@router.delete("/{id_incidente}", status_code=status.HTTP_204_NO_CONTENT)
def delete_incident(id_incidente: int, db: Session = Depends(get_db)):
    """Eliminar incidente."""
    db_incident = db.query(Incident).filter(Incident.id == id_incidente).first()
    if not db_incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    # Check if the related lease is finalized (can't delete incidents after finalization)
    if db_incident.lease and db_incident.lease.state == "finalizado":
        # Check if invoice exists
        if db_incident.lease.invoice:
            raise HTTPException(
                status_code=400,
                detail="Cannot delete incident for a lease with an existing invoice"
            )

    db.delete(db_incident)
    db.commit()
    return