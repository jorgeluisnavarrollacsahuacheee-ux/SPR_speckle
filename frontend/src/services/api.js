// frontend/src/services/api.js
import axios from "axios";

// ===============================
// CONFIGURACIÓN BASE
// ===============================
export const BASE =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: BASE,
  timeout: 20000,
});

// ===============================
// Interceptor global de errores
// ===============================
api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("❌ Error en API:", err.response?.data || err.message);
    return Promise.reject(err);
  }
);

// ===============================
// Utils
// ===============================
export function absUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${BASE}${path.startsWith("/") ? path : `/${path}`}`;
}

// ===============================
// REFERENCIAS (ALINEADO AL BACKEND)
// ===============================

// Subir referencia (activa automáticamente)
export async function uploadReference(file) {
  const fd = new FormData();
  fd.append("file", file);

  const res = await api.post("/reference/upload", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
}

// Obtener referencia activa
export async function getActiveReference() {
  const res = await api.get("/reference/current");
  return res.data;
}

// Procesar referencia activa
export async function processActive(payload) {
  const res = await api.post("/reference/process_active", payload, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
}

// Obtener historial
export async function fetchHistory() {
  const res = await api.get("/reference/history");
  return res.data;
}
