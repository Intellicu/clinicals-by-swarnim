/**
 * invoke-llm — server-side LLM proxy (replaces Base44 Core.InvokeLLM).
 *
 * WHY THIS EXISTS:
 *  - Keeps the Anthropic API key OUT of the browser.
 *  - Enforces the anti-hallucination grounding rules server-side so no client
 *    can bypass them (unlike the previous client-side prepend).
 *  - Supports both free-text and JSON-schema (structured) responses, matching
 *    the shape the app already expects: { result: <string | object> }.
 *
 * Deploy: supabase functions deploy invoke-llm
 * Secrets: supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
 */
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;
const MODEL = Deno.env.get("LLM_MODEL") || "claude-opus-4-8";

// Must stay in sync with src/lib/ai/groundingRules.js
const GROUNDING_RULES = `STRICT EVIDENCE RULES — follow every one:
1. Base every clinical statement ONLY on published guidelines (KDIGO, IPNA, ISPN, IAP, AAP, ESPN, NICE, WHO) or peer-reviewed literature. Name the source and year next to each recommendation, e.g. "(KDIGO 2021)".
2. If the evidence for something is weak, conflicting, or you are not certain a guideline says it — say exactly that: "Not established in current guidelines — consult a specialist." NEVER fill gaps with plausible-sounding content.
3. Never invent: drug doses, trial names, citation details, prevalence numbers, or cut-off values. If you cannot cite where a number comes from, do not state the number.
4. Doses must state: amount per kg or per m², maximum dose, route, and frequency — or explicitly say the dose is context-dependent and point to the app's Drugs & Dosing module.
5. Prefer Indian context where relevant (ISPN, IAP, Jan Aushadhi availability, low-resource adaptations).
6. End with a one-line "Sources:" list of the guidelines/papers actually used.`;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const opts = await req.json();
    const userPrompt: string = opts.prompt || "";
    const grounded = userPrompt.includes("STRICT EVIDENCE RULES")
      ? userPrompt
      : `${GROUNDING_RULES}\n\n${userPrompt}`;

    // Structured output → Claude tool-use with the caller's JSON schema
    const schema = opts.response_json_schema;
    const body: Record<string, unknown> = {
      model: MODEL,
      max_tokens: opts.max_tokens || 2048,
      messages: [{ role: "user", content: grounded }],
    };
    if (schema) {
      body.tools = [{ name: "respond", description: "Return the structured answer", input_schema: schema }];
      body.tool_choice = { type: "tool", name: "respond" };
    }

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      return new Response(JSON.stringify({ error: `LLM error: ${err}` }), { status: 502, headers: { ...cors, "content-type": "application/json" } });
    }

    const data = await res.json();
    let result: unknown;
    if (schema) {
      const toolUse = (data.content || []).find((c: any) => c.type === "tool_use");
      result = toolUse?.input ?? {};
    } else {
      result = (data.content || []).filter((c: any) => c.type === "text").map((c: any) => c.text).join("");
    }

    return new Response(JSON.stringify({ result }), { headers: { ...cors, "content-type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...cors, "content-type": "application/json" } });
  }
});
