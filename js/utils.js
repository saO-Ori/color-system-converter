/**
 * 色変換ユーティリティ関数群
 */

export function hexToRgb(hex) {
  const cleanHex = hex.replace(/^#/, '');
  if (!/^[0-9a-fA-F]{6}$/.test(cleanHex)) return null;

  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return { r, g, b };
}

export function rgbStringToRgb(str) {
  const parts = str.split(',').map(s => parseInt(s.trim(), 10));
  if (parts.length === 3 && parts.every(c => !isNaN(c) && c >= 0 && c <= 255)) {
    return { r: parts[0], g: parts[1], b: parts[2] };
  }
  return null;
}

export function hslStringToRgb(str) {
  const parts = str.split(',').map(s => parseInt(s.trim(), 10));
  if (
    parts.length === 3 &&
    parts[0] >= 0 && parts[0] <= 360 &&
    parts[1] >= 0 && parts[1] <= 100 &&
    parts[2] >= 0 && parts[2] <= 100
  ) {
    const h = parts[0] / 360;
    const s = parts[1] / 100;
    const l = parts[2] / 100;

    if (s === 0) {
      const val = Math.round(l * 255);
      return { r: val, g: val, b: val };
    }

    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const r = Math.round(hue2rgb(p, q, h + 1 / 3) * 255);
    const g = Math.round(hue2rgb(p, q, h) * 255);
    const b = Math.round(hue2rgb(p, q, h - 1 / 3) * 255);
    return { r, g, b };
  }
  return null;
}

export function rgbToHex(r, g, b) {
  return `#${[r, g, b].map(c => c.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
}

export function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}