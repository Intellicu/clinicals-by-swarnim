import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Bell, Send, Calendar, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { addDays, format, parseISO } from "date-fns";

export default function ReminderDashboard() {
  const [templateDialog, setTemplateDialog] = useState(false);
  const [template, setTemplate] = useState({
    subject: "Appointment Reminder",
    message: "Dear {patient_name}, this is a reminder for your appointment on {appointment_date} at {appointment_time} with Dr. {doctor_name}. Please call {clinic_phone} if you need to reschedule."
  });

  const queryClient = useQueryClient();

  const { data: appointments = [] } = useQuery({
    queryKey: ['upcoming-appointments'],
    queryFn: async () => {
      const all = await base44.entities.Appointment.list('-appointment_date');
      const upcoming = all.filter(apt => 
        new Date(apt.appointment_date) > new Date() && 
        apt.status === 'Scheduled'
      );
      return upcoming;
    },
    initialData: []
  });

  const sendReminderMutation = useMutation({
    mutationFn: async ({ appointment, patient }) => {
      const message = template.message
        .replace('{patient_name}', patient.patient_name)
        .replace('{appointment_date}', format(parseISO(appointment.appointment_date), 'MMM d, yyyy'))
        .replace('{appointment_time}', format(parseISO(appointment.appointment_date), 'HH:mm'))
        .replace('{doctor_name}', appointment.doctor_name || 'your physician')
        .replace('{clinic_phone}', '+91 XXXXX XXXXX');

      if (patient.mobile_number) {
        // In production, this would send SMS
        toast.info(`SMS sent to ${patient.mobile_number}`);
      }

      await base44.entities.Appointment.update(appointment.id, {
        reminder_sent: true,
        reminder_date: new Date().toISOString(),
        reminder_type: "SMS"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upcoming-appointments'] });
      toast.success("Reminder sent!");
    }
  });

  const bulkSendMutation = useMutation({
    mutationFn: async () => {
      const tomorrow = addDays(new Date(), 1);
      const aptsTomorrow = appointments.filter(apt => {
        const aptDate = new Date(apt.appointment_date);
        return aptDate.toDateString() === tomorrow.toDateString() && !apt.reminder_sent;
      });

      for (const apt of aptsTomorrow) {
        const patient = await base44.entities.Patient.filter({ id: apt.patient_id });
        if (patient[0]) {
          await sendReminderMutation.mutateAsync({ appointment: apt, patient: patient[0] });
        }
      }
    },
    onSuccess: () => toast.success("Bulk reminders sent!")
  });

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-600" />
            Appointment Reminders
          </CardTitle>
          <div className="flex gap-2">
            <Dialog open={templateDialog} onOpenChange={setTemplateDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">Edit Template</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reminder Template</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Subject</Label>
                    <Input
                      value={template.subject}
                      onChange={(e) => setTemplate({...template, subject: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Message Template</Label>
                    <Textarea
                      value={template.message}
                      onChange={(e) => setTemplate({...template, message: e.target.value})}
                      className="mt-1"
                      rows={5}
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Available variables: {'{patient_name}'}, {'{appointment_date}'}, {'{appointment_time}'}, {'{doctor_name}'}, {'{clinic_phone}'}
                    </p>
                  </div>
                  <Button onClick={() => setTemplateDialog(false)} className="w-full">
                    Save Template
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button 
              size="sm" 
              className="bg-amber-600 hover:bg-amber-700"
              onClick={() => bulkSendMutation.mutate()}
              disabled={bulkSendMutation.isPending}
            >
              <Send className="w-4 h-4 mr-2" />
              Send Tomorrow's
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-2">
          {appointments.slice(0, 10).map((apt) => (
            <div key={apt.id} className="border rounded-lg p-3 hover:bg-slate-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="font-semibold text-sm">
                      {format(parseISO(apt.appointment_date), 'MMM d, yyyy HH:mm')}
                    </span>
                    {apt.reminder_sent ? (
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Sent
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-800 text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-600">{apt.appointment_type}</p>
                  {apt.reminder_date && (
                    <p className="text-xs text-green-600 mt-1">
                      Reminder sent: {format(parseISO(apt.reminder_date), 'MMM d, HH:mm')}
                    </p>
                  )}
                </div>
                {!apt.reminder_sent && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      const patient = await base44.entities.Patient.filter({ id: apt.patient_id });
                      if (patient[0]) {
                        sendReminderMutation.mutate({ appointment: apt, patient: patient[0] });
                      }
                    }}
                    disabled={sendReminderMutation.isPending}
                  >
                    <Send className="w-3 h-3 mr-1" />
                    Send
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}