/**
 * send-email — replaces Base44 Core.SendEmail. Uses Resend.
 * Deploy: supabase functions deploy send-email
 * Secrets: supabase secrets set RESEND_API_KEY=re_...  EMAIL_FROM="CliniCals <noreply@yourdomain>"
 */
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const EMAIL_FROM = Deno.env.get("EMAIL_FROM") || "CliniCals <noreply@example.com>";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { to, subject, body, html } = await req.json();
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({ from: EMAIL_FROM, to, subject, html: html || body, text: body }),
    });
    const data = await res.json();
    if (!res.ok) return new Response(JSON.stringify({ error: data }), { status: 502, headers: { ...cors, "content-type": "application/json" } });
    return new Response(JSON.stringify({ success: true, id: data.id }), { headers: { ...cors, "content-type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...cors, "content-type": "application/json" } });
  }
});
