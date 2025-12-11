// src/components/Navbar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { BeakerIcon, PhotoIcon, ClockIcon } from "@heroicons/react/24/outline";

const linkClass = ({ isActive }) =>
  `flex items-center gap-2 px-4 py-2 rounded-md transition-colors font-semibold ${
    isActive
      ? "bg-blue-600 text-white"
      : "text-white/80 hover:bg-blue-500/20 hover:text-white"
  }`;

export default function Navbar() {
  return (
    <header className="bg-gradient-to-r from-blue-800 to-blue-600 shadow-lg">
      <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white font-bold text-xl">
          <BeakerIcon className="w-7 h-7" />
          SPR Speckle Analyzer
        </div>
        <div className="flex gap-2">
          <NavLink to="/reference" className={linkClass}>
            <PhotoIcon className="w-5 h-5" />
            Referencia
          </NavLink>
          <NavLink to="/process" className={linkClass}>
            <BeakerIcon className="w-5 h-5" />
            Procesar
          </NavLink>
          <NavLink to="/history" className={linkClass}>
            <ClockIcon className="w-5 h-5" />
            Historial
          </NavLink>
        </div>
      </nav>
    </header>
  );
}