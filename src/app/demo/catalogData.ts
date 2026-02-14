"use client";
import { BUILDINGS, MANUFACTURERS } from "./data";
import type { BuildingModule, Manufacturer } from "./types";

const STORAGE_KEY_B = "bpe-admin-buildings";
const STORAGE_KEY_M = "bpe-admin-manufacturers";

export interface ManufacturerData {
  id: Manufacturer;
  label: string;
  color: string;
  accent: string;
}

export function getBuildings(): BuildingModule[] {
  if (typeof window === "undefined") return BUILDINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_B);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Migration: clear stale Gropius data
        if (parsed.some((b: BuildingModule) => b.manufacturerLabel === "Gropius")) {
          localStorage.removeItem(STORAGE_KEY_B);
          localStorage.removeItem(STORAGE_KEY_M);
          return BUILDINGS;
        }
        return parsed;
      }
    }
  } catch {}
  return BUILDINGS;
}

export function getManufacturers(): Record<Manufacturer, { label: string; color: string; accent: string }> {
  if (typeof window === "undefined") return MANUFACTURERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_M);
    if (raw) {
      const parsed: ManufacturerData[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const record: Record<string, { label: string; color: string; accent: string }> = {};
        for (const m of parsed) {
          record[m.id] = { label: m.label, color: m.color, accent: m.accent };
        }
        return record as Record<Manufacturer, { label: string; color: string; accent: string }>;
      }
    }
  } catch {}
  return MANUFACTURERS;
}
