#!/usr/bin/env node
/**
 * Phase 2 migration — full data export from Base44.
 *
 * Dumps every record of every entity to ./migration-export/<Entity>.json and
 * writes a combined manifest. Read-only: it never writes to Base44.
 *
 * USAGE:
 *   1. Log into the live app in a browser.
 *   2. DevTools → Application → Local Storage → copy the value of `base44_token`
 *      and `base44_app_id`.
 *   3. Run:
 *        BASE44_APP_ID=<id> BASE44_TOKEN=<token> node scripts/export-base44-data.mjs
 *
 * Output feeds scripts/generate-supabase-schema.mjs (Phase 2 schema step).
 */
import { createClient } from "@base44/sdk";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const APP_ID = process.env.BASE44_APP_ID;
const TOKEN = process.env.BASE44_TOKEN;
const OUT_DIR = join(process.cwd(), "migration-export");
const PAGE_SIZE = 100;

// Full entity inventory (grepped from the codebase, July 2026).
const ENTITIES = [
  "AnalysisResult", "AppRoute", "Appointment", "Billing", "BiopsyPattern",
  "ClinicalEncounter", "Consultant", "CustomSection", "CustomTool", "DoseRule",
  "Drug", "FeedbackReport", "FollowUpSchedule", "GrowthRecord", "Guideline",
  "Inventory", "KidneyCareAIResult", "KidneyCareInboundQueue", "LabResult",
  "LearningPath", "Manuscript", "Measurement", "MedicalHistoryEntry",
  "MonitoringAlert", "MonitoringPlan", "MonitoringTemplate", "NSRelapseEpisode",
  "Notification", "NotificationPreference", "Patient", "PatientDailyLog",
  "PatientDocument", "PatientEducationAssignment", "Prescription",
  "RRTMonitoringData", "RareDiseaseContent", "ReferralLetter",
  "ResearchKnowledgeBase", "ResearchProject", "SavedRRTTemplate", "SearchIndex",
  "SearchSynonym", "Specialty", "StudentProgress", "TeachingModule", "ToolLog",
  "TreatmentTemplate", "UserPreferences", "VisitRecord", "WhatsAppMessageLog",
  "Workspace",
];

if (!APP_ID || !TOKEN) {
  console.error("Missing BASE44_APP_ID or BASE44_TOKEN env vars. See file header for usage.");
  process.exit(1);
}

const base44 = createClient({ appId: APP_ID, token: TOKEN, requiresAuth: false });

async function exportEntity(name) {
  const entity = base44.entities[name];
  if (!entity?.list) return { name, count: 0, skipped: true };

  const all = [];
  let page = 0;
  // Paginate until a short page signals the end.
  // SDK list signature: list(sort, limit, skip) — skip may be unsupported on
  // some entities; fall back to a single large page if paging looks stuck.
  try {
    while (true) {
      const batch = await entity.list("-created_date", PAGE_SIZE, page * PAGE_SIZE);
      if (!Array.isArray(batch) || batch.length === 0) break;
      all.push(...batch);
      if (batch.length < PAGE_SIZE) break;
      page++;
      if (page > 1000) { console.warn(`  ${name}: stopped at 100k records (safety cap)`); break; }
    }
  } catch (err) {
    // Retry once as a single unpaged pull
    try {
      const batch = await entity.list("-created_date", 10000);
      if (Array.isArray(batch)) all.push(...batch);
    } catch (err2) {
      return { name, count: 0, error: err2.message || String(err2) };
    }
  }

  await writeFile(join(OUT_DIR, `${name}.json`), JSON.stringify(all, null, 2));
  return { name, count: all.length };
}

(async () => {
  await mkdir(OUT_DIR, { recursive: true });
  const manifest = [];
  for (const name of ENTITIES) {
    process.stdout.write(`Exporting ${name}… `);
    const result = await exportEntity(name);
    manifest.push(result);
    console.log(result.error ? `ERROR: ${result.error}` : result.skipped ? "skipped" : `${result.count} records`);
  }
  await writeFile(join(OUT_DIR, "_manifest.json"), JSON.stringify({ exportedAt: new Date().toISOString(), entities: manifest }, null, 2));
  const total = manifest.reduce((s, m) => s + (m.count || 0), 0);
  console.log(`\nDone. ${total} total records across ${manifest.filter(m => m.count).length} entities → ${OUT_DIR}`);
})();
