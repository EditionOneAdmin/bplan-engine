/**
 * Import NRW Mietspiegel data from Open Data sources into Supabase geo_mietspiegel table.
 * Source: Dortmund Mietspiegel 2025-2026 (Open Data Dortmund / Open.NRW CKAN)
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jkcnvuyklczouglhcoih.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!SUPABASE_KEY) throw new Error('SUPABASE_SERVICE_ROLE_KEY env var required');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const CSV_URL_2025 = 'https://open-data.dortmund.de/api/v2/catalog/datasets/fb64-mietspiegel-2025-2026/exports/csv?use_labels=true';
const CSV_URL_2023 = 'https://open-data.dortmund.de/api/v2/catalog/datasets/mietspiegel-2023-2024/exports/csv?use_labels=true';

interface MietRecord {
  gebiet: string;
  miete: number;
}

async function fetchCSV(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.text();
}

function parseCSV(csv: string, gebietCol: string, mieteCol: string): MietRecord[] {
  const lines = csv.split('\n').filter(l => l.trim());
  const header = lines[0].split(';');
  const gebietIdx = header.findIndex(h => h.trim() === gebietCol);
  const mieteIdx = header.findIndex(h => h.trim().startsWith(mieteCol));
  
  if (gebietIdx < 0 || mieteIdx < 0) {
    console.error('Headers:', header);
    throw new Error(`Column not found: gebiet=${gebietIdx} miete=${mieteIdx}`);
  }

  const records: MietRecord[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(';');
    const gebiet = cols[gebietIdx]?.trim();
    const mieteStr = cols[mieteIdx]?.trim().replace(',', '.');
    const miete = parseFloat(mieteStr);
    if (gebiet && !isNaN(miete) && miete > 0) {
      records.push({ gebiet, miete });
    }
  }
  return records;
}

function aggregate(records: MietRecord[]): Map<string, { avg: number; count: number }> {
  const map = new Map<string, number[]>();
  for (const r of records) {
    if (!map.has(r.gebiet)) map.set(r.gebiet, []);
    map.get(r.gebiet)!.push(r.miete);
  }
  const result = new Map<string, { avg: number; count: number }>();
  for (const [gebiet, values] of map) {
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    result.set(gebiet, { avg: Math.round(avg * 100) / 100, count: values.length });
  }
  return result;
}

async function main() {
  console.log('Fetching Dortmund Mietspiegel 2025-2026...');
  const csv2025 = await fetchCSV(CSV_URL_2025);
  const records2025 = parseCSV(csv2025, 'Mietspiegelgebiet', 'Nettokaltmiete');
  console.log(`  Parsed ${records2025.length} records`);

  const byGebiet = aggregate(records2025);
  console.log('\nDortmund Mietspiegelgebiete (2025-2026):');
  
  // Also compute overall Dortmund average
  const allMieten = records2025.map(r => r.miete);
  const dortmundAvg = Math.round((allMieten.reduce((a, b) => a + b, 0) / allMieten.length) * 100) / 100;
  
  for (const [gebiet, { avg, count }] of byGebiet) {
    console.log(`  ${gebiet}: ${avg} €/m² (n=${count})`);
  }
  console.log(`  Dortmund gesamt: ${dortmundAvg} €/m² (n=${allMieten.length})`);

  // Upsert into geo_mietspiegel
  // First: upsert sub-areas as separate entries
  const quelle = 'Open Data Dortmund - Mietspiegel 2025-2026 (https://open-data.dortmund.de/explore/dataset/fb64-mietspiegel-2025-2026/)';
  const stichtag = '2025-01-01';
  
  const rows = [];
  
  // Overall Dortmund entry (update existing)
  rows.push({
    gemeinde: 'Dortmund',
    bundesland: 'nrw',
    miete_kalt_eur: dortmundAvg,
    baujahr_klasse: 'alle',
    wohnlage: 'durchschnitt',
    quelle,
    stichtag,
  });

  // Sub-areas
  for (const [gebiet, { avg }] of byGebiet) {
    // Avoid "Dortmund-Dortmund-Nord" etc.
    const gemeindeName = gebiet.startsWith('Dortmund-') ? gebiet : `Dortmund-${gebiet}`;
    rows.push({
      gemeinde: gemeindeName,
      bundesland: 'nrw',
      miete_kalt_eur: avg,
      baujahr_klasse: 'alle',
      wohnlage: 'durchschnitt',
      quelle,
      stichtag,
    });
  }

  console.log(`\nUpserting ${rows.length} rows...`);
  
  for (const row of rows) {
    // Delete existing entry with same gemeinde+bundesland first, then insert
    const { error: delErr } = await supabase
      .from('geo_mietspiegel')
      .delete()
      .eq('gemeinde', row.gemeinde)
      .eq('bundesland', 'nrw');
    
    if (delErr) console.warn(`  Delete warning for ${row.gemeinde}:`, delErr.message);
    
    const { error } = await supabase
      .from('geo_mietspiegel')
      .insert(row);
    
    if (error) {
      console.error(`  Error inserting ${row.gemeinde}:`, error.message);
    } else {
      console.log(`  ✓ ${row.gemeinde}: ${row.miete_kalt_eur} €/m²`);
    }
  }

  // Now try to fetch and process 2023-2024 data too (for comparison / older Mietspiegel areas)
  console.log('\nFetching Dortmund Mietspiegel 2023-2024...');
  try {
    const csv2023 = await fetchCSV(CSV_URL_2023);
    const records2023 = parseCSV(csv2023, 'Mietspiegelgebiet', 'Nettokaltmiete');
    console.log(`  Parsed ${records2023.length} records (2023-2024, for reference only - 2025-2026 data already imported)`);
    const byGebiet2023 = aggregate(records2023);
    const allMieten2023 = records2023.map(r => r.miete);
    const avg2023 = Math.round((allMieten2023.reduce((a, b) => a + b, 0) / allMieten2023.length) * 100) / 100;
    console.log(`  Dortmund 2023-2024 avg: ${avg2023} €/m² (vs 2025-2026: ${dortmundAvg} €/m²)`);
  } catch (e: any) {
    console.log(`  Could not fetch 2023-2024 data: ${e.message}`);
  }

  console.log('\nDone!');
}

main().catch(console.error);
