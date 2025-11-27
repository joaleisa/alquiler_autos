from sqlalchemy.orm import relationship

from backend.data.database import Base
from sqlalchemy import Integer, String, Column


class Client(Base):
    __tablename__ = 'Clients'

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255))
    dni = Column(String(255), unique=True)
    phone = Column(String(255))
    email = Column(String(255))
    status = Column(String(255))

    leases = relationship("Lease", back_populates="client")