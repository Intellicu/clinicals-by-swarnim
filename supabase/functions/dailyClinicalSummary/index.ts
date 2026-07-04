/**
 * dailyClinicalSummary — port of the Base44 server function of the same name.
 *
 * Generates (and persists) a grounded daily clinical pearl / summary row.
 * Invoked on-demand from the app and can also be scheduled via pg_cron.
 *
 * Deploy: supabase functions deploy dailyClinicalSummary
 * Secrets: ANTHROPIC_API_KEY, plus SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY
 *          (injected automatically for scheduled runs; passed for HTTP runs).
 *
 * NOTE: adjust the target table/columns to match your generated schema. This
 * mirrors the app's expectation of an AnalysisResult-like `daily_summary` row
 * with { summary_date, clinical_pearl, content }.
 */
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;
const MODEL = Deno.env.get("LLM_MODEL") || "claude-opus-4-8";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const GROUNDING = `Only use established pediatric nephrology guidelines (KDIGO, IPNA, ISPN, IAP, AAP). Cite source + year. Never invent doses or numbers. Prefer Indian context.`;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const today = new Date().toISOString().split("T")[0];
    const db = createClient(SUPABASE_URL, SERVICE_KEY);

    // Idempotent: skip if today's summary already exists
    const { data: existing } = await db.from("daily_summary").select("id").eq("summary_date", today).maybeSingle();
    if (existing) {
      return new Response(JSON.stringify({ success: true, skipped: true }), { headers: { ...cors, "content-type": "application/json" } });
    }

    const prompt = `${GROUNDING}\n\nProduce today's pediatric nephrology teaching summary as JSON with: clinical_pearl (one high-yield, guideline-cited pearl), content (3-4 sentence expansion), topic (short label).`;
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        tools: [{ name: "summary", description: "Daily summary", input_schema: { type: "object", properties: { clinical_pearl: { type: "string" }, content: { type: "string" }, topic: { type: "string" } }, required: ["clinical_pearl", "content"] } }],
        tool_choice: { type: "tool", name: "summary" },
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await res.json();
    const out = (data.content || []).find((c: any) => c.type === "tool_use")?.input || {};

    const { error } = await db.from("daily_summary").insert({
      summary_date: today,
      clinical_pearl: out.clinical_pearl,
      content: out.content,
      topic: out.topic,
    });
    if (error) throw error;

    return new Response(JSON.stringify({ success: true, summary_date: today }), { headers: { ...cors, "content-type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: String(e) }), { status: 500, headers: { ...cors, "content-type": "application/json" } });
  }
});
