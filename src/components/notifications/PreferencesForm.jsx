import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save, Settings2 } from "lucide-react";
import { toast } from "sonner";

export default function PreferencesForm({ onSaved }) {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const { data: existing } = useQuery({
    queryKey: ["notification-prefs", user?.email],
    queryFn: () => base44.entities.NotificationPreference.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const [prefs, setPrefs] = useState({
    email_appointment_reminders: true,
    sms_appointment_reminders: false,
    reminder_advance_hours: 24,
    second_reminder_hours: 2,
    clinician_new_appointment_alert: true,
    clinician_urgent_update_alert: true,
    critical_lab_alert: true,
    severe_diagnosis_alert: true,
    patient_education_reminders: true,
    follow_up_reminders: true,
    daily_clinical_summary: true,
    reminder_sender_name: "CliniCals by Swarnim",
    clinic_name: "",
    clinic_phone: "",
    custom_message: "",
    notification_email: "",
    notification_phone: "",
    quiet_hours_start: "",
    quiet_hours_end: "",
  });

  useEffect(() => {
    if (existing && existing.length > 0) {
      setPrefs({ ...prefs, ...existing[0] });
    }
  }, [existing]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const payload = { ...data, user_email: user.email };
      if (existing && existing.length > 0) {
        return base44.entities.NotificationPreference.update(existing[0].id, payload);
      } else {
        return base44.entities.NotificationPreference.create(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-prefs"] });
      toast.success("Preferences saved!");
      onSaved?.();
    },
  });

  const toggle = (key) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-blue-500" />
            Appointment Reminders
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Email Reminders to Patients</p>
              <p className="text-xs text-slate-500">Send email before scheduled appointments</p>
            </div>
            <Switch checked={prefs.email_appointment_reminders} onCheckedChange={() => toggle("email_appointment_reminders")} />
          </div>

          {prefs.email_appointment_reminders && (
            <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-blue-100">
              <div>
                <Label className="text-xs">First Reminder (hours before)</Label>
                <Input
                  type="number"
                  value={prefs.reminder_advance_hours}
                  onChange={(e) => setPrefs({ ...prefs, reminder_advance_hours: Number(e.target.value) })}
                  min={1} max={168}
                />
              </div>
              <div>
                <Label className="text-xs">Second Reminder (hours before, 0 = off)</Label>
                <Input
                  type="number"
                  value={prefs.second_reminder_hours}
                  onChange={(e) => setPrefs({ ...prefs, second_reminder_hours: Number(e.target.value) })}
                  min={0} max={48}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-purple-500" />
            Clinician Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">New Appointment Notifications</p>
              <p className="text-xs text-slate-500">Alert when a new appointment is scheduled</p>
            </div>
            <Switch checked={prefs.clinician_new_appointment_alert} onCheckedChange={() => toggle("clinician_new_appointment_alert")} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">🚨 Critical Lab Results</p>
              <p className="text-xs text-slate-500">Immediate alert for critical laboratory values</p>
            </div>
            <Switch checked={prefs.critical_lab_alert} onCheckedChange={() => toggle("critical_lab_alert")} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">⚠️ Severe Diagnosis Alerts</p>
              <p className="text-xs text-slate-500">Alert when severe/critical diagnosis is added to history</p>
            </div>
            <Switch checked={prefs.severe_diagnosis_alert} onCheckedChange={() => toggle("severe_diagnosis_alert")} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Urgent Patient Updates</p>
              <p className="text-xs text-slate-500">Alert on critical monitoring alerts</p>
            </div>
            <Switch checked={prefs.clinician_urgent_update_alert} onCheckedChange={() => toggle("clinician_urgent_update_alert")} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Follow-up Reminders</p>
              <p className="text-xs text-slate-500">Remind about upcoming patient follow-ups</p>
            </div>
            <Switch checked={prefs.follow_up_reminders} onCheckedChange={() => toggle("follow_up_reminders")} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Patient Education Completion</p>
              <p className="text-xs text-slate-500">Notify when patients complete assigned materials</p>
            </div>
            <Switch checked={prefs.patient_education_reminders} onCheckedChange={() => toggle("patient_education_reminders")} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">📋 Daily Clinical Summary Email</p>
              <p className="text-xs text-slate-500">Morning briefing with vignette, pearl & guideline update at 7 AM IST</p>
            </div>
            <Switch checked={prefs.daily_clinical_summary ?? true} onCheckedChange={() => toggle("daily_clinical_summary")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Communication Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs">Sender Name</Label>
            <Input value={prefs.reminder_sender_name} onChange={(e) => setPrefs({ ...prefs, reminder_sender_name: e.target.value })} placeholder="CliniCals by Swarnim" />
          </div>
          <div>
            <Label className="text-xs">Clinic Name</Label>
            <Input placeholder="e.g., Swarnim Pediatric Nephrology" value={prefs.clinic_name} onChange={(e) => setPrefs({ ...prefs, clinic_name: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs">Clinic Phone</Label>
            <Input placeholder="e.g., +91 98765 43210" value={prefs.clinic_phone} onChange={(e) => setPrefs({ ...prefs, clinic_phone: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs">Alternative Notification Email</Label>
            <Input type="email" placeholder="Optional - for receiving alerts" value={prefs.notification_email} onChange={(e) => setPrefs({ ...prefs, notification_email: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs">SMS Phone Number</Label>
            <Input placeholder="For SMS notifications (optional)" value={prefs.notification_phone} onChange={(e) => setPrefs({ ...prefs, notification_phone: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs">Custom Footer Message</Label>
            <Input placeholder="e.g., Please arrive 10 minutes early." value={prefs.custom_message} onChange={(e) => setPrefs({ ...prefs, custom_message: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Quiet Hours Start (optional)</Label>
              <Input type="time" value={prefs.quiet_hours_start} onChange={(e) => setPrefs({ ...prefs, quiet_hours_start: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Quiet Hours End (optional)</Label>
              <Input type="time" value={prefs.quiet_hours_end} onChange={(e) => setPrefs({ ...prefs, quiet_hours_end: e.target.value })} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={() => saveMutation.mutate(prefs)} disabled={saveMutation.isPending} className="w-full gap-2">
        {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Save Preferences
      </Button>
    </div>
  );
}