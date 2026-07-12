import datetime
from sqlalchemy import Column, Integer, String, Text, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from DATABASE.database import Base

class HistorialEscaneo(Base):
    __tablename__ = "historial_escaneos"

    id = Column(Integer, primary_key=True, index=True)
    mascota_id = Column(Integer, ForeignKey("mascotas.id", ondelete="CASCADE"))
    emocion = Column(String(30), nullable=False)
    confianza = Column(Numeric(5, 2), nullable=False)
    embedding_sample = Column(Text)
    fecha_hora = Column(DateTime, default=datetime.datetime.utcnow)

    mascota = relationship("Mascota", back_populates="escaneos")
