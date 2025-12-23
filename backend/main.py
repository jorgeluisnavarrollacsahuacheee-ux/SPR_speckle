# backend/main.py

from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import os
import numpy as np

# -------------------------------
# Routers
# -------------------------------
from backend.routers.reference import router as reference_router

# -------------------------------
# Database
# -------------------------------
from backend.database import Base, engine, get_db
from backend import models

# -------------------------------
# Utils
# -------------------------------
from backend import utils

# -------------------------------
# OpenCV (opcional)
# -------------------------------
try:
    import cv2
except Exception:
    cv2 = None
    print("⚠️ OpenCV no instalado (pip install opencv-python)")

# ============================================================
# APP
# ============================================================
app = FastAPI(
    title="SPR Speckle API",
    version="1.0.0",
    description="Backend académico para análisis de speckle SPR",
)

# ============================================================
# CORS
# ============================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# DB INIT
# ============================================================
Base.metadata.create_all(bind=engine)

# ============================================================
# STATIC FILES
# ============================================================
# Sirve imágenes desde:
# backend/storage/references/<id>/original.png
# backend/storage/references/<id>/processed.png
app.mount(
    "/static",
    StaticFiles(directory="backend/storage"),
    name="static",
)

# ============================================================
# ROUTERS
# ============================================================
app.include_router(reference_router)

# ============================================================
# HEALTH CHECK
# ============================================================
@app.get("/ping")
def ping():
    return {"status": "ok"}

# ============================================================
# (OPCIONAL) ENDPOINT SIMPLE DE PRUEBA
# ============================================================
@app.post("/process_reference")
async def process_reference(file: UploadFile = File(...)):
    """
    Endpoint aislado solo para pruebas rápidas.
    NO interfiere con el flujo real del proyecto.
    """
    if cv2 is None:
        raise HTTPException(status_code=500, detail="OpenCV no disponible")

    image = await utils.read_image_uploadfile(file)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    return {
        "mean_intensity": float(np.mean(gray)),
        "message": "Imagen procesada correctamente",
    }
