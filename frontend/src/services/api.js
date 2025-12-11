// src/services/api.js
import axios from "axios";

// Base URL desde .env
const BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// Instancia de Axios
const api = axios.create({
  baseURL: BASE,
  timeout: 10000, // 10 segundos
});

// Interceptor de respuestas
api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("❌ Error en API:", err.response?.data || err.message);
    return Promise.reject(err);
  }
);

// =====================
// Funciones de servicio
// =====================

export async function uploadReference(file) {
  const fd = new FormData();
  fd.append("file", file);

  const res = await api.post("/process_reference", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

/**
 * operationsObj: ejemplo { fft: true, contrast: false, mean: true, ... }
 */
export async function uploadSample({ file, sample_name, liquid_label, operationsObj }) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("sample_name", sample_name);
  fd.append("liquid_label", liquid_label);
  fd.append("operations_json", JSON.stringify(operationsObj));

  const res = await api.post("/process_sample", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function fetchHistory() {
  const res = await api.get("/history");
  return res.data;
}