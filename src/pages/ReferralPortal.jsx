import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Send, Plus, Users, FileText, Loader2, Sparkles, CheckCircle2, Clock, Phone, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const STATUS_STYLE = {
  Draft: 'bg-slate-100 text-slate-600',
  Sent: 'bg-blue-100 text-blue-700',
  Accepted: 'bg-green-100 text-green-700',
  Declined: 'bg-red-100 text-red-700',
  Completed: 'bg-purple-100 text-purple-700',
};

const URGENCY_STYLE = { Routine: 'bg-slate-100 text-slate-600', Urgent: 'bg-amber-100 text-amber-700', Emergency: 'bg-red-100 text-red-700' };

export default function ReferralPortal() {
  const queryClient = useQueryClient();
  const [showNewRef, setShowNewRef] = useState(false);
  const [showNewConsultant, setShowNewConsultant] = useState(false);
  const [selectedRef, setSelectedRef] = useState(null);
  const [generating, setGenerating] = useState(false);

  const { data: referrals = [] } = useQuery({ queryKey: ['referrals'], queryFn: () => base44.entities.ReferralLetter.list('-created_date', 100) });
  const { data: consultants = [] } = useQuery({ queryKey: ['consultants'], queryFn: () => base44.entities.Consultant.list('-created_date', 100) });
  const { data: patients = [] } = useQuery({ queryKey: ['patients'], queryFn: () => base44.entities.Patient.list() });
  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

  const [refForm, setRefForm] = useState({
    patient_id: '', reason_for_referral: '', referred_to_name: '',
    referred_to_specialty: '', referred_to_hospital: '', urgency: 'Routine', letter_content: ''
  });
  const [consultantForm, setConsultantForm] = useState({ name: '', specialty: '', hospital: '', email: '', phone: '', notes: '' });

  const createRefMutation = useMutation({
    mutationFn: () => {
      const pt = patients.find(p => p.id === refForm.patient_id);
      return base44.entities.ReferralLetter.create({
        ...refForm, patient_name: pt?.patient_name, referring_doctor: user?.full_name || user?.email, status: 'Draft'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referrals'] });
      setShowNewRef(false);
      setRefForm({ patient_id: '', reason_for_referral: '', referred_to_name: '', referred_to_specialty: '', referred_to_hospital: '', urgency: 'Routine', letter_content: '' });
      toast.success('Referral created!');
    }
  });

  const createConsultantMutation = useMutation({
    mutationFn: () => base44.entities.Consultant.create({ ...consultantForm, added_by: user?.email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultants'] });
      setShowNewConsultant(false);
      setConsultantForm({ name: '', specialty: '', hospital: '', email: '', phone: '', notes: '' });
      toast.success('Consultant added!');
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.ReferralLetter.update(id, { status, sent_date: status === 'Sent' ? new Date().toISOString() : undefined }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['referrals'] })
  });

  const generateLetter = async () => {
    const pt = patients.find(p => p.id === refForm.patient_id);
    if (!pt) return toast.error('Select a patient first');
    setGenerating(true);
    const letter = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a professional medical referral letter for a pediatric nephrology clinic.

Referring Doctor: ${user?.full_name || 'Dr. Attending Physician'}
Patient: ${pt.patient_name}, Age: ${pt.age_years}yr, Gender: ${pt.gender}
Diagnosis: ${pt.diagnosis || 'under evaluation'}
Comorbidities: ${pt.comorbidities?.join(', ') || 'None'}
Current Medications: ${pt.current_medications?.join(', ') || 'See notes'}
Referred To: Dr. ${refForm.referred_to_name} — ${refForm.referred_to_specialty}, ${refForm.referred_to_hospital || 'Specialist Hospital'}
Reason: ${refForm.reason_for_referral}
Urgency: ${refForm.urgency}

Write a formal, concise referral letter (300-400 words) including: brief clinical summary, reason for referral, relevant investigations, current management, specific questions/requests. Format professionally.`
    });
    setRefForm(p => ({ ...p, letter_content: letter }));
    setGenerating(false);
    toast.success('Letter generated!');
  };

  const printLetter = (ref) => {
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Referral Letter</title><style>
        body { font-family: Arial; padding: 40px; max-width: 600px; margin: auto; line-height: 1.6; }
        h2 { text-align: center; } .meta { background: #f5f5f5; padding: 12px; border-radius: 8px; margin: 16px 0; }
        .footer { margin-top: 40px; } pre { white-space: pre-wrap; font-family: Arial; }
      </style></head><body>
      <h2>REFERRAL LETTER</h2>
      <div class="meta">
        <strong>Patient:</strong> ${ref.patient_name}<br/>
        <strong>Referred To:</strong> Dr. ${ref.referred_to_name || ''} — ${ref.referred_to_specialty}${ref.referred_to_hospital ? ', ' + ref.referred_to_hospital : ''}<br/>
        <strong>Urgency:</strong> ${ref.urgency} | <strong>Date:</strong> ${format(new Date(ref.created_date), 'dd MMM yyyy')}
      </div>
      <pre>${ref.letter_content || ref.reason_for_referral}</pre>
      <div class="footer">
        <p>Referring Physician: ${ref.referring_doctor || ''}</p>
        <p>Signature: _________________________ Date: _________</p>
      </div>
      </body></html>
    `);
    win.print();
  };

  return (
    <div className="max-w-5xl mx-auto p-4 pb-24">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Send className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Referral Portal</h1>
            <p className="text-xs text-slate-500">Manage outgoing referrals & consultants</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowNewConsultant(true)} className="gap-1"><Users className="w-4 h-4" />Add Consultant</Button>
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700" size="sm" onClick={() => setShowNewRef(true)}><Plus className="w-4 h-4" />New Referral</Button>
        </div>
      </div>

      <Tabs defaultValue="referrals">
        <TabsList className="w-full mb-5">
          <TabsTrigger value="referrals" className="flex-1">Referrals ({referrals.length})</TabsTrigger>
          <TabsTrigger value="consultants" className="flex-1">Consultants ({consultants.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="referrals">
          <div className="space-y-2">
            {referrals.length === 0 ? (
              <div className="text-center py-12 text-slate-400"><Send className="w-10 h-10 mx-auto mb-2 opacity-40" /><p>No referrals yet</p></div>
            ) : referrals.map(ref => (
              <Card key={ref.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-sm">{ref.patient_name}</span>
                        <Badge className={`${STATUS_STYLE[ref.status]} text-xs`}>{ref.status}</Badge>
                        <Badge className={`${URGENCY_STYLE[ref.urgency]} text-xs`}>{ref.urgency}</Badge>
                      </div>
                      <p className="text-xs text-slate-600">→ Dr. {ref.referred_to_name || ''} · {ref.referred_to_specialty}</p>
                      {ref.referred_to_hospital && <p className="text-xs text-slate-400">{ref.referred_to_hospital}</p>}
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">{ref.reason_for_referral}</p>
                    </div>
                    <div className="flex gap-1 flex-col items-end shrink-0">
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setSelectedRef(ref); printLetter(ref); }}>
                        <FileText className="w-3 h-3 mr-1" />Print
                      </Button>
                      {ref.status === 'Draft' && (
                        <Button size="sm" className="h-7 text-xs bg-blue-600" onClick={() => updateStatusMutation.mutate({ id: ref.id, status: 'Sent' })}>
                          <Send className="w-3 h-3 mr-1" />Mark Sent
                        </Button>
                      )}
                      {ref.status === 'Sent' && (
                        <Button size="sm" className="h-7 text-xs bg-green-600" onClick={() => updateStatusMutation.mutate({ id: ref.id, status: 'Accepted' })}>
                          <CheckCircle2 className="w-3 h-3 mr-1" />Mark Accepted
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="consultants">
          <div className="grid md:grid-cols-2 gap-3">
            {consultants.length === 0 ? (
              <div className="col-span-2 text-center py-12 text-slate-400"><Users className="w-10 h-10 mx-auto mb-2 opacity-40" /><p>No consultants added</p></div>
            ) : consultants.map(c => (
              <Card key={c.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
                      {c.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Dr. {c.name}</p>
                      <Badge className="bg-blue-100 text-blue-700 text-xs mt-0.5">{c.specialty}</Badge>
                      {c.hospital && <p className="text-xs text-slate-500 mt-1">{c.hospital}</p>}
                      <div className="flex gap-3 mt-2">
                        {c.phone && <a href={`tel:${c.phone}`} className="flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600"><Phone className="w-3 h-3" />{c.phone}</a>}
                        {c.email && <a href={`mailto:${c.email}`} className="flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600"><Mail className="w-3 h-3" />{c.email}</a>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* New Referral Dialog */}
      <Dialog open={showNewRef} onOpenChange={setShowNewRef}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>New Referral Letter</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Patient *</Label>
              <Select value={refForm.patient_id} onValueChange={v => setRefForm(p => ({ ...p, patient_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                <SelectContent>{patients.map(p => <SelectItem key={p.id} value={p.id}>{p.patient_name} — {p.cr_number}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Refer To (Doctor Name)</Label>
                <Input value={refForm.referred_to_name} onChange={e => setRefForm(p => ({ ...p, referred_to_name: e.target.value }))} placeholder="Dr. Name" />
              </div>
              <div>
                <Label className="text-xs">Specialty *</Label>
                <Input value={refForm.referred_to_specialty} onChange={e => setRefForm(p => ({ ...p, referred_to_specialty: e.target.value }))} placeholder="e.g., Cardiology" />
              </div>
              <div>
                <Label className="text-xs">Hospital</Label>
                <Input value={refForm.referred_to_hospital} onChange={e => setRefForm(p => ({ ...p, referred_to_hospital: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs">Urgency</Label>
                <Select value={refForm.urgency} onValueChange={v => setRefForm(p => ({ ...p, urgency: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{['Routine', 'Urgent', 'Emergency'].map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs">Reason for Referral *</Label>
              <Textarea value={refForm.reason_for_referral} onChange={e => setRefForm(p => ({ ...p, reason_for_referral: e.target.value }))} rows={2} />
            </div>
            <Button onClick={generateLetter} variant="outline" disabled={!refForm.patient_id || !refForm.reason_for_referral || generating} className="w-full gap-2">
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-purple-600" />}
              AI Generate Letter
            </Button>
            {refForm.letter_content && (
              <Textarea value={refForm.letter_content} onChange={e => setRefForm(p => ({ ...p, letter_content: e.target.value }))} rows={8} className="text-xs font-mono" />
            )}
            <Button onClick={() => createRefMutation.mutate()} disabled={!refForm.patient_id || !refForm.referred_to_specialty || createRefMutation.isPending} className="w-full bg-blue-600">
              {createRefMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}Create Referral
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Consultant Dialog */}
      <Dialog open={showNewConsultant} onOpenChange={setShowNewConsultant}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Consultant</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {[['name', 'Name *', 'text'], ['specialty', 'Specialty *', 'text'], ['hospital', 'Hospital', 'text'], ['email', 'Email', 'email'], ['phone', 'Phone', 'tel']].map(([k, label, type]) => (
              <div key={k}>
                <Label className="text-xs">{label}</Label>
                <Input type={type} value={consultantForm[k]} onChange={e => setConsultantForm(p => ({ ...p, [k]: e.target.value }))} />
              </div>
            ))}
            <div><Label className="text-xs">Notes</Label><Textarea value={consultantForm.notes} onChange={e => setConsultantForm(p => ({ ...p, notes: e.target.value }))} rows={2} /></div>
            <Button onClick={() => createConsultantMutation.mutate()} disabled={!consultantForm.name || !consultantForm.specialty || createConsultantMutation.isPending} className="w-full bg-blue-600">
              {createConsultantMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}Add Consultant
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}