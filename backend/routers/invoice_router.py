from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date
from decimal import Decimal

from backend.data.database import get_db
from backend.models.invoice import Invoice
from backend.models.lease import Lease
from backend.models.incident import Incident
from backend.schemas.invoice_schemas import (
    InvoiceCreate, InvoiceResponse, InvoiceUpdate,
    InvoicePay, InvoiceCancel
)

router = APIRouter(
    prefix="/facturas",
    tags=["facturas"],
)

# --- Helper Function ---
def format_invoice_response(invoice: Invoice, db: Session) -> dict:
    """
    Construye la respuesta completa de la factura, incluyendo detalles
    del alquiler y la lista de incidentes asociados.
    """
    # 1. Obtener el alquiler asociado (Lease)
    lease = invoice.lease
    
    # 2. Obtener incidentes asociados a este alquiler
    # Se asume que Incident tiene un campo rentalId o relationship con Lease
    incidents = db.query(Incident).filter(Incident.rentalId == invoice.rentalId).all()
    
    # 3. Calcular totales y formatear lista de incidentes
    incidents_total = sum((i.cost for i in incidents if i.cost), Decimal(0))
    
    incidents_list = [
        {
            "type": i.type,
            "description": i.description,
            "cost": i.cost if i.cost else Decimal(0)
        } for i in incidents
    ]

    # 4. Obtener info del vehículo y fechas de forma segura
    vehicle_info = None
    lease_dates = None
    lease_amount = Decimal(0)

    if lease:
        # El monto base del alquiler
        lease_amount = lease.amount if lease.amount else Decimal(0)
        
        if lease.vehicle:
            vehicle_info = f"{lease.vehicle.brand} {lease.vehicle.model} - {lease.vehicle.patente}"
        
        if lease.date_time_start and lease.date_time_end:
            # Formato simple YYYY-MM-DD
            s_date = lease.date_time_start.strftime('%Y-%m-%d')
            e_date = lease.date_time_end.strftime('%Y-%m-%d')
            lease_dates = f"{s_date} to {e_date}"

    return {
        "id": invoice.id,
        "rentalId": invoice.rentalId,
        "clientName": invoice.clientName,
        "issuedDate": invoice.issuedDate,
        "total": invoice.total,
        "paymentMethod": invoice.paymentMethod,
        "status": invoice.status,
        "vehicleInfo": vehicle_info,
        "leaseDates": lease_dates,
        # Nuevos campos calculados
        "leaseAmount": lease_amount,
        "incidentsTotal": incidents_total,
        "incidents": incidents_list
    }


# --- Endpoints ---

@router.get("/", response_model=list[InvoiceResponse])
def read_invoices(
        skip: int = 0,
        limit: int = 100,
        status: Optional[str] = Query(None),
        paymentMethod: Optional[str] = Query(None),
        clientName: Optional[str] = Query(None),
        db: Session = Depends(get_db)
):
    """Lista general o filtrada (estado, método de pago, cliente)."""
    query = db.query(Invoice)

    # Apply filters
    if status:
        query = query.filter(Invoice.status == status)
    if paymentMethod:
        query = query.filter(Invoice.paymentMethod == paymentMethod)
    if clientName:
        query = query.filter(Invoice.clientName.ilike(f"%{clientName}%"))

    invoices = query.offset(skip).limit(limit).all()

    # Usamos el helper para formatear cada factura
    return [format_invoice_response(inv, db) for inv in invoices]


@router.get("/{id_factura}", response_model=InvoiceResponse)
def read_invoice(id_factura: int, db: Session = Depends(get_db)):
    """Detalle de la factura incluyendo incidentes y desglose."""
    invoice = db.query(Invoice).filter(Invoice.id == id_factura).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    return format_invoice_response(invoice, db)


@router.post("/", response_model=InvoiceResponse, status_code=status.HTTP_201_CREATED)
def create_invoice(invoice: InvoiceCreate, db: Session = Depends(get_db)):
    """Genera una factura para un alquiler (1:1). Calcula total = monto alquiler + incidentes."""

    # Validate lease exists
    lease = db.query(Lease).filter(Lease.id == invoice.rentalId).first()
    if not lease:
        raise HTTPException(status_code=404, detail="Lease not found")

    # Check if lease already has an invoice
    existing_invoice = db.query(Invoice).filter(Invoice.rentalId == invoice.rentalId).first()
    if existing_invoice:
        raise HTTPException(
            status_code=400,
            detail=f"Lease already has an invoice (Invoice ID: {existing_invoice.id})"
        )

    # Validate lease is finalized
    # Se usa lower() para evitar problemas de mayúsculas/minúsculas
    if not lease.state or lease.state.lower() != "finalizado":
        raise HTTPException(
            status_code=400,
            detail=f"Cannot create invoice for lease in state '{lease.state}'. Lease must be 'finalizado'."
        )

    # --- CÁLCULO DEL TOTAL ---
    # 1. Monto base del alquiler
    lease_amount = lease.amount if lease.amount else Decimal(0)

    # 2. Sumar incidentes asociados al alquiler
    incidents_total = Decimal(0)
    incidents = db.query(Incident).filter(Incident.rentalId == lease.id).all()
    
    for incident in incidents:
        if incident.cost:
            incidents_total += incident.cost

    total_final = lease_amount + incidents_total

    # Create invoice
    db_invoice = Invoice(
        rentalId=invoice.rentalId,
        clientName=lease.client.name if lease.client else "Unknown",
        issuedDate=date.today(),
        total=total_final,
        paymentMethod=invoice.paymentMethod,
        status="pendiente"
    )

    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)

    return format_invoice_response(db_invoice, db)


@router.patch("/{id_factura}/pagar", response_model=InvoiceResponse)
def pay_invoice(id_factura: int, db: Session = Depends(get_db)):
    """Cambia estado a 'Pagada'."""
    db_invoice = db.query(Invoice).filter(Invoice.id == id_factura).first()
    if not db_invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    if db_invoice.status == "anulada":
        raise HTTPException(
            status_code=400,
            detail="Cannot pay a cancelled invoice"
        )

    if db_invoice.status == "pagada":
        raise HTTPException(
            status_code=400,
            detail="Invoice is already paid"
        )

    db_invoice.status = "pagada"
    db.commit()
    db.refresh(db_invoice)

    return format_invoice_response(db_invoice, db)


@router.patch("/{id_factura}/anular", response_model=InvoiceResponse)
def cancel_invoice(id_factura: int, db: Session = Depends(get_db)):
    """Cambia a 'Anulada'."""
    db_invoice = db.query(Invoice).filter(Invoice.id == id_factura).first()
    if not db_invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    if db_invoice.status == "pagada":
        raise HTTPException(
            status_code=400,
            detail="Cannot cancel a paid invoice. Issue a refund instead."
        )

    if db_invoice.status == "anulada":
        raise HTTPException(
            status_code=400,
            detail="Invoice is already cancelled"
        )

    db_invoice.status = "anulada"
    db.commit()
    db.refresh(db_invoice)

    return format_invoice_response(db_invoice, db)