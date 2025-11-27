# models/incident.py
from sqlalchemy.orm import relationship
from backend.data.database import Base
from sqlalchemy import Integer, String, Column, ForeignKey, DATE, DECIMAL


class Incident(Base):
    __tablename__ = 'Incidents'

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    rentalId = Column(Integer, ForeignKey('Leases.id'), nullable=False)
    employeeId = Column(Integer, ForeignKey('Employees.id'), nullable=False)
    clientName = Column(String(255))
    vehicleName = Column(String(255))
    type = Column(String(255))
    description = Column(String(255))
    cost = Column(DECIMAL(10, 2))
    date = Column(DATE)  # Assuming 'state' should be 'date' based on the type

    # Relationships
    lease = relationship("Lease", back_populates="incidents")
    employee = relationship("Employee", back_populates="incidents")