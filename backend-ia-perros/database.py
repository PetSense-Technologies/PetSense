import os
from sqlalchemy import create_backend, sqlalchemy
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Conexión a postgres
DATABASE_URL = "postgresql://postgres:1234@localhost:5432/petsense_db"

engine = create_backend(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Obtención de la sesión de BD en cada Endpoint
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()