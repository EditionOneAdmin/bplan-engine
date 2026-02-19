"use client";

import type { PlacedUnit, BuildingModule, Baufeld } from "./types";
import { MANUFACTURERS } from "./data";

interface BuildingCardProps {
  unit: PlacedUnit;
  building: BuildingModule;
  baufeld: Baufeld | undefined;
  index: number;
  selected: boolean;
  onSelect: () => void;
  onViewSteckbrief: () => void;
}

function ComplianceBar({ label, value, max }: { label: string; value: number; max: number }) {
  const ratio = max > 0 ? value / max : 0;
  const pct = Math.min(ratio * 100, 100);
  const ok = ratio <= 1;
  const color = ok ? "#22C55E" : "#EF4444";

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-white/40 w-7 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-[10px] font-medium w-10 text-right" style={{ color }}>
        {ratio.toFixed(2)}
      </span>
      <span className="text-[10px]">{ok ? "✅" : "🔴"}</span>
    </div>
  );
}

function fmtNum(n: number): string {
  return n.toLocaleString("de-DE");
}

export function BuildingCard({ unit, building, baufeld, index, selected, onSelect, onViewSteckbrief }: BuildingCardProps) {
  const mfr = MANUFACTURERS[building.manufacturer];
  const bgf = unit.area;
  const wf = Math.round(bgf * (unit.wfEffizienz || 75) / 100);
  const bkGesamt = building.pricePerSqm * bgf;
  const bkProM2Nuf = wf > 0 ? Math.round(bkGesamt / wf) : 0;
  const gf = building.footprint.width * building.footprint.depth;

  // GRZ/GFZ per baufeld
  const bfFlaeche = baufeld?.grundstuecksflaecheM2 || 1;
  const maxGRZ = baufeld?.maxGRZ || 0.4;
  const maxGFZ = baufeld?.maxGFZ || 1.2;
  const grzValue = gf / bfFlaeche;
  const gfzValue = bgf / bfFlaeche;

  return (
    <div
      onClick={onSelect}
      className={`rounded-lg border transition-all duration-200 cursor-pointer hover:border-white/30 ${
        selected
          ? "border-teal-500/60 bg-[#0F172A]/80 shadow-lg shadow-teal-500/10"
          : "border-white/10 bg-[#0F172A]/50 hover:bg-[#0F172A]/70"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">🏢</span>
            <span className="text-xs font-semibold text-white truncate">Gebäude {index + 1}</span>
          </div>
          <div className="text-[10px] text-white/40 truncate mt-0.5">
            <span style={{ color: mfr.color }}>{mfr.label}</span> · {building.name}
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onViewSteckbrief(); }}
          className="p-1 rounded hover:bg-white/10 transition-colors text-white/40 hover:text-white/80 shrink-0"
          title="Steckbrief öffnen"
        >
          📋
        </button>
      </div>

      {/* Stats */}
      <div className="px-3 pb-2 border-t border-white/5">
        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 mt-1.5">
          <KV label="Geschosse" value={`${unit.geschosse}`} />
          <KV label="WE" value={`${unit.units}`} />
          <KV label="WF (NUF)" value={`${fmtNum(wf)} m²`} />
          <KV label="BGF" value={`${fmtNum(Math.round(bgf))} m²`} />
          <KV label="BK/m² NUF" value={`${fmtNum(bkProM2Nuf)} €`} />
          <KV label="BK gesamt" value={bkGesamt >= 1_000_000 ? `${(bkGesamt / 1_000_000).toFixed(2)} Mio. €` : `${fmtNum(Math.round(bkGesamt))} €`} />
        </div>
      </div>

      {/* GRZ/GFZ */}
      {baufeld && (
        <div className="px-3 pb-2 border-t border-white/5 pt-1.5 space-y-1">
          <ComplianceBar label="GRZ" value={grzValue} max={maxGRZ} />
          <ComplianceBar label="GFZ" value={gfzValue} max={maxGFZ} />
        </div>
      )}
    </div>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-[10px] text-white/40">{label}</span>
      <span className="text-[10px] font-medium text-white/80">{value}</span>
    </div>
  );
}
