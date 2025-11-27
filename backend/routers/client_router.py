# routers/clients.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from backend.data.database import get_db
from backend.models.client import Client
from backend.schemas.client_schemas import ClientCreate, ClientResponse, ClientUpdate, ClientStatusUpdate

router = APIRouter(
    prefix="/clientes",
    tags=["clientes"],
)


@router.get("/", response_model=list[ClientResponse])
def read_clients(
        skip: int = 0,
        limit: int = 100,
        status: Optional[str] = None,  # Filtro opcional por estado
        db: Session = Depends(get_db)
):
    query = db.query(Client)

    if status:
        query = query.filter(Client.status == status)

    clients = query.offset(skip).limit(limit).all()
    return clients


@router.get("/{id_cliente}", response_model=ClientResponse)
def read_client(id_cliente: int, db: Session = Depends(get_db)):
    client = db.query(Client).filter(Client.id == id_cliente).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client


@router.post("/", response_model=ClientResponse, status_code=status.HTTP_201_CREATED)
def create_client(client: ClientCreate, db: Session = Depends(get_db)):
    # Verificar DNI único
    existing = db.query(Client).filter(Client.dni == client.dni).first()
    if existing:
        raise HTTPException(status_code=400, detail="DNI already registered")

    db_client = Client(
        **client.dict(),
        status="activo"  # Nuevo cliente siempre activo
    )
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client


@router.put("/{id_cliente}", response_model=ClientResponse)
def update_client(id_cliente: int, client: ClientUpdate, db: Session = Depends(get_db)):
    db_client = db.query(Client).filter(Client.id == id_cliente).first()
    if not db_client:
        raise HTTPException(status_code=404, detail="Client not found")

    update_data = client.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_client, field, value)

    db.commit()
    db.refresh(db_client)
    return db_client


@router.patch("/{id_cliente}/estado", response_model=ClientResponse)
def update_client_status(id_cliente: int, status_update: ClientStatusUpdate, db: Session = Depends(get_db)):
    db_client = db.query(Client).filter(Client.id == id_cliente).first()
    if not db_client:
        raise HTTPException(status_code=404, detail="Client not found")

    # Validar que el estado sea válido
    if status_update.status not in ["activo", "inactivo"]:
        raise HTTPException(status_code=400, detail="Status must be 'activo' or 'inactivo'")

    db_client.status = status_update.status
    db.commit()
    db.refresh(db_client)
    return db_client


@router.delete("/{id_cliente}", status_code=status.HTTP_204_NO_CONTENT)
def delete_client(id_cliente: int, db: Session = Depends(get_db)):
    db_client = db.query(Client).filter(Client.id == id_cliente).first()
    if not db_client:
        raise HTTPException(status_code=404, detail="Client not found")

    # Baja lógica: cambiar estado a inactivo
    db_client.status = "inactivo"
    db.commit()
    return