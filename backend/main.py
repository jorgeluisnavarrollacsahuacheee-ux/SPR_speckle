# backend/main.py

from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import json
import numpy as np

# Manejo seguro de cv2
try:
    import cv2
except Exception:
    cv2 = None
    print("⚠️ Advertencia: OpenCV (cv2) no está instalado. Instala con: pip install opencv-python")

# Importaciones del paquete backend
from backend.database import Base, engine, get_db
from backend import models
from backend import utils

# ------------------------------------------------------------
# Logging y errores (archivos que debes tener en backend/logging.py y backend/errors.py)
# ------------------------------------------------------------
try:
    from backend.logging import setup_logger  # si tienes logging.py en backend/
except ImportError:
    # fallback por si estás importando como paquete relativo
    from logging import getLogger as setup_logger  # degradación mínima
    def setup_logger(name: str = "spr"):
        logger = setup_logger(name)
        return logger

try:
    from backend.errors import ErrorHandlerMiddleware  # si tienes errors.py en backend/
except ImportError:
    # Middleware mínimo inline si no se encuentra
    from fastapi import Request
    from fastapi.responses import JSONResponse
    from starlette.middleware.base import BaseHTTPMiddleware
    from logging import getLogger
    _logger_inline = getLogger("spr.api")

    class ErrorHandlerMiddleware(BaseHTTPMiddleware):
        async def dispatch(self, request: Request, call_next):
            try:
                response = await call_next(request)
                return response
            except Exception as exc:
                _logger_inline.exception(f"Unhandled error at {request.url.path}: {exc}")
                return JSONResponse(
                    status_code=500,
                    content={"detail": "Internal server error", "path": str(request.url.path)},
                )

logger = setup_logger("spr.boot")

# ------------------------------------------------------------
# App FastAPI
# ------------------------------------------------------------
app = FastAPI(title="SPR Speckle API", version="0.1.0")

# CORS controlado por entorno
def get_allowed_origins():
    origins_env = os.getenv("ALLOWED_ORIGINS", "")
    origins_list = [o.strip() for o in origins_env.split(",") if o.strip()]
    # Fallback de desarrollo si no hay entorno configurado
    if not origins_list:
        origins_list = [
            "http://localhost:5173",
            "http://localhost:5174",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:5174",
        ]
    return origins_list

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Manejo de errores global
app.add_middleware(ErrorHandlerMiddleware)

# ------------------------------------------------------------
# Inicialización de BD
# ------------------------------------------------------------
# En desarrollo puedes crear tablas si no existen. Evita drop_all para no perder datos.
try:
    Base.metadata.create_all(bind=engine)
    logger.info("DB checked: tables ensured.")
except Exception as e:
    logger.error(f"DB init error: {e}")

# ------------------------------------------------------------
# ENDPOINT DE SALUD /ping
# ------------------------------------------------------------
@app.get("/ping")
def ping():
    logger.info("Ping OK")
    return {"status": "ok"}

# ------------------------------------------------------------
# ENDPOINT 1: Procesar referencia
# ------------------------------------------------------------
@app.post("/process_reference")
async def process_reference(file: UploadFile = File(...)):
    if cv2 is None:
        raise HTTPException(status_code=500, detail="OpenCV no está instalado en el servidor")

    # Leer imagen
    try:
        image = await utils.read_image_uploadfile(file)
    except Exception as e:
        logger.exception(f"Error leyendo archivo: {e}")
        raise HTTPException(status_code=400, detail=f"Error leyendo archivo: {e}")

    # Convertir a gris
    try:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    except Exception as e:
        logger.exception(f"Error convirtiendo a gris: {e}")
        raise HTTPException(status_code=500, detail=f"Error convirtiendo a gris: {e}")

    # FFT
    try:
        fft_spec = utils.fft_spectrum(gray)
    except Exception as e:
        logger.exception(f"Error calculando FFT: {e}")
        raise HTTPException(status_code=500, detail=f"Error calculando FFT: {e}")

    resp = {
        "fft_mean": float(np.nanmean(fft_spec)),
        "mean_intensity": float(np.nanmean(gray)),
        "message": "Referencia procesada correctamente",
    }
    logger.info(f"Referencia procesada: {resp}")
    return resp

# ------------------------------------------------------------
# ENDPOINT 2: Procesar muestra con operaciones
# ------------------------------------------------------------
@app.post("/process_sample")
async def process_sample(
    sample_name: str = Form(...),
    liquid_label: str = Form(...),
    file: UploadFile = File(...),
    operations_json: Optional[str] = Form(None),
    operations: Optional[List[str]] = Form(None),
    db: Session = Depends(get_db),
):
    if cv2 is None:
        raise HTTPException(status_code=500, detail="OpenCV no está instalado")

    # Normalizar operaciones
    ops_dict = {
        "fft": False,
        "contrast": False,
        "mean": False,
        "correlation": False,
        "gaussian": False,
        "median": False,
        "edges": False,
    }

    try:
        if operations_json:
            parsed = json.loads(operations_json)
            if isinstance(parsed, dict):
                for k in ops_dict.keys():
                    ops_dict[k] = bool(parsed.get(k, False))
        elif operations:
            for k in operations:
                if k in ops_dict:
                    ops_dict[k] = True
    except Exception as e:
        logger.warning(f"Error parseando operaciones: {e}")

    # Leer imagen
    try:
        image = await utils.read_image_uploadfile(file)
    except Exception as e:
        logger.exception(f"Error leyendo archivo: {e}")
        raise HTTPException(status_code=400, detail=f"Error leyendo archivo: {e}")

    try:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    except Exception as e:
        logger.exception(f"Error convirtiendo a gris: {e}")
        raise HTTPException(status_code=500, detail=f"Error convirtiendo a gris: {e}")

    result = {
        "sample_name": sample_name,
        "liquid_label": liquid_label,
        "operations": [k for k, v in ops_dict.items() if v],
    }

    # Operaciones solicitadas
    try:
        if ops_dict["fft"]:
            result["fft_mean"] = float(np.nanmean(utils.fft_spectrum(gray)))

        if ops_dict["contrast"]:
            result["contrast"] = float(np.nanstd(gray))

        if ops_dict["correlation"]:
            flat = gray.flatten().astype(float)
            result["correlation"] = float(np.corrcoef(flat, flat)[0, 1]) if flat.size > 1 else 0.0

        if ops_dict["mean"]:
            result["mean_intensity"] = float(np.nanmean(gray))

        if ops_dict["gaussian"]:
            _ = cv2.GaussianBlur(gray, (5, 5), 0)
            result["gaussian"] = "OK"

        if ops_dict["median"]:
            _ = cv2.medianBlur(gray, 5)
            result["median"] = "OK"

        if ops_dict["edges"]:
            _ = cv2.Canny(gray, 50, 150)
            result["edges"] = "OK"
    except Exception as e:
        logger.exception(f"Error en operaciones: {e}")
        raise HTTPException(status_code=500, detail=f"Error en operaciones: {e}")

    # Guardado en BD
    try:
        new_sample = models.Sample(
            sample_name=sample_name,
            liquid_label=liquid_label,
            fft=result.get("fft_mean"),
            contrast=result.get("contrast"),
            mean_intensity=result.get("mean_intensity"),
        )
        db.add(new_sample)
        db.commit()
        db.refresh(new_sample)
        result["db_id"] = getattr(new_sample, "id", None)
        result["db_saved"] = True
    except Exception as e:
        db.rollback()
        result["db_saved"] = False
        logger.exception(f"Error guardando en DB: {e}")

    result["message"] = "Muestra procesada correctamente"
    logger.info(f"Muestra procesada: {result}")
    return result

# ------------------------------------------------------------
# ENDPOINT 3: Histórico
# ------------------------------------------------------------
@app.get("/history")
def history(db: Session = Depends(get_db)):
    try:
        samples = db.query(models.Sample).all()
    except Exception as e:
        logger.exception(f"Error consultando historial: {e}")
        raise HTTPException(status_code=500, detail=f"Error consultando historial: {e}")

    payload = []
    for s in samples:
        payload.append({
            "id": getattr(s, "id", None),
            "sample_name": getattr(s, "sample_name", None),
            "liquid_label": getattr(s, "liquid_label", None),
            "iv": getattr(s, "mean_intensity", None),
            "zncc": getattr(s, "zncc", None),
            "rssd": getattr(s, "rssd", None),
            "n_images": getattr(s, "n_images", 1),
        })

    return {"samples": payload}