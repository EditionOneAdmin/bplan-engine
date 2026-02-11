"use client";

import { X } from "lucide-react";
import type { FloorplanType, PlacedUnit } from "./types";

// SVG footprints for each type
function FloorplanSVG({ id, size = 48 }: { id: string; size?: number }) {
  const s = size;
  const svgMap: Record<string, React.ReactNode> = {
    a: (
      <svg width={s} height={s} viewBox="0 0 48 48">
        <rect x="4" y="8" width="40" height="32" rx="2" fill="#0D9488" opacity="0.2" stroke="#0D9488" strokeWidth="1.5" />
        <line x1="28" y1="8" x2="28" y2="40" stroke="#0D9488" strokeWidth="1" opacity="0.5" />
        <rect x="6" y="32" width="8" height="6" rx="1" fill="#0D9488" opacity="0.4" />
      </svg>
    ),
    b: (
      <svg width={s} height={s} viewBox="0 0 48 48">
        <rect x="4" y="6" width="40" height="36" rx="2" fill="#0D9488" opacity="0.2" stroke="#0D9488" strokeWidth="1.5" />
        <line x1="24" y1="6" x2="24" y2="42" stroke="#0D9488" strokeWidth="1" opacity="0.5" />
        <line x1="4" y1="24" x2="24" y2="24" stroke="#0D9488" strokeWidth="1" opacity="0.5" />
        <rect x="6" y="34" width="8" height="6" rx="1" fill="#0D9488" opacity="0.4" />
      </svg>
    ),
    c: (
      <svg width={s} height={s} viewBox="0 0 48 48">
        <rect x="2" y="4" width="44" height="40" rx="2" fill="#0D9488" opacity="0.2" stroke="#0D9488" strokeWidth="1.5" />
        <line x1="18" y1="4" x2="18" y2="44" stroke="#0D9488" strokeWidth="1" opacity="0.5" />
        <line x1="32" y1="4" x2="32" y2="44" stroke="#0D9488" strokeWidth="1" opacity="0.5" />
        <line x1="2" y1="26" x2="18" y2="26" stroke="#0D9488" strokeWidth="1" opacity="0.5" />
        <rect x="4" y="36" width="10" height="6" rx="1" fill="#0D9488" opacity="0.4" />
      </svg>
    ),
    d: (
      <svg width={s} height={s} viewBox="0 0 48 48">
        <rect x="2" y="2" width="44" height="44" rx="2" fill="#0D9488" opacity="0.2" stroke="#0D9488" strokeWidth="1.5" />
        <line x1="16" y1="2" x2="16" y2="46" stroke="#0D9488" strokeWidth="1" opacity="0.5" />
        <line x1="32" y1="2" x2="32" y2="46" stroke="#0D9488" strokeWidth="1" opacity="0.5" />
        <line x1="2" y1="24" x2="16" y2="24" stroke="#0D9488" strokeWidth="1" opacity="0.5" />
        <line x1="32" y1="24" x2="46" y2="24" stroke="#0D9488" strokeWidth="1" opacity="0.5" />
        <rect x="4" y="38" width="10" height="6" rx="1" fill="#0D9488" opacity="0.4" />
      </svg>
    ),
    e: (
      <svg width={s} height={s} viewBox="0 0 48 48">
        <path d="M2 4h44v40H2z" fill="#0D9488" opacity="0.2" stroke="#0D9488" strokeWidth="1.5" />
        <rect x="30" y="4" width="16" height="16" fill="#0D9488" opacity="0.15" stroke="#0D9488" strokeWidth="1" />
        <line x1="16" y1="4" x2="16" y2="44" stroke="#0D9488" strokeWidth="1" opacity="0.5" />
        <line x1="30" y1="4" x2="30" y2="44" stroke="#0D9488" strokeWidth="1" opacity="0.5" />
        <line x1="2" y1="28" x2="16" y2="28" stroke="#0D9488" strokeWidth="1" opacity="0.5" />
        <rect x="4" y="38" width="10" height="4" rx="1" fill="#0D9488" opacity="0.4" />
      </svg>
    ),
    f: (
      <svg width={s} height={s} viewBox="0 0 48 48">
        <path d="M2 2h44v44H2z" fill="#0D9488" opacity="0.2" stroke="#0D9488" strokeWidth="1.5" />
        <rect x="28" y="2" width="18" height="18" fill="#0D9488" opacity="0.15" stroke="#0D9488" strokeWidth="1" />
        <line x1="14" y1="2" x2="14" y2="46" stroke="#0D9488" strokeWidth="1" opacity="0.5" />
        <line x1="28" y1="2" x2="28" y2="46" stroke="#0D9488" strokeWidth="1" opacity="0.5" />
        <line x1="2" y1="24" x2="14" y2="24" stroke="#0D9488" strokeWidth="1" opacity="0.5" />
        <line x1="14" y1="30" x2="28" y2="30" stroke="#0D9488" strokeWidth="1" opacity="0.5" />
        <line x1="28" y1="28" x2="46" y2="28" stroke="#0D9488" strokeWidth="1" opacity="0.5" />
        <circle cx="40" cy="8" r="3" fill="#0D9488" opacity="0.3" />
        <rect x="4" y="38" width="8" height="6" rx="1" fill="#0D9488" opacity="0.4" />
      </svg>
    ),
  };
  return <>{svgMap[id] || null}</>;
}

interface Props {
  floorplans: (FloorplanType & { disabled?: boolean })[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  placedUnits: PlacedUnit[];
  onRemoveUnit: (id: string) => void;
}

export function FloorplanCatalog({ floorplans, selectedId, onSelect, placedUnits, onRemoveUnit }: Props) {
  return (
    <div>
      <h2 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">
        📐 Grundriss-Katalog
      </h2>
      {selectedId && (
        <div className="mb-3 px-3 py-2 bg-[#0D9488]/20 border border-[#0D9488]/40 rounded-lg text-xs text-[#0D9488]">
          Klicke auf ein Baufeld um den Grundriss zu platzieren
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2">
        {floorplans.map((fp) => {
          const isSelected = selectedId === fp.id;
          const count = placedUnits.filter((u) => u.floorplanId === fp.id).length;
          return (
            <button
              key={fp.id}
              onClick={() => {
                if (fp.disabled) return;
                onSelect(isSelected ? null : fp.id);
              }}
              className={`relative text-left p-3 rounded-lg border transition-all ${
                fp.disabled
                  ? "opacity-30 cursor-not-allowed border-white/5 bg-white/5"
                  : isSelected
                  ? "border-[#0D9488] bg-[#0D9488]/10 ring-1 ring-[#0D9488]/50"
                  : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <FloorplanSVG id={fp.id} size={40} />
                {count > 0 && (
                  <span className="bg-[#0D9488] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {count}
                  </span>
                )}
              </div>
              <div className="text-xs font-semibold text-white">{fp.name}</div>
              <div className="text-[11px] text-white/50">{fp.label}</div>
              <div className="text-[11px] text-white/40 mt-1">
                {fp.area} m² · {fp.rooms} Zi
              </div>
            </button>
          );
        })}
      </div>

      {/* Placed units summary */}
      {placedUnits.length > 0 && (
        <div className="mt-4 pt-3 border-t border-white/10">
          <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
            Platzierte Einheiten ({placedUnits.length})
          </h3>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {placedUnits.map((u) => {
              const fp = floorplans.find((f) => f.id === u.floorplanId);
              return (
                <div
                  key={u.id}
                  className="flex items-center justify-between text-xs py-1 px-2 rounded bg-white/5"
                >
                  <span className="text-white/70">
                    {fp?.name} · {u.area}m²
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveUnit(u.id);
                    }}
                    className="text-white/30 hover:text-red-400 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
