import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { filename, pdf_base64 } = await req.json();
    if (!filename || !pdf_base64) {
      return Response.json({ error: 'filename and pdf_base64 are required' }, { status: 400 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googledrive');
    const authHeader = { Authorization: `Bearer ${accessToken}` };

    // Find or create the "CliniCals Reports" folder (drive.file scope covers app-created files)
    const q = encodeURIComponent("name = 'CliniCals Reports' and mimeType = 'application/vnd.google-apps.folder' and trashed = false");
    const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id)`, { headers: authHeader });
    const searchData = await searchRes.json();
    let folderId = searchData.files?.[0]?.id;

    if (!folderId) {
      const folderRes = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: { ...authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'CliniCals Reports', mimeType: 'application/vnd.google-apps.folder' }),
      });
      const folderData = await folderRes.json();
      if (!folderRes.ok) return Response.json({ error: 'Could not create Drive folder', details: folderData }, { status: 502 });
      folderId = folderData.id;
    }

    // Decode base64 PDF bytes
    const binary = atob(pdf_base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

    // Multipart upload
    const boundary = 'clinicals_boundary_' + Date.now();
    const metadata = JSON.stringify({ name: filename, parents: [folderId], mimeType: 'application/pdf' });
    const head = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n--${boundary}\r\nContent-Type: application/pdf\r\n\r\n`;
    const tail = `\r\n--${boundary}--`;
    const headBytes = new TextEncoder().encode(head);
    const tailBytes = new TextEncoder().encode(tail);
    const bodyBytes = new Uint8Array(headBytes.length + bytes.length + tailBytes.length);
    bodyBytes.set(headBytes, 0);
    bodyBytes.set(bytes, headBytes.length);
    bodyBytes.set(tailBytes, headBytes.length + bytes.length);

    const uploadRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
      method: 'POST',
      headers: { ...authHeader, 'Content-Type': `multipart/related; boundary=${boundary}` },
      body: bodyBytes,
    });
    const uploadData = await uploadRes.json();
    if (!uploadRes.ok) return Response.json({ error: 'Drive upload failed', details: uploadData }, { status: 502 });

    return Response.json({ success: true, file_id: uploadData.id, web_view_link: uploadData.webViewLink });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});