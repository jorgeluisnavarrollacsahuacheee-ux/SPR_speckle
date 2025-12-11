// src/pages/HistoryPage.jsx
import React, { useEffect, useState } from "react";

export default function HistoryPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("http://localhost:8000/history");
        if (!response.ok) {
          throw new Error("Error en la respuesta del servidor");
        }
        const data = await response.json();
        // El backend devuelve { "samples": [...] }
        setRows(data.samples || []);
      } catch (err) {
        console.error(err);
        setError("Error al cargar historial.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <section className="max-w-6xl mx-auto mt-8 bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold text-white mb-6">Historial de muestras</h1>

      {loading && <div className="text-blue-400">Cargando...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!loading && rows.length === 0 && (
        <div className="text-slate-300">No hay resultados guardados.</div>
      )}

      {rows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-white">
            <thead>
              <tr className="bg-slate-800">
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Muestra</th>
                <th className="p-3 text-left">Líquido</th>
                <th className="p-3 text-left">IV</th>
                <th className="p-3 text-left">ZNCC</th>
                <th className="p-3 text-left">RSSD</th>
                <th className="p-3 text-left"># Imágenes</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={r.id ?? i}
                  className={
                    i % 2 === 0
                      ? "bg-slate-700"
                      : "bg-slate-600 hover:bg-slate-500"
                  }
                >
                  <td className="p-3">{r.id ?? i + 1}</td>
                  <td className="p-3">{r.sample_name}</td>
                  <td className="p-3">{r.liquid_label}</td>
                  <td className="p-3">{r.iv ?? "-"}</td>
                  <td className="p-3">{r.zncc ?? "-"}</td>
                  <td className="p-3">{r.rssd ?? "-"}</td>
                  <td className="p-3">{r.n_images ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}