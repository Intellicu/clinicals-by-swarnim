/**
 * Platform facade — the ONLY module the app should import platform services from.
 *
 * Backend selection is automatic:
 *   - If VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are set → Supabase backend.
 *   - Otherwise → Base44 (default, unchanged).
 * Flipping backends therefore requires NO code change — just env vars — and the
 * app keeps running on Base44 until Supabase is configured.
 *
 * MIGRATION CONTRACT: no other file in src/ may import from ./base44Client,
 * ./supabaseClient, or @base44/* directly. Everything goes through `base44`
 * (kept as the export name for compatibility) or the named aliases below.
 *
 * Surface used by the app (inventoried July 2026):
 *  - .entities.<48 entity names>.{list,filter,get,create,update,delete,bulkCreate}
 *  - .auth.{me,loginViaEmailPassword,loginWithProvider,logout,register,
 *      redirectToLogin,resendOtp,resetPassword,resetPasswordRequest,setToken}
 *  - .integrations.Core.{InvokeLLM,UploadFile,ExtractDataFromUploadedFile,
 *      SendEmail,GenerateImage}
 *  - .functions.invoke(name, payload)
 */
import { base44 as base44Backend } from "./base44Client";
import { supabaseBackend, isSupabaseConfigured } from "./supabaseClient";
import { enableOfflineSnapshots } from "@/lib/offline/entitySnapshot";
import { enableOfflineWrites } from "@/lib/offline/writeQueue";

// The active backend. Name kept as `base44` so the 244 existing call sites and
// the base44Client cross-cutting layers (grounding, offline snapshots) are
// untouched. When Supabase is configured it transparently takes over.
// (Base44 already has offline snapshots applied inside base44Client.js; the
//  Supabase backend gets the same reference-data offline layer here. LLM
//  grounding for Supabase is enforced server-side in the invoke-llm edge fn.)
if (isSupabaseConfigured) enableOfflineSnapshots(supabaseBackend);
export const base44 = isSupabaseConfigured ? supabaseBackend : base44Backend;

// Clinical inputs written while offline are queued locally and auto-synced on reconnect.
enableOfflineWrites(base44);

export const activeBackend = isSupabaseConfigured ? "supabase" : "base44";

// Named service aliases — prefer these in NEW code; they make the backend
// swap explicit and greppable.
export const db = base44.entities;
export const auth = base44.auth;
export const ai = {
  invoke: (opts) => base44.integrations.Core.InvokeLLM(opts),
  extractFromFile: (opts) => base44.integrations.Core.ExtractDataFromUploadedFile(opts),
  generateImage: (opts) => base44.integrations.Core.GenerateImage(opts),
};
export const files = {
  upload: (opts) => base44.integrations.Core.UploadFile(opts),
};
export const email = {
  send: (opts) => base44.integrations.Core.SendEmail(opts),
};
export const serverFunctions = {
  invoke: (name, payload) => base44.functions.invoke(name, payload),
};