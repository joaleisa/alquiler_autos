# schemas/maintenance_schemas.py
from typing import Optional
from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel


class MaintenanceCreate(BaseModel):
    vehicleId: int
    employeeId: Optional[int] = None
    type: str
    description: str
    cost: Decimal
   # startDate: datetime
    endDate: Optional[datetime] = None


class MaintenanceResponse(BaseModel):
    id: int
    vehicleId: int
    employeeId: Optional[int] = None
    vehicleName: str
    startDate: datetime
    endDate: Optional[datetime] = None
    type: str
    description: str
    cost: Decimal
    status: str

    class Config:
        from_attributes = True


class MaintenanceUpdate(BaseModel):
    type: Optional[str] = None
    description: Optional[str] = None
    cost: Optional[Decimal] = None