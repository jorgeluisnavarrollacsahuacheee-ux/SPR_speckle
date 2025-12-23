// src/utils/filterPresets.js
// ======================================================
// Presets científicos por filtro (LOW / MEDIUM / HIGH)
// ======================================================

export const FILTER_PRESETS = {
  gaussian: {
    LOW: { ksize: 3, sigmaX: 0.8 },
    MEDIUM: { ksize: 5, sigmaX: 1.2 },
    HIGH: { ksize: 7, sigmaX: 2.0 },
  },

  median: {
    LOW: { ksize: 3 },
    MEDIUM: { ksize: 5 },
    HIGH: { ksize: 7 },
  },

  blur: {
    LOW: { ksize: 3 },
    MEDIUM: { ksize: 5 },
    HIGH: { ksize: 9 },
  },

  bilateral: {
    LOW: { d: 5, sigmaColor: 50, sigmaSpace: 50 },
    MEDIUM: { d: 7, sigmaColor: 75, sigmaSpace: 75 },
    HIGH: { d: 9, sigmaColor: 120, sigmaSpace: 120 },
  },

  laplacian: {
    LOW: { ksize: 1 },
    MEDIUM: { ksize: 3 },
    HIGH: { ksize: 5 },
  },

  sobel: {
    LOW: { dx: 1, dy: 0, ksize: 3 },
    MEDIUM: { dx: 1, dy: 1, ksize: 3 },
    HIGH: { dx: 1, dy: 1, ksize: 5 },
  },

  canny: {
    LOW: { threshold1: 50, threshold2: 120 },
    MEDIUM: { threshold1: 100, threshold2: 200 },
    HIGH: { threshold1: 180, threshold2: 300 },
  },

  threshold: {
    LOW: { thresh: 80, maxval: 255 },
    MEDIUM: { thresh: 127, maxval: 255 },
    HIGH: { thresh: 180, maxval: 255 },
  },

  sharpen: {
    LOW: { strength: 0.5 },
    MEDIUM: { strength: 1.0 },
    HIGH: { strength: 2.0 },
  },

  equalize_hist: {
    LOW: {},
    MEDIUM: {},
    HIGH: {},
  },

  invert: {
    LOW: {},
    MEDIUM: {},
    HIGH: {},
  },
};

// ======================================================
// Helpers
// ======================================================

export const PRESET_LEVELS = ["LOW", "MEDIUM", "HIGH"];

export function getPreset(filterName, level) {
  return FILTER_PRESETS?.[filterName]?.[level] || null;
}
