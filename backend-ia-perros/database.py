import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker

# Configura tus datos reales aquí
DATABASE_URL = "postgresql://postgres:1234@localhost:5432/petsense_db"

# Configuración de SQLAlchemy
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Dependencia para obtener la sesión de BD
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# === BLOQUE DE PRUEBA DE CONEXIÓN ===
if __name__ == "__main__":
    print("Intentando conectar a la base de datos...")
    try:
        # Intentamos abrir una conexión directa y ejecutar una consulta de prueba
        with engine.connect() as connection:
            # Enviamos un comando simple a Postgres para verificar que responde
            resultado = connection.execute(text("SELECT version();"))
            version = resultado.fetchone()
            
            print("\n¡Conexión EXITOSA! 🎉")
            print(f"Información del servidor: {version[0]}\n")
            
    except Exception as e:
        print("\n❌ Error al conectar a la base de datos.")
        print("Detalle del error:")
        print(e)