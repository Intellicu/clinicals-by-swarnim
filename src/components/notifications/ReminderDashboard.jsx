import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, addHours, isBefore, isAfter } from "date-fns";
import { Bell, Mail, CheckCircle2, Clock, AlertTriangle, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

const STATUS_COLORS = {
  Scheduled: "bg-blue-100 text-blue-700",
  Confirmed: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
  "No-Show": "bg-orange-100 text-orange-700",
};

export default function ReminderDashboard({ preferences }) {
  const [sendingId, setSendingId] = useState(null);
  const [sentIds, setSentIds] = useState(new Set());

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["upcoming-appointments-reminders"],
    queryFn: () => base44.entities.Appointment.filter({ status: "Scheduled" }, "appointment_date", 50),
  });

  const sendReminderMutation = useMutation({
    mutationFn: async (appointment) => {
      const advanceHours = preferences?.reminder_advance_hours ?? 24;
      const apptDate = new Date(appointment.appointment_date);
      const formattedDate = format(apptDate, "EEEE, MMMM do 'at' h:mm a");
      const clinicName = preferences?.clinic_name || "Our Clinic";
      const senderName = preferences?.reminder_sender_name || "CliniCals";

      await base44.integrations.Core.SendEmail({
        from_name: senderName,
        to: appointment.patient_name + "@placeholder.com", // placeholder — real app would use patient contact
        subject: `Appointment Reminder: ${formattedDate}`,
        body: `Dear ${appointment.patient_name},\n\nThis is a friendly reminder about your upcoming appointment at ${clinicName}.\n\n📅 Date & Time: ${formattedDate}\n👨‍⚕️ Doctor: ${appointment.doctor_name || "Your Doctor"}\n🏥 Type: ${appointment.appointment_type || "Consultation"}\n\n${preferences?.custom_message || "Please arrive 10 minutes early. Call us if you need to reschedule."}\n\nBest regards,\n${senderName}`,
      });
      return appointment.id;
    },
    onSuccess: (id) => {
      setSentIds((prev) => new Set([...prev, id]));
      toast.success("Reminder sent successfully!");
    },
    onError: () => toast.error("Failed to send reminder"),
  });

  const sendAllDueReminders = async () => {
    const advanceHours = preferences?.reminder_advance_hours ?? 24;
    const dueNow = appointments.filter((apt) => {
      const apptDate = new Date(apt.appointment_date);
      const reminderTime = addHours(new Date(), advanceHours);
      return isBefore(apptDate, reminderTime) && isAfter(apptDate, new Date()) && !sentIds.has(apt.id);
    });

    if (dueNow.length === 0) {
      toast.info("No reminders due at this time.");
      return;
    }

    for (const apt of dueNow) {
      setSendingId(apt.id);
      await sendReminderMutation.mutateAsync(apt);
    }
    setSendingId(null);
  };

  const upcoming = appointments.filter((a) => isAfter(new Date(a.appointment_date), new Date()));

  if (isLoading) return (
    <div className="flex items-center justify-center p-12">
      <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{upcoming.length} upcoming appointments</p>
        </div>
        <Button onClick={sendAllDueReminders} className="bg-blue-600 hover:bg-blue-700 gap-2">
          <Send className="w-4 h-4" />
          Send Due Reminders
        </Button>
      </div>

      {upcoming.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Bell className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p>No upcoming appointments</p>
        </div>
      ) : (
        <div className="space-y-3">
          {upcoming.map((apt) => {
            const apptDate = new Date(apt.appointment_date);
            const hoursUntil = (apptDate - new Date()) / (1000 * 60 * 60);
            const isDue = hoursUntil <= (preferences?.reminder_advance_hours ?? 24);
            const isSent = sentIds.has(apt.id);

            return (
              <Card key={apt.id} className={`border-l-4 ${isDue ? "border-l-amber-400" : "border-l-blue-300"}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{apt.patient_name || "Patient"}</span>
                        <Badge className={STATUS_COLORS[apt.status] || "bg-slate-100 text-slate-600"}>{apt.status}</Badge>
                        {isDue && !isSent && (
                          <Badge className="bg-amber-100 text-amber-700 gap-1">
                            <AlertTriangle className="w-3 h-3" /> Reminder Due
                          </Badge>
                        )}
                        {isSent && (
                          <Badge className="bg-green-100 text-green-700 gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Sent
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(apptDate, "MMM d, yyyy 'at' h:mm a")}
                        </span>
                        {apt.doctor_name && <span>Dr. {apt.doctor_name}</span>}
                        {apt.appointment_type && <span>{apt.appointment_type}</span>}
                      </div>
                      {apt.chief_complaint && (
                        <p className="text-xs text-slate-600 mt-1 truncate">{apt.chief_complaint}</p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant={isSent ? "outline" : "default"}
                      disabled={sendingId === apt.id || isSent}
                      onClick={() => { setSendingId(apt.id); sendReminderMutation.mutate(apt); }}
                      className="shrink-0"
                    >
                      {sendingId === apt.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : isSent ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <><Mail className="w-3 h-3 mr-1" />Send</>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}