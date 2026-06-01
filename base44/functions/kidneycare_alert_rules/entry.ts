import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const payload = await req.json();
    const { patient_id, patient_name, date_of_birth, gender, bp_systolic, bp_diastolic, ai_result_id } = payload;
    const base44 = createClientFromRequest(req);
    const now = new Date();
    const nowIso = now.toISOString();

    // ── Rule A: RELAPSE DETECTION ─────────────────────────────────────────
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const proteinLogs = await base44.asServiceRole.entities.PatientDailyLog.filter({
      patient_id,
      module_type: "Urine_Protein",
    });
    const recentProteinLogs = proteinLogs
      .filter(l => l.log_date >= sevenDaysAgo)
      .sort((a, b) => b.log_date.localeCompare(a.log_date));

    const positives = ["2+", "3+", "4+"];
    let consecutiveCount = 0;
    const posLogIds = [];
    for (const log of recentProteinLogs) {
      if (positives.includes(log.protein_result)) {
        consecutiveCount++;
        posLogIds.push(log.id);
      } else {
        break;
      }
    }

    let relapseAlertFired = false;
    if (consecutiveCount >= 3) {
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      const existingRelapse = await base44.asServiceRole.entities.MonitoringAlert.filter({
        patient_id,
        alert_type: "Relapse_Suspected",
        acknowledged: false,
      });
      const recentRelapse = existingRelapse.filter(a => a.generated_at >= oneDayAgo);

      if (recentRelapse.length === 0) {
        await base44.asServiceRole.entities.MonitoringAlert.create({
          patient_id,
          patient_name,
          alert_type: "Relapse_Suspected",
          priority: consecutiveCount >= 5 ? "Critical" : "High",
          generated_at: nowIso,
          generated_by: "System_Auto",
          consecutive_positive_days: consecutiveCount,
          urgency_window_hours: consecutiveCount >= 5 ? 4 : 24,
          source_daily_log_ids: posLogIds.slice(0, consecutiveCount),
          message: `Protein 2+ or higher for ${consecutiveCount} consecutive days via KidneyCare WhatsApp agent. RELAPSE SUSPECTED — restart prednisolone 2mg/kg/day (IPNA 2023).`,
          acknowledged: false,
        });
        relapseAlertFired = true;
        if (ai_result_id) {
          await base44.asServiceRole.entities.KidneyCareAIResult.update(ai_result_id, {
            relapse_alert_triggered: true,
          });
        }
      } else if (recentRelapse.length > 0 && consecutiveCount >= 5) {
        await base44.asServiceRole.entities.MonitoringAlert.update(recentRelapse[0].id, {
          priority: "Critical",
          urgency_window_hours: 4,
        });
      }
    }

    // ── Rule B: MEDICATION NON-COMPLIANCE ─────────────────────────────────
    const medLogs = await base44.asServiceRole.entities.PatientDailyLog.filter({
      patient_id,
      module_type: "Medications",
    });
    const recentMedLogs = medLogs.sort((a, b) => b.log_date.localeCompare(a.log_date)).slice(0, 2);

    if (
      recentMedLogs.length === 2 &&
      recentMedLogs[0]?.value?.taken === false &&
      recentMedLogs[1]?.value?.taken === false
    ) {
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      const existingMed = await base44.asServiceRole.entities.MonitoringAlert.filter({
        patient_id,
        alert_type: "Medication_Non_Compliance",
        acknowledged: false,
      });
      const recentMedAlert = existingMed.filter(a => a.generated_at >= oneDayAgo);
      if (recentMedAlert.length === 0) {
        await base44.asServiceRole.entities.MonitoringAlert.create({
          patient_id,
          patient_name,
          alert_type: "Medication_Non_Compliance",
          priority: "High",
          generated_at: nowIso,
          generated_by: "System_Auto",
          urgency_window_hours: 12,
          message: "Prednisolone missed on 2 consecutive days (WhatsApp agent report). Non-adherence drives relapse. Contact caregiver immediately.",
          acknowledged: false,
        });
      }
    }

    // ── Rule D: BP ALERT ─────────────────────────────────────────────────
    if (bp_systolic != null) {
      let ageYears = 8; // default
      if (date_of_birth) {
        const dob = new Date(date_of_birth);
        ageYears = Math.floor((now - dob) / (365.25 * 24 * 60 * 60 * 1000));
      }
      const clamped = Math.min(ageYears, 13);
      const stage1Sys = 100 + clamped * 1.5;
      const stage2Sys = stage1Sys + 12;

      let bpPriority = null;
      let bpMsg = null;
      if (bp_systolic >= stage2Sys) {
        bpPriority = "High";
        bpMsg = `BP ${bp_systolic}/${bp_diastolic} — Stage 2 HTN by approximate age-based threshold for age ${ageYears} years. KidneyCare WhatsApp report.`;
      } else if (bp_systolic >= stage1Sys) {
        bpPriority = "Medium";
        bpMsg = `BP ${bp_systolic}/${bp_diastolic} — Stage 1 HTN. WhatsApp agent report. Recheck at next visit.`;
      }

      if (bpPriority) {
        await base44.asServiceRole.entities.MonitoringAlert.create({
          patient_id,
          patient_name,
          alert_type: "BP_High",
          priority: bpPriority,
          generated_at: nowIso,
          generated_by: "System_Auto",
          message: bpMsg,
          acknowledged: false,
        });
      }
    }

    // ── Rule E: RAPID WEIGHT GAIN ─────────────────────────────────────────
    const weightLogs = await base44.asServiceRole.entities.PatientDailyLog.filter({
      patient_id,
      module_type: "Weight",
    });
    const recentWeights = weightLogs.sort((a, b) => b.log_date.localeCompare(a.log_date)).slice(0, 3);

    if (recentWeights.length >= 2) {
      const recent = recentWeights[0].weight_kg;
      const prior = recentWeights[1].weight_kg;
      if (recent != null && prior != null && (recent - prior) > 0.5) {
        await base44.asServiceRole.entities.MonitoringAlert.create({
          patient_id,
          patient_name,
          alert_type: "Weight_Gain_Rapid",
          priority: "Medium",
          generated_at: nowIso,
          generated_by: "System_Auto",
          message: `Weight gain ${(recent - prior).toFixed(1)} kg in ~48h. Possible fluid retention.`,
          acknowledged: false,
        });
      }
    }

    // ── Rule F: FRNS PATTERN DETECTION ───────────────────────────────────
    if (relapseAlertFired) {
      const d180ago = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString();
      const allRelapses = await base44.asServiceRole.entities.MonitoringAlert.filter({
        patient_id,
        alert_type: "Relapse_Suspected",
      });
      const relapses180d = allRelapses.filter(
        a => ["High", "Critical"].includes(a.priority) && a.generated_at >= d180ago
      );
      if (relapses180d.length >= 2) {
        const d7ago = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const existingFrns = await base44.asServiceRole.entities.MonitoringAlert.filter({
          patient_id,
          alert_type: "Custom",
          acknowledged: false,
        });
        const recentFrns = existingFrns.filter(a => a.generated_at >= d7ago);
        if (recentFrns.length === 0) {
          await base44.asServiceRole.entities.MonitoringAlert.create({
            patient_id,
            patient_name,
            alert_type: "Custom",
            priority: "Medium",
            generated_at: nowIso,
            generated_by: "System_Auto",
            message: `FRNS PATTERN: ${relapses180d.length} relapse episodes in 180 days. Discuss steroid-sparing therapy — Levamisole 2.5mg/kg alternate days (ISPN/IPNA first-line).`,
            acknowledged: false,
          });
        }
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});