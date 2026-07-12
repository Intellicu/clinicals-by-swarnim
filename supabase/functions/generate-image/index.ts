/**
 * generate-image — replaces Base44 Core.GenerateImage.
 * Used by PatientEducationGenerator (parent infographics). Returns { url }.
 *
 * Uses Google's Gemini image generation; stores the result in the `uploads`
 * bucket and returns its public URL. If GEMINI_API_KEY is unset the function
 * returns 501 with a clear message — the app already handles failure with a
 * toast, so this degrades gracefully.
 *
 * Deploy:  supabase functions deploy generate-image
 * Secrets: supabase secrets set GEMINI_API_KEY=...
 */
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const IMAGE_MODEL = Deno.env.get("IMAGE_MODEL") || "gemini-2.5-flash-image";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "content-type": "application/json" } });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (!GEMINI_API_KEY) return json({ error: "Image generation not configured (set GEMINI_API_KEY)" }, 501);

  try {
    const { prompt } = await req.json();

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${IMAGE_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseModalities: ["IMAGE"] },
        }),
      },
    );
    if (!res.ok) return json({ error: `Image API error: ${await res.text()}` }, 502);

    const data = await res.json();
    const part = data?.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
    if (!part) return json({ error: "No image returned by model" }, 502);

    const bytes = Uint8Array.from(atob(part.inlineData.data), (c) => c.charCodeAt(0));
    const path = `generated/${Date.now()}.png`;
    const db = createClient(SUPABASE_URL, SERVICE_KEY);
    const { error } = await db.storage.from("uploads").upload(path, bytes, { contentType: "image/png" });
    if (error) return json({ error: error.message }, 500);

    const { data: pub } = db.storage.from("uploads").getPublicUrl(path);
    return json({ url: pub.publicUrl });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
