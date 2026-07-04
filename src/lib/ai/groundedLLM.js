import { base44 } from "@/api/client";

/**
 * Shared grounding + caching layer for every LLM call in the app.
 *
 * Grounding: a strict system preamble that forbids invented facts and forces
 * guideline citation, applied uniformly so no feature ships an ungrounded prompt.
 *
 * Caching: identical prompts within the TTL are answered from localStorage —
 * cuts token spend and lets previously asked questions work fully offline.
 */

export { GROUNDING_RULES } from "./groundingRules";
import { GROUNDING_RULES } from "./groundingRules";

const CACHE_KEY = "ai_response_cache_v1";
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const CACHE_MAX_ENTRIES = 60;

function hashString(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

function readCache() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeCache(cache) {
  try {
    const entries = Object.entries(cache);
    if (entries.length > CACHE_MAX_ENTRIES) {
      entries.sort((a, b) => b[1].t - a[1].t);
      cache = Object.fromEntries(entries.slice(0, CACHE_MAX_ENTRIES));
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Quota exceeded — drop the cache rather than break the feature
    try { localStorage.removeItem(CACHE_KEY); } catch {}
  }
}

/**
 * Grounded, cached LLM call.
 * @param {object} opts - InvokeLLM options (prompt, add_context_from_internet, file_urls, response_json_schema, ...)
 * @param {object} cfg  - { cache: boolean (default true when no files), ground: boolean (default true) }
 * @returns LLM response (string or object per schema). Adds `_fromCache: true` marker via second return field when cached.
 */
export async function invokeGrounded(opts, cfg = {}) {
  const ground = cfg.ground !== false;
  // File-based and schema calls vary too much to cache safely by default
  const cacheable = cfg.cache !== undefined ? cfg.cache : (!opts.file_urls && !opts.response_json_schema);

  const prompt = ground ? `${GROUNDING_RULES}\n\n${opts.prompt}` : opts.prompt;
  const finalOpts = { ...opts, prompt };
  const key = hashString(JSON.stringify({ p: prompt, i: !!opts.add_context_from_internet, s: opts.response_json_schema ? 1 : 0 }));

  if (cacheable) {
    const cache = readCache();
    const hit = cache[key];
    if (hit && Date.now() - hit.t < CACHE_TTL_MS) {
      return { response: hit.r, fromCache: true };
    }
  }

  const response = await base44.integrations.Core.InvokeLLM(finalOpts);

  if (cacheable && response != null) {
    const cache = readCache();
    cache[key] = { r: response, t: Date.now() };
    writeCache(cache);
  }
  return { response, fromCache: false };
}

/** Pick only guidelines relevant to the question instead of sending the whole library (token saver). */
export function selectRelevantGuidelines(guidelines, question, maxCount = 5) {
  if (!guidelines?.length || !question) return [];
  const qWords = question.toLowerCase().split(/\W+/).filter(w => w.length > 3);
  const scored = guidelines.map(g => {
    const text = `${g.title || ""} ${g.category || ""} ${g.summary || ""}`.toLowerCase();
    const score = qWords.reduce((s, w) => s + (text.includes(w) ? 1 : 0), 0);
    return { g, score };
  }).filter(x => x.score > 0);
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, maxCount).map(x => x.g);
}
