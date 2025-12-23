// frontend/src/pages/AccessPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AccessPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!code.trim()) {
      setError("Ingresa el código de acceso.");
      return;
    }

    // Guardar código
    localStorage.setItem("ACCESS_CODE", code.trim());

    // Redirigir al sistema
    navigate("/reference", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="bg-white/10 backdrop-blur-md p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-4 text-center">
          Acceso al sistema
        </h1>

        <p className="text-slate-300 text-sm mb-6 text-center">
          Ingresa el código de acceso para utilizar el sistema de análisis
          SPR Speckle.
        </p>

        {error && (
          <div className="bg-red-500/20 text-red-300 p-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Código de acceso"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full px-4 py-2 rounded bg-slate-800 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold"
          >
            Ingresar
          </button>
        </form>

        <p className="text-xs text-slate-400 mt-6 text-center">
          Acceso restringido · Uso académico
        </p>
      </div>
    </div>
  );
}
