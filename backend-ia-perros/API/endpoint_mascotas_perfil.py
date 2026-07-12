from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from DATABASE import database
from MODELS import models

router = APIRouter()

@router.get("/mascotas/{mascota_id}/perfil")
def obtener_perfil_mascota(mascota_id: int, db: Session = Depends(database.get_db)):
    try:
        mascota = db.query(models.Mascota).filter(models.Mascota.id == mascota_id).first()
        if not mascota:
            return {"status": "error", "message": "Mascota no encontrada"}

        total_escaneos = db.query(models.HistorialEscaneo).filter(
            models.HistorialEscaneo.mascota_id == mascota_id
        ).count()

        ultimo_escaneo = db.query(models.HistorialEscaneo).filter(
            models.HistorialEscaneo.mascota_id == mascota_id
        ).order_by(models.HistorialEscaneo.id.desc()).first()

        ultima_emocion = ultimo_escaneo.emocion.capitalize() if ultimo_escaneo else "Indefinido"

        return {
            "status": "success",
            "nombre": mascota.nombre_mascota,
            "raza": mascota.raza,
            "edad": mascota.edad_meses,
            "racha_actual": mascota.racha_actual,
            "total_escaneos": total_escaneos,
            "ultima_emocion": ultima_emocion
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}
