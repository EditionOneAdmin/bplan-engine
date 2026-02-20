-- =============================================================
-- GeoIndex PostGIS RPC Functions for Supabase
-- Run these in Supabase SQL Editor to create the RPC endpoints
-- =============================================================

-- 1. Lookup by Coordinate — returns Flurstück containing the point
CREATE OR REPLACE FUNCTION geo_lookup_by_coordinate(
  p_lat double precision,
  p_lng double precision
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb := '{}'::jsonb;
  v_flurstueck jsonb;
  v_bplan jsonb;
  v_boris jsonb;
  v_mietspiegel jsonb;
  v_lbo jsonb;
  v_point geometry;
BEGIN
  -- Create point geometry (SRID 4326 = WGS84)
  v_point := ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326);

  -- Flurstück containing point
  SELECT jsonb_build_object(
    'id', id,
    'gemarkung', gemarkung,
    'flur', flur,
    'zaehler', zaehler,
    'nenner', nenner,
    'flaeche_m2', flaeche_m2,
    'gemeinde', gemeinde,
    'kennzeichen', kennzeichen
  ) INTO v_flurstueck
  FROM geo_fluerstuecke
  WHERE ST_Contains(geom, v_point)
  LIMIT 1;

  -- B-Plan containing point (via spatial query)
  SELECT jsonb_build_object(
    'id', b.id,
    'name', b.name,
    'nummer', b.nummer,
    'status', b.status,
    'festsetzungen', b.festsetzungen
  ) INTO v_bplan
  FROM geo_bplaene b
  WHERE ST_Contains(b.geom, v_point)
  LIMIT 1;

  -- If no direct spatial match, try via flurstück-bplan join
  IF v_bplan IS NULL AND v_flurstueck IS NOT NULL THEN
    SELECT jsonb_build_object(
      'id', b.id,
      'name', b.name,
      'nummer', b.nummer,
      'status', b.status,
      'festsetzungen', b.festsetzungen
    ) INTO v_bplan
    FROM geo_fluerstueck_bplan fb
    JOIN geo_bplaene b ON b.id = fb.bplan_id
    WHERE fb.fluerstueck_id = (v_flurstueck->>'id')::uuid
    LIMIT 1;
  END IF;

  -- BORIS Bodenrichtwert zone containing point
  SELECT jsonb_build_object(
    'bodenrichtwert', bodenrichtwert,
    'stichtag', stichtag,
    'nutzungsart', nutzungsart,
    'entwicklungszustand', entwicklungszustand
  ) INTO v_boris
  FROM geo_boris
  WHERE ST_Contains(geom, v_point)
  LIMIT 1;

  -- If no exact contain, find nearest within 500m
  IF v_boris IS NULL THEN
    SELECT jsonb_build_object(
      'bodenrichtwert', bodenrichtwert,
      'stichtag', stichtag,
      'nutzungsart', nutzungsart,
      'entwicklungszustand', entwicklungszustand,
      'distance_m', ROUND(ST_Distance(geom::geography, v_point::geography)::numeric, 1)
    ) INTO v_boris
    FROM geo_boris
    WHERE ST_DWithin(geom::geography, v_point::geography, 500)
    ORDER BY ST_Distance(geom::geography, v_point::geography)
    LIMIT 1;
  END IF;

  -- Mietspiegel zone containing point
  SELECT jsonb_build_object(
    'wohnlage', wohnlage,
    'miete_min', miete_min,
    'miete_max', miete_max,
    'miete_durchschnitt', miete_durchschnitt,
    'bezirk', bezirk,
    'stand', stand
  ) INTO v_mietspiegel
  FROM geo_mietspiegel
  WHERE ST_Contains(geom, v_point)
  LIMIT 1;

  -- LBO rules for the Bundesland of the point
  SELECT jsonb_build_object(
    'land', land,
    'abstandsflaechen_faktor', abstandsflaechen_faktor,
    'abstandsflaechen_minimum', abstandsflaechen_minimum,
    'stellplatz_pkw_pro_we', stellplatz_pkw_pro_we,
    'stellplatz_fahrrad_pro_we', stellplatz_fahrrad_pro_we,
    'gebaeudeklassen', gebaeudeklassen
  ) INTO v_lbo
  FROM geo_lbo_rules
  WHERE ST_Contains(geom, v_point)
  LIMIT 1;

  -- Assemble result
  result := jsonb_build_object(
    'coordinate', jsonb_build_object('lat', p_lat, 'lng', p_lng),
    'flurstueck', COALESCE(v_flurstueck, 'null'::jsonb),
    'bplan', COALESCE(v_bplan, 'null'::jsonb),
    'boris', COALESCE(v_boris, 'null'::jsonb),
    'mietspiegel', COALESCE(v_mietspiegel, 'null'::jsonb),
    'lbo', COALESCE(v_lbo, 'null'::jsonb)
  );

  RETURN result;
END;
$$;

-- 2. Lookup by Flurstück identifiers
CREATE OR REPLACE FUNCTION geo_lookup_by_flurstueck(
  p_gemarkung text,
  p_flur text,
  p_zaehler text,
  p_nenner text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  v_flurstueck record;
  v_centroid geometry;
BEGIN
  -- Find Flurstück by identifiers
  SELECT * INTO v_flurstueck
  FROM geo_fluerstuecke
  WHERE gemarkung = p_gemarkung
    AND flur = p_flur
    AND zaehler = p_zaehler
    AND (p_nenner IS NULL OR nenner = p_nenner)
  LIMIT 1;

  IF v_flurstueck IS NULL THEN
    RETURN jsonb_build_object('error', 'Flurstück nicht gefunden');
  END IF;

  -- Use centroid for spatial lookups
  v_centroid := ST_Centroid(v_flurstueck.geom);

  -- Delegate to coordinate lookup using centroid
  SELECT geo_lookup_by_coordinate(
    ST_Y(v_centroid),
    ST_X(v_centroid)
  ) INTO result;

  -- Override flurstueck with exact match data
  result := jsonb_set(result, '{flurstueck}', jsonb_build_object(
    'id', v_flurstueck.id,
    'gemarkung', v_flurstueck.gemarkung,
    'flur', v_flurstueck.flur,
    'zaehler', v_flurstueck.zaehler,
    'nenner', v_flurstueck.nenner,
    'flaeche_m2', v_flurstueck.flaeche_m2,
    'gemeinde', v_flurstueck.gemeinde,
    'kennzeichen', v_flurstueck.kennzeichen
  ));

  RETURN result;
END;
$$;

-- Grant access to anon and authenticated roles
GRANT EXECUTE ON FUNCTION geo_lookup_by_coordinate TO anon, authenticated;
GRANT EXECUTE ON FUNCTION geo_lookup_by_flurstueck TO anon, authenticated;
