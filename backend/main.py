# backend/main.py

from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
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
#  APP FASTAPI
# ------------------------------------------------------------

app = FastAPI(title="SPR Speckle API", version="0.1.0")

# ⚠️ Desarrollo: borra y recrea tablas para alinear con models.py
# Quita estas dos líneas cuando quieras preservar datos en producción.
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

# ------------------------------------------------------------
#  CORS PARA PERMITIR FRONTEND VITE (localhost:5173 y 5174)
# ------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "*",  # mantener abierto durante pruebas
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------------------
#  ENDPOINT DE PRUEBA /ping
# ------------------------------------------------------------
@app.get("/ping")
def ping():
    return {"status": "ok"}

# ------------------------------------------------------------
#  ENDPOINT 1: Procesar referencia
# ------------------------------------------------------------
@app.post("/process_reference")
async def process_reference(file: UploadFile = File(...)):
    if cv2 is None:
        raise HTTPException(status_code=500, detail="OpenCV no está instalado en el servidor")

    # Leer imagen
    try:
        image = await utils.read_image_uploadfile(file)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error leyendo archivo: {e}")

    # Convertir a gris
    try:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error convirtiendo a gris: {e}")

    # FFT
    try:
        fft_spec = utils.fft_spectrum(gray)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculando FFT: {e}")

    return {
        "fft_mean": float(np.nanmean(fft_spec)),
        "mean_intensity": float(np.nanmean(gray)),
        "message": "Referencia procesada correctamente",
    }

# ------------------------------------------------------------
#  ENDPOINT 2: Procesar muestra con operaciones
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
        print("⚠️ Error parseando operaciones:", e)

    # Leer imagen
    try:
        image = await utils.read_image_uploadfile(file)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error leyendo archivo: {e}")

    try:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    except Exception as e:
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
        raise HTTPException(status_code=500, detail=f"Error en operaciones: {e}")

    # Guardado en BD (usa nombres de columnas reales del modelo)
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
        print("⚠️ Error guardando en DB:", e)

    result["message"] = "Muestra procesada correctamente"
    return result

# ------------------------------------------------------------
#  ENDPOINT 3: Histórico
# ------------------------------------------------------------
@app.get("/history")
def history(db: Session = Depends(get_db)):
    try:
        samples = db.query(models.Sample).all()
    except Exception as e:
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