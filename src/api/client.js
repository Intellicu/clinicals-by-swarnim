/**
 * Platform facade — the ONLY module the app should import platform services from.
 *
 * Today it re-exports the Base44 implementation (see ./base44Client.js, which
 * also applies the global AI-grounding and offline-snapshot layers).
 *
 * MIGRATION CONTRACT: to move off Base44, reimplement the same surface here
 * (backed by e.g. Supabase + an LLM edge function) and delete base44Client.js.
 * No other file in src/ may import from ./base44Client or @base44/* directly.
 *
 * Surface used by the app (inventoried July 2026):
 *  - base44.entities.<48 entity names>.list / filter / create / update / delete
 *  - base44.auth.{me,loginViaEmailPassword,loginWithProvider,logout,register,
 *      redirectToLogin,resendOtp,resetPassword,resetPasswordRequest,setToken}
 *  - base44.integrations.Core.{InvokeLLM,UploadFile,ExtractDataFromUploadedFile,
 *      SendEmail,GenerateImage}
 *  - base44.functions.invoke(name, payload)
 */
import { base44 } from "./base44Client";

export { base44 };

// Named service aliases — prefer these in NEW code; they make the eventual
// backend swap explicit and greppable.
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
