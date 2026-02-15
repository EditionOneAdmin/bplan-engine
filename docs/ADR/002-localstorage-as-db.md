# ADR-002: localStorage als Datenbank

**Status:** Accepted

## Kontext

Die Anwendung benötigt Persistenz für Gebäude-Module und Hersteller-Daten, die über den Admin-Bereich bearbeitet werden. Die Demo-Ansicht muss diese Daten lesen können.

## Entscheidung

Wir verwenden **localStorage** als einzige Persistenzschicht statt eines Backends (API + Datenbank).

**Gründe:**

1. **Kein Backend nötig:** Die App ist ein Static Export auf GitHub Pages. Es gibt keinen Server.
2. **Sofortige Verfügbarkeit:** Kein Auth-Flow, kein API-Setup, keine Datenbank-Migration.
3. **Admin ↔ Demo Sync:** Admin schreibt in localStorage (`bpe-admin-buildings`, `bpe-admin-manufacturers`), Demo liest beim Page Load via `catalogData.ts`. Gleicher Origin = geteilter Storage.
4. **Fallback auf Code-Defaults:** Wenn localStorage leer ist, werden die hardcoded `BUILDINGS` und `MANUFACTURERS` aus `data.ts` verwendet. Die App funktioniert immer — auch ohne jemals den Admin zu benutzen.
5. **Demo-Kontext:** Die Anwendung ist ein Demonstrator/Prototyp. Multi-User-Support und server-seitige Persistenz sind (noch) nicht erforderlich.

## Konsequenzen

- ✅ Zero-Backend-Architektur, deploybar als statische Dateien
- ✅ Sofort lauffähig ohne Setup
- ✅ Daten bleiben im Browser des Nutzers (Datenschutz)
- ⚠️ Daten gehen verloren bei Browser-Reset/Incognito
- ⚠️ Kein Multi-User / Multi-Device Sync
- ⚠️ ~5 MB Storage-Limit (für diesen Use Case mehr als ausreichend)
- ⚠️ Migration bei Schema-Änderungen muss manuell gehandelt werden (siehe Gropius→GROPYUS Migration in GOTCHAS.md)
