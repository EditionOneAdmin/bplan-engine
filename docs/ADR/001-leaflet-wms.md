# ADR-001: Leaflet + WMS statt Mapbox

**Status:** Accepted

## Kontext

Die Anwendung benötigt eine interaktive Karte mit amtlichen Geodaten (Flurstücke, Bebauungspläne, Bodenrichtwerte, Wohnlagen) der Stadt Berlin. Diese Daten werden als WMS-Dienste von der GDI Berlin bereitgestellt.

## Entscheidung

Wir verwenden **Leaflet** (via react-leaflet) mit nativer WMS-Integration statt Mapbox GL JS.

**Gründe:**

1. **Native WMS-Unterstützung:** Leaflet hat `L.TileLayer.WMS` als First-Class-Feature. Mapbox GL JS unterstützt WMS nur über Umwege (raster source mit manuell konstruierten Tile-URLs).
2. **Keine API-Key-Abhängigkeit:** Leaflet ist vollständig Open Source ohne Usage-basierte Kosten. Mapbox erfordert einen Access Token und rechnet nach Tile-Requests ab.
3. **Lightweight:** Leaflet (~40 KB gzipped) ist deutlich kleiner als Mapbox GL JS (~200 KB+).
4. **GDI Berlin Kompatibilität:** Die WMS-Dienste der GDI Berlin funktionieren zuverlässig mit Leaflets WMS-Layer. Keine proprietären Tile-Formate nötig.
5. **Polygon-Editing:** Leaflet bietet über Events (`useMapEvents`) eine einfache Basis für Custom-Polygon-Drawing ohne Plugin-Abhängigkeit.

## Konsequenzen

- ✅ Kein API-Key-Management, keine laufenden Kosten
- ✅ Direkte WMS-Integration ohne Workarounds
- ✅ Gut dokumentiert, große Community
- ⚠️ Kein Vector-Tile-Support (für diesen Use Case nicht benötigt)
- ⚠️ Kein 3D-Support (Gebäude werden als 2D-Polygone dargestellt)
- ⚠️ html2canvas-Kompatibilität mit Leaflet SVG-Overlays ist problematisch (siehe GOTCHAS.md)
