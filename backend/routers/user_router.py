from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext


from backend.data.database import get_db
from backend.models.user import User
from backend.schemas.user_schemas import UserCreate, UserResponse, UserUpdate, UserUpdatePassword

password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
router = APIRouter(
    prefix="/usuarios",
    tags=["usuarios"],
)


@router.get("/", response_model=list[UserResponse])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    # todo: solo admin
    users = db.query(User).offset(skip).limit(limit).all()
    return [
        {
            "userId": user.id,
            "employeeId": user.id_employee,
            "username": user.username,
            "employeeName": user.employee.name if user.employee else None
        }
        for user in users
    ]

@router.get("/{id_usuario}", response_model=UserResponse)
def read_user(id_usuario: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == id_usuario).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "userId": user.id,
        "employeeId": user.id_employee,
        "username": user.username,
        "employeeName": user.employee.name if user.employee else None
    }


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)

def create_user(user: UserCreate, db: Session = Depends(get_db)):
    hashed_password = password_context.hash(user.password)
    db_user = User(
        id_employee=user.employeeId,
        username=user.username,
        password=hashed_password,  # Store hashed, not plain text
        #password=user.password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return {
        "userId": db_user.id,
        "employeeId": db_user.id_employee,
        "username": db_user.username,
        "employeeName": db_user.employee.name if db_user.employee else None
    }

@router.patch("/{id_usuario}/password", response_model=UserResponse)
def update_user_password(id_usuario: int, user: UserUpdatePassword, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == id_usuario).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    db_user.password = password_context.hash(user.password)
    db.commit()
    db.refresh(db_user)
    return {
        "userId": db_user.id,
        "employeeId": db_user.id_employee,
        "username": db_user.username,
        "employeeName": db_user.employee.name if db_user.employee else None
    }

@router.patch("/{id_usuario}", response_model=UserResponse)
def update_user_employee(id_usuario: int, user: UserUpdate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == id_usuario).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    db_user.id_employee = user.employeeId
    db.commit()
    db.refresh(db_user)
    return {
        "userId": db_user.id,
        "employeeId": db_user.id_employee,
        "username": db_user.username,
        "employeeName": db_user.employee.name if db_user.employee else None
    }

@router.delete("/{id_usuario}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(id_usuario: int, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == id_usuario).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    #todo: cambiar funcionalidad para una soft delete, como en clientes
    db.delete(db_user)
    db.commit()
    return