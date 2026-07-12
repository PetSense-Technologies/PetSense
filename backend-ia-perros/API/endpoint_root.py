from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def inicio():
    return {"status": "online", "message": "API de Emociones Caninas activa"}
