// src/components/ReferenceUploader.tsx
import { useState } from "react";
import { uploadReference } from "../services/api";

interface ReferenceUploaderProps {
  onUploaded: (data: any) => void;
}

export default function ReferenceUploader({
  onUploaded,
}: ReferenceUploaderProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleFile = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setMessage(null);

    try {
      const res = await uploadReference(file);
      onUploaded(res);
      setMessage("Referencia subida y activada correctamente.");
    } catch (err) {
      console.error(err);
      setMessage("Error al subir la referencia.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <input
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="block w-full text-sm text-slate-300
                   file:mr-4 file:py-2 file:px-4
                   file:rounded file:border-0
                   file:text-sm file:font-semibold
                   file:bg-blue-600 file:text-white
                   hover:file:bg-blue-700"
      />

      {loading && <p className="text-blue-400 text-sm">Subiendo...</p>}
      {message && <p className="text-slate-300 text-sm">{message}</p>}
    </div>
  );
}
