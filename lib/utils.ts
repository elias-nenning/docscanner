import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatDate(value: string | null): string {
  if (!value) return "-";
  return value;
}

export function formatCurrency(value: string | null, waehrung = "EUR"): string {
  if (!value) return "-";
  const sanitized = value.replace(",", ".");
  const number = Number(sanitized);
  if (Number.isNaN(number)) return `${value} ${waehrung}`;
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: waehrung || "EUR",
  }).format(number);
}

export function hashStringToHsl(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 65% 45%)`;
}

export function toKb(bytes: number): number {
  return Math.round(bytes / 1024);
}
