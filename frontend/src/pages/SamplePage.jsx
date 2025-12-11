// src/pages/SamplePage.jsx
import React, { useState } from "react";

export default function SamplePage() {
  const [file, setFile] = useState(null);
  const [sampleName, setSampleName] = useState("");
  const [liquidLabel, setLiquidLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const [ops, setOps] = useState({
    fft: true,
    contrast: false,
    mean: true,
    correlation: false,
    gaussian: false,
    median: false,
    edges: false,
  });

  const handleCheckbox = (k) => {
    setOps((o) => ({ ...o, [k]: !o[k] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!file) return setError("Selecciona una imagen.");
    if (!sampleName.trim()) return setError("Ingresa el nombre de la muestra.");
    if (!liquidLabel.trim()) return setError("Ingresa el tipo de líquido.");

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("sample_name", sampleName);
      formData.append("liquid_label", liquidLabel);

      // Agregar operaciones seleccionadas
      Object.keys(ops).forEach((key) => {
        if (ops[key]) formData.append("operations", key);
      });

      const response = await fetch("http://localhost:8000/process_sample", {
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
      setError("Error al enviar al backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-4xl mx-auto mt-8 bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold text-white mb-6">Procesar muestra</h1>

      <form onSubmit={handleSubmit} className="grid gap-6">
        <div>
          <label className="block text-sm font-medium text-white mb-1">Imagen</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full p-2 rounded bg-slate-800 text-white border border-slate-600"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-white mb-1">Nombre de la muestra</label>
            <input
              value={sampleName}
              onChange={(e) => setSampleName(e.target.value)}
              placeholder="Ej: muestra_01"
              className="w-full p-2 rounded bg-slate-800 text-white border border-slate-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-1">Tipo de líquido</label>
            <input
              value={liquidLabel}
              onChange={(e) => setLiquidLabel(e.target.value)}
              placeholder="Ej: Agua, Etanol..."
              className="w-full p-2 rounded bg-slate-800 text-white border border-slate-600"
            />
          </div>
        </div>

        <fieldset className="border border-slate-600 rounded p-4">
          <legend className="px-2 text-sm font-semibold text-white">Operaciones</legend>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
            {Object.keys(ops).map((k) => (
              <label key={k} className="flex items-center gap-2 text-white">
                <input
                  type="checkbox"
                  checked={ops[k]}
                  onChange={() => handleCheckbox(k)}
                  className="accent-blue-600"
                />
                <span className="capitalize">{k}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {error && <p className="text-red-500 font-medium">{error}</p>}

        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Procesando..." : "Procesar muestra"}
          </button>
          <button
            type="button"
            onClick={() => {
              setFile(null);
              setSampleName("");
              setLiquidLabel("");
              setOps({
                fft: true,
                contrast: false,
                mean: true,
                correlation: false,
                gaussian: false,
                median: false,
                edges: false,
              });
              setResult(null);
              setError("");
            }}
            className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded"
          >
            Resetear
          </button>
        </div>
      </form>

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