from pydantic import BaseModel
from typing import Optional


class LoginRequest(BaseModel):
    """Schema for login request"""
    username: str
    password: str


class LoginResponse(BaseModel):
    """Schema for login response"""
    userId: int
    employeeId: Optional[int] = None
    username: str
    employeeName: Optional[str] = None

    class Config:
        from_attributes = True