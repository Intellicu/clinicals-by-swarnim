import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Scheduled daily at 09:00 — check for monitoring gaps across all active patients
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const now = new Date();
    const today = now.toISOString().split("T")[0];

    // Get all active patients
    const patients = await base44.asServiceRole.entities.Patient.list();
    const activePatients = patients.filter(p => p.status !== "Discharged");

    let alertsCreated = 0;

    for (const patient of activePatients) {
      const proteinLogs = await base44.asServiceRole.entities.PatientDailyLog.filter({
        patient_id: patient.id,
        module_type: "Urine_Protein",
      });

      if (proteinLogs.length === 0) continue;

      const sorted = proteinLogs.sort((a, b) => b.log_date.localeCompare(a.log_date));
      const mostRecent = sorted[0];
      const lastDate = new Date(mostRecent.log_date);
      const todayDate = new Date(today);
      const gapDays = Math.floor((todayDate - lastDate) / (24 * 60 * 60 * 1000));

      if (gapDays < 3) continue;

      const d48ago = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();
      const alertType = gapDays >= 7 ? "Missed_Monitoring_7_Days" : "Missed_Monitoring_3_Days";
      const priority = gapDays >= 7 ? "High" : "Medium";

      const existing = await base44.asServiceRole.entities.MonitoringAlert.filter({
        patient_id: patient.id,
        alert_type: alertType,
        acknowledged: false,
      });
      const recentExisting = existing.filter(a => a.generated_at >= d48ago);

      if (recentExisting.length === 0) {
        await base44.asServiceRole.entities.MonitoringAlert.create({
          patient_id: patient.id,
          patient_name: patient.patient_name,
          alert_type: alertType,
          priority,
          generated_at: now.toISOString(),
          generated_by: "System_Auto",
          message: `No dipstick recorded for ${gapDays} days via WhatsApp agent.`,
          acknowledged: false,
        });
        alertsCreated++;
      }
    }

    return Response.json({ success: true, alerts_created: alertsCreated });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});