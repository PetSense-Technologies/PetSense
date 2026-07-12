import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.orm import relationship
from DATABASE.database import Base

class Dueno(Base):
    __tablename__ = "duenos"

    id = Column(Integer, primary_key=True, index=True)
    nombre_dueno = Column(String(100), nullable=False)
    celular = Column(String(20), nullable=False)
    direccion = Column(Text)
    fecha_registro = Column(DateTime, default=datetime.datetime.utcnow)

    mascotas = relationship("Mascota", back_populates="dueno")
