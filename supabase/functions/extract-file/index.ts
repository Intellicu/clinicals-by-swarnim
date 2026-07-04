/**
 * extract-file — replaces Base44 Core.ExtractDataFromUploadedFile.
 * Fetches the uploaded file and asks Claude to extract structured data per the
 * caller's json_schema. Returns { status: "success", output } to match the
 * shape the app expects.
 *
 * Deploy: supabase functions deploy extract-file
 * Secrets: shares ANTHROPIC_API_KEY with invoke-llm.
 */
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;
const MODEL = Deno.env.get("LLM_MODEL") || "claude-opus-4-8";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { file_url, json_schema } = await req.json();

    // Pull the file and pass it to Claude as a document/image block.
    const fileRes = await fetch(file_url);
    const contentType = fileRes.headers.get("content-type") || "application/octet-stream";
    const bytes = new Uint8Array(await fileRes.arrayBuffer());
    let b64 = "";
    for (let i = 0; i < bytes.length; i += 8192) b64 += String.fromCharCode(...bytes.subarray(i, i + 8192));
    b64 = btoa(b64);

    const isImage = contentType.startsWith("image/");
    const block = isImage
      ? { type: "image", source: { type: "base64", media_type: contentType, data: b64 } }
      : { type: "document", source: { type: "base64", media_type: "application/pdf", data: b64 } };

    const body = {
      model: MODEL,
      max_tokens: 4096,
      tools: [{ name: "extract", description: "Extract the requested structured data", input_schema: json_schema || { type: "object" } }],
      tool_choice: { type: "tool", name: "extract" },
      messages: [{ role: "user", content: [block, { type: "text", text: "Extract the structured data from this document per the schema. Do not invent values not present in the document." }] }],
    };

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) return new Response(JSON.stringify({ status: "error", details: data }), { status: 502, headers: { ...cors, "content-type": "application/json" } });
    const toolUse = (data.content || []).find((c: any) => c.type === "tool_use");
    return new Response(JSON.stringify({ status: "success", output: toolUse?.input ?? {} }), { headers: { ...cors, "content-type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ status: "error", details: String(e) }), { status: 500, headers: { ...cors, "content-type": "application/json" } });
  }
});
