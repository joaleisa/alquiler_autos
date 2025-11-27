from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime
from typing import List, Dict

from backend.data.database import get_db
from backend.models.lease import Lease
from backend.models.client import Client
from backend.models.vehicle import Vehicle
from backend.models.invoice import Invoice

router = APIRouter(
    prefix="/dashboard",
    tags=["dashboard"],
)


@router.get("/", response_model=dict)
def get_dashboard_data(db: Session = Depends(get_db)):
   
    # Ingresos totales
    total_revenue = db.query(func.sum(Invoice.total)).filter(
        Invoice.status == "pagada"
    ).scalar() or 0
    
    # Cantidad de alquileres
    total_rentals = db.query(func.count(Lease.id)).scalar() or 0
    
    # Cantidad de clientes
    active_clients = db.query(func.count(Client.id.distinct())).filter(
        Client.status == "activo"
    ).scalar() or 0
    
    # Cantidad de vehiculos disponibles
    available_vehicles = db.query(func.count(Vehicle.id)).filter(
        Vehicle.estado == "disponible"
    ).scalar() or 0
    
    total_vehicles = db.query(func.count(Vehicle.id)).filter(Vehicle.estado != "baja").scalar() or 0

    kpis = {
        "totalRevenue": float(total_revenue),
        "totalRentals": total_rentals,
        "activeClients": active_clients,
        "availableVehicles": available_vehicles,
        "totalVehicles": total_vehicles
    }
    
    # Ingresos de cada mes del anio actual
    current_year = datetime.now().year
    months_names = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", 
                    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
    
    monthly_data = db.query(
        extract('month', Invoice.issuedDate).label('month'),
        func.sum(Invoice.total).label('total')
    ).filter(
        extract('year', Invoice.issuedDate) == current_year,
        Invoice.status == "pagada"
    ).group_by(
        extract('month', Invoice.issuedDate)
    ).all()
    
    monthly_dict = {int(month): float(total) for month, total in monthly_data}
    
    monthly_revenue = [
        {
            "month": months_names[i],
            "total": monthly_dict.get(i + 1, 0)
        }
        for i in range(12)
    ]
    
    # Popular Vehicles (top 3 + others)
    vehicle_rentals = db.query(
        Vehicle.brand,
        Vehicle.model,
        func.count(Lease.id).label('rental_count')
    ).join(
        Lease, Vehicle.id == Lease.vehicleId
    ).group_by(
        Vehicle.id, Vehicle.brand, Vehicle.model
    ).order_by(
        func.count(Lease.id).desc()
    ).limit(3).all()
    
    popular_vehicles = []
    for vehicle in vehicle_rentals:
        popular_vehicles.append({
            "name": f"{vehicle.brand} {vehicle.model}",
            "rentals": vehicle.rental_count
        })
    
    # Top 3 de vehiculos mas alquilos + otros
    top_vehicles_count = sum(v['rentals'] for v in popular_vehicles)
    otros_count = total_rentals - top_vehicles_count
    
    if otros_count > 0:
        popular_vehicles.append({
            "name": "Otro",
            "rentals": otros_count
        })
    
    # Detalles de los ultimos 10 alquileres con factura
    leases_with_invoices = db.query(Lease).join(
        Invoice, Lease.id == Invoice.rentalId
    ).order_by(
        Lease.date_time_start.desc()
    ).limit(10).all()
    
    detailed_rentals = []
    for lease in leases_with_invoices:
        client = db.query(Client).filter(Client.id == lease.clientId).first()
        vehicle = db.query(Vehicle).filter(Vehicle.id == lease.vehicleId).first()
        invoice = db.query(Invoice).filter(Invoice.rentalId == lease.id).first()
        
        detailed_rentals.append({
            "clientName": client.name if client else "Unknown",
            "rentalId": f"r{lease.id:03d}",
            "vehicleName": f"{vehicle.brand} {vehicle.model}" if vehicle else "Unknown",
            "startDate": lease.date_time_start.date().isoformat(),
            "endDate": lease.date_time_end.date().isoformat(),
            "total": float(invoice.total) if invoice else 0
        })
    
    return {
        "kpis": kpis,
        "monthlyRevenue": monthly_revenue,
        "popularVehicles": popular_vehicles,
        "detailedRentals": detailed_rentals
    }