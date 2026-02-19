"use client";

import type { PlacedUnit, BuildingModule, Baufeld } from "./types";
import { BuildingCard } from "./BuildingCard";

interface BuildingListProps {
  placedUnits: PlacedUnit[];
  buildings: BuildingModule[];
  baufelder: Baufeld[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onViewSteckbrief: (id: string) => void;
}

export function BuildingList({ placedUnits, buildings, baufelder, selectedId, onSelect, onViewSteckbrief }: BuildingListProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider">
          Gebäude auf dem Baufeld
        </h3>
        <span className="text-[10px] text-white/30 bg-white/5 rounded-full px-2 py-0.5">
          {placedUnits.length}
        </span>
      </div>

      {placedUnits.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-2xl mb-2">🏗️</div>
          <div className="text-xs text-white/40">Noch keine Gebäude platziert.</div>
          <div className="text-xs text-white/30 mt-1">Wechsle zum Katalog.</div>
        </div>
      ) : (
        <div className="space-y-2">
          {placedUnits.map((unit, i) => {
            const building = buildings.find(b => b.id === unit.buildingId);
            if (!building) return null;
            const baufeld = baufelder.find(bf => bf.id === unit.baufeldId);
            return (
              <BuildingCard
                key={unit.id}
                unit={unit}
                building={building}
                baufeld={baufeld}
                index={i}
                selected={unit.id === selectedId}
                onSelect={() => onSelect(unit.id)}
                onViewSteckbrief={() => onViewSteckbrief(unit.id)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
