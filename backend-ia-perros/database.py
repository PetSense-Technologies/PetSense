import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
load_dotenv()

<<<<<<< HEAD
# Conexión a postgres
# DATABASE_URL = "postgresql://postgres:1234@localhost:5432/petsense_db"
DATABASE_URL = "sqlite:///./petsense.db"
=======
# Conexión a supabase
DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL is None:
    raise ValueError("La variable DATABASE_URL no está definida.")
>>>>>>> 155c3eac3c2b18a4fbbef3fc59522c8f66479a44

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()