# ADR-003: DIN 276 Kostengruppen

**Status:** Accepted

## Kontext

Der Kostenrechner muss Baukosten strukturiert darstellen. In der deutschen Bauwirtschaft gibt es verschiedene Kostengliederungen. Nutzer der Anwendung (Projektentwickler, Architekten, Investoren) erwarten eine branchenübliche Struktur.

## Entscheidung

Wir verwenden die **DIN 276** (Kosten im Bauwesen) als Gliederungsstandard für die Kostenaufstellung.

**Gründe:**

1. **Branchenstandard:** DIN 276 ist der de-facto Standard für Baukostengliederung in Deutschland. Jeder Akteur in der Baubranche kennt die Kostengruppen 100-700.
2. **Vergleichbarkeit:** Nutzer können die Ergebnisse direkt mit eigenen Kalkulationen und Benchmarks vergleichen.
3. **Granularität:** Die 7 Hauptgruppen (100 Grundstück bis 700 Baunebenkosten) bieten eine gute Balance zwischen Übersichtlichkeit und Detail.
4. **PDF-Export:** Die strukturierte Darstellung eignet sich gut für den tabellarischen PDF-Export.

## Konsequenzen

- ✅ Sofort verständlich für Zielgruppe (Bauwirtschaft)
- ✅ Vergleichbar mit anderen Kalkulationstools
- ✅ Klare Struktur für UI und PDF-Export
- ⚠️ Vereinfachte Berechnung — keine vollständige DIN 276 Level-3 Aufschlüsselung
- ⚠️ Kostensätze basieren auf Hersteller-Pauschalpreisen/m², nicht auf Einzelleistungen
