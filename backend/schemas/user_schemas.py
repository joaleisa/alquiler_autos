from typing import Optional
from pydantic import BaseModel

class UserCreate(BaseModel):
    employeeId: int
    username: str
    password: str


class UserResponse(BaseModel):
    userId: int
    employeeId: Optional[int] = None
    username: str
    employeeName: Optional[str] = None

    class Config:
        from_attributes = True


class UserUpdatePassword(BaseModel):
    password: Optional[str] = None

class UserUpdate(BaseModel):
    employeeId: int
