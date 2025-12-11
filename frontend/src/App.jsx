// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ReferencePage from "./pages/ReferencePage";
import SamplePage from "./pages/SamplePage";
import HistoryPage from "./pages/HistoryPage";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Navbar fijo */}
      <Navbar />

      {/* Contenido principal */}
      <main className="flex-1 container mx-auto px-6 py-8">
        <Routes>
          <Route path="/" element={<Navigate to="/reference" replace />} />
          <Route path="/reference" element={<ReferencePage />} />
          <Route path="/process" element={<SamplePage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 text-center text-sm text-slate-400 py-4">
        © {new Date().getFullYear()} SPR Speckle Analyzer — Proyecto académico
      </footer>
    </div>
  );
}