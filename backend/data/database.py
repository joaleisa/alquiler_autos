import os
import ssl
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from .config import settings

# Certificados
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CERTS_DIR = os.path.join(BASE_DIR, "certificados")
print(CERTS_DIR)

# Create SSL context - bypass strict verification
ssl_context = ssl.create_default_context()
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE

# Load client certificates for authentication
ssl_context.load_cert_chain(
    certfile=os.path.join(CERTS_DIR, "client-cert.pem"),
    keyfile=os.path.join(CERTS_DIR, "client-key.pem")
)

# Build connection string
DATABASE_URL = f"mysql+pymysql://{settings.DB_USER}:{settings.DB_PASSWORD}@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"

# Create engine with SSL context
engine = create_engine(
    DATABASE_URL,
    connect_args={"ssl": ssl_context}
)

# Create Session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class
class Base(DeclarativeBase):
    pass

# Dependency to get DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()