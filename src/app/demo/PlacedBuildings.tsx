"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { Polygon, CircleMarker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import type { PlacedUnit, BuildingModule, BuildingShape } from "./types";
import { BUILDINGS } from "./data";

/* ── Geometry helpers ─────────────────────────────────────── */

function metersToLatLng(
  centerLat: number,
  centerLng: number,
  dx: number,
  dy: number
): [number, number] {
  const latOffset = dy / 111320;
  const lngOffset = dx / (111320 * Math.cos((centerLat * Math.PI) / 180));
  return [centerLat + latOffset, centerLng + lngOffset];
}

function rotatePoint(
  cx: number,
  cy: number,
  x: number,
  y: number,
  angleDeg: number
): [number, number] {
  const rad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return [
    cos * (x - cx) - sin * (y - cy) + cx,
    sin * (x - cx) + cos * (y - cy) + cy,
  ];
}

/** Get shape outline points in meter-space (relative to center 0,0) */
function getShapePoints(
  shape: BuildingShape,
  w: number,
  d: number
): [number, number][][] {
  const hw = w / 2;
  const hd = d / 2;

  switch (shape) {
    case "riegel":
    case "punkthaus":
      return [[[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]]];

    case "doppelhaus": {
      const gap = 1; // 1m gap per side (2m total)
      return [
        [[-hw - gap, -hd], [-gap, -hd], [-gap, hd], [-hw - gap, hd]],
        [[gap, -hd], [hw + gap, -hd], [hw + gap, hd], [gap, hd]],
      ];
    }

    case "l-winkel": {
      // L-shape: full width × half depth on top, left half width × full depth
      const halfW = w / 2;
      const halfD = d / 2;
      return [[
        [-halfW, -halfD],
        [halfW, -halfD],
        [halfW, 0],
        [0, 0],
        [0, halfD],
        [-halfW, halfD],
      ]];
    }

    case "u-form": {
      // U-shape: two arms + base
      const armW = w * 0.25;
      const innerH = d * 0.6;
      return [[
        [-hw, -hd],
        [-hw + armW, -hd],
        [-hw + armW, -hd + innerH],
        [hw - armW, -hd + innerH],
        [hw - armW, -hd],
        [hw, -hd],
        [hw, hd],
        [-hw, hd],
      ]];
    }

    case "t-form": {
      // T-shape: top crossbar + vertical stem
      const crossH = d / 3;
      const stemW = w / 3;
      const stemHW = stemW / 2;
      return [[
        [-hw, -hd],
        [hw, -hd],
        [hw, -hd + crossH],
        [stemHW, -hd + crossH],
        [stemHW, hd],
        [-stemHW, hd],
        [-stemHW, -hd + crossH],
        [-hw, -hd + crossH],
      ]];
    }

    default:
      return [[[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]]];
  }
}

/** Convert shape to lat/lng polygons */
export function buildingToLatLng(
  building: BuildingModule,
  center: [number, number],
  rotation: number
): [number, number][][] {
  const parts = getShapePoints(
    building.shape,
    building.footprint.width,
    building.footprint.depth
  );

  return parts.map((ring) => {
    // Rotate in meter space, then convert to latlng
    const rotated = ring.map(([x, y]) => rotatePoint(0, 0, x, y, rotation));
    return rotated.map(([x, y]) =>
      metersToLatLng(center[0], center[1], x, y)
    );
  });
}

/** Get the topmost point (in meter-space after rotation) for rotation handle */
function getRotationHandlePos(
  building: BuildingModule,
  center: [number, number],
  rotation: number
): [number, number] {
  const d = Math.max(building.footprint.width, building.footprint.depth) / 2 + 5;
  const [dx, dy] = rotatePoint(0, 0, 0, d, rotation);
  return metersToLatLng(center[0], center[1], dx, dy);
}

/* ── Single Building Polygon ──────────────────────────────── */

function PlacedBuildingPolygon({
  unit,
  building,
  onMove,
  onRotate,
  onView,
}: {
  unit: PlacedUnit;
  building: BuildingModule;
  onMove: (id: string, pos: [number, number]) => void;
  onRotate: (id: string, rotation: number) => void;
  onView?: (id: string) => void;
}) {
  const map = useMap();
  const [dragging, setDragging] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [dragPos, setDragPos] = useState<[number, number] | null>(null);
  const [dragRot, setDragRot] = useState<number | null>(null);

  const currentPos = dragPos || unit.position;
  const currentRot = dragRot ?? unit.rotation;

  const polygons = useMemo(
    () => buildingToLatLng(building, currentPos, currentRot),
    [building, currentPos, currentRot]
  );

  const handlePos = useMemo(
    () => getRotationHandlePos(building, currentPos, currentRot),
    [building, currentPos, currentRot]
  );

  // Label marker
  const labelRef = useCallback(
    (el: L.CircleMarker | null) => {
      // We use the polygon center for label instead
    },
    []
  );

  // Drag handler
  useMapEvents({
    mousemove: (e) => {
      if (dragging) {
        setDragPos([e.latlng.lat, e.latlng.lng]);
      }
      if (rotating) {
        const center = currentPos;
        const dx = e.latlng.lng - center[1];
        const dy = e.latlng.lat - center[0];
        let angle = (Math.atan2(dx, dy) * 180) / Math.PI;
        if (angle < 0) angle += 360;
        setDragRot(angle);
      }
    },
    mouseup: () => {
      if (dragging && dragPos) {
        onMove(unit.id, dragPos);
        setDragPos(null);
        setDragging(false);
        map.dragging.enable();
      }
      if (rotating) {
        if (dragRot !== null) onRotate(unit.id, dragRot);
        setDragRot(null);
        setRotating(false);
        map.dragging.enable();
      }
    },
  });

  const startDrag = useCallback(
    (e: L.LeafletMouseEvent) => {
      L.DomEvent.stop(e.originalEvent);
      setDragging(true);
      setDragPos(unit.position);
      map.dragging.disable();
    },
    [unit.position, map]
  );

  const startRotate = useCallback(
    (e: L.LeafletMouseEvent) => {
      L.DomEvent.stop(e.originalEvent);
      setRotating(true);
      setDragRot(unit.rotation);
      map.dragging.disable();
    },
    [unit.rotation, map]
  );

  const handleClick = useCallback(
    (e: L.LeafletMouseEvent) => {
      if (!dragging && !rotating) {
        onView?.(unit.id);
      }
    },
    [dragging, rotating, onView, unit.id]
  );

  // Context menu for quick rotation
  const handleContextMenu = useCallback(
    (e: L.LeafletMouseEvent) => {
      L.DomEvent.stop(e.originalEvent);
      const newRot = (unit.rotation + 15) % 360;
      onRotate(unit.id, newRot);
    },
    [unit.id, unit.rotation, onRotate]
  );

  // Label overlay
  useEffect(() => {
    const labelIcon = L.divIcon({
      className: "building-label",
      html: `<div style="background:${building.color}cc;color:white;border-radius:3px;padding:1px 4px;font-size:9px;font-weight:600;white-space:nowrap;font-family:Inter,sans-serif;pointer-events:none;text-align:center;line-height:1.3;">${building.name}<br/>${unit.geschosse}G</div>`,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });
    const marker = L.marker(currentPos, { icon: labelIcon, interactive: false }).addTo(map);
    return () => {
      marker.remove();
    };
  }, [map, currentPos, building.color, building.name, unit.geschosse]);

  return (
    <>
      {/* Building polygon(s) */}
      {polygons.map((coords, i) => (
        <Polygon
          key={`${unit.id}-${i}`}
          positions={coords}
          pathOptions={{
            color: building.color,
            fillColor: building.color,
            fillOpacity: 0.3,
            weight: 2,
          }}
          eventHandlers={{
            mousedown: startDrag,
            click: handleClick,
            contextmenu: handleContextMenu,
          }}
        />
      ))}

      {/* Rotation handle */}
      {!dragging && (
        <CircleMarker
          center={handlePos}
          radius={5}
          pathOptions={{
            color: building.color,
            fillColor: "#fff",
            fillOpacity: 0.9,
            weight: 2,
          }}
          eventHandlers={{
            mousedown: startRotate,
          }}
        />
      )}
    </>
  );
}

/* ── Ghost Polygon (placement preview) ────────────────────── */

export function GhostPolygon({
  buildingId,
  onPlace,
  onCancel,
}: {
  buildingId: string;
  onPlace: (position: [number, number], rotation: number) => void;
  onCancel: () => void;
}) {
  const map = useMap();
  const building = BUILDINGS.find((b) => b.id === buildingId);
  const [mousePos, setMousePos] = useState<[number, number] | null>(null);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const container = map.getContainer();
    container.style.cursor = "crosshair";

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
      if (e.key === "r" || e.key === "R") setRotation((r) => (r + 15) % 360);
    };
    window.addEventListener("keydown", handleKey);

    return () => {
      container.style.cursor = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [map, onCancel]);

  useMapEvents({
    mousemove: (e) => {
      setMousePos([e.latlng.lat, e.latlng.lng]);
    },
    click: (e) => {
      if (mousePos) {
        onPlace([e.latlng.lat, e.latlng.lng], rotation);
      }
    },
  });

  if (!building || !mousePos) return null;

  const polygons = buildingToLatLng(building, mousePos, rotation);

  return (
    <>
      {polygons.map((coords, i) => (
        <Polygon
          key={`ghost-${i}`}
          positions={coords}
          pathOptions={{
            color: building.color,
            fillColor: building.color,
            fillOpacity: 0.15,
            weight: 2,
            dashArray: "6 4",
          }}
          interactive={false}
        />
      ))}
    </>
  );
}

/* ── Main Export ───────────────────────────────────────────── */

export default function PlacedBuildings({
  placedUnits,
  onMoveUnit,
  onRotateUnit,
  onViewUnit,
}: {
  placedUnits: PlacedUnit[];
  onMoveUnit: (id: string, position: [number, number]) => void;
  onRotateUnit: (id: string, rotation: number) => void;
  onViewUnit?: (id: string) => void;
}) {
  return (
    <>
      {placedUnits.map((unit) => {
        const building = BUILDINGS.find((b) => b.id === unit.buildingId);
        if (!building) return null;
        return (
          <PlacedBuildingPolygon
            key={unit.id}
            unit={unit}
            building={building}
            onMove={onMoveUnit}
            onRotate={onRotateUnit}
            onView={onViewUnit}
          />
        );
      })}
    </>
  );
}
