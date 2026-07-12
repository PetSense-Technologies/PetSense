from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from DATABASE import database
from MODELS import models

router = APIRouter()

@router.post("/mascotas/registro")
def registrar_mascota_completa(
    nombre_dueno: str, celular: str, direccion: str,
    nombre_mascota: str, raza: str, edad_meses: int,
    db: Session = Depends(database.get_db)
):
    try:
        nuevo_dueno = models.Dueno(nombre_dueno=nombre_dueno, celular=celular, direccion=direccion)
        db.add(nuevo_dueno)
        db.flush()

        nueva_mascota = models.Mascota(
            dueno_id=nuevo_dueno.id,
            nombre_mascota=nombre_mascota,
            raza=raza,
            edad_meses=edad_meses,
            racha_actual=0
        )
        db.add(nueva_mascota)
        db.commit()
        db.refresh(nueva_mascota)

        return {"status": "success", "mascota_id": nueva_mascota.id, "message": "Registro completado exitosamente"}
    except Exception as e:
        db.rollback()
        return {"status": "error", "message": str(e)}
