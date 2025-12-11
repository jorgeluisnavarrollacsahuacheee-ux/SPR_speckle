// src/components/Dropzone.jsx
import { useState, useRef } from "react";
import { CloudArrowUpIcon } from "@heroicons/react/24/outline";

export default function Dropzone({ onFileSelected }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileSelected(file);
  };

  return (
    <div
      className={`w-full h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition ${
        dragging ? "border-blue-400 bg-blue-900/30" : "border-slate-600 bg-slate-800/40"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current.click()}
    >
      <input
        type="file"
        ref={inputRef}
        className="hidden"
        onChange={(e) => onFileSelected(e.target.files[0])}
        accept="image/*,.zip"
      />
      <CloudArrowUpIcon className="w-12 h-12 text-blue-400 mb-2" />
      <p className="text-slate-300 font-medium">
        Arrastra tu imagen / ZIP aquí o haz click
      </p>
    </div>
  );
}