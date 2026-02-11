"use client";

import type { Filters } from "./types";

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
}

export function FilterPanel({ filters, onChange }: Props) {
  const set = (partial: Partial<Filters>) => onChange({ ...filters, ...partial });

  return (
    <div>
      <h2 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">
        ⚙️ Filter & Parameter
      </h2>
      <div className="space-y-3">
        {/* Area range */}
        <div>
          <label className="text-[11px] text-white/40 block mb-1">
            Wohnungsmix: {filters.minArea}–{filters.maxArea} m²
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="range"
              min={35}
              max={140}
              value={filters.minArea}
              onChange={(e) => set({ minArea: Math.min(+e.target.value, filters.maxArea) })}
              className="flex-1 accent-[#0D9488] h-1"
            />
            <input
              type="range"
              min={35}
              max={140}
              value={filters.maxArea}
              onChange={(e) => set({ maxArea: Math.max(+e.target.value, filters.minArea) })}
              className="flex-1 accent-[#0D9488] h-1"
            />
          </div>
        </div>

        {/* Strategy toggle */}
        <div>
          <label className="text-[11px] text-white/40 block mb-1">Verwertung</label>
          <div className="flex rounded-lg overflow-hidden border border-white/10">
            {(["hold", "sell"] as const).map((s) => (
              <button
                key={s}
                onClick={() => set({ strategy: s })}
                className={`flex-1 text-xs py-1.5 transition-colors ${
                  filters.strategy === s
                    ? "bg-[#0D9488] text-white"
                    : "bg-white/5 text-white/50 hover:bg-white/10"
                }`}
              >
                {s === "hold" ? "Bestandshaltung" : "Verkauf"}
              </button>
            ))}
          </div>
        </div>

        {/* Dropdowns row */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-[11px] text-white/40 block mb-1">Dach</label>
            <select
              value={filters.roofType}
              onChange={(e) => set({ roofType: e.target.value as Filters["roofType"] })}
              className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white"
            >
              <option value="flat">Flachdach</option>
              <option value="saddle">Satteldach</option>
              <option value="pult">Pultdach</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] text-white/40 block mb-1">Energie</label>
            <select
              value={filters.energy}
              onChange={(e) => set({ energy: e.target.value as Filters["energy"] })}
              className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white"
            >
              <option value="fernwaerme">Fernwärme</option>
              <option value="waermepumpe">Wärmepumpe</option>
              <option value="gas">Gas</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] text-white/40 block mb-1">Standard</label>
            <select
              value={filters.efficiency}
              onChange={(e) => set({ efficiency: e.target.value as Filters["efficiency"] })}
              className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white"
            >
              <option value="geg">GEG 2024</option>
              <option value="kfw40">KfW 40</option>
              <option value="passivhaus">Passivhaus</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
