from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date
from decimal import Decimal


# Nuevo modelo para el detalle de incidentes dentro de la factura
class IncidentDetail(BaseModel):
    type: str
    description: str
    cost: Decimal

    class Config:
        from_attributes = True


class InvoiceCreate(BaseModel):
    rentalId: int
    paymentMethod: str = Field(..., min_length=1, max_length=255)


class InvoiceResponse(BaseModel):
    id: int
    rentalId: int
    clientName: str
    issuedDate: date
    total: Decimal
    paymentMethod: str
    status: str

    # Info adicional del alquiler
    vehicleInfo: Optional[str] = None  # e.g., "Toyota Corolla - ABC123"
    leaseDates: Optional[str] = None  # e.g., "2024-01-15 to 2024-01-20"

    # --- CAMPOS AGREGADOS PARA DETALLE COMPLETO ---
    leaseAmount: Optional[Decimal] = 0  # El costo base del alquiler sin incidentes
    incidentsTotal: Optional[Decimal] = 0  # Suma total de incidentes
    incidents: List[IncidentDetail] = []  # Lista detallada

    class Config:
        from_attributes = True


class InvoiceUpdate(BaseModel):
    paymentMethod: Optional[str] = None
    status: Optional[str] = None


class InvoicePay(BaseModel):
    pass  # No additional data needed


class InvoiceCancel(BaseModel):
    pass  # No additional data needed