import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Entities included in the automatic clinical backup
const BACKUP_ENTITIES = [
  'Guideline',        // clinical pathways & guidelines
  'CustomSection',    // custom pathways / tools / engines
  'TeachingModule',   // teaching content
  'Drug',             // formulary
  'DoseRule',         // dosing engine rules
  'BiopsyPattern',    // biopsy reference patterns
  'ToolLog',          // diagnostic tool logs
  'AnalysisResult',   // AI diagnostic results
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Collect data (per-entity failures don't sink the whole backup)
    const backup = {};
    const counts = {};
    for (const name of BACKUP_ENTITIES) {
      try {
        const rows = await base44.asServiceRole.entities[name].list('-updated_date', 1000);
        backup[name] = rows;
        counts[name] = rows.length;
      } catch (e) {
        counts[name] = `error: ${e.message}`;
      }
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googledrive');
    const authHeader = { Authorization: `Bearer ${accessToken}` };

    // Find or create the "CliniCals Backups" folder
    const q = encodeURIComponent("name = 'CliniCals Backups' and mimeType = 'application/vnd.google-apps.folder' and trashed = false");
    const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id)`, { headers: authHeader });
    const searchData = await searchRes.json();
    let folderId = searchData.files?.[0]?.id;
    if (!folderId) {
      const folderRes = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: { ...authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'CliniCals Backups', mimeType: 'application/vnd.google-apps.folder' }),
      });
      const folderData = await folderRes.json();
      if (!folderRes.ok) return Response.json({ error: 'Could not create Drive folder', details: folderData }, { status: 502 });
      folderId = folderData.id;
    }

    // Multipart upload of the backup JSON
    const now = new Date();
    const filename = `clinicals_backup_${now.toISOString().slice(0, 10)}_${now.getUTCHours()}${String(now.getUTCMinutes()).padStart(2, '0')}.json`;
    const payload = JSON.stringify({ backed_up_at: now.toISOString(), counts, data: backup });

    const boundary = 'clinicals_backup_' + Date.now();
    const metadata = JSON.stringify({ name: filename, parents: [folderId], mimeType: 'application/json' });
    const body =
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n` +
      `--${boundary}\r\nContent-Type: application/json\r\n\r\n${payload}\r\n--${boundary}--`;

    const uploadRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
      method: 'POST',
      headers: { ...authHeader, 'Content-Type': `multipart/related; boundary=${boundary}` },
      body,
    });
    const uploadData = await uploadRes.json();
    if (!uploadRes.ok) return Response.json({ error: 'Drive upload failed', details: uploadData }, { status: 502 });

    return Response.json({ success: true, file: uploadData.name, web_view_link: uploadData.webViewLink, counts });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});