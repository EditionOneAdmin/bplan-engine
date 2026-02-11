"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Polygon, Popup, ScaleControl, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Baufeld, PlacedUnit } from "./types";
import { FLOORPLANS } from "./data";

// Fix leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface Props {
  baufelder: Baufeld[];
  selectedBaufeld: string | null;
  selectedFloorplan: string | null;
  placedUnits: PlacedUnit[];
  onBaufeldClick: (id: string) => void;
  activeBaufeld: Baufeld | null;
}

function BaufeldPolygon({
  bf,
  isSelected,
  isPlaceMode,
  unitCount,
  onClick,
}: {
  bf: Baufeld;
  isSelected: boolean;
  isPlaceMode: boolean;
  unitCount: number;
  onClick: () => void;
}) {
  return (
    <Polygon
      positions={bf.coordinates}
      pathOptions={{
        color: isSelected ? "#0D9488" : bf.color,
        fillColor: bf.fillColor,
        fillOpacity: isSelected ? 0.6 : 0.35,
        weight: isSelected ? 3 : 2,
        dashArray: isPlaceMode ? "8 4" : undefined,
      }}
      eventHandlers={{ click: onClick }}
    >
      <Popup>
        <div className="text-sm min-w-[200px]">
          <div className="font-bold text-base mb-2" style={{ color: bf.color }}>
            {bf.name} — {bf.type}
          </div>
          <div className="text-gray-500 text-xs mb-2">{bf.typeLabel}</div>
          <table className="w-full text-xs">
            <tbody>
              <tr className="border-b">
                <td className="py-1 text-gray-500">GRZ max</td>
                <td className="py-1 font-medium text-right">{bf.maxGRZ}</td>
              </tr>
              <tr className="border-b">
                <td className="py-1 text-gray-500">GFZ max</td>
                <td className="py-1 font-medium text-right">{bf.maxGFZ}</td>
              </tr>
              <tr className="border-b">
                <td className="py-1 text-gray-500">Max. Geschosse</td>
                <td className="py-1 font-medium text-right">{bf.maxGeschosse}</td>
              </tr>
              <tr className="border-b">
                <td className="py-1 text-gray-500">Grundstück</td>
                <td className="py-1 font-medium text-right">{bf.grundstuecksflaecheM2.toLocaleString("de-DE")} m²</td>
              </tr>
              <tr>
                <td className="py-1 text-gray-500">Nutzung</td>
                <td className="py-1 font-medium text-right">{bf.nutzung}</td>
              </tr>
            </tbody>
          </table>
          {unitCount > 0 && (
            <div className="mt-2 pt-2 border-t text-xs text-teal-600 font-medium">
              {unitCount} WE platziert
            </div>
          )}
        </div>
      </Popup>
    </Polygon>
  );
}

function PlacedUnitMarkers({ placedUnits, baufelder }: { placedUnits: PlacedUnit[]; baufelder: Baufeld[] }) {
  const map = useMap();

  useEffect(() => {
    const markers: L.Marker[] = [];

    // Group by baufeld
    const grouped: Record<string, PlacedUnit[]> = {};
    placedUnits.forEach((u) => {
      if (!grouped[u.baufeldId]) grouped[u.baufeldId] = [];
      grouped[u.baufeldId].push(u);
    });

    Object.entries(grouped).forEach(([bfId, units]) => {
      const bf = baufelder.find((b) => b.id === bfId);
      if (!bf) return;

      // Center of baufeld
      const centerLat = bf.coordinates.reduce((s, c) => s + c[0], 0) / bf.coordinates.length;
      const centerLng = bf.coordinates.reduce((s, c) => s + c[1], 0) / bf.coordinates.length;

      units.forEach((unit, i) => {
        const fp = FLOORPLANS.find((f) => f.id === unit.floorplanId);
        if (!fp) return;

        const angle = (i / Math.max(units.length, 1)) * Math.PI * 2;
        const r = 0.0003;
        const lat = centerLat + Math.cos(angle) * r;
        const lng = centerLng + Math.sin(angle) * r * 1.5;

        const icon = L.divIcon({
          className: "custom-unit-icon",
          html: `<div style="background:#0D9488;color:white;border-radius:4px;padding:2px 6px;font-size:10px;font-weight:600;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,.3);font-family:Inter,sans-serif;">${fp.name} ${fp.area}m²</div>`,
          iconSize: [60, 20],
          iconAnchor: [30, 10],
        });

        const marker = L.marker([lat, lng], { icon }).addTo(map);
        markers.push(marker);
      });
    });

    return () => markers.forEach((m) => m.remove());
  }, [placedUnits, baufelder, map]);

  return null;
}

export default function MapPanel({ baufelder, selectedBaufeld, selectedFloorplan, placedUnits, onBaufeldClick, activeBaufeld }: Props) {
  const center: [number, number] = [52.5215, 13.4120];

  return (
    <MapContainer
      center={center}
      zoom={16}
      className="w-full h-full"
      zoomControl={true}
      style={{ background: "#1a1a2e" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <ScaleControl position="bottomleft" imperial={false} />
      {baufelder.map((bf) => {
        const unitCount = placedUnits.filter((u) => u.baufeldId === bf.id).length;
        return (
          <BaufeldPolygon
            key={bf.id}
            bf={bf}
            isSelected={selectedBaufeld === bf.id}
            isPlaceMode={!!selectedFloorplan}
            unitCount={unitCount}
            onClick={() => onBaufeldClick(bf.id)}
          />
        );
      })}
      <PlacedUnitMarkers placedUnits={placedUnits} baufelder={baufelder} />
    </MapContainer>
  );
}
