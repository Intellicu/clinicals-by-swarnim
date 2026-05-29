import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Entity automation handler — fires when a LabResult is created or updated.
 * Extracts key nephrology values and auto-updates the linked Patient record
 * with calculated GFR, AKI stage, and BP classification.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const { event, data: labResult } = body;

    if (!labResult) {
      return Response.json({ message: "No lab data in payload" }, { status: 200 });
    }

    const patientId = labResult.patient_id;
    if (!patientId) {
      return Response.json({ message: "No patient_id on lab result, skipping" }, { status: 200 });
    }

    // Fetch the patient
    let patient;
    try {
      patient = await base44.asServiceRole.entities.Patient.get(patientId);
    } catch {
      return Response.json({ message: "Patient not found, skipping" }, { status: 200 });
    }
    if (!patient) {
      return Response.json({ message: "Patient not found" }, { status: 200 });
    }

    const updates = {};

    // ── Schwartz GFR calculation ──
    // Schwartz 2009: eGFR = 0.413 × height(cm) / serum_creatinine(mg/dL)
    const creatinine = labResult.creatinine ?? labResult.values?.creatinine ?? labResult.data?.creatinine;
    const heightCm = patient.height_cm ?? patient.height;
    if (creatinine && heightCm && creatinine > 0) {
      const eGFR = Math.round((0.413 * heightCm) / creatinine);
      updates.egfr = eGFR;

      // CKD staging by eGFR
      if (eGFR >= 90) updates.ckd_stage = "G1";
      else if (eGFR >= 60) updates.ckd_stage = "G2";
      else if (eGFR >= 45) updates.ckd_stage = "G3a";
      else if (eGFR >= 30) updates.ckd_stage = "G3b";
      else if (eGFR >= 15) updates.ckd_stage = "G4";
      else updates.ckd_stage = "G5";
    }

    // ── AKI Staging (KDIGO) — needs baseline creatinine on patient ──
    const baselineCr = patient.baseline_creatinine;
    if (creatinine && baselineCr && baselineCr > 0) {
      const ratio = creatinine / baselineCr;
      if (ratio >= 3.0) updates.aki_stage = 3;
      else if (ratio >= 2.0) updates.aki_stage = 2;
      else if (ratio >= 1.5) updates.aki_stage = 1;
      else updates.aki_stage = null;
    }

    // ── Sodium / electrolyte flags ──
    const sodium = labResult.sodium ?? labResult.values?.sodium ?? labResult.data?.sodium;
    if (sodium) {
      updates.latest_sodium = sodium;
      if (sodium < 125) updates.sodium_alert = "Severe Hyponatremia";
      else if (sodium < 135) updates.sodium_alert = "Mild-Moderate Hyponatremia";
      else if (sodium > 150) updates.sodium_alert = "Hypernatremia";
      else updates.sodium_alert = null;
    }

    const potassium = labResult.potassium ?? labResult.values?.potassium ?? labResult.data?.potassium;
    if (potassium) {
      updates.latest_potassium = potassium;
      if (potassium >= 6.5) updates.potassium_alert = "Severe Hyperkalemia";
      else if (potassium >= 5.5) updates.potassium_alert = "Mild Hyperkalemia";
      else if (potassium <= 2.5) updates.potassium_alert = "Severe Hypokalemia";
      else if (potassium < 3.5) updates.potassium_alert = "Hypokalemia";
      else updates.potassium_alert = null;
    }

    // ── Urine Protein/Creatinine Ratio ──
    const uProtein = labResult.urine_protein ?? labResult.values?.urine_protein ?? labResult.data?.urine_protein;
    const uCr = labResult.urine_creatinine ?? labResult.values?.urine_creatinine ?? labResult.data?.urine_creatinine;
    if (uProtein && uCr && uCr > 0) {
      const upcr = parseFloat((uProtein / uCr).toFixed(2));
      updates.latest_upcr = upcr;
      if (upcr >= 2.0) updates.proteinuria_grade = "Nephrotic Range";
      else if (upcr >= 0.2) updates.proteinuria_grade = "Significant Proteinuria";
      else updates.proteinuria_grade = "Normal";
    }

    // ── Hemoglobin (Anemia of CKD) ──
    const hb = labResult.hemoglobin ?? labResult.values?.hemoglobin ?? labResult.data?.hemoglobin;
    if (hb) {
      updates.latest_hemoglobin = hb;
    }

    // Store the latest lab result date
    updates.last_labs_updated = new Date().toISOString();

    if (Object.keys(updates).length > 1) {
      await base44.asServiceRole.entities.Patient.update(patientId, updates);
      console.log(`Updated patient ${patientId} with:`, JSON.stringify(updates));
    }

    return Response.json({ success: true, patient_id: patientId, updates_applied: updates });
  } catch (error) {
    console.error("onLabResultCreated error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});