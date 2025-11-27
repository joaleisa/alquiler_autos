from sqlalchemy.orm import relationship

from backend.data.database import Base
from sqlalchemy import Integer, String, Column, ForeignKey


class User(Base):
    __tablename__ = 'Users'

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_employee = Column(Integer, ForeignKey('Employees.id'), nullable=True)
    username = Column(String(255))
    password = Column(String(255))

    employee = relationship("Employee", back_populates="users")