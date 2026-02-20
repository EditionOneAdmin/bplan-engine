/**
 * GeoIndex API — Lookup functions for U-Plan Engine
 * Uses Supabase RPC calls to PostGIS functions for spatial queries.
 * Falls back to direct table queries if RPC functions are not yet deployed.
 */
import { supabase } from './supabase';

/* ── Types ─────────────────────────────────────────────────── */

export interface FlurstueckResult {
  id: string;
  gemarkung: string;
  flur: string;
  zaehler: string;
  nenner: string | null;
  flaeche_m2: number | null;
  gemeinde: string | null;
  kennzeichen: string | null;
}

export interface BplanResult {
  id: string;
  name: string;
  nummer: string | null;
  status: string | null;
  festsetzungen: Record<string, unknown> | null;
}

export interface BorisResult {
  bodenrichtwert: number;
  stichtag: string | null;
  nutzungsart: string | null;
  entwicklungszustand: string | null;
  distance_m?: number;
}

export interface MietspiegelResult {
  wohnlage: string | null;
  miete_min: number | null;
  miete_max: number | null;
  miete_durchschnitt: number | null;
  bezirk: string | null;
  stand: string | null;
}

export interface LboResult {
  land: string;
  abstandsflaechen_faktor: number;
  abstandsflaechen_minimum: number;
  stellplatz_pkw_pro_we: number;
  stellplatz_fahrrad_pro_we: number;
  gebaeudeklassen: unknown[] | null;
}

export interface GeoIndexResult {
  coordinate: { lat: number; lng: number };
  flurstueck: FlurstueckResult | null;
  bplan: BplanResult | null;
  boris: BorisResult | null;
  mietspiegel: MietspiegelResult | null;
  lbo: LboResult | null;
  source: 'rpc' | 'fallback';
  error?: string;
}

/* ── RPC-based lookup ──────────────────────────────────────── */

export async function lookupByCoordinate(lat: number, lng: number): Promise<GeoIndexResult> {
  // Try RPC function first (requires PostGIS SQL functions deployed)
  const { data, error } = await supabase.rpc('geo_lookup_by_coordinate', {
    p_lat: lat,
    p_lng: lng,
  });

  if (!error && data) {
    const d = typeof data === 'string' ? JSON.parse(data) : data;
    return {
      coordinate: { lat, lng },
      flurstueck: d.flurstueck === null || d.flurstueck === 'null' ? null : d.flurstueck,
      bplan: d.bplan === null || d.bplan === 'null' ? null : d.bplan,
      boris: d.boris === null || d.boris === 'null' ? null : d.boris,
      mietspiegel: d.mietspiegel === null || d.mietspiegel === 'null' ? null : d.mietspiegel,
      lbo: d.lbo === null || d.lbo === 'null' ? null : d.lbo,
      source: 'rpc',
    };
  }

  // Fallback: direct table queries (no PostGIS, simpler bounding box)
  console.warn('[GeoIndex] RPC unavailable, using fallback:', error?.message);
  return lookupByCoordinateFallback(lat, lng);
}

export async function lookupByFlurstueck(
  gemarkung: string,
  flur: string,
  zaehler: string,
  nenner?: string
): Promise<GeoIndexResult> {
  // Try RPC
  const { data, error } = await supabase.rpc('geo_lookup_by_flurstueck', {
    p_gemarkung: gemarkung,
    p_flur: flur,
    p_zaehler: zaehler,
    p_nenner: nenner ?? null,
  });

  if (!error && data) {
    const d = typeof data === 'string' ? JSON.parse(data) : data;
    return {
      coordinate: d.coordinate || { lat: 0, lng: 0 },
      flurstueck: d.flurstueck === null || d.flurstueck === 'null' ? null : d.flurstueck,
      bplan: d.bplan === null || d.bplan === 'null' ? null : d.bplan,
      boris: d.boris === null || d.boris === 'null' ? null : d.boris,
      mietspiegel: d.mietspiegel === null || d.mietspiegel === 'null' ? null : d.mietspiegel,
      lbo: d.lbo === null || d.lbo === 'null' ? null : d.lbo,
      source: 'rpc',
    };
  }

  // Fallback: find flurstück by attributes, then coordinate lookup
  console.warn('[GeoIndex] RPC unavailable for flurstueck lookup:', error?.message);

  let query = supabase
    .from('geo_fluerstuecke')
    .select('*')
    .eq('gemarkung', gemarkung)
    .eq('flur', flur)
    .eq('zaehler', zaehler);

  if (nenner) {
    query = query.eq('nenner', nenner);
  }

  const { data: rows } = await query.limit(1);
  if (rows && rows.length > 0) {
    const fs = rows[0];
    // If we have centroid coordinates stored
    if (fs.centroid_lat && fs.centroid_lng) {
      const result = await lookupByCoordinateFallback(fs.centroid_lat, fs.centroid_lng);
      result.flurstueck = {
        id: fs.id,
        gemarkung: fs.gemarkung,
        flur: fs.flur,
        zaehler: fs.zaehler,
        nenner: fs.nenner,
        flaeche_m2: fs.flaeche_m2,
        gemeinde: fs.gemeinde,
        kennzeichen: fs.kennzeichen,
      };
      return result;
    }
  }

  return {
    coordinate: { lat: 0, lng: 0 },
    flurstueck: null,
    bplan: null,
    boris: null,
    mietspiegel: null,
    lbo: null,
    source: 'fallback',
    error: 'Flurstück nicht gefunden',
  };
}

/* ── Fallback: direct table queries without PostGIS RPC ──── */

async function lookupByCoordinateFallback(lat: number, lng: number): Promise<GeoIndexResult> {
  const result: GeoIndexResult = {
    coordinate: { lat, lng },
    flurstueck: null,
    bplan: null,
    boris: null,
    mietspiegel: null,
    lbo: null,
    source: 'fallback',
  };

  // Simple bounding box queries (approximation without PostGIS RPC)
  // These work if tables have centroid_lat/centroid_lng columns or bbox columns
  const delta = 0.001; // ~111m

  const wrap = <T,>(p: PromiseLike<T>): Promise<T> => Promise.resolve(p);

  const promises = [
    wrap(supabase
      .from('geo_fluerstuecke')
      .select('id,gemarkung,flur,zaehler,nenner,flaeche_m2,gemeinde,kennzeichen')
      .gte('centroid_lat', lat - delta)
      .lte('centroid_lat', lat + delta)
      .gte('centroid_lng', lng - delta)
      .lte('centroid_lng', lng + delta)
      .limit(1))
      .then(({ data }) => { if (data?.[0]) result.flurstueck = data[0] as FlurstueckResult; })
      .catch(() => {}),

    wrap(supabase
      .from('geo_bplaene')
      .select('id,name,nummer,status,festsetzungen')
      .gte('bbox_south', lat - delta)
      .lte('bbox_north', lat + delta)
      .gte('bbox_west', lng - delta)
      .lte('bbox_east', lng + delta)
      .limit(1))
      .then(({ data }) => { if (data?.[0]) result.bplan = data[0] as BplanResult; })
      .catch(() => {}),

    wrap(supabase
      .from('geo_boris')
      .select('bodenrichtwert,stichtag,nutzungsart,entwicklungszustand')
      .gte('centroid_lat', lat - delta)
      .lte('centroid_lat', lat + delta)
      .gte('centroid_lng', lng - delta)
      .lte('centroid_lng', lng + delta)
      .limit(1))
      .then(({ data }) => { if (data?.[0]) result.boris = data[0] as BorisResult; })
      .catch(() => {}),

    wrap(supabase
      .from('geo_mietspiegel')
      .select('wohnlage,miete_min,miete_max,miete_durchschnitt,bezirk,stand')
      .gte('centroid_lat', lat - delta)
      .lte('centroid_lat', lat + delta)
      .gte('centroid_lng', lng - delta)
      .lte('centroid_lng', lng + delta)
      .limit(1))
      .then(({ data }) => { if (data?.[0]) result.mietspiegel = data[0] as MietspiegelResult; })
      .catch(() => {}),

    wrap(supabase
      .from('geo_lbo_rules')
      .select('land,abstandsflaechen_faktor,abstandsflaechen_minimum,stellplatz_pkw_pro_we,stellplatz_fahrrad_pro_we,gebaeudeklassen')
      .limit(1))
      .then(({ data }) => { if (data?.[0]) result.lbo = data[0] as LboResult; })
      .catch(() => {}),
  ];

  await Promise.allSettled(promises);
  return result;
}
