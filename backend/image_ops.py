# backend/image_ops.py
import numpy as np
from PIL import Image
import os

def load_image_as_gray(path: str) -> np.ndarray:
    img = Image.open(path).convert("L")
    return np.array(img, dtype=np.float32)

def write_bytes(dest_path: str, content: bytes) -> str:
    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    with open(dest_path, "wb") as f:
        f.write(content)
    return dest_path