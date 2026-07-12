from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from DATABASE.database import get_db
from MODELS.historial_escaneo import HistorialEscaneo

router = APIRouter()

@router.get("/mascotas/{mascota_id}/historial")
def obtener_historial_mascota(mascota_id: int, db: Session = Depends(get_db)):
    try:
        registros = db.query(HistorialEscaneo).filter(
            HistorialEscaneo.mascota_id == mascota_id
        ).order_by(HistorialEscaneo.fecha_hora.desc()).all()

        resultado = []
        for r in registros:
            fecha_formateada = r.fecha_hora.strftime("%Y-%m-%d %H:%M") if r.fecha_hora else "Sin fecha"

            resultado.append({
                "id": r.id,
                "emocion": r.emocion.capitalize() if r.emocion else "Indefinido",
                "confianza": float(r.confianza) if r.confianza else 0.0,
                "fecha": fecha_formateada
            })
        return {"status": "success", "historial": resultado}
    except Exception as e:
        print(f"Error en historial: {str(e)}")
        return {"status": "error", "message": str(e)}
