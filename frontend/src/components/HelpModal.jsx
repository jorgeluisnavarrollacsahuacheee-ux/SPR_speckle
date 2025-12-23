import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function HelpModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-900 text-white w-full max-w-lg rounded-xl p-6 shadow-xl relative">
        {/* ================= Header ================= */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            Acerca del proyecto
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* ================= Contenido ================= */}
        <div className="space-y-3 text-sm text-slate-300">
          <p>
            <span className="font-semibold text-white">
              SPR Speckle Analyzer
            </span>{" "}
            es una herramienta académica para el análisis de patrones
            speckle aplicados a sensores SPR mediante procesamiento digital
            de imágenes.
          </p>

          <p>
            El sistema permite aplicar filtros espaciales, analizar métricas
            estadísticas y comparar resultados entre imágenes originales y
            procesadas.
          </p>

          {/* ======== AUTORES (MODIFICADO) ======== */}
          <div>
            <p className="font-semibold text-white mb-1">
              Autores:
            </p>
            <ul className="list-disc list-inside ml-2">
              <li>Jorge Luis Navarro Llacsahuache</li>
              <li>Universidad Nacional de Trujillo</li>
            </ul>
          </div>

          <div>
            <p className="font-semibold text-white mb-1">
              Tecnologías:
            </p>
            <ul className="list-disc list-inside ml-2">
              <li>React + Vite</li>
              <li>FastAPI</li>
              <li>OpenCV</li>
              <li>SQLAlchemy</li>
            </ul>
          </div>

          <p className="text-xs text-slate-500 mt-4">
            Versión 1.0 — Proyecto académico
          </p>
        </div>

        {/* ================= Footer ================= */}
        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
