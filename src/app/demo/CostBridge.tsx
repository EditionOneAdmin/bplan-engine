'use client';

import { useState } from 'react';
import type { ZuschlagItem } from './kostx/engine/kostx-types';

interface Props {
  basisHaus_eurM2: number;
  zuschlaege: ZuschlagItem[];
  gesamt_eurM2: number;
}

function fmt(v: number): string {
  return Math.round(v).toLocaleString('de-DE');
}

const COLORS: Record<string, string> = {
  basis: '#6B7280',
  bautechnisch: '#22C55E',
  planungsrechtlich: '#F59E0B',
  ausstattung: '#06B6D4',
  gesamt: '#14B8A6',
  sonstige: '#8B5CF6',
};

// Categorize zuschlag items
function categorize(label: string): 'bautechnisch' | 'planungsrechtlich' | 'ausstattung' {
  const l = label.toLowerCase();
  if (l.includes('statik') || l.includes('tiefgründung') || l.includes('beengt') || l.includes('gebäudeklasse') || l.includes('geschoss'))
    return 'bautechnisch';
  if (l.includes('energiestandard') || l.includes('eh 40') || l.includes('eh 55') || l.includes('geg') || l.includes('grün') || l.includes('pv'))
    return 'planungsrechtlich';
  return 'ausstattung';
}

export function CostBridge({ basisHaus_eurM2, zuschlaege, gesamt_eurM2 }: Props) {
  const [hover, setHover] = useState<number | null>(null);

  // Build bridge items from zuschlaege (skip basis and summe, we handle those ourselves)
  const deltas = zuschlaege.filter(z => z.typ === 'zuschlag' || z.typ === 'abzug');

  // Split into significant (>5 €/m²) and small
  const significant: { label: string; value: number; color: string }[] = [];
  let sonstigeSum = 0;

  for (const d of deltas) {
    if (Math.abs(d.wert_eurM2) > 5) {
      const cat = categorize(d.label);
      significant.push({ label: d.label, value: d.wert_eurM2, color: COLORS[cat] });
    } else {
      sonstigeSum += d.wert_eurM2;
    }
  }

  if (Math.abs(sonstigeSum) > 0.5) {
    significant.push({ label: 'Sonstige', value: sonstigeSum, color: COLORS.sonstige });
  }

  // Build all bars: Basis + deltas + Gesamt
  const bars = [
    { label: 'Basis', value: basisHaus_eurM2, color: COLORS.basis, isEndpoint: true },
    ...significant,
    { label: 'Gesamt', value: gesamt_eurM2, color: COLORS.gesamt, isEndpoint: true },
  ];

  if (bars.length < 2) return null;

  // Layout
  const H = 120;
  const PAD_T = 24;
  const PAD_B = 28;
  const barH = H - PAD_T - PAD_B;
  const maxVal = Math.max(...bars.map(b => Math.abs(b.value)), 1);

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${bars.length * 80 + 20} ${H}`} className="w-full" style={{ minWidth: bars.length * 60, aspectRatio: `${bars.length * 80 + 20}/${H}` }}>
        {bars.map((bar, i) => {
          const isEndpoint = (bar as { isEndpoint?: boolean }).isEndpoint;
          const x = 10 + i * 80;
          const barW = isEndpoint ? 56 : 40;
          const barXOffset = isEndpoint ? 0 : 8;
          const h = (Math.abs(bar.value) / maxVal) * barH;
          const y = PAD_T + (barH - h);
          const isHovered = hover === i;

          return (
            <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} style={{ cursor: 'pointer' }}>
              {/* Bar */}
              <rect
                x={x + barXOffset} y={y} width={barW} height={Math.max(h, 2)}
                rx={3} fill={bar.color}
                opacity={isHovered ? 1 : 0.75}
                className="transition-opacity duration-150"
              />

              {/* Value on top */}
              <text x={x + barXOffset + barW / 2} y={y - 4} textAnchor="middle" fill="white" fillOpacity={0.7} fontSize={9} fontWeight="600">
                {!isEndpoint && bar.value > 0 ? '+' : ''}{fmt(bar.value)}
              </text>

              {/* Label below */}
              <text x={x + barXOffset + barW / 2} y={H - 6} textAnchor="middle" fill="white" fillOpacity={0.4} fontSize={8}>
                {bar.label.length > 10 ? bar.label.slice(0, 9) + '…' : bar.label}
              </text>

              {/* Connector line to next bar */}
              {i < bars.length - 1 && !isEndpoint && (
                <line
                  x1={x + barXOffset + barW} y1={y}
                  x2={x + 80 + ((bars[i + 1] as { isEndpoint?: boolean }).isEndpoint ? 0 : 8)} y2={y}
                  stroke="white" strokeOpacity={0.15} strokeWidth={1} strokeDasharray="3 2"
                />
              )}

              {/* Tooltip */}
              {isHovered && (
                <g>
                  <rect x={x + barXOffset - 10} y={Math.max(2, y - 38)} width={barW + 20} height={22} rx={4} fill="#0F172A" stroke="#334155" strokeWidth={1} />
                  <text x={x + barXOffset + barW / 2} y={Math.max(16, y - 22)} textAnchor="middle" fill="white" fontSize={9} fontWeight="bold">
                    {bar.label}: {fmt(bar.value)} €/m²
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-1 px-1">
        {[
          { label: 'Bautechnisch', color: COLORS.bautechnisch },
          { label: 'Planungsrechtlich', color: COLORS.planungsrechtlich },
          { label: 'Ausstattung', color: COLORS.ausstattung },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: l.color }} />
            <span className="text-[9px] text-white/40">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
