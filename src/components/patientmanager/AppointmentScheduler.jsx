import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CalendarDays, Plus, Clock, User, Edit2, Trash2, CheckCircle, XCircle, RotateCcw, Calendar } from "lucide-react";
import { toast } from "sonner";
import { format, parseISO, isToday, isTomorrow, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay } from "date-fns";

const STATUS_COLORS = {
  Scheduled: "bg-blue-100 text-blue-800",
  Confirmed: "bg-green-100 text-green-800",
  Completed: "bg-slate-100 text-slate-700",
  Cancelled: "bg-red-100 text-red-800",
  "No-Show": "bg-orange-100 text-orange-800",
  Rescheduled: "bg-purple-100 text-purple-800",
};

const SLOT_TIMES = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"
];

const DOCTORS = ["Dr. Assigned Physician", "Dr. Senior Consultant", "Dr. Resident"];

export default function AppointmentScheduler({ patient }) {
  const qc = useQueryClient();
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [editingAppt, setEditingAppt] = useState(null);
  const [viewMode, setViewMode] = useState("calendar"); // calendar | list

  const emptyForm = {
    patient_id: patient.id,
    patient_name: patient.patient_name,
    appointment_date: "",
    appointment_time: "09:00",
    appointment_type: "Follow-up",
    doctor_name: DOCTORS[0],
    duration_minutes: 30,
    chief_complaint: "",
    notes: "",
    status: "Scheduled",
  };
  const [form, setForm] = useState(emptyForm);

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["appointments", patient.id],
    queryFn: () => base44.entities.Appointment.filter({ patient_id: patient.id }, "-appointment_date", 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Appointment.create(data),
    onSuccess: () => { qc.invalidateQueries(["appointments", patient.id]); toast.success("Appointment booked"); setShowForm(false); setForm(emptyForm); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Appointment.update(id, data),
    onSuccess: () => { qc.invalidateQueries(["appointments", patient.id]); toast.success("Appointment updated"); setShowForm(false); setEditingAppt(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Appointment.delete(id),
    onSuccess: () => { qc.invalidateQueries(["appointments", patient.id]); toast.success("Appointment cancelled"); },
  });

  const openEdit = (appt) => {
    const dt = appt.appointment_date ? new Date(appt.appointment_date) : new Date();
    setForm({
      ...appt,
      appointment_date: format(dt, "yyyy-MM-dd"),
      appointment_time: format(dt, "HH:mm"),
    });
    setEditingAppt(appt);
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.appointment_date) { toast.error("Please pick a date"); return; }
    const dt = new Date(`${form.appointment_date}T${form.appointment_time || "09:00"}`);
    const payload = { ...form, appointment_date: dt.toISOString() };
    if (editingAppt) updateMutation.mutate({ id: editingAppt.id, data: payload });
    else createMutation.mutate(payload);
  };

  const quickStatus = (appt, status) => updateMutation.mutate({ id: appt.id, data: { ...appt, status } });

  // Calendar logic
  const monthStart = startOfMonth(calendarMonth);
  const monthEnd = endOfMonth(calendarMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad = getDay(monthStart);

  const apptsByDay = {};
  appointments.forEach(a => {
    if (!a.appointment_date) return;
    const key = format(new Date(a.appointment_date), "yyyy-MM-dd");
    if (!apptsByDay[key]) apptsByDay[key] = [];
    apptsByDay[key].push(a);
  });

  const upcoming = appointments.filter(a => a.appointment_date && new Date(a.appointment_date) >= new Date() && a.status !== "Cancelled");
  const past = appointments.filter(a => a.appointment_date && (new Date(a.appointment_date) < new Date() || a.status === "Cancelled" || a.status === "Completed"));

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-2">
          <Button size="sm" variant={viewMode === "calendar" ? "default" : "outline"} onClick={() => setViewMode("calendar")}><Calendar className="w-4 h-4 mr-1" />Calendar</Button>
          <Button size="sm" variant={viewMode === "list" ? "default" : "outline"} onClick={() => setViewMode("list")}>List</Button>
        </div>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => { setForm(emptyForm); setEditingAppt(null); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-1" />Book Appointment
        </Button>
      </div>

      {/* Calendar View */}
      {viewMode === "calendar" && (
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setCalendarMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))}>‹</Button>
            <CardTitle className="text-sm">{format(calendarMonth, "MMMM yyyy")}</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setCalendarMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))}>›</Button>
          </CardHeader>
          <CardContent className="p-3">
            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
                <div key={d} className="text-xs text-slate-400 font-semibold py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array(startPad).fill(null).map((_, i) => <div key={`pad-${i}`} />)}
              {days.map(day => {
                const key = format(day, "yyyy-MM-dd");
                const dayAppts = apptsByDay[key] || [];
                const today = isToday(day);
                return (
                  <div key={key} className={`min-h-[52px] rounded-lg p-1 text-xs border cursor-pointer hover:bg-blue-50 transition-colors ${today ? "bg-blue-50 border-blue-300" : "border-slate-100"}`}
                    onClick={() => { setForm(f => ({ ...f, appointment_date: key })); setEditingAppt(null); setShowForm(true); }}>
                    <div className={`font-semibold mb-0.5 ${today ? "text-blue-700" : "text-slate-700"}`}>{format(day, "d")}</div>
                    {dayAppts.slice(0, 2).map((a, i) => (
                      <div key={i} className={`truncate text-xs rounded px-1 py-0.5 mb-0.5 ${STATUS_COLORS[a.status] || "bg-slate-100"}`}
                        onClick={e => { e.stopPropagation(); openEdit(a); }}>
                        {a.appointment_type}
                      </div>
                    ))}
                    {dayAppts.length > 2 && <div className="text-slate-400">+{dayAppts.length - 2}</div>}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="space-y-3">
          {upcoming.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1"><CalendarDays className="w-3 h-3" />Upcoming</h3>
              {upcoming.map(a => <AppointmentCard key={a.id} appt={a} onEdit={() => openEdit(a)} onDelete={() => { if (confirm("Cancel this appointment?")) deleteMutation.mutate(a.id); }} onStatusChange={quickStatus} />)}
            </div>
          )}
          {past.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Past / Cancelled</h3>
              {past.map(a => <AppointmentCard key={a.id} appt={a} onEdit={() => openEdit(a)} onDelete={() => deleteMutation.mutate(a.id)} onStatusChange={quickStatus} muted />)}
            </div>
          )}
          {appointments.length === 0 && !isLoading && (
            <div className="text-center py-10 text-slate-400">
              <CalendarDays className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>No appointments yet. Book one above.</p>
            </div>
          )}
        </div>
      )}

      {/* Booking Dialog */}
      <Dialog open={showForm} onOpenChange={(o) => { if (!o) { setShowForm(false); setEditingAppt(null); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingAppt ? "Edit Appointment" : "Book Appointment"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Date *</Label>
                <Input type="date" value={form.appointment_date} onChange={e => setForm(f => ({ ...f, appointment_date: e.target.value }))} className="mt-1" required />
              </div>
              <div>
                <Label className="text-xs font-semibold">Time Slot</Label>
                <Select value={form.appointment_time} onValueChange={v => setForm(f => ({ ...f, appointment_time: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SLOT_TIMES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold">Type</Label>
                <Select value={form.appointment_type} onValueChange={v => setForm(f => ({ ...f, appointment_type: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["First Visit","Follow-up","Emergency","Consultation","Procedure","Lab Review"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold">Doctor</Label>
                <Select value={form.doctor_name} onValueChange={v => setForm(f => ({ ...f, doctor_name: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DOCTORS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold">Duration (min)</Label>
                <Select value={String(form.duration_minutes)} onValueChange={v => setForm(f => ({ ...f, duration_minutes: Number(v) }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["15","20","30","45","60"].map(d => <SelectItem key={d} value={d}>{d} min</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {editingAppt && (
                <div>
                  <Label className="text-xs font-semibold">Status</Label>
                  <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.keys(STATUS_COLORS).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <div>
              <Label className="text-xs font-semibold">Chief Complaint</Label>
              <Input value={form.chief_complaint} onChange={e => setForm(f => ({ ...f, chief_complaint: e.target.value }))} placeholder="Reason for visit" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs font-semibold">Notes</Label>
              <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any additional notes…" className="mt-1 h-16" />
            </div>
            <div className="flex gap-2 justify-end pt-1">
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingAppt(null); }}>Cancel</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingAppt ? "Update" : "Book Appointment"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AppointmentCard({ appt, onEdit, onDelete, onStatusChange, muted }) {
  const dt = appt.appointment_date ? new Date(appt.appointment_date) : null;
  const label = dt ? (isToday(dt) ? "Today" : isTomorrow(dt) ? "Tomorrow" : format(dt, "dd MMM yyyy")) : "—";
  return (
    <Card className={`bg-white shadow-sm border ${muted ? "opacity-70" : ""}`}>
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <div className="text-center bg-blue-50 rounded-lg p-2 min-w-[48px]">
            <div className="text-xs text-blue-600 font-bold">{dt ? format(dt, "dd") : "—"}</div>
            <div className="text-xs text-blue-400">{dt ? format(dt, "MMM") : ""}</div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm text-slate-900">{appt.appointment_type}</span>
              <Badge className={`text-xs ${STATUS_COLORS[appt.status] || "bg-slate-100"}`}>{appt.status}</Badge>
              <span className="text-xs text-slate-400">{label}</span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5 flex gap-3 flex-wrap">
              {dt && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{format(dt, "hh:mm a")}</span>}
              {appt.doctor_name && <span className="flex items-center gap-1"><User className="w-3 h-3" />{appt.doctor_name}</span>}
            </div>
            {appt.chief_complaint && <p className="text-xs text-slate-600 mt-0.5">{appt.chief_complaint}</p>}
          </div>
          <div className="flex gap-1 flex-shrink-0">
            {appt.status === "Scheduled" && (
              <>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600 hover:bg-green-50" onClick={() => onStatusChange(appt, "Confirmed")} title="Confirm"><CheckCircle className="w-4 h-4" /></Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-purple-600 hover:bg-purple-50" onClick={() => onStatusChange(appt, "Rescheduled")} title="Reschedule"><RotateCcw className="w-4 h-4" /></Button>
              </>
            )}
            <Button size="icon" variant="ghost" className="h-7 w-7 hover:bg-slate-50" onClick={onEdit}><Edit2 className="w-4 h-4" /></Button>
            <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500 hover:bg-red-50" onClick={onDelete}><XCircle className="w-4 h-4" /></Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}