/**
 * KostX Engine — Haupt-Orchestrierung
 * Berechnet alle Kosten aus einer KostXConfig.
 * Pure function, keine Side-Effects.
 *
 * Excel: Kostenmodell (gesamtes Sheet)
 */

import type { KostXConfig, KostXResult, ZuschlagItem } from './kostx-types';
import { calculateMasses } from './masses';
import { calculateKG300 } from './kg300';
import { calculateKG400 } from './kg400';
import { calculateHonorar } from './honorar';
import { calculateGIK, calculateEconomics } from './economics';
import { calculateBasement } from './basement';

/**
 * Erzeugt Zuschlag-Waterfall-Daten für Visualisierung.
 */
function computeZuschlaege(config: KostXConfig, masses: import('./kostx-types').MassCalculation, basisHaus_eurM2: number): ZuschlagItem[] {
  const items: ZuschlagItem[] = [];
  const erloes = masses.erloesflaecheWarm_m2;

  items.push({ label: 'Basis Haus (KG 300+400)', wert_eurM2: basisHaus_eurM2, typ: 'basis' });

  // KG 100-700 Zuschläge
  items.push({ label: 'KG 100 Grundstück', wert_eurM2: config.kg100_eurM2, typ: 'zuschlag' });
  items.push({ label: 'KG 200 Erschließung', wert_eurM2: config.kg200_eurM2, typ: 'zuschlag' });
  items.push({ label: 'KG 500 Außenanlagen', wert_eurM2: config.kg500_eurM2, typ: 'zuschlag' });
  items.push({ label: 'KG 700 sonstige', wert_eurM2: config.kg700Sonstige_eurM2, typ: 'zuschlag' });

  // Interne Kosten
  const interneKostenBasis = config.kg100_eurM2 + config.kg500_eurM2 + config.kg200_eurM2
    + basisHaus_eurM2 + config.sonstigeKosten_eurM2;
  items.push({ label: 'Interne Kosten', wert_eurM2: interneKostenBasis * config.interneKostenProzent, typ: 'zuschlag' });

  // Baukostenreserve
  items.push({ label: 'Baukostenreserve', wert_eurM2: config.baukostenreserveProzent * basisHaus_eurM2, typ: 'zuschlag' });

  if (config.sonstigeKosten_eurM2 > 0) {
    items.push({ label: 'Sonstige Kosten', wert_eurM2: config.sonstigeKosten_eurM2, typ: 'zuschlag' });
  }

  if (config.foerderung_eurM2 > 0) {
    items.push({ label: 'Förderung', wert_eurM2: -config.foerderung_eurM2, typ: 'abzug' });
  }

  // Summe
  const gikM2 = items.reduce((s, i) => s + i.wert_eurM2, 0);
  items.push({ label: 'GIK gesamt', wert_eurM2: gikM2, typ: 'summe' });

  return items;
}

/**
 * Hauptfunktion: Berechnet alle KostX-Ergebnisse.
 *
 * @param config - Vollständige Gebäudekonfiguration
 * @returns Alle berechneten Ergebnisse
 */
export function calculateKostX(config: KostXConfig): KostXResult {
  // 1. Massen
  const masses = calculateMasses(config);

  // 2. KG 300
  const kg300 = calculateKG300(config, masses);

  // 3. KG 400
  const kg400 = calculateKG400(config, masses);

  // 4. Untergeschoss
  const basement = calculateBasement(config, masses);

  // 5. Basis Haus €/m² NUF brutto
  const erloes = masses.erloesflaecheWarm_m2;
  const basisHaus_eurM2 = erloes > 0
    ? (kg300.total_eurBrutto + kg400.total_eurBrutto) / erloes
    : 0;

  // 6. Honorarrechner (KG 700 Planungsleistungen)
  const honorar = calculateHonorar(config, masses, kg300.total_eurBrutto, kg400.total_eurBrutto);

  // 7. Waterfall
  const zuschlaege = computeZuschlaege(config, masses, basisHaus_eurM2);

  // 8. GIK (mit Honorar)
  const gik = calculateGIK(config, basisHaus_eurM2, masses, honorar.total_brutto);

  // 9. Economics
  const economics = calculateEconomics(config, gik, masses);

  return {
    masses,
    kg300,
    kg400,
    basement,
    basisHaus_eurM2,
    zuschlaege,
    honorar,
    gik,
    economics,
  };
}
