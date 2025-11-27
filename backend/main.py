from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import employee_router, user_router, client_router, vehicle_router, maintenance_router, \
    lease_router, invoice_router, incident_router, dashboard_router, auth_router

#todo: from routers import

app = FastAPI(
    title="Sistema de Alquiler de Vehículos",
    description="API para gestión de alquileres",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # todo: validar con ema
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
#todo: modelos según bd
#todo: crear routers
#todo: crear esquemas

app.include_router(employee_router.router)
app.include_router(user_router.router)
app.include_router(client_router.router)
app.include_router(vehicle_router.router)
app.include_router(maintenance_router.router)
app.include_router(lease_router.router)
app.include_router(invoice_router.router)
app.include_router(incident_router.router)
app.include_router(dashboard_router.router)
app.include_router(auth_router.router) 

@app.get("/")
def root():
    return {"message": "ALQUILER DE AUTOS"}
