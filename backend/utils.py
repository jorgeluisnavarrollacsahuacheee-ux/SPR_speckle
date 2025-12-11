# backend/utils.py
import numpy as np
import cv2
from fastapi import UploadFile

async def read_image_uploadfile(file: UploadFile) -> np.ndarray:
    """
    Lee un UploadFile (FastAPI) y devuelve imagen en formato BGR (OpenCV).
    """
    contents = await file.read()
    arr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("No se pudo decodificar la imagen. Formato inválido o archivo corrupto.")
    return img

def fft_spectrum(gray: np.ndarray) -> np.ndarray:
    """
    Calcula un espectro FFT magnitude para una imagen en escala de grises.
    Devuelve magnitudes (float).
    """
    f = np.fft.fft2(gray.astype(float))
    fshift = np.fft.fftshift(f)
    magnitude_spectrum = np.abs(fshift)
    # evitar NaN/inf
    magnitude_spectrum = np.nan_to_num(magnitude_spectrum, nan=0.0, posinf=0.0, neginf=0.0)
    return magnitude_spectrum
