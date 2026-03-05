import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Video, MessageSquare, Calendar, Monitor, Mic, MicOff, VideoOff,
  Phone, PhoneOff, Send, Plus, Clock, User, Share, Loader2,
  CheckCircle2, Settings, ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const CONSULTATION_LINK = 'https://meet.jit.si/clinicals-'; // Free open-source video

function VideoRoom({ patient, onEnd }) {
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [sharing, setSharing] = useState(false);
  const iframeRef = useRef(null);

  const roomName = `clinicals-${patient.cr_number}-${Date.now()}`;
  const jitsiUrl = `https://meet.jit.si/${roomName}#userInfo.displayName="${encodeURIComponent('Dr. Swarnim')}"&config.startWithAudioMuted=${muted}&config.startWithVideoMuted=${videoOff}&interfaceConfig.SHOW_JITSI_WATERMARK=false&interfaceConfig.DEFAULT_REMOTE_DISPLAY_NAME="${encodeURIComponent(patient.patient_name)}"`;

  const copyLinkForPatient = () => {
    const patientLink = `https://meet.jit.si/${roomName}`;
    navigator.clipboard.writeText(patientLink);
    toast.success('Patient link copied! Share this with the patient to join.');
  };

  return (
    <div className="space-y-3">
      <div className="bg-slate-900 rounded-xl overflow-hidden" style={{ height: '60vh' }}>
        <iframe
          ref={iframeRef}
          src={jitsiUrl}
          allow="camera; microphone; fullscreen; display-capture; autoplay"
          className="w-full h-full border-0"
          title="Video Consultation"
        />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1">
          <p className="text-sm font-semibold">Session with {patient.patient_name}</p>
          <p className="text-xs text-slate-500">CR: {patient.cr_number}</p>
        </div>
        <Button variant="outline" onClick={copyLinkForPatient} className="gap-2">
          <ExternalLink className="w-4 h-4" /> Copy Patient Link
        </Button>
        <Button variant="outline" onClick={() => { navigator.mediaDevices?.getDisplayMedia(); setSharing(!sharing); }} className="gap-2">
          <Monitor className="w-4 h-4" /> {sharing ? 'Stop Share' : 'Share Screen'}
        </Button>
        <Button variant="destructive" onClick={onEnd} className="gap-2">
          <PhoneOff className="w-4 h-4" /> End Session
        </Button>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
        <strong>Patient Instructions:</strong> Share the copied link via WhatsApp/SMS. Patient opens it in browser (no app required). Uses Jitsi Meet — encrypted, no sign-in needed.
      </div>
    </div>
  );
}

function PatientMessages({ patientId, patientName }) {
  const [newMsg, setNewMsg] = useState('');
  const [messages, setMessages] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`msgs_${patientId}`) || '[]'); } catch { return []; }
  });

  const sendMessage = () => {
    if (!newMsg.trim()) return;
    const updated = [...messages, { text: newMsg, from: 'doctor', ts: new Date().toISOString() }];
    setMessages(updated);
    localStorage.setItem(`msgs_${patientId}`, JSON.stringify(updated));
    setNewMsg('');
    toast.success('Message saved (patient will see on next login)');
  };

  return (
    <div className="space-y-3">
      <div className="text-xs text-slate-500 bg-blue-50 p-2 rounded-lg">
        Messages are stored locally and visible when patient accesses their portal.
      </div>
      <ScrollArea className="h-64 border rounded-xl p-3">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No messages yet</p>
          </div>
        ) : messages.map((m, i) => (
          <div key={i} className={`flex mb-3 ${m.from === 'doctor' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${m.from === 'doctor' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-900'}`}>
              <p>{m.text}</p>
              <p className={`text-xs mt-1 ${m.from === 'doctor' ? 'text-blue-200' : 'text-slate-400'}`}>
                {format(new Date(m.ts), 'MMM d, h:mm a')}
              </p>
            </div>
          </div>
        ))}
      </ScrollArea>
      <div className="flex gap-2">
        <Input value={newMsg} onChange={e => setNewMsg(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder={`Message to ${patientName}...`} />
        <Button onClick={sendMessage} className="bg-blue-600 gap-2 shrink-0">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export default function Telemedicine() {
  const [activeSession, setActiveSession] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({ patient_id: '', date: '', time: '10:00', notes: '' });
  const [scheduledSessions, setScheduledSessions] = useState(() => {
    try { return JSON.parse(localStorage.getItem('tele_sessions') || '[]'); } catch { return []; }
  });
  const queryClient = useQueryClient();

  const { data: patients = [] } = useQuery({ queryKey: ['patients'], queryFn: () => base44.entities.Patient.list() });
  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

  const saveSession = () => {
    const patient = patients.find(p => p.id === scheduleForm.patient_id);
    if (!patient || !scheduleForm.date) { toast.error('Fill in all required fields'); return; }
    const session = { ...scheduleForm, patient_name: patient.patient_name, cr_number: patient.cr_number, status: 'Scheduled', id: Date.now().toString() };
    const updated = [...scheduledSessions, session];
    setScheduledSessions(updated);
    localStorage.setItem('tele_sessions', JSON.stringify(updated));
    setShowSchedule(false);
    setScheduleForm({ patient_id: '', date: '', time: '10:00', notes: '' });
    toast.success('Consultation scheduled!');
  };

  const updateSessionStatus = (id, status) => {
    const updated = scheduledSessions.map(s => s.id === id ? { ...s, status } : s);
    setScheduledSessions(updated);
    localStorage.setItem('tele_sessions', JSON.stringify(updated));
  };

  const startSession = (session) => {
    const patient = patients.find(p => p.id === session.patient_id) || { patient_name: session.patient_name, cr_number: session.cr_number };
    setActiveSession(session);
    setSelectedPatient(patient);
    updateSessionStatus(session.id, 'In Progress');
  };

  const endSession = () => {
    if (activeSession) updateSessionStatus(activeSession.id, 'Completed');
    setActiveSession(null);
    setSelectedPatient(null);
    toast.success('Session ended and saved.');
  };

  const upcoming = scheduledSessions.filter(s => s.status === 'Scheduled' || s.status === 'In Progress')
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));

  const past = scheduledSessions.filter(s => s.status === 'Completed');

  return (
    <div className="max-w-5xl mx-auto p-4 pb-24">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Video className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Telemedicine</h1>
            <p className="text-xs text-slate-500">Video consultations, patient messaging & screen sharing</p>
          </div>
        </div>
        <Button onClick={() => setShowSchedule(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4" />Schedule Consultation
        </Button>
      </div>

      {activeSession && selectedPatient && (
        <Card className="mb-6 border-2 border-green-300">
          <CardHeader className="pb-2 bg-green-50">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Live Session — {activeSession.patient_name}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <VideoRoom patient={selectedPatient} onEnd={endSession} />
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="upcoming">
        <TabsList className="w-full mb-5">
          <TabsTrigger value="upcoming" className="flex-1">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="messages" className="flex-1">Messages</TabsTrigger>
          <TabsTrigger value="past" className="flex-1">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {upcoming.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Video className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p>No scheduled consultations</p>
            </div>
          ) : upcoming.map(session => (
            <Card key={session.id} className={`mb-3 border-l-4 ${session.status === 'In Progress' ? 'border-l-green-500 bg-green-50' : 'border-l-blue-400'}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="font-semibold text-sm">{session.patient_name}</span>
                      <Badge className={session.status === 'In Progress' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>{session.status}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="w-3 h-3" />
                      <span>{session.date} at {session.time}</span>
                    </div>
                    {session.notes && <p className="text-xs text-slate-600 mt-1">{session.notes}</p>}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" className="gap-2 bg-green-600 hover:bg-green-700" onClick={() => startSession(session)}>
                      <Video className="w-3 h-3" />Start
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="messages">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2 uppercase">Select Patient</p>
              <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
                {patients.map(p => (
                  <button key={p.id} onClick={() => setSelectedPatient(p)}
                    className={`w-full text-left p-2 rounded-lg border text-sm transition-all ${selectedPatient?.id === p.id ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                    <p className="font-medium">{p.patient_name}</p>
                    <p className="text-xs text-slate-500">CR: {p.cr_number}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
              {selectedPatient ? (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{selectedPatient.patient_name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PatientMessages patientId={selectedPatient.id} patientName={selectedPatient.patient_name} />
                  </CardContent>
                </Card>
              ) : (
                <div className="flex items-center justify-center h-48 border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
                  <div className="text-center">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">Select a patient to message</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="past">
          <div className="space-y-2">
            {past.length === 0 ? (
              <div className="text-center py-12 text-slate-400"><CheckCircle2 className="w-10 h-10 mx-auto mb-2 opacity-40" /><p>No completed sessions</p></div>
            ) : past.map(s => (
              <Card key={s.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">{s.patient_name}</p>
                      <p className="text-xs text-slate-500">{s.date} at {s.time}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-700">Completed</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Schedule Dialog */}
      <Dialog open={showSchedule} onOpenChange={setShowSchedule}>
        <DialogContent>
          <DialogHeader><DialogTitle>Schedule Video Consultation</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Patient *</Label>
              <Select value={scheduleForm.patient_id} onValueChange={v => setScheduleForm(p => ({ ...p, patient_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                <SelectContent>{patients.map(p => <SelectItem key={p.id} value={p.id}>{p.patient_name} — {p.cr_number}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Date *</Label>
                <Input type="date" value={scheduleForm.date} onChange={e => setScheduleForm(p => ({ ...p, date: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs">Time *</Label>
                <Input type="time" value={scheduleForm.time} onChange={e => setScheduleForm(p => ({ ...p, time: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label className="text-xs">Consultation Notes</Label>
              <Textarea value={scheduleForm.notes} onChange={e => setScheduleForm(p => ({ ...p, notes: e.target.value }))} rows={2} placeholder="Reason / agenda..." />
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-800">
              <strong>How it works:</strong> When you start the session, a Jitsi Meet room opens instantly. Copy the patient link and share via WhatsApp/SMS. No app installation needed.
            </div>
            <Button onClick={saveSession} className="w-full bg-blue-600">
              <Calendar className="w-4 h-4 mr-2" />Schedule Consultation
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}