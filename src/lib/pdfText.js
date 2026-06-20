/**
 * Client-side PDF text extraction (no upload / no network).
 * Used by the Intelligence Engine builder so guidelines can be parsed even
 * when the Base44 file-upload endpoint is unreachable.
 */
import * as pdfjsLib from 'pdfjs-dist';
// Bundle the worker via Vite so no external/CDN fetch is needed.
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

export async function extractPdfText(file, maxChars = 12000) {
  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
  let out = '';
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    const pageText = content.items.map(it => (it.str || '')).join(' ');
    out += pageText + '\n\n';
    if (out.length >= maxChars) break;
  }
  return out.slice(0, maxChars).trim();
}
