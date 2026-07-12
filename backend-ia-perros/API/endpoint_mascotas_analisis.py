from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, timedelta
from DATABASE.database import get_db
from MODELS.historial_escaneo import HistorialEscaneo

router = APIRouter()

@router.get("/mascotas/{mascota_id}/analisis")
def obtener_analisis_mascota(mascota_id: int, db: Session = Depends(get_db)):
    try:
        conteos_raw = db.query(
            HistorialEscaneo.emocion, func.count(HistorialEscaneo.id)
        ).filter(HistorialEscaneo.mascota_id == mascota_id).group_by(HistorialEscaneo.emocion).all()

        emociones_base = {"FELIZ": 0, "EMOCIONADO": 0, "TRANQUILO": 0, "TRISTE": 0, "ANSIOSO": 0}
        for emocion, conteo in conteos_raw:
            if emocion and emocion.upper() in emociones_base:
                emociones_base[emocion.upper()] = conteo

        dias_semana_map = {
            "Monday": "L", "Tuesday": "M", "Wednesday": "Mi",
            "Thursday": "J", "Friday": "V", "Saturday": "S", "Sunday": "D"
        }
        hoy = date.today()
        escaneos_por_dia = []

        for i in range(6, -1, -1):
            dia_evaluado = hoy - timedelta(days=i)

            conteo_dia = db.query(HistorialEscaneo).filter(
                HistorialEscaneo.mascota_id == mascota_id,
                func.date(HistorialEscaneo.fecha_hora) == dia_evaluado
            ).count()

            nombre_dia_eng = dia_evaluado.strftime("%A")
            nombre_dia_esp = dias_semana_map.get(nombre_dia_eng, dia_evaluado.strftime("%a"))

            escaneos_por_dia.append({
                "day": nombre_dia_esp,
                "count": conteo_dia,
                "active": dia_evaluado == hoy
            })

        return {
            "status": "success",
            "bienestar_general": 86,
            "escaneos_por_dia": escaneos_por_dia,
            "distribucion": {k.capitalize(): v for k, v in emociones_base.items()}
        }
    except Exception as e:
        print(f"Error en análisis: {str(e)}")
        return {"status": "error", "message": str(e)}
