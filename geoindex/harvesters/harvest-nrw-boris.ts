/**
 * NRW BORIS Bodenrichtwerte Harvester
 *
 * Source: OpenGeodata NRW Shapefiles (EPSG:25832)
 * URL:    https://www.opengeodata.nrw.de/produkte/infrastruktur_bauen_wohnen/boris/BRW/
 * License: Datenlizenz Deutschland – Namensnennung 2.0
 *
 * Downloads the current BRW Shapefile, reprojects to EPSG:4326, and upserts
 * into geo_boris table via Supabase REST API.
 *
 * Usage:
 *   npx tsx geoindex/harvesters/harvest-nrw-boris.ts [--dry-run] [--limit <n>] [--gemeinde <name>]
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

const DOWNLOAD_URL =
  "https://www.opengeodata.nrw.de/produkte/infrastruktur_bauen_wohnen/boris/BRW/BRW_EPSG25832_Shape.zip";

const SUPABASE_URL =
  process.env.SUPABASE_URL ??
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://jkcnvuyklczouglhcoih.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

const TABLE = "geo_boris";
const BATCH_SIZE = 500;
const TMP_DIR = "/tmp/brw_nrw_harvest";

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
  let gemeinde: string | undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--limit" && args[i + 1]) limit = Number(args[++i]);
    if (args[i] === "--gemeinde" && args[i + 1]) gemeinde = args[++i];
    if (args[i] === "--dry-run") dryRun = true;
  }
  return { limit, dryRun, gemeinde };
}

// ---------------------------------------------------------------------------
// Download & extract
// ---------------------------------------------------------------------------

async function downloadAndExtract(): Promise<string> {
  if (!existsSync(TMP_DIR)) mkdirSync(TMP_DIR, { recursive: true });

  const zipPath = path.join(TMP_DIR, "brw.zip");

  // Check if already downloaded
  const shpGlob = path.join(TMP_DIR, "BRW_*_Polygon.shp");
  const existing = execSync(`ls ${shpGlob} 2>/dev/null || true`)
    .toString()
    .trim();
  if (existing) {
    console.log(`📦 Using cached shapefile: ${existing}`);
    return existing;
  }

  console.log("📥 Downloading NRW BRW shapefile (~28MB)...");
  const res = await fetch(DOWNLOAD_URL);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);

  const writer = createWriteStream(zipPath);
  await pipeline(Readable.fromWeb(res.body as any), writer);
  console.log("✅ Downloaded.");

  console.log("📦 Extracting...");
  execSync(`unzip -o "${zipPath}" -d "${TMP_DIR}" 2>/dev/null`);

  const shpFile = execSync(`ls ${TMP_DIR}/BRW_*_Polygon.shp`)
    .toString()
    .trim();
  console.log(`✅ Extracted: ${shpFile}`);
  return shpFile;
}

// ---------------------------------------------------------------------------
// Coordinate transformation
// ---------------------------------------------------------------------------

function transformCoords(
  coords: number[][]
): number[][] {
  return coords.map(([x, y]) => {
    const [lng, lat] = proj4("EPSG:25832", "EPSG:4326", [x, y]);
    return [lng, lat];
  });
}

function transformPolygon(
  geometry: GeoJSON.Polygon
): GeoJSON.Polygon {
  return {
    type: "Polygon",
    coordinates: geometry.coordinates.map(transformCoords),
  };
}

function transformMultiPolygon(
  geometry: GeoJSON.MultiPolygon
): GeoJSON.MultiPolygon {
  return {
    type: "MultiPolygon",
    coordinates: geometry.coordinates.map((polygon) =>
      polygon.map(transformCoords)
    ),
  };
}

function centroid(geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon): [number, number] {
  let coords: number[][] = [];
  if (geometry.type === "Polygon") {
    coords = geometry.coordinates[0];
  } else {
    for (const poly of geometry.coordinates) {
      coords.push(...poly[0]);
    }
  }
  const lng = coords.reduce((s, c) => s + c[0], 0) / coords.length;
  const lat = coords.reduce((s, c) => s + c[1], 0) / coords.length;
  return [lng, lat];
}

// ---------------------------------------------------------------------------
// Parse BRW value (German decimal: "1,2" → 1.2, "125" → 125)
// ---------------------------------------------------------------------------

function parseBRW(brw: string | null | undefined): number | null {
  if (!brw) return null;
  const val = parseFloat(String(brw).replace(",", "."));
  return isNaN(val) ? null : val;
}

// ---------------------------------------------------------------------------
// Nutzungsart mapping
// ---------------------------------------------------------------------------

const NUTA_MAP: Record<string, string> = {
  W: "Wohnbaufläche",
  WS: "Kleinsiedlungsgebiet",
  WR: "Reines Wohngebiet",
  WA: "Allgemeines Wohngebiet",
  WB: "Besonderes Wohngebiet",
  M: "Gemischte Baufläche",
  MI: "Mischgebiet",
  MK: "Kerngebiet",
  MD: "Dorfgebiet",
  G: "Gewerbliche Baufläche",
  GE: "Gewerbegebiet",
  GI: "Industriegebiet",
  S: "Sonderbaufläche",
  SE: "Sondergebiet Erholung",
  SO: "Sonstiges Sondergebiet",
  F: "Fläche der Land-/Forstwirtschaft",
  LF: "Land-/Forstwirtschaft",
  SF: "Sonstige Fläche",
  E: "Sonstige Fläche",
};

const ENTW_MAP: Record<string, string> = {
  B: "Baureifes Land",
  R: "Rohbauland",
  E: "Erschließungsbeitragsfrei",
  LF: "Land-/Forstwirtschaft",
  SF: "Sonstige Fläche",
  ebf: "Erschließungsbeitragsfrei",
  ebp: "Erschließungsbeitragspflichtig",
};

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const { limit, dryRun, gemeinde } = parseArgs();

  console.log("🌍 NRW BORIS Bodenrichtwerte Harvester");
  console.log(`   Source: OpenGeodata NRW Shapefiles`);
  if (gemeinde) console.log(`   Filter: Gemeinde = ${gemeinde}`);
  if (limit < Infinity) console.log(`   Limit:  ${limit}`);
  if (dryRun) console.log("   🔸 DRY RUN — no database writes");
  console.log();

  const shpFile = await downloadAndExtract();
  const dbfFile = shpFile.replace(".shp", ".dbf");

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
        `   ✅ Upserted batch of ${batch.length} (total: ${totalUpserted})`
      );
    }
    batch = [];
  }

  while (totalRead < limit) {
    const { done, value } = await source.read();
    if (done) break;

    const props = value.properties as Record<string, any>;
    const geom = value.geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon | null;

    if (!geom || !props) {
      skipped++;
      continue;
    }

    // Filter by gemeinde if specified
    if (gemeinde && props.GENA !== gemeinde) {
      totalRead++;
      continue;
    }

    const brwEur = parseBRW(props.BRW);
    if (brwEur === null) {
      skipped++;
      totalRead++;
      continue;
    }

    // Transform geometry to EPSG:4326
    const geom4326 =
      geom.type === "Polygon"
        ? transformPolygon(geom as GeoJSON.Polygon)
        : transformMultiPolygon(geom as GeoJSON.MultiPolygon);

    const center = centroid(geom4326);
    const gfzRaw = props.GFZ;
    const gfz = gfzRaw ? parseFloat(String(gfzRaw).replace(",", ".")) : null;

    const row = {
      gemeinde: props.GENA || "unbekannt",
      bundesland: "nrw",
      bodenrichtwert_eur: brwEur,
      stichtag: props.STAG || null,
      richtwertzone: props.BRWZNR ? String(props.BRWZNR) : null,
      entwicklungszustand:
        ENTW_MAP[props.ENTW] || props.ENTW || null,
      point: {
        type: "Point" as const,
        coordinates: center,
      },
      raw_data: {
        nutzungsart_code: props.NUTA,
        nutzungsart: NUTA_MAP[props.NUTA] || props.NUTA || null,
        gfz: gfz,
        grz: props.GRZ ? parseFloat(String(props.GRZ).replace(",", ".")) : null,
        ortsteil: props.ORTST,
        plz: props.PLZ,
        gemarkung: props.GEMA,
        gemeindeschluessel: props.GESL,
        wertermittlungsnummer: props.WNUM,
        polygon: geom4326,
        quelle: "opengeodata_nrw_brw",
        lizenz: "dl-de/by-2-0",
      },
    };

    batch.push(row);
    totalRead++;

    if (dryRun && totalRead <= 3) {
      console.log(
        `📋 Sample #${totalRead}:`,
        JSON.stringify(
          { ...row, raw_data: { ...row.raw_data, polygon: "[omitted]" } },
          null,
          2
        ).slice(0, 600)
      );
    }

    if (batch.length >= BATCH_SIZE) {
      await flushBatch();
    }
  }

  // Flush remaining
  await flushBatch();

  console.log(`\n🏁 Done.`);
  console.log(`   Total read:     ${totalRead}`);
  console.log(`   Total upserted: ${totalUpserted}`);
  console.log(`   Skipped:        ${skipped}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
