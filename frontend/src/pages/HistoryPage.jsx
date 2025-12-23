// src/pages/HistoryPage.jsx
import React, { useEffect, useState } from "react";
import { fetchHistory } from "../services/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const HISTORY_CLEARED_AT_KEY = "historyClearedAt";

export default function HistoryPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await fetchHistory();
        let list = data.items || [];

        // 🔑 Filtrar por limpieza previa (timestamp)
        const clearedAt = localStorage.getItem(HISTORY_CLEARED_AT_KEY);
        if (clearedAt) {
          const clearedTime = Number(clearedAt);
          list = list.filter((r) => {
            const created = new Date(r.created_at).getTime();
            return created > clearedTime;
          });
        }

        setRows(list);
      } catch (err) {
        console.error(err);
        setError("Error al cargar historial.");
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  // =============================
  // Acciones UI
  // =============================
  const clearHistory = () => {
    localStorage.setItem(HISTORY_CLEARED_AT_KEY, Date.now().toString());
    setRows([]);
    setError("");
  };

  const exportHistoryToPDF = () => {
    if (rows.length === 0) return;

    const doc = new jsPDF("l", "mm", "a4");

    doc.setFontSize(14);
    doc.text(
      "SPR Speckle Analyzer – Historial de Procesamientos",
      14,
      15
    );

    const tableData = rows.map((r) => [
      r.id ?? "-",
      r.filename ?? "-",
      Array.isArray(r.ops) ? r.ops.join(", ") : "-",
      Array.isArray(r.ops)
        ? r.ops
            .map((op) =>
              r.params?.[op]
                ? `${op}: ${JSON.stringify(r.params[op])}`
                : null
            )
            .filter(Boolean)
            .join(" | ")
        : "-",
      r.iv_original != null ? r.iv_original.toFixed(2) : "-",
      r.iv_processed != null ? r.iv_processed.toFixed(2) : "-",
      r.zncc != null ? r.zncc.toFixed(4) : "-",
      r.rssd != null ? r.rssd.toFixed(2) : "-",
    ]);

    autoTable(doc, {
      startY: 25,
      head: [[
        "ID",
        "Archivo",
        "Filtros",
        "Parámetros usados",
        "IV original",
        "IV procesado",
        "ZNCC",
        "RSSD",
      ]],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 58, 138] },
      columnStyles: {
        3: { cellWidth: 80 }, // parámetros
      },
    });

    doc.save("historial_spr_speckle.pdf");
  };

  // =============================
  // Render helpers
  // =============================
  const renderValue = (val, decimals = 2) =>
    val !== null && val !== undefined && !Number.isNaN(val)
      ? Number(val).toFixed(decimals)
      : "-";

  const renderOps = (ops) =>
    Array.isArray(ops) && ops.length > 0 ? ops.join(", ") : "-";

  /**
   * Mostrar SOLO los parámetros de los filtros usados
   */
  const renderParams = (params, ops) => {
    if (!params || !Array.isArray(ops) || ops.length === 0) return "-";

    return ops
      .map((op) => {
        const p = params[op];
        if (!p) return null;
        return `${op}: ${JSON.stringify(p)}`;
      })
      .filter(Boolean)
      .join(" | ");
  };

  const renderMetricsFilter = (metrics) => {
    if (!metrics || typeof metrics !== "object") return "-";

    return (
      <div className="space-y-2 text-xs">
        {Object.entries(metrics).map(([filterName, m]) => (
          <div
            key={filterName}
            className="border border-slate-500 rounded p-2 bg-slate-800"
          >
            <div className="font-semibold text-blue-300">
              {filterName}
            </div>

            <div className="text-slate-300">
              {Object.entries(m).map(([k, v]) => (
                <div key={k}>
                  <span className="font-medium">{k}:</span>{" "}
                  {typeof v === "number"
                    ? renderValue(v, 4)
                    : JSON.stringify(v)}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <section className="max-w-7xl mx-auto mt-8 bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">
          Historial de procesamientos
        </h1>

        <div className="flex gap-2">
          <button
            onClick={exportHistoryToPDF}
            disabled={rows.length === 0}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded"
          >
            Descargar PDF
          </button>

          <button
            onClick={clearHistory}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Limpiar historial
          </button>
        </div>
      </div>

      {loading && <div className="text-blue-400">Cargando...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!loading && rows.length === 0 && (
        <div className="text-slate-300">
          No hay resultados guardados.
        </div>
      )}

      {rows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-white border-collapse">
            <thead>
              <tr className="bg-slate-800">
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Archivo</th>
                <th className="p-3 text-left">Filtros</th>
                <th className="p-3 text-left">Parámetros</th>
                <th className="p-3 text-left">IV original</th>
                <th className="p-3 text-left">IV procesado</th>
                <th className="p-3 text-left">ZNCC</th>
                <th className="p-3 text-left">RSSD</th>
                <th className="p-3 text-left">Métricas por filtro</th>
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
                  <td className="p-3">{r.filename ?? "-"}</td>
                  <td className="p-3">{renderOps(r.ops)}</td>
                  <td className="p-3">
                    {renderParams(r.params, r.ops)}
                  </td>
                  <td className="p-3">{renderValue(r.iv_original, 2)}</td>
                  <td className="p-3">{renderValue(r.iv_processed, 2)}</td>
                  <td className="p-3">{renderValue(r.zncc, 4)}</td>
                  <td className="p-3">{renderValue(r.rssd, 2)}</td>
                  <td className="p-3">
                    {renderMetricsFilter(r.filter_metrics)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
