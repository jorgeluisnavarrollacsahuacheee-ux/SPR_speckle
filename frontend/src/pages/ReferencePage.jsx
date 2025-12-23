// src/pages/ReferencePage.jsx
import { useState } from "react";
import ReferenceUploader from "../components/ReferenceUploader";
import { absUrl } from "../services/api";

export default function ReferencePage() {
  const [refData, setRefData] = useState(null);

  return (
    <section className="max-w-4xl mx-auto mt-8 bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold text-white mb-6">
        Imagen de referencia
      </h1>

      <p className="text-slate-300 mb-4">
        Sube una <b>única imagen</b> como referencia del sistema.
      </p>

      {/* Upload de referencia */}
      <ReferenceUploader onUploaded={(res) => setRefData(res)} />

      {/* Vista de referencia activa */}
      {refData?.original_url_png && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-white mb-2">
            Referencia activa
          </h2>

          <img
            src={absUrl(refData.original_url_png)}
            alt="Referencia"
            className="max-h-80 w-full object-contain border border-slate-600 rounded"
          />

          <p className="text-slate-300 mt-2 text-sm">
            IV original: {refData.iv ?? "-"}
          </p>
        </div>
      )}
    </section>
  );
}
