from sqlalchemy.orm import relationship

from backend.data.database import Base
from sqlalchemy import Integer, String, Column, ForeignKey, DECIMAL

class Vehicle(Base):
    __tablename__ = 'Vehicles'

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    brand = Column(String(255))
    model = Column(String(255))
    patente = Column(String(255), unique=True)
    year = Column(Integer)
    pricePerDay = Column(DECIMAL(10,2))
    thumbnail = Column(String(255))
    seats = Column(Integer)
    transmission = Column(String(45))
    fuel = Column(String(45))
    kilometraje_actual = Column(Integer) #todo: traducir aca y en bd
    estado = Column(String(255)) #todo: traducir aca y en bd

    maintenances = relationship("Maintenance", back_populates="vehicle")
    leases = relationship("Lease", back_populates="vehicle")