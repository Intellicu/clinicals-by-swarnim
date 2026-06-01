import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

async function verifyHmac(body, signature, secret) {
  if (!signature || !secret) return false;
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const msgData = encoder.encode(body);
  const cryptoKey = await crypto.subtle.importKey(
    "raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, msgData);
  const hex = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
  return hex === signature;
}

Deno.serve(async (req) => {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("X-KidneyCareAI-Signature") || "";
    const secret = Deno.env.get("KIDNEYCARE_SHARED_SECRET") || "";

    const valid = await verifyHmac(rawBody, signature, secret);
    if (!valid) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const base44 = createClientFromRequest(req);
    const now = new Date().toISOString();

    // Create the WhatsApp log
    const logData = {
      whatsapp_message_id: payload.whatsapp_message_id,
      caregiver_phone: payload.caregiver_phone,
      caregiver_name: payload.caregiver_name,
      direction: payload.direction || "Inbound",
      message_type: payload.message_type,
      message_text: payload.message_text,
      transcription: payload.transcription,
      image_url: payload.image_url,
      message_timestamp: payload.message_timestamp || now,
      received_in_clinicals_at: now,
      workflow_step: payload.workflow_step,
      source_app: "KidneyCare_WhatsApp_Agent",
      requires_clinician_action: payload.requires_clinician_action || false,
    };

    // Attempt to match patient by phone number if patient_id not provided
    if (payload.patient_id) {
      logData.patient_id = payload.patient_id;
    } else if (payload.caregiver_phone) {
      const patients = await base44.asServiceRole.entities.Patient.filter({
        mobile_number: payload.caregiver_phone,
      });
      if (patients.length === 1) {
        logData.patient_id = patients[0].id;
        logData.patient_name = patients[0].patient_name;
      }
    }

    await base44.asServiceRole.entities.WhatsAppMessageLog.create(logData);

    return Response.json({ received: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});