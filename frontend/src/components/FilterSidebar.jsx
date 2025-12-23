import React from "react";
import { ChevronDown, Settings } from "lucide-react";

export default function FilterSidebar({
  filters = {},
  filterParams = {},
  onToggleFilter,
  onConfigure,
}) {
  return (
    <aside className="w-64 bg-white/10 backdrop-blur-md p-4 rounded-xl shadow-lg">
      <h2 className="text-lg font-semibold text-white mb-4">
        Filtros
      </h2>

      <div className="space-y-2">
        {Object.keys(filters).map((filterName) => {
          const isActive = filters[filterName];
          const hasParams =
            filterParams &&
            filterParams[filterName] &&
            Object.keys(filterParams[filterName]).length > 0;

          return (
            <div
              key={filterName}
              className="border border-slate-600 rounded-lg p-2 bg-slate-800/40"
            >
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-slate-200">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={() => onToggleFilter(filterName)}
                    className="accent-blue-600"
                  />
                  <span className="capitalize">{filterName}</span>
                </label>

                {/* Botón configuración */}
                <button
                  onClick={() => onConfigure(filterName)}
                  disabled={!isActive}
                  title={
                    hasParams
                      ? "Configurar parámetros"
                      : "Este filtro no tiene parámetros"
                  }
                  className={`p-1 rounded ${
                    isActive
                      ? "hover:bg-slate-600 text-slate-200"
                      : "text-slate-500 cursor-not-allowed"
                  }`}
                >
                  <ChevronDown size={16} />
                </button>
              </div>

              {/* Resumen rápido de parámetros */}
              {isActive && hasParams && (
                <div className="mt-2 text-xs text-slate-400 space-y-1">
                  {Object.entries(filterParams[filterName]).map(
                    ([k, v]) => (
                      <div key={k}>
                        <span className="font-medium">{k}:</span>{" "}
                        {v}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
