# schemas/vehicle_schemas.py
from typing import Optional
from decimal import Decimal
from pydantic import BaseModel


class VehicleCreate(BaseModel):
    brand: str
    model: str
    patente: str
    year: int
    pricePerDay: Decimal
    thumbnail: Optional[str] = None
    seats: int
    transmission: str
    fuel: str
    kilometraje_actual: int


class VehicleResponse(BaseModel):
    id: int
    brand: str
    model: str
    patente: str
    year: int
    pricePerDay: Decimal
    thumbnail: Optional[str] = None
    seats: int
    transmission: str
    fuel: str
    kilometraje_actual: int
    estado: str

    class Config:
        from_attributes = True


class VehicleUpdate(BaseModel):
    brand: Optional[str] = None
    model: Optional[str] = None
    patente: Optional[str] = None
    year: Optional[int] = None
    pricePerDay: Optional[Decimal] = None
    thumbnail: Optional[str] = None
    seats: Optional[int] = None
    transmission: Optional[str] = None
    fuel: Optional[str] = None
    kilometraje_actual: Optional[int] = None


class VehicleStatusUpdate(BaseModel):
    estado: str  # "disponible", "alquilado", "mantenimiento"