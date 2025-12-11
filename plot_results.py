import pandas as pd
import matplotlib.pyplot as plt
import os
import yaml

# === Cargar config.yaml ===
with open("config.yaml", "r") as f:
    cfg = yaml.safe_load(f)

results_path = cfg["paths"]["results"]
run_id = cfg["experiment"]["run_id"]

csv_file = os.path.join(results_path, f"{run_id}_metrics.csv")

print("📄 Leyendo archivo:", csv_file)

df = pd.read_csv(csv_file)

# Crear carpeta para gráficos si no existe
plots_dir = os.path.join(results_path, "plots")
os.makedirs(plots_dir, exist_ok=True)

print("📊 Generando gráficos...")

def save_plot(x, y, xlabel, ylabel, title, filename):
    plt.figure(figsize=(7,5))
    plt.plot(x, y, marker="o", linewidth=2)
    plt.xlabel(xlabel)
    plt.ylabel(ylabel)
    plt.title(title)
    plt.grid(True)
    plt.tight_layout()
    plt.savefig(os.path.join(plots_dir, filename))
    plt.close()

# === Gráficos ===

# IV vs n
save_plot(
    df["n_value"], df["IV"],
    xlabel="Índice de refracción (n)",
    ylabel="Intensidad de Varianza (IV)",
    title="IV vs Índice de Refracción",
    filename="iv_vs_n.png"
)

# ZNCC vs n
save_plot(
    df["n_value"], df["ZNCC"],
    xlabel="Índice de refracción (n)",
    ylabel="ZNCC",
    title="ZNCC vs Índice de Refracción",
    filename="zncc_vs_n.png"
)

# rSSD vs n
save_plot(
    df["n_value"], df["rSSD"],
    xlabel="Índice de refracción (n)",
    ylabel="rSSD",
    title="rSSD vs Índice de Refracción",
    filename="rssd_vs_n.png"
)

print("✅ Gráficos guardados en:", plots_dir)
