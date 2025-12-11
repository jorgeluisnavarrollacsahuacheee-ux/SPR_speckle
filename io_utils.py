import os
import cv2
import numpy as np
from tqdm import tqdm
import yaml


def load_config(config_path="config.yaml"):
    """Carga la configuración YAML y devuelve el diccionario."""
    with open(config_path, "r", encoding="utf-8") as f:
        cfg = yaml.safe_load(f)
    return cfg


def list_images_in_folder(folder):
    """Devuelve una lista ordenada de rutas de imágenes en la carpeta."""
    valid_exts = (".png", ".jpg", ".jpeg", ".tif", ".bmp")
    files = [os.path.join(folder, f) for f in os.listdir(folder)
             if f.lower().endswith(valid_exts)]
    return sorted(files)


def load_images(folder, limit=None):
    """Carga imágenes como matrices NumPy, opcionalmente limitando la cantidad."""
    files = list_images_in_folder(folder)
    if limit:
        files = files[:limit]
    images = [cv2.imread(f, cv2.IMREAD_GRAYSCALE).astype(np.float32)
              for f in tqdm(files, desc=f"Cargando {os.path.basename(folder)}")]
    return np.stack(images, axis=0)  # (N, alto, ancho)


def average_images(images):
    """Calcula el promedio de intensidad de un conjunto de imágenes."""
    avg_img = np.mean(images, axis=0)
    return avg_img


def save_image(img, path):
    """Guarda una imagen en escala de grises."""
    cv2.imwrite(path, img.astype(np.uint8))


def ensure_dir(path):
    """Crea la carpeta si no existe."""
    if not os.path.exists(path):
        os.makedirs(path)
