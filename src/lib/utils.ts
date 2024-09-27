import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function interpolateColor(t: number): string {
  // Define the color stops
  const colors = [
    { t: 0, r: 39, g: 174, b: 96 },  // Green
    { t: 0.5, r: 241, g: 196, b: 15 }, // Yellow
    { t: 1, r: 192, g: 57, b: 43 }   // Red
  ];

  // Find the two colors to interpolate between
  let lower = colors[0];
  let upper = colors[colors.length - 1];
  for (let i = 0; i < colors.length - 1; i++) {
    if (t >= colors[i].t && t <= colors[i + 1].t) {
      lower = colors[i];
      upper = colors[i + 1];
      break;
    }
  }

  // Interpolate between the two colors
  const range = upper.t - lower.t;
  const adjustedT = range === 0 ? 0 : (t - lower.t) / range;
  const r = Math.round(lower.r + adjustedT * (upper.r - lower.r));
  const g = Math.round(lower.g + adjustedT * (upper.g - lower.g));
  const b = Math.round(lower.b + adjustedT * (upper.b - lower.b));

  return `rgb(${r}, ${g}, ${b})`;
}
