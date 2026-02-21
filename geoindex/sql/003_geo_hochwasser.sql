-- Create geo_hochwasser table for flood risk zone data
-- Sources: Berlin WFS (gdi.berlin.de), NRW WMS (wms.nrw.de)

CREATE TABLE IF NOT EXISTS geo_hochwasser (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  geometry GEOMETRY(Geometry, 4326),
  risikozone TEXT NOT NULL,        -- HQ_hoch, HQ100, HQ_extrem, HQ10, HQ500, etc.
  wassertiefe TEXT,                -- e.g. "> 0,5 - 1,0 m"
  ueberflutungsschutz TEXT,        -- geschuetzt/ungeschuetzt (NRW)
  bundesland TEXT NOT NULL,        -- berlin, nrw
  gemeinde TEXT,
  quelle_url TEXT NOT NULL,
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Spatial index
CREATE INDEX IF NOT EXISTS idx_geo_hochwasser_geometry ON geo_hochwasser USING GIST (geometry);

-- Index on bundesland + risikozone
CREATE INDEX IF NOT EXISTS idx_geo_hochwasser_land_zone ON geo_hochwasser (bundesland, risikozone);

-- Enable RLS
ALTER TABLE geo_hochwasser ENABLE ROW LEVEL SECURITY;

-- Allow public read
CREATE POLICY "geo_hochwasser_public_read" ON geo_hochwasser
  FOR SELECT TO anon, authenticated USING (true);
