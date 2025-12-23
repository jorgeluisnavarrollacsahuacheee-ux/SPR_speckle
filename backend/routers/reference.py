from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Body, Request
from sqlalchemy.orm import Session
from pathlib import Path
import numpy as np
from PIL import Image
import io
import cv2
import shutil
import json
from typing import Any

from backend.database import get_db
from backend.models import Reference, Sample

router = APIRouter(prefix="/reference", tags=["reference"])
BASE_DIR = Path("backend/storage/references")


# ============================================================
# Utils
# ============================================================
def abs_url(request: Request, path: str) -> str:
    base = str(request.base_url).rstrip("/")
    return f"{base}{path}"


# ============================================================
# Upload referencia (IMAGEN ÚNICA)
# ============================================================
@router.post("/upload")
async def upload_reference(
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="El archivo no es una imagen")

    # Desactivar referencias anteriores
    db.query(Reference).update({Reference.active: False})

    ref = Reference(
        filename=file.filename,
        path="",
        iv=None,
        active=True,
    )
    db.add(ref)
    db.commit()
    db.refresh(ref)

    ref_dir = BASE_DIR / str(ref.id)
    ref_dir.mkdir(parents=True, exist_ok=True)
    dest = ref_dir / "original.png"

    content = await file.read()
    image = Image.open(io.BytesIO(content)).convert("L")
    image.save(dest)

    img = np.array(image, dtype=np.float32)
    ref.iv = float(np.mean(img))
    ref.path = str(dest)

    db.commit()
    db.refresh(ref)

    return {
        "message": "Referencia guardada y activada",
        "id": ref.id,
        "filename": ref.filename,
        "iv": ref.iv,
        "original_url_png": abs_url(
            request, f"/static/references/{ref.id}/original.png"
        ),
    }


# ============================================================
# Obtener referencia activa
# ============================================================
@router.get("/current")
def get_current_reference(request: Request, db: Session = Depends(get_db)):
    ref = db.query(Reference).filter(Reference.active == True).first()
    if not ref:
        raise HTTPException(status_code=404, detail="No hay referencia activa")

    latest = (
        db.query(Sample)
        .filter(Sample.filename == ref.filename)
        .order_by(Sample.created_at.desc())
        .first()
    )

    processed_path = Path(ref.path).parent / "processed.png"
    processed_url = (
        abs_url(request, f"/static/references/{ref.id}/processed.png")
        if processed_path.exists()
        else None
    )

    return {
        "id": ref.id,
        "filename": ref.filename,
        "iv": ref.iv,
        "iv_processed": latest.iv_processed if latest else None,
        "zncc": latest.zncc if latest else None,
        "rssd": latest.rssd if latest else None,
        "filter_metrics": latest.filter_metrics if latest else None,
        "active": ref.active,
        "original_url_png": abs_url(
            request, f"/static/references/{ref.id}/original.png"
        ),
        "processed_url_png": processed_url,
    }


# ============================================================
# Procesar referencia activa
# ============================================================
@router.post("/process_active")
def process_active_reference(
    request: Request,
    body: dict = Body(...),
    db: Session = Depends(get_db),
):
    filters = body.get("filters", {})
    params = body.get("params", {})

    ref = db.query(Reference).filter(Reference.active == True).first()
    if not ref:
        raise HTTPException(status_code=404, detail="No hay referencia activa")

    ref_path = Path(ref.path)
    if not ref_path.exists():
        raise HTTPException(status_code=404, detail="Archivo de referencia no existe")

    orig = np.array(Image.open(ref_path).convert("L"), dtype=np.uint8)
    processed = orig.copy()

    filter_metrics: dict[str, Any] = {}
    errores = []

    # ==========================
    # GAUSSIAN
    # ==========================
    if filters.get("gaussian"):
        try:
            p = params.get("gaussian", {})
            k = int(p.get("ksize", 5))
            if k % 2 == 0:
                k += 1

            processed = cv2.GaussianBlur(processed, (k, k), 0)

            filter_metrics["gaussian"] = {
                "ksize": k,
                "varianza": float(np.var(processed)),
                "energia": float(np.sum(processed.astype(np.float32) ** 2)),
                "media": float(np.mean(processed)),
            }
        except Exception as e:
            errores.append(f"gaussian: {e}")

    # ==========================
    # MEDIAN
    # ==========================
    if filters.get("median"):
        try:
            p = params.get("median", {})
            k = int(p.get("ksize", 5))
            if k % 2 == 0:
                k += 1

            processed = cv2.medianBlur(processed, k)

            filter_metrics["median"] = {
                "ksize": k,
                "desviacion_std": float(np.std(processed)),
                "varianza": float(np.var(processed)),
            }
        except Exception as e:
            errores.append(f"median: {e}")

    # ==========================
    # EQUALIZE HIST
    # ==========================
    if filters.get("equalize_hist"):
        try:
            processed = cv2.equalizeHist(processed)

            filter_metrics["equalize_hist"] = {
                "contraste": float(processed.max() - processed.min()),
                "entropia": float(
                    -np.sum(
                        (np.histogram(processed, bins=256)[0] / processed.size + 1e-9)
                        * np.log2(
                            np.histogram(processed, bins=256)[0] / processed.size + 1e-9
                        )
                    )
                ),
            }
        except Exception as e:
            errores.append(f"equalize_hist: {e}")

    # ==========================
    # CANNY
    # ==========================
    if filters.get("canny"):
        try:
            p = params.get("canny", {})
            t1 = int(p.get("threshold1", 100))
            t2 = int(p.get("threshold2", 200))

            edges = cv2.Canny(processed, t1, t2)
            processed = edges

            filter_metrics["canny"] = {
                "threshold1": t1,
                "threshold2": t2,
                "bordes_detectados": int(np.sum(edges > 0)),
                "densidad_bordes": float(np.mean(edges > 0)),
            }
        except Exception as e:
            errores.append(f"canny: {e}")

    # ==========================
    # BLUR
    # ==========================
    if filters.get("blur"):
        try:
            p = params.get("blur", {})
            k = int(p.get("ksize", 5))
            if k % 2 == 0:
                k += 1

            processed = cv2.blur(processed, (k, k))

            filter_metrics["blur"] = {
                "ksize": k,
                "varianza": float(np.var(processed)),
            }
        except Exception as e:
            errores.append(f"blur: {e}")

    # ==========================
    # BILATERAL
    # ==========================
    if filters.get("bilateral"):
        try:
            p = params.get("bilateral", {})
            d = int(p.get("d", 5))
            sc = int(p.get("sigmaColor", 75))
            ss = int(p.get("sigmaSpace", 75))

            processed = cv2.bilateralFilter(processed, d, sc, ss)

            filter_metrics["bilateral"] = {
                "d": d,
                "sigmaColor": sc,
                "sigmaSpace": ss,
                "varianza": float(np.var(processed)),
            }
        except Exception as e:
            errores.append(f"bilateral: {e}")

    # ==========================
    # LAPLACIAN
    # ==========================
    if filters.get("laplacian"):
        try:
            p = params.get("laplacian", {})
            k = int(p.get("ksize", 1))
            if k % 2 == 0:
                k += 1

            lap = cv2.Laplacian(processed, cv2.CV_64F, ksize=k)
            processed = cv2.convertScaleAbs(lap)

            filter_metrics["laplacian"] = {
                "ksize": k,
                "varianza": float(np.var(lap)),
                "energia": float(np.sum(lap ** 2)),
                "pixels_border": int(np.sum(np.abs(lap) > 0)),
            }
        except Exception as e:
            errores.append(f"laplacian: {e}")

    # ==========================
    # SOBEL
    # ==========================
    if filters.get("sobel"):
        try:
            p = params.get("sobel", {})
            dx = int(p.get("dx", 1))
            dy = int(p.get("dy", 0))
            k = int(p.get("ksize", 3))

            sob = cv2.Sobel(processed, cv2.CV_64F, dx, dy, ksize=k)
            processed = cv2.convertScaleAbs(sob)

            filter_metrics["sobel"] = {
                "dx": dx,
                "dy": dy,
                "ksize": k,
                "energia": float(np.sum(sob ** 2)),
            }
        except Exception as e:
            errores.append(f"sobel: {e}")

    # ==========================
    # THRESHOLD
    # ==========================
    if filters.get("threshold"):
        try:
            p = params.get("threshold", {})
            th = int(p.get("thresh", 127))
            mv = int(p.get("maxval", 255))

            _, processed = cv2.threshold(
                processed, th, mv, cv2.THRESH_BINARY
            )

            filter_metrics["threshold"] = {
                "thresh": th,
                "pixeles_blancos": int(np.sum(processed == 255)),
            }
        except Exception as e:
            errores.append(f"threshold: {e}")

    # ==========================
    # INVERT
    # ==========================
    if filters.get("invert"):
        processed = cv2.bitwise_not(processed)
        filter_metrics["invert"] = {
            "media": float(np.mean(processed)),
        }

    # ==========================
    # SHARPEN
    # ==========================
    if filters.get("sharpen"):
        try:
            p = params.get("sharpen", {})
            strength = float(p.get("strength", 1))

            kernel = np.array(
                [[0, -1, 0], [-1, 5 + strength, -1], [0, -1, 0]]
            )
            processed = cv2.filter2D(processed, -1, kernel)

            filter_metrics["sharpen"] = {
                "strength": strength,
                "varianza": float(np.var(processed)),
            }
        except Exception as e:
            errores.append(f"sharpen: {e}")

    if errores:
        raise HTTPException(status_code=400, detail=errores)

    # ============================================================
    # Guardar imagen procesada
    # ============================================================
    out_path = ref_path.parent / "processed.png"
    Image.fromarray(processed).save(out_path)

    # ============================================================
    # Métricas globales
    # ============================================================
    iv_processed = float(np.mean(processed))

    x = orig.astype(np.float32)
    y = processed.astype(np.float32)

    zncc = float(
        np.sum((x - x.mean()) * (y - y.mean()))
        / (np.linalg.norm(x - x.mean()) * np.linalg.norm(y - y.mean()))
    )

    rssd = float(np.sum((x - y) ** 2))

    sample = Sample(
        filename=ref.filename,
        iv_original=ref.iv,
        iv_processed=iv_processed,
        zncc=zncc,
        rssd=rssd,
        ops=[k for k, v in filters.items() if v],
        params=params,
        filter_metrics=filter_metrics,
    )

    db.add(sample)
    db.commit()

    return {
        "message": "Referencia activa procesada",
        "iv_original": ref.iv,
        "iv_processed": iv_processed,
        "zncc": zncc,
        "rssd": rssd,
        "original_url_png": abs_url(
            request, f"/static/references/{ref.id}/original.png"
        ),
        "processed_url_png": abs_url(
            request, f"/static/references/{ref.id}/processed.png"
        ),
    }


# ============================================================
# Historial
# ============================================================
@router.get("/history")
def get_history(request: Request, db: Session = Depends(get_db)):
    samples = db.query(Sample).order_by(Sample.created_at.desc()).all()
    return {
        "items": [
            {
                "id": s.id,
                "filename": s.filename,
                "iv_original": s.iv_original,
                "iv_processed": s.iv_processed,
                "zncc": s.zncc,
                "rssd": s.rssd,
                "ops": s.ops,
                "params": s.params,
                "filter_metrics": s.filter_metrics,
                "created_at": s.created_at.isoformat(),
            }
            for s in samples
        ]
    }
