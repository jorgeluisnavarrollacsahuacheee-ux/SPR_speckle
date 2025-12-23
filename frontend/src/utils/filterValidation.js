// src/utils/filterValidation.js

/**
 * ======================================================
 * VALIDACIÓN, DESCRIPCIÓN Y PRESETS DE FILTROS
 * ======================================================
 * Compatible 100% con los filtros visibles en SamplePage
 * y FilterSidebar.
 *
 * Filtros soportados:
 * - gaussian
 * - median
 * - equalize_hist
 * - canny
 * - blur
 * - bilateral
 * - laplacian
 * - sobel
 * - threshold
 * - invert
 * - sharpen
 */

// ======================================================
// DESCRIPCIONES CIENTÍFICAS (tooltips / ayuda)
// ======================================================
export const FILTER_DESCRIPTIONS = {
  gaussian:
    "Suavizado gaussiano: reduce ruido preservando estructuras globales.",
  median:
    "Filtro de mediana: elimina ruido impulsivo (sal y pimienta).",
  equalize_hist:
    "Ecualización de histograma: mejora el contraste global.",
  canny:
    "Detector de bordes Canny: identifica bordes fuertes y débiles.",
  blur:
    "Filtro promedio: suavizado uniforme de la imagen.",
  bilateral:
    "Filtro bilateral: suaviza preservando bordes.",
  laplacian:
    "Laplaciano: resalta cambios rápidos de intensidad (bordes).",
  sobel:
    "Sobel: calcula gradientes horizontales y/o verticales.",
  threshold:
    "Umbralización: segmenta la imagen por intensidad.",
  invert:
    "Inversión de intensidades: útil para análisis de contraste.",
  sharpen:
    "Sharpen: realce de bordes mediante altas frecuencias.",
};

// ======================================================
// PRESETS RECOMENDADOS (LOW / MEDIUM / HIGH)
// ======================================================
export const FILTER_PRESETS = {
  gaussian: {
    low: { ksize: 3, sigmaX: 0.8 },
    medium: { ksize: 5, sigmaX: 1.2 },
    high: { ksize: 7, sigmaX: 2.0 },
  },

  median: {
    low: { ksize: 3 },
    medium: { ksize: 5 },
    high: { ksize: 7 },
  },

  canny: {
    low: { threshold1: 50, threshold2: 100 },
    medium: { threshold1: 75, threshold2: 150 },
    high: { threshold1: 100, threshold2: 200 },
  },

  blur: {
    low: { ksize: 3 },
    medium: { ksize: 5 },
    high: { ksize: 7 },
  },

  bilateral: {
    low: { d: 5, sigmaColor: 50, sigmaSpace: 50 },
    medium: { d: 7, sigmaColor: 75, sigmaSpace: 75 },
    high: { d: 9, sigmaColor: 100, sigmaSpace: 100 },
  },

  laplacian: {
    low: { ksize: 1 },
    medium: { ksize: 3 },
    high: { ksize: 5 },
  },

  sobel: {
    low: { dx: 1, dy: 0, ksize: 3 },
    medium: { dx: 0, dy: 1, ksize: 3 },
    high: { dx: 1, dy: 1, ksize: 5 },
  },

  threshold: {
    low: { thresh: 80, maxval: 255 },
    medium: { thresh: 127, maxval: 255 },
    high: { thresh: 180, maxval: 255 },
  },

  sharpen: {
    low: { strength: 0.5 },
    medium: { strength: 1.0 },
    high: { strength: 2.0 },
  },
};

// ======================================================
// VALIDACIÓN DE PARÁMETROS
// ======================================================
export function validateFilters(filters, params) {
  const errors = [];

  // ---------- Gaussian ----------
  if (filters.gaussian) {
    const { ksize, sigmaX } = params.gaussian || {};
    if (!ksize || ksize < 1 || ksize % 2 === 0) {
      errors.push("Gaussian: ksize debe ser impar y ≥ 1.");
    }
    if (sigmaX <= 0) {
      errors.push("Gaussian: sigmaX debe ser > 0.");
    }
  }

  // ---------- Median ----------
  if (filters.median) {
    const { ksize } = params.median || {};
    if (!ksize || ksize < 1 || ksize % 2 === 0) {
      errors.push("Median: ksize debe ser impar y ≥ 1.");
    }
  }

  // ---------- Equalize Hist ----------
  if (filters.equalize_hist) {
    // No requiere parámetros → siempre válido
  }

  // ---------- Canny ----------
  if (filters.canny) {
    const { threshold1, threshold2 } = params.canny || {};
    if (threshold1 < 0 || threshold2 < 0) {
      errors.push("Canny: thresholds deben ser ≥ 0.");
    }
    if (threshold1 >= threshold2) {
      errors.push(
        "Canny: threshold1 debe ser menor que threshold2."
      );
    }
  }

  // ---------- Blur ----------
  if (filters.blur) {
    const { ksize } = params.blur || {};
    if (!ksize || ksize < 1 || ksize % 2 === 0) {
      errors.push("Blur: ksize debe ser impar y ≥ 1.");
    }
  }

  // ---------- Bilateral ----------
  if (filters.bilateral) {
    const { d, sigmaColor, sigmaSpace } =
      params.bilateral || {};
    if (d <= 0) {
      errors.push("Bilateral: d debe ser > 0.");
    }
    if (sigmaColor <= 0 || sigmaSpace <= 0) {
      errors.push(
        "Bilateral: sigmaColor y sigmaSpace deben ser > 0."
      );
    }
  }

  // ---------- Laplacian ----------
  if (filters.laplacian) {
    const { ksize } = params.laplacian || {};
    if (![1, 3, 5, 7].includes(ksize)) {
      errors.push(
        "Laplacian: ksize recomendado = 1, 3, 5 o 7."
      );
    }
  }

  // ---------- Sobel ----------
  if (filters.sobel) {
    const { dx, dy, ksize } = params.sobel || {};
    if (dx === 0 && dy === 0) {
      errors.push("Sobel: dx o dy debe ser distinto de 0.");
    }
    if (!ksize || ksize < 1 || ksize % 2 === 0) {
      errors.push("Sobel: ksize debe ser impar y ≥ 1.");
    }
  }

  // ---------- Threshold ----------
  if (filters.threshold) {
    const { thresh, maxval } = params.threshold || {};
    if (thresh < 0 || thresh > 255) {
      errors.push("Threshold: thresh ∈ [0, 255].");
    }
    if (maxval <= 0 || maxval > 255) {
      errors.push("Threshold: maxval ∈ (0, 255].");
    }
  }

  // ---------- Invert ----------
  if (filters.invert) {
    // No parámetros → siempre válido
  }

  // ---------- Sharpen ----------
  if (filters.sharpen) {
    const { strength } = params.sharpen || {};
    if (strength <= 0 || strength > 5) {
      errors.push("Sharpen: strength ∈ (0, 5].");
    }
  }

  return errors;
}
