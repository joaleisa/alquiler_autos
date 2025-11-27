from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from backend.data.database import get_db
from backend.models.user import User
from backend.schemas.auth_schemas import LoginRequest, LoginResponse

# Password hashing context (same as user_router)
password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter(
    prefix="/auth",
    tags=["authentication"],
)


@router.post("/login", response_model=LoginResponse)
def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate a user with username and password.
    
    - **username**: The user's username
    - **password**: The user's password (will be verified against hashed password in DB)
    
    Returns user information if authentication is successful.
    """
    # Find user by username
    user = db.query(User).filter(User.username == credentials.username).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos"
        )
    
    # Verify password against hashed password in database
    if not password_context.verify(credentials.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos"
        )
    
    # Return user data (similar to UserResponse)
    return {
        "userId": user.id,
        "employeeId": user.id_employee,
        "username": user.username,
        "employeeName": user.employee.name if user.employee else None
    }