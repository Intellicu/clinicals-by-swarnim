import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Plus, CheckCircle, X, ChevronDown } from "lucide-react";
import { format, addDays } from "date-fns";
import { toast } from "sonner";

const TYPES = ["Follow-up", "First Visit", "Lab Review", "Procedure", "Emergency"];
const SLOTS = ["08:00", "09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"];

export default function QuickAppointmentBar({ workspaceId, patients = [], onBooked }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [date, setDate] = useState(format(addDays(new Date(), 1), "yyyy-MM-dd"));
  const [time, setTime] = useState("09:00");
  const [type, setType] = useState("Follow-up");
  const [complaint, setComplaint] = useState("");

  const queryClient = useQueryClient();

  const filtered = patients.filter(p =>
    p.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.cr_number?.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 6);

  const bookMutation = useMutation({
    mutationFn: () => base44.entities.Appointment.create({
      workspace_id: workspaceId,
      patient_id: selected.id,
      patient_name: selected.patient_name,
      appointment_date: `${date}T${time}:00`,
      appointment_type: type,
      chief_complaint: complaint,
      status: "Scheduled",
      duration_minutes: 20,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success(`Appointment booked for ${selected.patient_name}`);
      setOpen(false);
      setSelected(null);
      setComplaint("");
      onBooked?.();
    }
  });

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} size="sm" className="bg-green-600 hover:bg-green-700 h-9 gap-1.5">
        <Plus className="w-4 h-4" />Book Appointment
      </Button>
    );
  }

  return (
    <div className="bg-white border-2 border-green-200 rounded-2xl p-3 shadow-lg space-y-3 max-w-md">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-green-600" />Quick Book
        </p>
        <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Patient search */}
      {!selected ? (
        <div>
          <Input placeholder="Search patient name or CR#..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="h-9 text-sm" autoFocus />
          {search && (
            <div className="mt-1.5 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              {filtered.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-3">No patients found</p>
              ) : (
                filtered.map(p => (
                  <button key={p.id} onClick={() => { setSelected(p); setSearch(""); }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-blue-50 border-b last:border-b-0 transition-colors">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {p.patient_name?.[0]?.toUpperCase() || "P"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{p.patient_name}</p>
                      <p className="text-xs text-slate-500">CR# {p.cr_number} · {p.age_years}y</p>
                    </div>
                    {p.diagnosis && <Badge className="text-xs bg-blue-100 text-blue-800 border-0">{p.diagnosis}</Badge>}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
            {selected.patient_name?.[0]?.toUpperCase() || "P"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{selected.patient_name}</p>
            <p className="text-xs text-slate-500">CR# {selected.cr_number}</p>
          </div>
          <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {selected && (
        <>
          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate-500 block mb-1">Date</label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="h-9 text-sm" />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Time</label>
              <select value={time} onChange={e => setTime(e.target.value)}
                className="w-full h-9 border border-slate-200 rounded-md px-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300">
                {SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Type chips */}
          <div className="flex gap-1.5 flex-wrap">
            {TYPES.map(t => (
              <button key={t} onClick={() => setType(t)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${type === t ? "bg-green-600 text-white border-green-600" : "bg-white text-slate-600 border-slate-200 hover:border-green-300"}`}>
                {t}
              </button>
            ))}
          </div>

          {/* Complaint */}
          <Input placeholder="Chief complaint (optional)"
            value={complaint} onChange={e => setComplaint(e.target.value)} className="h-9 text-sm" />

          <Button onClick={() => bookMutation.mutate()} disabled={bookMutation.isPending}
            className="w-full bg-green-600 hover:bg-green-700 h-9 text-sm">
            <CheckCircle className="w-4 h-4 mr-1.5" />
            {bookMutation.isPending ? "Booking..." : `Book ${type} — ${format(new Date(date + "T00:00"), "MMM d")} ${time}`}
          </Button>
        </>
      )}
    </div>
  );
}