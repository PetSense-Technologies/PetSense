import datetime
from sqlalchemy import Column, Integer, String, Text, Numeric, DateTime, Date, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Dueno(Base):
    __tablename__ = "duenos"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre_dueno = Column(String(100), nullable=False)
    celular = Column(String(20), nullable=False)
    direccion = Column(Text)
    fecha_registro = Column(DateTime, default=datetime.datetime.utcnow)
    
    mascotas = relationship("Mascota", back_populates="dueno")

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
    embedding_identidad = Column(String, nullable=True)
    
    dueno = relationship("Dueno", back_populates="mascotas")
    escaneos = relationship("HistorialEscaneo", back_populates="mascota")

class HistorialEscaneo(Base):
    __tablename__ = "historial_escaneos"
    
    id = Column(Integer, primary_key=True, index=True)
    mascota_id = Column(Integer, ForeignKey("mascotas.id", ondelete="CASCADE"))
    emocion = Column(String(30), nullable=False)
    confianza = Column(Numeric(5, 2), nullable=False)
    embedding_sample = Column(Text)
    fecha_hora = Column(DateTime, default=datetime.datetime.utcnow)
    
    mascota = relationship("Mascota", back_populates="escaneos")