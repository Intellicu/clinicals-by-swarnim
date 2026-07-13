/**
 * Offline write middleware — intercepts create/update on clinical-input
 * entities. When the device is offline, the write is stored in the local sync
 * queue (instead of failing) and pushed to the database automatically once
 * the connection is restored (flushQueue in syncQueue.js, triggered by the
 * OfflineSync component on 'online').
 */
import { queueWrite } from '@/lib/offline/syncQueue';

/** Entities whose writes are captured offline (clinical inputs at the bedside). */
export const CLINICAL_INPUT_ENTITIES = [
  'ClinicalEncounter',
  'PatientDailyLog',
  'ToolLog',
  'VisitRecord',
  'LabResult',
  'Prescription',
  'Appointment',
  'MonitoringLog',
  'GrowthRecord',
  'MedicalHistoryEntry',
];

export function enableOfflineWrites(client) {
  for (const name of CLINICAL_INPUT_ENTITIES) {
    const entity = client?.entities?.[name];
    if (!entity || entity.__offlineWrites) continue;
    entity.__offlineWrites = true;

    const origCreate = entity.create.bind(entity);
    const origUpdate = entity.update.bind(entity);

    entity.create = async (data) => {
      if (!navigator.onLine) {
        queueWrite('create', name, data);
        return { queued: true, id: `queued-${Date.now()}`, ...data };
      }
      return origCreate(data);
    };

    entity.update = async (id, data) => {
      if (!navigator.onLine) {
        queueWrite('update', name, data, id);
        return { queued: true, id, ...data };
      }
      return origUpdate(id, data);
    };
  }
}