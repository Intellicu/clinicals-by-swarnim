#!/usr/bin/env node
/**
 * Phase 2 migration — import the exported Base44 data into Supabase.
 *
 * Reads ./migration-export/<Entity>.json and inserts into the corresponding
 * snake_case tables, preserving original ids (so cross-entity references like
 * DoseRule.drug_id → Drug.id remain valid). Idempotent: uses upsert on id.
 *
 * PREREQS:
 *  - schema.sql applied to the Supabase project (see generate-supabase-schema.mjs)
 *  - Service-role key (Settings → API). NEVER ship this key to the frontend.
 *
 * USAGE:
 *   SUPABASE_URL=https://<ref>.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=<service-role-key> \
 *   node scripts/import-to-supabase.mjs [EntityName ...]
 *
 * With no args imports everything; pass entity names to import selectively.
 * Reference tables import first automatically (dependency order).
 */
import { createClient } from "@supabase/supabase-js";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DIR = join(process.cwd(), "migration-export");
const BATCH = 200;

// Reference data first so anything pointing at it lands on existing rows.
const IMPORT_FIRST = ["Drug", "DoseRule", "Guideline", "SearchIndex", "SearchSynonym", "AppRoute", "Specialty", "BiopsyPattern", "RareDiseaseContent", "TeachingModule", "TreatmentTemplate", "MonitoringTemplate"];

if (!URL || !KEY) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. See file header.");
  process.exit(1);
}

const sb = createClient(URL, KEY, { auth: { persistSession: false } });
const toSnake = (s) => s.replace(/([a-z0-9])([A-Z])/g, "$1_$2").replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2").toLowerCase();

function transformRecord(rec) {
  const out = {};
  for (const [k, v] of Object.entries(rec)) {
    if (k === "created_date") { out.created_at = v; continue; }
    if (k === "updated_date") { out.updated_at = v; continue; }
    // Base44 system fields with no schema column
    if (k === "created_by_id" || k === "created_by" || k === "is_sample") continue;
    out[toSnake(k)] = v;
  }
  return out;
}

async function importEntity(name) {
  let records;
  try {
    records = JSON.parse(await readFile(join(DIR, `${name}.json`), "utf8"));
  } catch {
    return { name, count: 0, skipped: "no export file" };
  }
  if (!Array.isArray(records) || records.length === 0) return { name, count: 0, skipped: "empty" };

  const table = toSnake(name);
  const rows = records.map(transformRecord);
  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await sb.from(table).upsert(batch, { onConflict: "id" });
    if (error) return { name, count: inserted, error: `${error.message} (batch at ${i})` };
    inserted += batch.length;
  }
  return { name, count: inserted };
}

(async () => {
  const requested = process.argv.slice(2);
  let names;
  if (requested.length > 0) {
    names = requested;
  } else {
    const files = (await readdir(DIR)).filter(f => f.endsWith(".json") && !f.startsWith("_")).map(f => f.replace(".json", ""));
    names = [...IMPORT_FIRST.filter(n => files.includes(n)), ...files.filter(n => !IMPORT_FIRST.includes(n))];
  }

  let ok = 0, failed = 0;
  for (const name of names) {
    process.stdout.write(`Importing ${name}… `);
    const r = await importEntity(name);
    if (r.error) { failed++; console.log(`ERROR: ${r.error}`); }
    else if (r.skipped) console.log(`skipped (${r.skipped})`);
    else { ok++; console.log(`${r.count} rows`); }
  }
  console.log(`\nDone: ${ok} entities imported, ${failed} failed.`);
  if (failed > 0) {
    console.log("Fix schema mismatches (add missing columns / adjust types) and re-run — upsert makes this safe to repeat.");
    process.exit(1);
  }
})();
