/**
 * Hochwasserkarten Harvester — Berlin & NRW
 *
 * Sources:
 *   Berlin: WFS https://gdi.berlin.de/services/wfs/ua_uesg
 *           FeatureType: ua_uesg:c_ueberschwemmungsgebiete (HQ100, festgesetzt)
 *           License: Datenlizenz Deutschland – Zero 2.0
 *
 *   NRW:   OpenGeodata Shapefiles (EPSG:25832)
 *           https://www.opengeodata.nrw.de/produkte/umwelt_klima/wasser/hochwasser/hwrm/
 *           Datasets: HQ100, HQhaeufig, HQextrem (Überschwemmungsgrenzen)
 *           License: Datenlizenz Deutschland – Zero 2.0
 *
 * Usage:
 *   npx tsx geoindex/harvesters/harvest-hochwasser.ts [--dry-run] [--limit <n>] [--source berlin|nrw] [--risikozone HQ100|HQhaeufig|HQextrem]
 */

import { createClient } from "@supabase/supabase-js";
import * as shapefile from "shapefile";
import proj4 from "proj4";
import { createWriteStream, existsSync, mkdirSync } from "fs";
import { pipeline } from "stream/promises";
import { Readable } from "stream";
import { execSync } from "child_process";
import path from "path";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const NRW_BASE_URL =
  "https://www.opengeodata.nrw.de/produkte/umwelt_klima/wasser/hochwasser/hwrm";

const NRW_DATASETS: Record<string, string> = {
  HQ100: `${NRW_BASE_URL}/HQ100-Ueberschwemmungsgrenzen_EPSG25832_Shape.zip`,
  HQhaeufig: `${NRW_BASE_URL}/HQhaeufig-Ueberschwemmungsgrenzen_EPSG25832_Shape.zip`,
  HQextrem: `${NRW_BASE_URL}/HQextrem-Ueberschwemmungsgrenzen_EPSG25832_Shape.zip`,
};

const BERLIN_WFS_URL = "https://gdi.berlin.de/services/wfs/ua_uesg";
const BERLIN_FEATURE_TYPE = "ua_uesg:c_ueberschwemmungsgebiete";

const SUPABASE_URL =
  process.env.SUPABASE_URL ??
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://jkcnvuyklczouglhcoih.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

const TABLE = "geo_hochwasser";
const BATCH_SIZE = 200;
const TMP_DIR = "/tmp/hochwasser_harvest";

// EPSG:25832 (ETRS89 / UTM zone 32N)
proj4.defs(
  "EPSG:25832",
  "+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"
);

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

function parseArgs() {
  const args = process.argv.slice(2);
  let limit = Infinity;
  let dryRun = false;
  let source: string | undefined;
  let risikozone: string | undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--limit" && args[i + 1]) limit = Number(args[++i]);
    if (args[i] === "--source" && args[i + 1]) source = args[++i];
    if (args[i] === "--risikozone" && args[i + 1]) risikozone = args[++i];
    if (args[i] === "--dry-run") dryRun = true;
  }
  return { limit, dryRun, source, risikozone };
}

// ---------------------------------------------------------------------------
// Coordinate transformation (NRW shapefiles are EPSG:25832)
// ---------------------------------------------------------------------------

function transformCoords(coords: number[][]): number[][] {
  return coords.map(([x, y]) => {
    const [lng, lat] = proj4("EPSG:25832", "EPSG:4326", [x, y]);
    return [lng, lat];
  });
}

function transformGeometry(
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon
): GeoJSON.Polygon | GeoJSON.MultiPolygon {
  if (geometry.type === "Polygon") {
    return {
      type: "Polygon",
      coordinates: geometry.coordinates.map(transformCoords),
    };
  }
  return {
    type: "MultiPolygon",
    coordinates: geometry.coordinates.map((polygon) =>
      polygon.map(transformCoords)
    ),
  };
}

// ---------------------------------------------------------------------------
// Download & extract NRW shapefiles
// ---------------------------------------------------------------------------

async function downloadAndExtract(risikozone: string): Promise<string> {
  if (!existsSync(TMP_DIR)) mkdirSync(TMP_DIR, { recursive: true });

  const url = NRW_DATASETS[risikozone];
  if (!url) throw new Error(`Unknown risikozone: ${risikozone}`);

  const dir = path.join(TMP_DIR, risikozone);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  const zipPath = path.join(dir, "data.zip");

  // Check if already extracted
  const existing = execSync(`ls ${dir}/*.shp 2>/dev/null || true`)
    .toString()
    .trim();
  if (existing) {
    const first = existing.split("\n")[0];
    console.log(`📦 Using cached shapefile: ${first}`);
    return first;
  }

  console.log(`📥 Downloading NRW ${risikozone} shapefile...`);
  console.log(`   URL: ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);

  const writer = createWriteStream(zipPath);
  await pipeline(Readable.fromWeb(res.body as any), writer);
  console.log("✅ Downloaded.");

  console.log("📦 Extracting...");
  execSync(`unzip -o "${zipPath}" -d "${dir}" 2>/dev/null`);

  const shpFile = execSync(`ls ${dir}/*.shp`).toString().trim().split("\n")[0];
  console.log(`✅ Extracted: ${shpFile}`);
  return shpFile;
}

// ---------------------------------------------------------------------------
// Harvest NRW (Shapefiles)
// ---------------------------------------------------------------------------

async function harvestNRW(
  risikozone: string,
  limit: number,
  dryRun: boolean,
  supabase: ReturnType<typeof createClient> | null
): Promise<{ read: number; upserted: number; skipped: number }> {
  const shpFile = await downloadAndExtract(risikozone);
  const dbfFile = shpFile.replace(".shp", ".dbf");

  const source = await shapefile.open(shpFile, dbfFile);
  let totalRead = 0;
  let totalUpserted = 0;
  let skipped = 0;
  let batch: any[] = [];

  async function flushBatch() {
    if (batch.length === 0 || !supabase) return;
    const { error } = await supabase.from(TABLE).insert(batch);
    if (error) {
      console.error(`❌ Insert error: ${error.message}`);
    } else {
      totalUpserted += batch.length;
      console.log(
        `   ✅ Inserted batch of ${batch.length} (total: ${totalUpserted})`
      );
    }
    batch = [];
  }

  while (totalRead < limit) {
    const { done, value } = await source.read();
    if (done) break;

    const props = value.properties as Record<string, any>;
    const geom = value.geometry as
      | GeoJSON.Polygon
      | GeoJSON.MultiPolygon
      | null;

    if (!geom) {
      skipped++;
      totalRead++;
      continue;
    }

    // Transform to EPSG:4326
    const geom4326 = transformGeometry(geom);

    // Extract gemeinde from properties (field names vary per dataset)
    const gemeinde =
      props.GEMEINDE || props.GN || props.GENA || props.gemeinde || "unbekannt";

    const row = {
      geometry: geom4326,
      risikozone,
      bundesland: "nrw",
      gemeinde: String(gemeinde),
      quelle_url: NRW_DATASETS[risikozone],
      raw_data: {
        ...props,
        quelle: "opengeodata_nrw_hwrm",
        lizenz: "dl-de/zero-2-0",
      },
    };

    batch.push(row);
    totalRead++;

    if (dryRun && totalRead <= 3) {
      console.log(
        `📋 Sample #${totalRead}:`,
        JSON.stringify(
          { ...row, geometry: `[${geom4326.type}]` },
          null,
          2
        ).slice(0, 600)
      );
    }

    if (batch.length >= BATCH_SIZE) {
      await flushBatch();
    }
  }

  await flushBatch();
  return { read: totalRead, upserted: totalUpserted, skipped };
}

// ---------------------------------------------------------------------------
// Harvest Berlin (WFS)
// ---------------------------------------------------------------------------

async function harvestBerlin(
  limit: number,
  dryRun: boolean,
  supabase: ReturnType<typeof createClient> | null
): Promise<{ read: number; upserted: number; skipped: number }> {
  const params = new URLSearchParams({
    SERVICE: "WFS",
    VERSION: "2.0.0",
    REQUEST: "GetFeature",
    TYPENAMES: BERLIN_FEATURE_TYPE,
    COUNT: String(Math.min(limit, 1000)),
    SRSNAME: "EPSG:4326",
    OUTPUTFORMAT: "application/json",
  });

  const url = `${BERLIN_WFS_URL}?${params.toString()}`;
  console.log(`📥 Fetching Berlin WFS...`);
  console.log(`   URL: ${url}`);

  const res = await fetch(url);
  if (!res.ok) {
    console.error(`❌ HTTP ${res.status}`);
    return { read: 0, upserted: 0, skipped: 0 };
  }

  const data = await res.json();
  const features = data.features || [];
  console.log(`   → ${features.length} features returned (total in dataset: ${data.totalFeatures})`);

  let totalRead = 0;
  let totalUpserted = 0;
  let skipped = 0;
  const batch: any[] = [];

  for (const feature of features) {
    if (totalRead >= limit) break;

    const geom = feature.geometry as
      | GeoJSON.Polygon
      | GeoJSON.MultiPolygon
      | null;
    const props = feature.properties as Record<string, any>;

    if (!geom) {
      skipped++;
      totalRead++;
      continue;
    }

    // Berlin ÜSG are HQ100 by definition (§76 WHG)
    const row = {
      geometry: geom,
      risikozone: "HQ100",
      bundesland: "berlin",
      gemeinde: "Berlin",
      quelle_url: props.link || BERLIN_WFS_URL,
      raw_data: {
        sen_id: props.sen_id,
        uesg: props.uesg,
        link: props.link,
        quelle: "gdi_berlin_wfs_ua_uesg",
        lizenz: "dl-de/zero-2-0",
      },
    };

    batch.push(row);
    totalRead++;

    if (dryRun && totalRead <= 3) {
      console.log(
        `📋 Sample #${totalRead}:`,
        JSON.stringify(
          { ...row, geometry: `[${geom.type}]` },
          null,
          2
        ).slice(0, 600)
      );
    }
  }

  // Insert all Berlin features (small dataset)
  if (supabase && batch.length > 0) {
    const { error } = await supabase.from(TABLE).insert(batch);
    if (error) {
      console.error(`❌ Insert error: ${error.message}`);
    } else {
      totalUpserted = batch.length;
      console.log(`   ✅ Inserted ${totalUpserted} Berlin features`);
    }
  }

  return { read: totalRead, upserted: totalUpserted, skipped };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const { limit, dryRun, source, risikozone } = parseArgs();

  console.log("🌊 Hochwasserkarten Harvester — Berlin & NRW");
  if (source) console.log(`   Source:     ${source}`);
  if (risikozone) console.log(`   Risikozone: ${risikozone}`);
  if (limit < Infinity) console.log(`   Limit:      ${limit}`);
  if (dryRun) console.log("   🔸 DRY RUN — no database writes");
  console.log();

  let supabase: ReturnType<typeof createClient> | null = null;
  if (!dryRun) {
    if (!SUPABASE_KEY) {
      console.error(
        "❌ SUPABASE_SERVICE_ROLE_KEY not set. Use --dry-run or set env var."
      );
      process.exit(1);
    }
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  }

  let totalRead = 0;
  let totalUpserted = 0;
  let totalSkipped = 0;

  // Berlin
  if (!source || source === "berlin") {
    console.log("━━━ Berlin (WFS) ━━━");
    const r = await harvestBerlin(limit, dryRun, supabase);
    totalRead += r.read;
    totalUpserted += r.upserted;
    totalSkipped += r.skipped;
    console.log();
  }

  // NRW
  if (!source || source === "nrw") {
    const zones = risikozone
      ? [risikozone]
      : Object.keys(NRW_DATASETS);

    for (const zone of zones) {
      console.log(`━━━ NRW ${zone} (Shapefile) ━━━`);
      const remaining = limit - totalRead;
      if (remaining <= 0) break;
      const r = await harvestNRW(zone, remaining, dryRun, supabase);
      totalRead += r.read;
      totalUpserted += r.upserted;
      totalSkipped += r.skipped;
      console.log();
    }
  }

  console.log("🏁 Done.");
  console.log(`   Total read:     ${totalRead}`);
  console.log(`   Total upserted: ${totalUpserted}`);
  console.log(`   Skipped:        ${totalSkipped}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
