/**
 * Offline snapshot layer for read-mostly reference entities.
 *
 * Wraps list/filter on the whitelisted entities so that:
 *  - every successful network read refreshes a local snapshot
 *  - when the network fails (offline bedside use), the snapshot answers instead
 *
 * This is deliberately limited to reference data (formulary, dose rules,
 * guidelines, search index) — patient data must never be served stale.
 */

const SNAPSHOT_PREFIX = "offline_ent_v1_";
export const OFFLINE_ENTITIES = ["Drug", "DoseRule", "Guideline", "AppRoute", "SearchIndex"];

function argsKey(args) {
  try {
    let h = 5381;
    const str = JSON.stringify(args ?? []);
    for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
    return h.toString(36);
  } catch {
    return "default";
  }
}

function readSnapshot(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.d) ? parsed.d : null;
  } catch {
    return null;
  }
}

function writeSnapshot(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ d: data, t: Date.now() }));
  } catch {
    // Quota exceeded — evict our snapshots oldest-first and retry once
    try {
      const mine = Object.keys(localStorage)
        .filter(k => k.startsWith(SNAPSHOT_PREFIX))
        .map(k => { try { return { k, t: JSON.parse(localStorage.getItem(k))?.t || 0 }; } catch { return { k, t: 0 }; } })
        .sort((a, b) => a.t - b.t);
      for (const { k } of mine.slice(0, Math.ceil(mine.length / 2))) localStorage.removeItem(k);
      localStorage.setItem(key, JSON.stringify({ d: data, t: Date.now() }));
    } catch { /* give up quietly — offline reads just won't cover this query */ }
  }
}

/** Wrap the read methods of whitelisted entities on a base44 client instance. */
export function enableOfflineSnapshots(base44) {
  const entities = base44?.entities;
  if (!entities) return;

  for (const name of OFFLINE_ENTITIES) {
    const entity = entities[name];
    if (!entity) continue;

    for (const method of ["list", "filter"]) {
      const original = entity[method]?.bind(entity);
      if (!original) continue;

      entity[method] = async (...args) => {
        const key = `${SNAPSHOT_PREFIX}${name}_${method}_${argsKey(args)}`;
        try {
          const result = await original(...args);
          if (Array.isArray(result)) writeSnapshot(key, result);
          return result;
        } catch (err) {
          const snapshot = readSnapshot(key);
          if (snapshot) {
            console.warn(`[offline] serving ${name}.${method} from snapshot (${snapshot.length} records)`);
            return snapshot;
          }
          throw err;
        }
      };
    }
  }
}
