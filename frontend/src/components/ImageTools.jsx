// src/components/ImageTools.jsx
import { useEffect, useRef, useState } from "react";

export default function ImageTools({ file }) {
  const canvasRef = useRef();
  const [originalData, setOriginalData] = useState(null);
  const [ctx, setCtx] = useState(null);

  useEffect(() => {
    if (!file) return;
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;
      context.drawImage(img, 0, 0);
      const data = context.getImageData(0, 0, canvas.width, canvas.height);
      setOriginalData(data);
      setCtx(context);
    };
  }, [file]);

  if (!file) return null;

  const applyFilter = (callback) => {
    if (!ctx || !originalData) return;
    const dataCopy = new ImageData(
      new Uint8ClampedArray(originalData.data),
      originalData.width,
      originalData.height
    );
    callback(dataCopy.data);
    ctx.putImageData(dataCopy, 0, 0);
  };

  const grayscale = () =>
    applyFilter((d) => {
      for (let i = 0; i < d.length; i += 4) {
        const avg = (d[i] + d[i + 1] + d[i + 2]) / 3;
        d[i] = d[i + 1] = d[i + 2] = avg;
      }
    });

  const invert = () =>
    applyFilter((d) => {
      for (let i = 0; i < d.length; i += 4) {
        d[i] = 255 - d[i];
        d[i + 1] = 255 - d[i + 1];
        d[i + 2] = 255 - d[i + 2];
      }
    });

  const reset = () => {
    if (ctx && originalData) ctx.putImageData(originalData, 0, 0);
  };

  return (
    <div className="mt-6 p-6 bg-slate-800 rounded-xl shadow-lg">
      <h2 className="text-white text-xl mb-3 font-semibold">Vista previa</h2>
      <canvas
        ref={canvasRef}
        className="max-w-full rounded-lg border border-slate-600"
      ></canvas>
      <div className="flex gap-2 mt-4 flex-wrap">
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded" onClick={grayscale}>
          Gris
        </button>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded" onClick={invert}>
          Invertir
        </button>
        <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded" onClick={reset}>
          Reset
        </button>
      </div>
    </div>
  );
}