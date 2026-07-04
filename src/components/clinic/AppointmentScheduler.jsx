import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AppointmentScheduler({ workspaceId, patients, onScheduled }) {
  const [formData, setFormData] = useState({
    patient_id: '',
    appointment_date: '',
    appointment_time: '',
    appointment_type: 'Follow-up',
    doctor_name: 'Dr. Swarnim',
    duration_minutes: 30,
    chief_complaint: '',
    notes: ''
  });

  const scheduleMutation = useMutation({
    mutationFn: async (data) => {
      const dateTime = new Date(`${data.appointment_date}T${data.appointment_time}`);
      const patient = patients.find(p => p.id === data.patient_id);
      
      return base44.entities.Appointment.create({
        workspace_id: workspaceId,
        patient_id: data.patient_id,
        patient_name: patient?.patient_name || '',
        appointment_date: dateTime.toISOString(),
        appointment_type: data.appointment_type,
        doctor_name: data.doctor_name,
        duration_minutes: data.duration_minutes,
        chief_complaint: data.chief_complaint,
        notes: data.notes,
        status: 'Scheduled'
      });
    },
    onSuccess: () => {
      toast.success('Appointment scheduled!');
      onScheduled();
    },
    onError: () => {
      toast.error('Failed to schedule appointment');
    }
  });

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Patient *</Label>
            <Select value={formData.patient_id} onValueChange={(val) => setFormData({...formData, patient_id: val})}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.patient_name} - CR# {p.cr_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Appointment Type</Label>
            <Select value={formData.appointment_type} onValueChange={(val) => setFormData({...formData, appointment_type: val})}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="First Visit">First Visit</SelectItem>
                <SelectItem value="Follow-up">Follow-up</SelectItem>
                <SelectItem value="Emergency">Emergency</SelectItem>
                <SelectItem value="Consultation">Consultation</SelectItem>
                <SelectItem value="Lab Review">Lab Review</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Date *</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="date"
                value={formData.appointment_date}
                onChange={(e) => setFormData({...formData, appointment_date: e.target.value})}
                className="pl-10 mt-1"
              />
            </div>
          </div>

          <div>
            <Label>Time *</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="time"
                value={formData.appointment_time}
                onChange={(e) => setFormData({...formData, appointment_time: e.target.value})}
                className="pl-10 mt-1"
              />
            </div>
          </div>

          <div>
            <Label>Duration (minutes)</Label>
            <Input
              type="number"
              value={formData.duration_minutes}
              onChange={(e) => setFormData({...formData, duration_minutes: parseInt(e.target.value) || 30})}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Doctor</Label>
            <Input
              value={formData.doctor_name}
              onChange={(e) => setFormData({...formData, doctor_name: e.target.value})}
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label>Chief Complaint</Label>
          <Textarea
            value={formData.chief_complaint}
            onChange={(e) => setFormData({...formData, chief_complaint: e.target.value})}
            placeholder="Reason for visit..."
            className="mt-1"
            rows={2}
          />
        </div>

        <div>
          <Label>Notes</Label>
          <Textarea
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            placeholder="Additional notes..."
            className="mt-1"
            rows={2}
          />
        </div>

        <Button
          onClick={() => scheduleMutation.mutate(formData)}
          disabled={!formData.patient_id || !formData.appointment_date || !formData.appointment_time || scheduleMutation.isPending}
          className="w-full bg-green-600"
        >
          {scheduleMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Scheduling...
            </>
          ) : (
            'Schedule Appointment'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}