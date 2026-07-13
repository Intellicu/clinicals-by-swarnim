/**
 * Offline sync queue — clinical data written while offline is queued in
 * localStorage and pushed to the active backend (Base44 or Supabase, via the
 * platform facade in @/api/client) as soon as the connection is restored.
 *
 * Usage:
 *   import { saveClinicalData } from '@/lib/offline/syncQueue';
 *   await saveClinicalData('ToolLog', { ... });   // queues automatically offline
 */
import { db } from '@/api/client';

const KEY = 'clinical_sync_queue';
const MAX_ATTEMPTS = 5;
const EVENT = 'sync-queue-changed';

function readQueue() {
  try {
    const q = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(q) ? q : [];
  } catch {
    return [];
  }
}

function writeQueue(q) {
  localStorage.setItem(KEY, JSON.stringify(q));
  window.dispatchEvent(new Event(EVENT));
}

export function getQueueCount() {
  return readQueue().length;
}

/** Full queue contents — for the sync manager UI. */
export function getQueueItems() {
  return readQueue();
}

/** Remove a single queued item by its qid. */
export function removeQueueItem(qid) {
  writeQueue(readQueue().filter(i => i.qid !== qid));
}

/** Queue a write directly (used by the offline write middleware). */
export function queueWrite(op, entityName, data, recordId) {
  enqueue({ op, entity: entityName, data, ...(recordId ? { record_id: recordId } : {}) });
  return { queued: true };
}

export function subscribeQueue(cb) {
  const handler = () => cb(getQueueCount());
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}

function enqueue(item) {
  writeQueue([
    ...readQueue(),
    { ...item, queued_at: new Date().toISOString(), attempts: 0, qid: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` },
  ]);
}

/** Create a record — queues automatically when offline or the request fails. */
export async function saveClinicalData(entityName, data) {
  if (navigator.onLine) {
    try {
      return await db[entityName].create(data);
    } catch (e) {
      console.warn(`[syncQueue] create failed, queueing ${entityName}`, e);
    }
  }
  enqueue({ op: 'create', entity: entityName, data });
  return { queued: true };
}

/** Update a record — queues automatically when offline or the request fails. */
export async function updateClinicalData(entityName, recordId, data) {
  if (navigator.onLine) {
    try {
      return await db[entityName].update(recordId, data);
    } catch (e) {
      console.warn(`[syncQueue] update failed, queueing ${entityName}`, e);
    }
  }
  enqueue({ op: 'update', entity: entityName, record_id: recordId, data });
  return { queued: true };
}

let flushing = false;

/** Push every queued write to the backend. Returns { synced, failed }. */
export async function flushQueue() {
  if (flushing || !navigator.onLine) return { synced: 0, failed: getQueueCount() };
  flushing = true;
  let synced = 0;
  const remaining = [];
  try {
    for (const item of readQueue()) {
      try {
        if (item.op === 'update') await db[item.entity].update(item.record_id, item.data);
        else await db[item.entity].create(item.data);
        synced++;
      } catch (e) {
        const attempts = (item.attempts || 0) + 1;
        if (attempts < MAX_ATTEMPTS) remaining.push({ ...item, attempts });
        else console.error(`[syncQueue] dropping ${item.entity} write after ${attempts} failed attempts`, e);
      }
    }
    writeQueue(remaining);
  } finally {
    flushing = false;
  }
  return { synced, failed: remaining.length };
}