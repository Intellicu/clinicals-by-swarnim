import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Plus, Clock, User, FileText, CheckCircle, XCircle, Copy, PlayCircle } from "lucide-react";
import { toast } from "sonner";
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO } from "date-fns";
import ReminderDashboard from "./ReminderDashboard";
import AppointmentWorkflow from "./AppointmentWorkflow";

export default function AppointmentCalendar({ patientId }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("week");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showReminders, setShowReminders] = useState(false);
  const [workflowDialog, setWorkflowDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [newAppt, setNewAppt] = useState({
    appointment_date: new Date().toISOString().slice(0, 16),
    appointment_type: "Follow-up",
    doctor_name: "",
    duration_minutes: 30,
    chief_complaint: "",
    notes: ""
  });

  const { data: recentAppts = [] } = useQuery({
    queryKey: ['recent-appointments'],
    queryFn: () => base44.entities.Appointment.list('-created_date', 5),
    initialData: []
  });

  const queryClient = useQueryClient();

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments', patientId],
    queryFn: async () => {
      const apts = patientId
        ? await base44.entities.Appointment.filter({ patient_id: patientId }, '-appointment_date')
        : await base44.entities.Appointment.list('-appointment_date');
      
      // Enrich with patient data
      const enriched = await Promise.all(apts.map(async (apt) => {
        if (apt.patient_id) {
          const patients = await base44.entities.Patient.filter({ id: apt.patient_id });
          return { ...apt, patient: patients[0] };
        }
        return apt;
      }));
      
      return enriched;
    },
    initialData: []
  });

  const createMutation = useMutation({
    mutationFn: (apptData) => base44.entities.Appointment.create({
      ...apptData,
      patient_id: patientId,
      status: "Scheduled"
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setDialogOpen(false);
      toast.success("Appointment scheduled!");
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Appointment.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success("Status updated");
    }
  });

  const weekDays = eachDayOfInterval({
    start: startOfWeek(selectedDate),
    end: endOfWeek(selectedDate)
  });

  const getApptsForDate = (date) => {
    return appointments.filter(apt => 
      isSameDay(parseISO(apt.appointment_date), date)
    );
  };

  const statusColors = {
    "Scheduled": "bg-blue-100 text-blue-800",
    "Confirmed": "bg-green-100 text-green-800",
    "Completed": "bg-slate-100 text-slate-800",
    "Cancelled": "bg-red-100 text-red-800",
    "No-Show": "bg-amber-100 text-amber-800",
    "Rescheduled": "bg-purple-100 text-purple-800"
  };

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            {patientId ? "Patient Appointments" : "All Appointments"}
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowReminders(!showReminders)}
            >
              <Clock className="w-4 h-4 mr-2" />
              Reminders
            </Button>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-2" />
                Schedule
              </Button>
            </DialogTrigger>
          </div>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule Appointment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Date & Time *</Label>
                  <Input
                    type="datetime-local"
                    value={newAppt.appointment_date}
                    onChange={(e) => setNewAppt({...newAppt, appointment_date: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Type *</Label>
                  <Select value={newAppt.appointment_type} onValueChange={(val) => setNewAppt({...newAppt, appointment_type: val})}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="First Visit">First Visit</SelectItem>
                      <SelectItem value="Follow-up">Follow-up</SelectItem>
                      <SelectItem value="Emergency">Emergency</SelectItem>
                      <SelectItem value="Consultation">Consultation</SelectItem>
                      <SelectItem value="Procedure">Procedure</SelectItem>
                      <SelectItem value="Lab Review">Lab Review</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Doctor</Label>
                  <Input
                    value={newAppt.doctor_name}
                    onChange={(e) => setNewAppt({...newAppt, doctor_name: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={newAppt.duration_minutes}
                    onChange={(e) => setNewAppt({...newAppt, duration_minutes: parseInt(e.target.value)})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Chief Complaint</Label>
                  <Input
                    value={newAppt.chief_complaint}
                    onChange={(e) => setNewAppt({...newAppt, chief_complaint: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea
                    value={newAppt.notes}
                    onChange={(e) => setNewAppt({...newAppt, notes: e.target.value})}
                    className="mt-1"
                    rows={2}
                  />
                </div>
                <div className="flex gap-2">
                  {recentAppts.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const lastAppt = recentAppts[0];
                        setNewAppt({
                          ...newAppt,
                          appointment_type: lastAppt.appointment_type,
                          doctor_name: lastAppt.doctor_name,
                          duration_minutes: lastAppt.duration_minutes
                        });
                        toast.success("Template applied");
                      }}
                      className="flex-1"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Use Last
                    </Button>
                  )}
                  <Button
                    onClick={() => createMutation.mutate(newAppt)}
                    disabled={createMutation.isPending}
                    className="flex-1"
                  >
                    Schedule
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {showReminders && (
          <div className="mb-4">
            <ReminderDashboard />
          </div>
        )}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <Button
              variant={viewMode === "week" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("week")}
            >
              Week
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              List
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDate(addDays(selectedDate, -7))}
            >
              ← Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDate(new Date())}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDate(addDays(selectedDate, 7))}
            >
              Next →
            </Button>
          </div>
        </div>

        {viewMode === "week" ? (
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day) => {
              const dayAppts = getApptsForDate(day);
              const isToday = isSameDay(day, new Date());
              return (
                <div key={day.toISOString()} className={`border rounded p-2 min-h-32 ${isToday ? 'bg-blue-50 border-blue-300' : ''}`}>
                  <div className="font-semibold text-xs mb-2">
                    {format(day, 'EEE d')}
                  </div>
                  <div className="space-y-1">
                    {dayAppts.map((apt) => (
                      <div
                        key={apt.id}
                        className="text-xs p-1 bg-white border rounded cursor-pointer hover:shadow"
                        onClick={() => {
                          // View appointment details
                        }}
                      >
                        <div className="font-semibold">{format(parseISO(apt.appointment_date), 'HH:mm')}</div>
                        <div className="text-slate-600 truncate">{apt.appointment_type}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {appointments.slice(0, 10).map((apt) => (
              <div key={apt.id} className="border rounded-lg p-3 hover:bg-slate-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="font-semibold">{format(parseISO(apt.appointment_date), 'MMM d, yyyy HH:mm')}</span>
                      <Badge className={statusColors[apt.status]}>
                        {apt.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600">{apt.appointment_type}</p>
                    {apt.doctor_name && (
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <User className="w-3 h-3" />
                        {apt.doctor_name}
                      </p>
                    )}
                    {apt.chief_complaint && (
                      <p className="text-xs text-slate-600 mt-1">{apt.chief_complaint}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {apt.status === "Scheduled" && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedAppointment(apt);
                          setWorkflowDialog(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <PlayCircle className="w-4 h-4 mr-1" />
                        Start
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => updateStatusMutation.mutate({ id: apt.id, status: "Completed" })}
                      className="text-green-600"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => updateStatusMutation.mutate({ id: apt.id, status: "Cancelled" })}
                      className="text-red-600"
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Appointment Workflow Dialog */}
      <Dialog open={workflowDialog} onOpenChange={setWorkflowDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Patient Check-in</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <AppointmentWorkflow
              appointment={selectedAppointment}
              patient={selectedAppointment.patient}
              onComplete={(data) => {
                setWorkflowDialog(false);
                toast.success("Visit started successfully!");
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}