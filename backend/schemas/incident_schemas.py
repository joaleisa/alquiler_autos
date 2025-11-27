# schemas/incident_schemas.py
from pydantic import BaseModel, Field
from typing import Optional
from datetime import date
from decimal import Decimal


class IncidentCreate(BaseModel):
    rentalId: int
    #employeeId: int
    type: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1, max_length=255)
    cost: Decimal = Field(..., ge=0)


class IncidentResponse(BaseModel):
    id: int
    rentalId: int
    employeeId: Optional[int]
    clientName: str
    vehicleName: str
    type: str
    description: str
    cost: Decimal
    date: date

    # Additional info
    employeeName: Optional[str] = None
    leaseState: Optional[str] = None

    class Config:
        from_attributes = True


class IncidentUpdate(BaseModel):
    description: Optional[str] = None
    cost: Optional[Decimal] = Field(None, ge=0)