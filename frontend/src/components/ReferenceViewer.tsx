// frontend/src/components/ReferenceViewer.tsx
import React from "react";

type ReferenceViewerProps = {
  referenceId: number;
  originalUrl: string; // Debe ser la URL PNG que devuelve el backend: /static/references/{id}/original.png
};

export default function ReferenceViewer({ referenceId, originalUrl }: ReferenceViewerProps) {
  if (!originalUrl) {
    return (
      <div className="text-yellow-300">
        No hay URL de referencia disponible. Sube y activa una imagen en la sección Referencia.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 text-slate-300 text-sm">
        <span className="font-semibold text-white">ID:</span> {referenceId}
        <span className="opacity-60">|</span>
        <span className="font-semibold text-white">Estado:</span> Referencia activa
      </div>

      <div>
        <h3 className="font-semibold text-white mb-2">Imagen de referencia</h3>
        <img
          src={originalUrl}
          alt={`Referencia ${referenceId}`}
          className="max-h-96 w-full object-contain border border-slate-600 rounded"
        />
      </div>
    </div>
  );
}