// src/pages/ReferencePage.jsx
import React, { useState } from "react";

export default function ReferencePage() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!file) return setError("Selecciona una imagen de referencia.");
    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://localhost:8000/process_reference", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error en la respuesta del servidor");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Error al procesar la referencia.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-4xl mx-auto mt-8 bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold text-white mb-6">Imagen de referencia</h1>
      <p className="text-slate-300 mb-4">
        Selecciona la imagen base del sistema para análisis.
      </p>

      <div className="grid gap-4">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          className="w-full p-2 rounded bg-slate-800 text-white border border-slate-600"
        />

        {file && (
          <img
            className="mt-4 max-w-xs rounded border border-slate-600"
            src={URL.createObjectURL(file)}
            alt="preview"
          />
        )}

        {error && <p className="text-red-500 font-medium">{error}</p>}

        <button
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Procesando..." : "Subir referencia"}
        </button>
      </div>

      {result && (
        <div className="mt-8 bg-slate-800 p-4 rounded-lg text-sm">
          <h2 className="text-white font-semibold mb-2">Resultado</h2>
          <pre className="text-white whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </section>
  );
}