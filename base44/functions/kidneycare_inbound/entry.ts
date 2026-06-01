import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// HMAC-SHA256 verification using Web Crypto API
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

    // ── Step 1: Write to KidneyCareInboundQueue immediately ──────────────
    const queueRecord = await base44.asServiceRole.entities.KidneyCareInboundQueue.create({
      raw_cr_number: payload.cr_number,
      captured_at: payload.captured_at,
      received_at: now,
      predicted_result: payload.predicted_result,
      confidence_score: payload.confidence_score,
      image_quality: payload.image_quality,
      image_url: payload.image_before_url || payload.image_url,
      model_version: payload.model_version,
      medication_logged: payload.medication_logged,
      prednisolone_dose_mg: payload.prednisolone_dose_mg,
      weight_kg: payload.weight_kg,
      bp_systolic: payload.bp_systolic,
      bp_diastolic: payload.bp_diastolic,
      symptoms: payload.symptoms,
      patient_note: payload.patient_note,
      source_app_version: payload.source_app,
      request_signature: signature,
      processed: false,
      match_status: "Pending",
    });

    // ── Step 2: Write WhatsAppMessageLog (if whatsapp_message_id exists) ──
    let waLogRecord = null;
    if (payload.whatsapp_message_id) {
      waLogRecord = await base44.asServiceRole.entities.WhatsAppMessageLog.create({
        whatsapp_message_id: payload.whatsapp_message_id,
        caregiver_phone: payload.caregiver_phone,
        caregiver_name: payload.caregiver_name,
        direction: "Inbound",
        message_type: payload.message_type,
        message_text: payload.message_text,
        transcription: payload.transcription,
        image_url: payload.image_url,
        message_timestamp: payload.captured_at,
        received_in_clinicals_at: now,
        workflow_step: payload.workflow_step,
        source_app: "KidneyCare_WhatsApp_Agent",
        data_extracted: {
          protein_result: payload.predicted_result,
          medication_taken: payload.medication_logged,
          dose_taken_mg: payload.prednisolone_dose_mg,
          weight_kg: payload.weight_kg,
          bp_systolic: payload.bp_systolic,
          bp_diastolic: payload.bp_diastolic,
          symptoms: payload.symptoms,
        },
      });
    }

    // ── Step 3: Match CR number to Patient ───────────────────────────────
    const patients = await base44.asServiceRole.entities.Patient.filter({
      cr_number: payload.cr_number,
    });
    const activePatients = patients.filter(p => p.status !== "Discharged");

    if (activePatients.length === 0) {
      await base44.asServiceRole.entities.KidneyCareInboundQueue.update(queueRecord.id, {
        match_status: "Unmatched",
      });
      return Response.json({ received: true, matched: false, reason: "CR number not found" });
    }

    if (activePatients.length > 1) {
      await base44.asServiceRole.entities.KidneyCareInboundQueue.update(queueRecord.id, {
        match_status: "Error",
        match_error: "Multiple patients with same CR number",
      });
      return Response.json({ received: true, matched: false, reason: "Duplicate CR" });
    }

    const patient = activePatients[0];
    await base44.asServiceRole.entities.KidneyCareInboundQueue.update(queueRecord.id, {
      matched_patient_id: patient.id,
      match_status: "Matched",
    });
    if (waLogRecord) {
      await base44.asServiceRole.entities.WhatsAppMessageLog.update(waLogRecord.id, {
        patient_id: patient.id,
        patient_name: patient.patient_name,
      });
    }

    // ── Step 4: Write KidneyCareAIResult (dipstick events) ───────────────
    let aiResultId = null;
    if (payload.event_type === "dipstick_result" && payload.predicted_result) {
      const aiResult = await base44.asServiceRole.entities.KidneyCareAIResult.create({
        patient_id: patient.id,
        image_url: payload.image_before_url || payload.image_url,
        capture_timestamp: payload.captured_at,
        model_version: payload.model_version,
        predicted_result: payload.predicted_result,
        confidence_score: payload.confidence_score ? payload.confidence_score / 100 : null,
        image_quality_flag: payload.image_quality,
        study_arm: "Routine Monitoring",
        relapse_alert_triggered: false,
      });
      aiResultId = aiResult.id;
    }

    // ── Step 5: Write PatientDailyLog records ────────────────────────────
    const logDate = payload.captured_at
      ? payload.captured_at.split("T")[0]
      : now.split("T")[0];
    let firstDailyLogId = null;
    const writtenLogs = [];

    if (payload.predicted_result) {
      const log = await base44.asServiceRole.entities.PatientDailyLog.create({
        patient_id: patient.id,
        log_date: logDate,
        module_type: "Urine_Protein",
        protein_result: payload.predicted_result,
        source: "AI",
        confidence_score: payload.confidence_score,
        photo_url: payload.image_before_url,
        completion_status: "Complete",
      });
      writtenLogs.push(log.id);
      if (!firstDailyLogId) firstDailyLogId = log.id;
    }

    if (payload.prednisolone_dose_mg != null) {
      const log = await base44.asServiceRole.entities.PatientDailyLog.create({
        patient_id: patient.id,
        log_date: logDate,
        module_type: "Medications",
        prednisolone_dose: payload.prednisolone_dose_mg,
        value: { taken: payload.medication_logged, dose_mg: payload.prednisolone_dose_mg },
        source: "AI",
      });
      writtenLogs.push(log.id);
      if (!firstDailyLogId) firstDailyLogId = log.id;
    }

    if (payload.weight_kg != null) {
      const log = await base44.asServiceRole.entities.PatientDailyLog.create({
        patient_id: patient.id,
        log_date: logDate,
        module_type: "Weight",
        weight_kg: payload.weight_kg,
        source: "AI",
      });
      writtenLogs.push(log.id);
      if (!firstDailyLogId) firstDailyLogId = log.id;
    }

    if (payload.bp_systolic != null) {
      const log = await base44.asServiceRole.entities.PatientDailyLog.create({
        patient_id: patient.id,
        log_date: logDate,
        module_type: "Blood_Pressure",
        bp_systolic: payload.bp_systolic,
        bp_diastolic: payload.bp_diastolic,
        source: "AI",
      });
      writtenLogs.push(log.id);
      if (!firstDailyLogId) firstDailyLogId = log.id;
    }

    if (Array.isArray(payload.symptoms) && payload.symptoms.length > 0) {
      const log = await base44.asServiceRole.entities.PatientDailyLog.create({
        patient_id: patient.id,
        log_date: logDate,
        module_type: "Symptoms",
        value: { symptoms: payload.symptoms },
        source: "AI",
      });
      writtenLogs.push(log.id);
      if (!firstDailyLogId) firstDailyLogId = log.id;
    }

    // ── Step 6: Update queue record as processed ─────────────────────────
    await base44.asServiceRole.entities.KidneyCareInboundQueue.update(queueRecord.id, {
      processed: true,
      processed_at: now,
      kidneycareai_result_id: aiResultId,
      daily_log_id: firstDailyLogId,
    });

    if (waLogRecord && firstDailyLogId) {
      await base44.asServiceRole.entities.WhatsAppMessageLog.update(waLogRecord.id, {
        entity_written: "PatientDailyLog",
        entity_written_id: firstDailyLogId,
      });
    }

    // ── Step 7: Run alert rules ───────────────────────────────────────────
    await base44.asServiceRole.functions.invoke("kidneycare_alert_rules", {
      patient_id: patient.id,
      patient_name: patient.patient_name,
      date_of_birth: patient.date_of_birth,
      gender: patient.gender,
      bp_systolic: payload.bp_systolic,
      bp_diastolic: payload.bp_diastolic,
      ai_result_id: aiResultId,
    });

    return Response.json({
      received: true,
      matched: true,
      patient_id: patient.id,
      records_written: writtenLogs.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});