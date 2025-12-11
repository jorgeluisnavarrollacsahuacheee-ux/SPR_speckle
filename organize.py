import os
import shutil

# Ruta al folder raw
RAW = r"./data/2025-11-13_run01/raw"

# Creamos carpetas destino
dest_ref     = os.path.join(RAW, "ref")
dest_n13311  = os.path.join(RAW, "n13311")
dest_n13450  = os.path.join(RAW, "n13450")
dest_n13529  = os.path.join(RAW, "n13529")
dest_extra   = os.path.join(RAW, "extra")

for d in [dest_ref, dest_n13311, dest_n13450, dest_n13529, dest_extra]:
    os.makedirs(d, exist_ok=True)

# Reglas según Opción 2
rules = {
    "image_sample1_1": dest_ref,      # referencia
    "image_sample2_0": dest_n13311,   # n = 1.3311
    "image_sample3_0": dest_n13450,   # n = 1.3450
    "image_sample4_0": dest_n13529,   # n = 1.3529
}

print("\n=== ORGANIZANDO ARCHIVOS ===\n")

for filename in os.listdir(RAW):
    if not filename.lower().endswith((".png", ".tif", ".jpg")):
        continue

    full_path = os.path.join(RAW, filename)

    moved = False
    for key, dest_folder in rules.items():
        if key in filename:
            shutil.move(full_path, os.path.join(dest_folder, filename))
            print(f"✔ {filename} → {os.path.basename(dest_folder)}")
            moved = True
            break

    if not moved:
        shutil.move(full_path, os.path.join(dest_extra, filename))
        print(f"⚠ {filename} → extra/ (no coincidió con ninguna regla)")

print("\n=== ORGANIZACIÓN COMPLETA ===")