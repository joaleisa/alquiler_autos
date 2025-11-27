# schemas/client_schemas.py
from typing import Optional
from pydantic import BaseModel


class ClientCreate(BaseModel):
    name: str
    dni: str
    phone: str
    email: str


class ClientResponse(BaseModel):
    id: int
    name: str
    dni: str
    phone: str
    email: str
    status: str

    class Config:
        from_attributes = True


class ClientUpdate(BaseModel):
    name: Optional[str] = None
    dni: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    status: Optional[str] = None


class ClientStatusUpdate(BaseModel):
    status: str  # "activo" or "inactivo"