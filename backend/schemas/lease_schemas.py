# schemas/lease_schemas.py
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, date
from decimal import Decimal


class LeaseCreate(BaseModel):
    clientId: int
    vehicleId: int
    employeeId: int
    date_time_start: datetime
    date_time_end: datetime
    start_kilometers: Optional[int] = None
    


class LeaseResponse(BaseModel):
    id: int
    clientId: int
    clientName: str
    vehicleId: int
    vehicleBrand: Optional[str] = None
    vehicleModel: Optional[str] = None
    vehiclePatente: Optional[str] = None
    employeeId: Optional[int] = None
    employeeName: Optional[str] = None
    date_time_start: datetime
    date_time_end: datetime
    amount: Optional[Decimal] = None
    state: str
    date_create: date
    date_confirm: Optional[date] = None
    date_cancel: Optional[date] = None
    start_kilometers: Optional[int] = None
    end_kilometers: Optional[int] = None

    class Config:
        from_attributes = True


class LeaseUpdate(BaseModel):
    date_time_start: Optional[datetime] = None
    date_time_end: Optional[datetime] = None
    start_kilometers: Optional[int] = None
    end_kilometers: Optional[int] = None
    state: Optional[str] = None


class LeaseConfirm(BaseModel):
    pass  # No additional data needed


class LeaseCancel(BaseModel):
    pass  # No additional data needed


class LeaseFinalize(BaseModel):
    end_kilometers: int