import yaml

# Abrir el archivo config.yaml en modo lectura y codificación UTF-8
with open("config.yaml", "r", encoding="utf-8") as f:
    cfg = yaml.safe_load(f)  # Cargar los datos del archivo YAML como un diccionario de Python

# Mostrar los datos cargados para verificar que se leen correctamente
print("✅ Archivo leído correctamente")
print("Run ID:", cfg["experiment"]["run_id"])

print("Muestras:")
for s in cfg["experiment"]["samples"]:
    print(" -", s["label"], "→ índice:", s["n"])
