from typing import Optional
from pydantic import BaseModel


class EmployeeCreate(BaseModel):
    name: str
    dni: str
    email: str
    phone: str
    cargo: str

class EmployeeResponse(BaseModel):
    id: int
    name: str
    dni: str
    email: str
    phone: str
    cargo: str


class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    dni: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    cargo: Optional[str] = None

