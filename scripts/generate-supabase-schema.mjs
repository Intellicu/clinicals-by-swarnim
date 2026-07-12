#!/usr/bin/env node
/**
 * Phase 2 migration — infer a Postgres/Supabase schema from the exported JSON.
 *
 * Reads ./migration-export/*.json (from export-base44-data.mjs) and emits
 * ./migration-export/schema.sql with a CREATE TABLE per entity, column types
 * inferred from the data, plus RLS policy stubs. Review and adjust before
 * applying — inference is a starting point, not a final schema.
 *
 * USAGE: node scripts/generate-supabase-schema.mjs
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const DIR = join(process.cwd(), "migration-export");

// Entities that hold PHI / per-user data → get owner-scoped RLS.
// Everything else is shared reference data → read-all, write-admin.
const PATIENT_SCOPED = new Set([
  "Patient", "VisitRecord", "ClinicalEncounter", "LabResult", "Measurement",
  "GrowthRecord", "Prescription", "MedicalHistoryEntry", "PatientDailyLog",
  "PatientDocument", "PatientEducationAssignment", "FollowUpSchedule",
  "MonitoringPlan", "MonitoringAlert", "NSRelapseEpisode", "RRTMonitoringData",
  "ReferralLetter", "Billing", "Appointment", "Notification",
  "NotificationPreference", "UserPreferences", "AnalysisResult",
]);

const toSnake = (s) => s.replace(/([a-z0-9])([A-Z])/g, "$1_$2").replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2").toLowerCase();

function inferType(values) {
  const nonNull = values.filter(v => v !== null && v !== undefined);
  if (nonNull.length === 0) return "text";
  if (nonNull.every(v => typeof v === "boolean")) return "boolean";
  if (nonNull.every(v => typeof v === "number")) return nonNull.every(v => Number.isInteger(v)) ? "bigint" : "double precision";
  if (nonNull.every(v => typeof v === "object")) return "jsonb";
  if (nonNull.every(v => typeof v === "string" && /^\d{4}-\d{2}-\d{2}T/.test(v))) return "timestamptz";
  return "text";
}

function columnsFor(records) {
  const keys = new Map(); // key -> array of sampled values
  for (const rec of records.slice(0, 500)) {
    if (!rec || typeof rec !== "object") continue;
    for (const [k, v] of Object.entries(rec)) {
      if (!keys.has(k)) keys.set(k, []);
      keys.get(k).push(v);
    }
  }
  return [...keys.entries()].map(([k, vals]) => ({ name: toSnake(k), type: inferType(vals), raw: k }));
}

(async () => {
  let files;
  try {
    files = (await readdir(DIR)).filter(f => f.endsWith(".json") && !f.startsWith("_"));
  } catch {
    console.error(`No export found at ${DIR}. Run export-base44-data.mjs first.`);
    process.exit(1);
  }

  let sql = `-- Generated Supabase schema (Phase 2 migration). REVIEW before applying.\n`;
  sql += `-- Types inferred from exported data; adjust FKs, indexes, and constraints manually.\n\n`;
  sql += `create extension if not exists "pgcrypto";\n\n`;

  for (const file of files) {
    const entity = file.replace(".json", "");
    const table = toSnake(entity);
    const records = JSON.parse(await readFile(join(DIR, file), "utf8"));
    if (!Array.isArray(records) || records.length === 0) {
      sql += `-- ${entity}: no records exported, schema skipped\n\n`;
      continue;
    }
    const cols = columnsFor(records).filter(c => !["id", "created_date", "updated_date"].includes(c.raw));
    sql += `create table if not exists ${table} (\n`;
    // TEXT ids, not uuid: Base44 ids must be preserved verbatim on import so
    // cross-entity references (e.g. DoseRule.drug_id -> Drug.id) stay intact.
    sql += `  id text primary key default gen_random_uuid()::text,\n`;
    sql += `  created_at timestamptz default now(),\n`;
    sql += `  updated_at timestamptz default now()`;
    if (PATIENT_SCOPED.has(entity)) sql += `,\n  owner_id uuid references auth.users(id)`;
    for (const c of cols) sql += `,\n  ${c.name} ${c.type}`;
    sql += `\n);\n`;
    sql += `alter table ${table} enable row level security;\n`;
    if (PATIENT_SCOPED.has(entity)) {
      sql += `create policy "${table}_owner_all" on ${table} for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);\n`;
    } else {
      sql += `create policy "${table}_read_all" on ${table} for select using (true);\n`;
      sql += `create policy "${table}_write_admin" on ${table} for all using ((auth.jwt() ->> 'role') = 'admin');\n`;
    }
    sql += `\n`;
  }

  await writeFile(join(DIR, "schema.sql"), sql);
  console.log(`Wrote ${join(DIR, "schema.sql")} — review, then apply via Supabase SQL editor or CLI.`);
})();
