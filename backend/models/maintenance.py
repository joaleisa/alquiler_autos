from sqlalchemy.dialects.mysql import DATETIME
from sqlalchemy.orm import relationship

from backend.data.database import Base
from sqlalchemy import Integer, String, Column, ForeignKey, DECIMAL


class Maintenance(Base):
    __tablename__ = 'Maintenance'

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    vehicleId = Column(Integer, ForeignKey('Vehicles.id'), nullable=True)
    employeeId = Column(Integer, ForeignKey('Employees.id'), nullable=True)
    vehicleName = Column(String(255))
    startDate = Column(DATETIME)
    endDate = Column(DATETIME)
    type = Column(String(255))
    description = Column(String(255))
    cost = Column(DECIMAL(10,2))
    status = Column(String(50), default="iniciado")    

    
    vehicle = relationship("Vehicle", back_populates="maintenances")
    employee = relationship("Employee", back_populates="maintenances")