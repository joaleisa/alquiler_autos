from sqlalchemy.orm import relationship
from sqlalchemy.dialects.mysql import DATETIME
from backend.data.database import Base
from sqlalchemy import Integer, String, Column, ForeignKey, DECIMAL, DATE


class Lease(Base):
    __tablename__ = 'Leases'

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    clientId = Column(Integer, ForeignKey('Clients.id'), nullable=False)
    vehicleId = Column(Integer, ForeignKey('Vehicles.id'), nullable=False)
    employeeId = Column(Integer, ForeignKey('Employees.id'), nullable=False)
    date_time_start = Column(DATETIME, nullable=False)
    date_time_end = Column(DATETIME, nullable=False)
    amount = Column(DECIMAL(10, 2))
    state = Column(String(45), default="confirmado")  # creado, confirmado, cancelado, finalizado
    date_create = Column(DATE, nullable=False)
    date_confirm = Column(DATE, nullable=True)
    date_cancel = Column(DATE, nullable=True)
    start_kilometers = Column(Integer, nullable=True)
    end_kilometers = Column(Integer, nullable=True)

    # Relationships
    client = relationship("Client", back_populates="leases")
    vehicle = relationship("Vehicle", back_populates="leases")
    employee = relationship("Employee", back_populates="leases")
    invoice = relationship("Invoice", back_populates="lease", uselist=False)
    incidents = relationship("Incident", back_populates="lease")