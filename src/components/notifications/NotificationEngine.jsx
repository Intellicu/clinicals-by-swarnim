import React, { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { format, addHours, differenceInHours, isBefore } from "date-fns";

// Notification Engine - runs automated checks for sending notifications
export default function NotificationEngine() {
  const qc = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const { data: prefs } = useQuery({
    queryKey: ["notification-prefs", user?.email],
    queryFn: () => base44.entities.NotificationPreference.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ["all-appointments"],
    queryFn: () => base44.entities.Appointment.list("-appointment_date", 500),
    refetchInterval: 60000, // Check every minute
  });

  const { data: historyEntries = [] } = useQuery({
    queryKey: ["all-history"],
    queryFn: () => base44.entities.MedicalHistoryEntry.list("-entry_date", 100),
    refetchInterval: 120000, // Check every 2 minutes
  });

  const sendEmailMutation = useMutation({
    mutationFn: ({ to, subject, body, from_name }) =>
      base44.integrations.Core.SendEmail({ to, subject, body, from_name }),
  });

  // Check for upcoming appointments and send reminders
  useEffect(() => {
    if (!prefs || prefs.length === 0 || !prefs[0].email_appointment_reminders) return;

    const settings = prefs[0];
    const now = new Date();

    appointments.forEach(async (appt) => {
      if (!appt.appointment_date || appt.status === "Cancelled" || appt.status === "Completed") return;

      const apptTime = new Date(appt.appointment_date);
      const hoursUntil = differenceInHours(apptTime, now);

      // Send first reminder
      if (hoursUntil > 0 && hoursUntil <= settings.reminder_advance_hours && hoursUntil >= settings.reminder_advance_hours - 1) {
        const patient = await base44.entities.Patient.filter({ id: appt.patient_id });
        if (patient.length > 0 && patient[0].mobile_number) {
          const subject = `Appointment Reminder - ${settings.clinic_name || "CliniCals"}`;
          const body = `
Dear ${appt.patient_name || "Patient"},

This is a reminder for your upcoming appointment.

📅 Date: ${format(apptTime, "dd MMM yyyy")}
🕐 Time: ${format(apptTime, "hh:mm a")}
👨‍⚕️ Doctor: ${appt.doctor_name || "Dr. Assigned Physician"}
📍 Type: ${appt.appointment_type}

${appt.chief_complaint ? `Reason: ${appt.chief_complaint}` : ""}

${settings.custom_message || "Please arrive 10 minutes early for registration."}

For any changes, please contact us in advance.

Best regards,
${settings.reminder_sender_name || "CliniCals by Swarnim"}
          `;

          // In real implementation, would send to patient.mobile_number as email or SMS
          // For now, send to clinician as confirmation
          sendEmailMutation.mutate({
            to: user.email,
            subject: `[REMINDER SENT] ${subject}`,
            body: `Appointment reminder sent to ${appt.patient_name}:\n\n${body}`,
            from_name: settings.reminder_sender_name,
          });
        }
      }

      // Send second reminder if enabled
      if (settings.second_reminder_hours > 0 && hoursUntil > 0 && hoursUntil <= settings.second_reminder_hours && hoursUntil >= settings.second_reminder_hours - 1) {
        const patient = await base44.entities.Patient.filter({ id: appt.patient_id });
        if (patient.length > 0 && patient[0].mobile_number) {
          const subject = `Final Reminder - Appointment Today`;
          const body = `
Dear ${appt.patient_name || "Patient"},

Your appointment is in ${Math.round(hoursUntil)} hour(s).

📅 Today at ${format(apptTime, "hh:mm a")}
👨‍⚕️ ${appt.doctor_name || "Dr. Assigned Physician"}

Please ensure you arrive on time.

${settings.reminder_sender_name || "CliniCals by Swarnim"}
          `;

          sendEmailMutation.mutate({
            to: user.email,
            subject: `[FINAL REMINDER SENT] ${subject}`,
            body: `Final reminder sent to ${appt.patient_name}:\n\n${body}`,
            from_name: settings.reminder_sender_name,
          });
        }
      }
    });
  }, [appointments, prefs, user]);

  // Check for critical lab results and severe diagnoses
  useEffect(() => {
    if (!prefs || prefs.length === 0 || !prefs[0].clinician_urgent_update_alert) return;

    const settings = prefs[0];
    const recentEntries = historyEntries.filter(e => {
      const entryDate = new Date(e.entry_date);
      const hoursSince = differenceInHours(new Date(), entryDate);
      return hoursSince < 2; // New entries in last 2 hours
    });

    recentEntries.forEach(async (entry) => {
      const isCritical = 
        entry.severity === "Critical" || 
        entry.severity === "Severe" ||
        entry.entry_type === "Lab Report" && entry.description?.toLowerCase().includes("critical");

      if (isCritical) {
        const patient = await base44.entities.Patient.filter({ id: entry.patient_id });
        if (patient.length > 0) {
          const subject = `🚨 URGENT: Critical Update for ${patient[0].patient_name}`;
          const body = `
CRITICAL PATIENT UPDATE

Patient: ${patient[0].patient_name}
CR#: ${patient[0].cr_number}

Entry Type: ${entry.entry_type}
Severity: ${entry.severity || "Not specified"}
Title: ${entry.title}

Details:
${entry.description || "No additional details"}

${entry.outcome ? `Outcome: ${entry.outcome}` : ""}

Recorded by: ${entry.doctor_name || "System"}
Date: ${entry.entry_date ? format(new Date(entry.entry_date), "dd MMM yyyy HH:mm") : "Just now"}

Please review immediately.

CliniCals Alert System
          `;

          sendEmailMutation.mutate({
            to: user.email,
            subject,
            body,
            from_name: "CliniCals Alert System",
          });

          toast.error(`Critical alert sent for ${patient[0].patient_name}`, { duration: 5000 });
        }
      }
    });
  }, [historyEntries, prefs, user]);

  // Check for new appointments (clinician notification)
  useEffect(() => {
    if (!prefs || prefs.length === 0 || !prefs[0].clinician_new_appointment_alert) return;

    const settings = prefs[0];
    const recentAppts = appointments.filter(a => {
      const createdDate = new Date(a.created_date);
      const minutesSince = differenceInHours(new Date(), createdDate) * 60;
      return minutesSince < 5 && a.status === "Scheduled"; // New in last 5 minutes
    });

    recentAppts.forEach(async (appt) => {
      const subject = `📅 New Appointment Scheduled`;
      const body = `
New appointment has been scheduled:

Patient: ${appt.patient_name}
Date: ${appt.appointment_date ? format(new Date(appt.appointment_date), "dd MMM yyyy hh:mm a") : "TBD"}
Type: ${appt.appointment_type}
Doctor: ${appt.doctor_name}

${appt.chief_complaint ? `Reason: ${appt.chief_complaint}` : ""}

View full details in the system.

CliniCals Notification System
      `;

      sendEmailMutation.mutate({
        to: user.email,
        subject,
        body,
        from_name: "CliniCals Notification System",
      });
    });
  }, [appointments, prefs, user]);

  // This component runs silently in the background
  return null;
}