// src/components/Navbar.jsx
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  BeakerIcon,
  PhotoIcon,
  ClockIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import HelpModal from "./HelpModal";

// ======================================================
// Estilos de links activos / inactivos
// ======================================================
const linkClass = ({ isActive }) =>
  `flex items-center gap-2 px-4 py-2 rounded-md transition-colors font-semibold ${
    isActive
      ? "bg-blue-600 text-white"
      : "text-white/80 hover:bg-blue-500/20 hover:text-white"
  }`;

export default function Navbar() {
  // ======================================================
  // Estado modal Help
  // ======================================================
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <>
      <header className="bg-gradient-to-r from-blue-800 to-blue-600 shadow-lg">
        <nav className="w-full px-6 py-4 flex items-center justify-between">
          {/* ================= Logo ================= */}
          <div className="flex items-center gap-2 text-white font-bold text-xl">
            <BeakerIcon className="w-7 h-7" />
            SPR Speckle Analyzer
          </div>

          {/* ================= Navegación ================= */}
          <div className="flex gap-2">
            <NavLink to="/reference" className={linkClass}>
              <PhotoIcon className="w-5 h-5" />
              Referencia
            </NavLink>

            <NavLink to="/sample" className={linkClass}>
              <BeakerIcon className="w-5 h-5" />
              Procesar
            </NavLink>

            <NavLink to="/history" className={linkClass}>
              <ClockIcon className="w-5 h-5" />
              Historial
            </NavLink>

            {/* ================= Help ================= */}
            <button
              onClick={() => setHelpOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-md transition-colors font-semibold text-white/80 hover:bg-blue-500/20 hover:text-white"
            >
              <QuestionMarkCircleIcon className="w-5 h-5" />
              Help
            </button>
          </div>
        </nav>
      </header>

      {/* ================= Modal Help ================= */}
      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
}
