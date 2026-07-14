import datetime
from sqlalchemy import Column, Integer, String, Text, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from DATABASE.database import Base

class Mascota(Base):
    __tablename__ = "mascotas"

    id = Column(Integer, primary_key=True, index=True)
    dueno_id = Column(Integer, ForeignKey("duenos.id", ondelete="CASCADE"))
    nombre_mascota = Column(String(50), nullable=False)
    raza = Column(String(50))
    edad_meses = Column(Integer)
    foto_perfil = Column(Text)
    racha_actual = Column(Integer, default=0)
    ultima_racha_update = Column(Date)
    fecha_registro = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Perfil Biométrico
    embedding_identidad = Column(Text)
    vista_frontal = Column(Text)
    lado_izq = Column(Text)
    lado_der = Column(Text)
    vista_3_4 = Column(Text)
    vista_superior = Column(Text)

    dueno = relationship("Dueno", back_populates="mascotas")
    escaneos = relationship("HistorialEscaneo", back_populates="mascota")
