import os
import cv2
import numpy as np
import pandas as pd
from tqdm import tqdm
from io_utils import load_config, load_images, average_images, save_image, ensure_dir
from metrics import IV, ZNCC, rSSD


def main():
    # === 1. Leer archivo de configuración ===
    cfg = load_config("config.yaml")
    paths = cfg["paths"]
    exp = cfg["experiment"]

    run_id = exp["run_id"]
    base_dir = paths["base"]
    raw_dir = paths["raw"]
    processed_dir = paths["processed"]
    results_dir = paths["results"]

    ensure_dir(processed_dir)
    ensure_dir(results_dir)

    # === 2. Cargar imágenes de referencia ===
    print("\n=== Cargando referencia ===")
    ref_folder = os.path.join(raw_dir, exp["reference_label"])
    ref_images = load_images(ref_folder, limit=exp["frames_per_sample"])
    ref_avg = average_images(ref_images)
    save_image(ref_avg, os.path.join(processed_dir, "avg", f"{exp['reference_label']}_avg.png"))

    # === 3. Calcular métricas ===
    data_rows = []

    print("\n=== Analizando muestras ===")
    for sample in exp["samples"]:
        label = sample["label"]
        n_value = sample["n"]

        folder = os.path.join(raw_dir, label)
        print(f"\nProcesando muestra: {label} (n={n_value})")

        # 3.1 Cargar imágenes y calcular promedio
        imgs = load_images(folder, limit=exp["frames_per_sample"])
        avg_img = average_images(imgs)

        # 3.2 Calcular métricas
        iv_val = IV(avg_img)
        zncc_val = ZNCC(avg_img, ref_avg)
        rssd_val = rSSD(avg_img, ref_avg)

        # 3.3 Guardar imagen promedio
        save_path = os.path.join(processed_dir, "avg", f"{label}_avg.png")
        save_image(avg_img, save_path)

        # 3.4 Almacenar resultados en lista
        data_rows.append({
            "sample": label,
            "n_value": n_value,
            "IV": iv_val,
            "ZNCC": zncc_val,
            "rSSD": rssd_val
        })

    # === 4. Exportar resultados a CSV ===
    df = pd.DataFrame(data_rows)
    out_csv = os.path.join(results_dir, f"{run_id}_metrics.csv")
    df.to_csv(out_csv, index=False)
    print(f"\n✅ Resultados guardados en: {out_csv}")

    print("\n=== Análisis completado con éxito ===")
    print(df)


if __name__ == "__main__":
    main()
