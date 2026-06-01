import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Entity automation: OPDQueue update → when status changes to "Called", send monitoring summary
Deno.serve(async (req) => {
  try {
    const payload = await req.json();
    const { event, data } = payload;

    // Only process when status becomes "Called"
    if (data?.status !== "Called") {
      return Response.json({ skipped: true });
    }

    const base44 = createClientFromRequest(req);
    const patient_id = data.patient_id;
    if (!patient_id) return Response.json({ skipped: true, reason: "no patient_id" });

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // Get recent alerts
    const allAlerts = await base44.asServiceRole.entities.MonitoringAlert.filter({ patient_id });
    const recentAlerts = allAlerts.filter(a => a.generated_at >= thirtyDaysAgo);

    if (recentAlerts.length === 0) return Response.json({ skipped: true, reason: "no recent alerts" });

    // Get patient info
    const patients = await base44.asServiceRole.entities.Patient.filter({ id: patient_id });
    const patient = patients[0];
    if (!patient) return Response.json({ skipped: true, reason: "patient not found" });

    // Determine max priority
    const hasCritical = recentAlerts.some(a => a.priority === "Critical");
    const hasHigh = recentAlerts.some(a => a.priority === "High");
    const maxPriority = hasCritical ? "Critical" : hasHigh ? "High" : "Medium";

    // Build summary body
    const body = `Patient: ${patient.patient_name} (CR: ${patient.cr_number || "—"})

${recentAlerts.length} monitoring alert(s) in the last 30 days:
${recentAlerts.map(a => `• [${a.priority}] ${a.message}`).join("\n")}

Data via KidneyCare WhatsApp Agent · CliniCals Hub`;

    // Create notification for the assigned clinician
    const recipientEmail = data.assigned_to || data.created_by;
    if (recipientEmail) {
      await base44.asServiceRole.entities.Notification.create({
        recipient_email: recipientEmail,
        notification_type: "Critical Lab Alert",
        priority: maxPriority,
        subject: `${patient.patient_name} is next — ${recentAlerts.length} monitoring alert(s)`,
        body,
        related_patient_id: patient_id,
        is_read: false,
        created_at: now.toISOString(),
      });
    }

    return Response.json({ success: true, alerts_count: recentAlerts.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});