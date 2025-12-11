import os
from PIL import Image
from datetime import datetime

# Ruta correcta donde están tus .TIF
input_folder = r"C:\Users\jorge\Downloads\SPECKELS-Dataset\SPECKELS-JORGE"

# Carpeta de salida dentro del proyecto
output_folder = os.path.join(
    os.path.dirname(__file__),
    "data",
    datetime.now().strftime("%Y-%m-%d_run01"),
    "raw"
)

os.makedirs(output_folder, exist_ok=True)

print(f"\n=== Extrayendo TIFF multipágina desde: {input_folder} ===\n")

for fname in os.listdir(input_folder):
    if fname.lower().endswith((".tif", ".tiff")):
        fpath = os.path.join(input_folder, fname)
        print(f"📂 Procesando: {fname}")

        img = Image.open(fpath)

        for i in range(img.n_frames):
            img.seek(i)
            out_name = f"{os.path.splitext(fname)[0]}_frame_{i:03d}.png"
            img.save(os.path.join(output_folder, out_name))

        print(f"   → {img.n_frames} frames extraídos")

print(f"\n=== EXTRACCIÓN COMPLETA ===")
print(f"Las imágenes están en: {output_folder}\n")
