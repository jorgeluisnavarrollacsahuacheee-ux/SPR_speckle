// src/pages/SamplePage.jsx
import React, { useEffect, useState } from "react";
import { getActiveReference, processActive, absUrl } from "../services/api";
import FilterSidebar from "../components/FilterSidebar";
import FilterConfigModal from "../components/FilterConfigModal";
import { validateFilters } from "../utils/filterValidation";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
} from "recharts";

export default function SamplePage() {
  // ======================================================
  // Estados principales
  // ======================================================
  const [activeRef, setActiveRef] = useState(null);
  const [processedUrl, setProcessedUrl] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [showChart, setShowChart] = useState(false);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState([]);

  // ======================================================
  // Estados de modal
  // ======================================================
  const [modalOpen, setModalOpen] = useState(false);
  const [currentFilter, setCurrentFilter] = useState(null);
  const [modalParams, setModalParams] = useState({});

  // ======================================================
  // Filtros
  // ======================================================
  const [filters, setFilters] = useState({
    gaussian: false,
    median: false,
    equalize_hist: false,
    canny: false,
    blur: false,
    bilateral: false,
    laplacian: false,
    sobel: false,
    threshold: false,
    invert: false,
    sharpen: false,
  });

  // ======================================================
  // Parámetros de filtros
  // ======================================================
  const [filterParams, setFilterParams] = useState({
    gaussian: { ksize: 3, sigmaX: 1 },
    median: { ksize: 3 },
    canny: { threshold1: 100, threshold2: 200 },
    blur: { ksize: 3 },
    bilateral: { d: 5, sigmaColor: 75, sigmaSpace: 75 },
    laplacian: { ksize: 1 },
    sobel: { dx: 1, dy: 0, ksize: 3 },
    threshold: { thresh: 127, maxval: 255 },
    sharpen: { strength: 1 },
  });

  // ======================================================
  // Cargar referencia activa
  // ======================================================
  useEffect(() => {
    const loadActiveReference = async () => {
      try {
        const ref = await getActiveReference();
        setActiveRef(ref);
      } catch (err) {
        console.error(err);
        setError("No hay referencia activa. Sube una imagen.");
      }
    };
    loadActiveReference();
  }, []);

  // ======================================================
  // Handlers de filtros
  // ======================================================
  const toggleFilter = (filterName) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: !prev[filterName],
    }));
  };

  // ======================================================
  // Modal handlers (ROBUSTOS)
  // ======================================================
  const openConfigModal = (filterName) => {
    if (
      !filterParams[filterName] ||
      Object.keys(filterParams[filterName]).length === 0
    ) {
      return;
    }

    setCurrentFilter(filterName);
    setModalParams({ ...filterParams[filterName] });
    setModalOpen(true);
  };

  const closeConfigModal = () => {
    setModalOpen(false);
    setCurrentFilter(null);
    setModalParams({});
  };

  const handleModalParamChange = (key, value) => {
    setModalParams((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const saveModalConfig = () => {
    setFilterParams((prev) => ({
      ...prev,
      [currentFilter]: modalParams,
    }));
    closeConfigModal();
  };

  // ======================================================
  // Procesar referencia (CON VALIDACIÓN)
  // ======================================================
  const handleProcess = async () => {
    setError("");
    setValidationErrors([]);
    setShowChart(false);

    if (!activeRef?.id) {
      setError("No hay referencia activa.");
      return;
    }

    const anyFilterEnabled = Object.values(filters).some(Boolean);
    if (!anyFilterEnabled) {
      setError("Selecciona al menos un filtro.");
      return;
    }

    const errors = validateFilters(filters, filterParams);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const res = await processActive({
        filters,
        params: filterParams,
      });

      setProcessedUrl(
        absUrl(res.processed_url_png) + "?t=" + Date.now()
      );

      setMetrics({
        iv_original: res.iv_original,
        iv_processed: res.iv_processed,
        zncc: res.zncc,
        rssd: res.rssd,
      });
    } catch (err) {
      console.error(err);
      setError("Error al procesar la referencia.");
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // Helpers de render
  // ======================================================
  const renderValue = (val, decimals = 4) => {
    if (val === null || val === undefined) return "-";
    return Number(val).toFixed(decimals);
  };

  // ======================================================
  // Helpers VISUALES NUEVOS (NO EXISTÍAN)
  // ======================================================
  const formatRSSD = (val) => {
    if (val === null || val === undefined) return "-";
    return Number(val).toExponential(3);
  };

  const metricCellClass =
    "p-3 text-center font-mono text-sm tabular-nums";

  // ======================================================
  // Normalización científica
  // ======================================================
  const normalizeMetrics = (m) => {
    if (!m) return [];

    const ivNorm =
      m.iv_original > 0 ? m.iv_processed / m.iv_original : 0;

    const znccNorm = (m.zncc + 1) / 2;

    const rssdNorm =
      m.rssd > 0 ? 1 / (1 + m.rssd) : 1;

    return [
      { name: "IV", original: 1, procesado: ivNorm },
      { name: "ZNCC", original: 1, procesado: znccNorm },
      { name: "RSSD", original: 1, procesado: rssdNorm },
    ];
  };

  // ======================================================
  // Render
  // ======================================================
  return (
    <section className="w-full px-6 mt-8">

      <h1 className="text-2xl font-bold text-white mb-4">
        Procesar referencia activa
      </h1>

      {error && (
        <div className="bg-red-500/20 text-red-300 p-3 rounded mb-4">
          {error}
        </div>
      )}

      {validationErrors.length > 0 && (
        <div className="bg-yellow-500/20 text-yellow-300 p-3 rounded mb-4">
          <p className="font-semibold mb-1">
            Corrige los siguientes parámetros:
          </p>
          <ul className="list-disc list-inside text-sm">
            {validationErrors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-6">
        {/* ================= Sidebar ================= */}
        <FilterSidebar
          filters={filters}
          filterParams={filterParams}
          onToggleFilter={toggleFilter}
          onConfigure={openConfigModal}
        />

        {/* ================= Contenido ================= */}
        <div className="flex-1 bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-lg">
          <button
            onClick={handleProcess}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            {loading ? "Procesando..." : "Aplicar filtros"}
          </button>

          {/* ================= Imágenes ================= */}
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div>
              <h3 className="font-semibold text-white">Original</h3>
              {activeRef?.original_url_png ? (
                <img
                  src={absUrl(activeRef.original_url_png)}
                  alt="Original"
                  className="max-h-96 w-full object-contain border rounded mt-2"
                />
              ) : (
                <p className="text-slate-300">Sin referencia.</p>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-white">Procesada</h3>
              {processedUrl ? (
                <img
                  src={processedUrl}
                  alt="Procesada"
                  className="max-h-96 w-full object-contain border rounded mt-2"
                />
              ) : (
                <p className="text-slate-300">Aún no procesada.</p>
              )}
            </div>
          </div>

          {/* ================= Tabla métricas ================= */}
          {metrics && (
            <div className="mt-6 overflow-x-auto">
              <h3 className="font-semibold text-white mb-2">
                Métricas obtenidas
              </h3>

              <table className="min-w-full text-white border-collapse">
                <thead>
                  <tr className="bg-slate-800">
                    <th className="p-3 text-center">IV original</th>
                    <th className="p-3 text-center">IV procesado</th>
                    <th className="p-3 text-center">ZNCC</th>
                    <th className="p-3 text-center">RSSD</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-slate-700">
                    <td className={metricCellClass}>
                      {renderValue(metrics.iv_original)}
                    </td>
                    <td className={metricCellClass}>
                      {renderValue(metrics.iv_processed)}
                    </td>
                    <td className={metricCellClass}>
                      {renderValue(metrics.zncc, 6)}
                    </td>
                    <td className={metricCellClass}>
                      {formatRSSD(metrics.rssd)}
                    </td>
                  </tr>
                </tbody>
              </table>

              <button
                onClick={() => setShowChart(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded mt-4"
              >
                Comparar
              </button>
            </div>
          )}

          {/* ================= Gráfica ================= */}
          {metrics && showChart && (
            <div className="mt-6">
              <h3 className="font-semibold text-white mb-2">
                Comparativa de métricas (normalizadas)
              </h3>

              <BarChart
                width={600}
                height={300}
                data={normalizeMetrics(metrics)}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 1]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="original" fill="#8884d8">
                  <LabelList dataKey="original" position="top" />
                </Bar>
                <Bar dataKey="procesado" fill="#82ca9d">
                  <LabelList dataKey="procesado" position="top" />
                </Bar>
              </BarChart>
            </div>
          )}
        </div>
      </div>

      {/* ================= Modal ================= */}
      <FilterConfigModal
        open={modalOpen}
        filterName={currentFilter}
        params={modalParams}
        onChange={handleModalParamChange}
        onClose={closeConfigModal}
        onSave={saveModalConfig}
      />
    </section>
  );
}
