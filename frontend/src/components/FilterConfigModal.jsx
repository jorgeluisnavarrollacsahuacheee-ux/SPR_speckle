// src/components/FilterConfigModal.jsx
import React, { useState } from "react";
import { FILTER_PRESETS, PRESET_LEVELS } from "../utils/filterPresets";

// ======================================================
// Descripciones científicas de parámetros
// ======================================================
const PARAM_DOCS = {
  gaussian: {
    ksize: "Tamaño del kernel gaussiano (impar). Controla el nivel de suavizado.",
    sigmaX:
      "Desviación estándar del kernel. Valores mayores producen mayor desenfoque.",
  },
  median: {
    ksize:
      "Tamaño del kernel de la mediana. Reduce ruido impulsivo (sal y pimienta).",
  },
  laplacian: {
    ksize:
      "Tamaño del kernel para derivadas de segundo orden. Afecta la sensibilidad a bordes.",
  },
  sobel: {
    dx: "Orden de derivada en X.",
    dy: "Orden de derivada en Y.",
    ksize: "Tamaño del kernel Sobel (impar).",
  },
  canny: {
    threshold1:
      "Umbral inferior para detección de bordes (histéresis).",
    threshold2:
      "Umbral superior para detección de bordes (histéresis).",
  },
  blur: {
    ksize:
      "Tamaño del kernel promedio. Produce desenfoque uniforme.",
  },
  bilateral: {
    d: "Diámetro del vecindario del filtro.",
    sigmaColor:
      "Controla cuánto se mezclan intensidades similares.",
    sigmaSpace:
      "Controla cuánto influyen píxeles lejanos.",
  },
  threshold: {
    thresh:
      "Valor umbral para binarización.",
    maxval:
      "Valor asignado a los píxeles que superan el umbral.",
  },
  sharpen: {
    strength:
      "Intensidad del realce de bordes.",
  },
};

// ======================================================
// Componente
// ======================================================
export default function FilterConfigModal({
  open,
  filterName,
  params,
  onChange,
  onSave,
  onClose,
}) {
  const [selectedPreset, setSelectedPreset] = useState(null);

  if (!open || !filterName) return null;

  const docs = PARAM_DOCS[filterName] || {};
  const presets = FILTER_PRESETS[filterName];

  // ======================================================
  // Aplicar preset
  // ======================================================
  const applyPreset = (level) => {
    const preset = presets?.[level];
    if (!preset) return;

    Object.entries(preset).forEach(([k, v]) => {
      onChange(k, v);
    });

    setSelectedPreset(level);
  };

  // ======================================================
  // Render
  // ======================================================
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-900 w-full max-w-md rounded-xl p-6 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-4 capitalize">
          Configuración: {filterName}
        </h2>

        {/* ================= Presets ================= */}
        {presets && (
          <div className="mb-4">
            <p className="text-slate-300 text-sm mb-2">
              Presets recomendados:
            </p>
            <div className="flex gap-2">
              {PRESET_LEVELS.map((level) => (
                <button
                  key={level}
                  onClick={() => applyPreset(level)}
                  className={`px-3 py-1 rounded text-sm font-semibold ${
                    selectedPreset === level
                      ? "bg-blue-600 text-white"
                      : "bg-slate-700 text-slate-200 hover:bg-slate-600"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ================= Parámetros ================= */}
        <div className="space-y-3">
          {Object.entries(params).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm text-slate-200 mb-1">
                {key}
              </label>

              <input
                type="number"
                value={value}
                onChange={(e) =>
                  onChange(key, Number(e.target.value))
                }
                className="w-full px-2 py-1 rounded bg-slate-800 text-white border border-slate-600"
              />

              {docs[key] && (
                <p className="text-xs text-slate-400 mt-1">
                  {docs[key]}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* ================= Acciones ================= */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-slate-700 text-white hover:bg-slate-600"
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
