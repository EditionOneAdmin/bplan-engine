"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  WMSTileLayer,
  Polygon,
  Popup,
  ScaleControl,
  useMap,
  useMapEvents,
  LayersControl,
} from "react-leaflet";
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

/* ── Address Search Bar ───────────────────────────────────── */

function AddressSearch() {
  const map = useMap();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const search = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ", Berlin")}&limit=1`
      );
      const data = await res.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        map.flyTo([parseFloat(lat), parseFloat(lon)], 17, { duration: 1.5 });
      }
    } catch {
      // silently ignore
    } finally {
      setLoading(false);
    }
  }, [query, map]);

  return (
    <div
      className="leaflet-top leaflet-left"
      style={{ top: 10, left: 60, position: "absolute", zIndex: 1000 }}
    >
      <div style={{ display: "flex", gap: 4 }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder="Adresse suchen…"
          style={{
            padding: "6px 10px",
            borderRadius: 6,
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(15,23,42,0.9)",
            color: "#fff",
            fontSize: 13,
            width: 240,
            outline: "none",
          }}
        />
        <button
          onClick={search}
          disabled={loading}
          style={{
            padding: "6px 12px",
            borderRadius: 6,
            background: "#0D9488",
            color: "#fff",
            fontSize: 13,
            border: "none",
            cursor: "pointer",
            opacity: loading ? 0.5 : 1,
          }}
        >
          {loading ? "…" : "🔍"}
        </button>
      </div>
    </div>
  );
}

/* ── GetFeatureInfo on Click ──────────────────────────────── */

function ClickFeatureInfo() {
  const map = useMap();

  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      const size = map.getSize();
      const bounds = map.getBounds();
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();
      const bbox = `${sw.lng},${sw.lat},${ne.lng},${ne.lat}`;

      // Pixel position
      const point = map.latLngToContainerPoint(e.latlng);

      const params = new URLSearchParams({
        SERVICE: "WMS",
        VERSION: "1.1.1",
        REQUEST: "GetFeatureInfo",
        LAYERS: "adv_sn_flurstueck",
        QUERY_LAYERS: "adv_sn_flurstueck",
        INFO_FORMAT: "text/plain",
        SRS: "EPSG:4326",
        BBOX: bbox,
        WIDTH: String(size.x),
        HEIGHT: String(size.y),
        X: String(Math.round(point.x)),
        Y: String(Math.round(point.y)),
      });

      const url = `https://fbinter.stadt-berlin.de/fb/wms/senstadt/wmsk_alkis?${params}`;

      let content = `<div style="font-family:Inter,sans-serif;font-size:12px;">
        <div style="color:#94a3b8;margin-bottom:4px;">📍 ${lat.toFixed(6)}, ${lng.toFixed(6)}</div>`;

      try {
        const res = await fetch(url);
        if (res.ok) {
          const text = await res.text();
          // Parse plain text response for useful fields
          const lines = text.split("\n").filter((l) => l.includes("="));
          if (lines.length > 0) {
            content += `<div style="margin-top:6px;border-top:1px solid rgba(255,255,255,0.1);padding-top:6px;">
              <div style="font-weight:600;margin-bottom:4px;color:#0D9488;">Flurstück-Info</div>`;
            for (const line of lines.slice(0, 8)) {
              const [key, ...vals] = line.split("=");
              content += `<div><span style="color:#94a3b8;">${key.trim()}:</span> ${vals.join("=").trim()}</div>`;
            }
            content += `</div>`;
          } else {
            content += `<div style="color:#64748b;margin-top:4px;font-style:italic;">Keine Flurstück-Info verfügbar</div>`;
          }
        }
      } catch {
        content += `<div style="color:#64748b;margin-top:4px;font-style:italic;">GetFeatureInfo nicht verfügbar (CORS)</div>`;
      }

      content += `</div>`;

      L.popup()
        .setLatLng(e.latlng)
        .setContent(content)
        .openOn(map);
    },
  });

  return null;
}

/* ── Baufeld Polygon ──────────────────────────────────────── */

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

/* ── Placed Unit Markers ──────────────────────────────────── */

function PlacedUnitMarkers({ placedUnits, baufelder }: { placedUnits: PlacedUnit[]; baufelder: Baufeld[] }) {
  const map = useMap();

  useEffect(() => {
    const markers: L.Marker[] = [];

    const grouped: Record<string, PlacedUnit[]> = {};
    placedUnits.forEach((u) => {
      if (!grouped[u.baufeldId]) grouped[u.baufeldId] = [];
      grouped[u.baufeldId].push(u);
    });

    Object.entries(grouped).forEach(([bfId, units]) => {
      const bf = baufelder.find((b) => b.id === bfId);
      if (!bf) return;

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

/* ── Main MapPanel ────────────────────────────────────────── */

export default function MapPanel({
  baufelder,
  selectedBaufeld,
  selectedFloorplan,
  placedUnits,
  onBaufeldClick,
  activeBaufeld,
}: Props) {
  const center: [number, number] = [52.52, 13.405];

  return (
    <MapContainer
      center={center}
      zoom={16}
      className="w-full h-full"
      zoomControl={true}
      style={{ background: "#1a1a2e" }}
    >
      {/* Base Map */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      {/* WMS Overlay Layers with toggle */}
      <LayersControl position="topright">
        <LayersControl.Overlay checked name="Flurstücke (ALKIS)">
          <WMSTileLayer
            url="https://fbinter.stadt-berlin.de/fb/wms/senstadt/wmsk_alkis"
            layers="adv_sn_flurstueck"
            format="image/png"
            transparent={true}
            opacity={0.7}
            attribution="© Berlin FIS-Broker"
          />
        </LayersControl.Overlay>
        <LayersControl.Overlay checked name="Bebauungspläne">
          <WMSTileLayer
            url="https://fbinter.stadt-berlin.de/fb/wms/senstadt/wmsk_bplan"
            layers="bplan_festges"
            format="image/png"
            transparent={true}
            opacity={0.6}
            attribution="© Berlin FIS-Broker"
          />
        </LayersControl.Overlay>
        <LayersControl.Overlay name="Bodenrichtwerte">
          <WMSTileLayer
            url="https://fbinter.stadt-berlin.de/fb/wms/senstadt/wmsk_boris"
            layers="boris_2024"
            format="image/png"
            transparent={true}
            opacity={0.5}
            attribution="© Berlin FIS-Broker"
          />
        </LayersControl.Overlay>
      </LayersControl>

      <ScaleControl position="bottomleft" imperial={false} />

      {/* Address search */}
      <AddressSearch />

      {/* Click to get feature info */}
      <ClickFeatureInfo />

      {/* Demo Baufelder */}
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
