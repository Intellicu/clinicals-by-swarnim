import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MessageCircle, Send, X, Loader2, Bot, User, AlertTriangle, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { invokeGrounded } from '@/lib/ai/groundedLLM';

export default function DataChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [proactiveAlerts, setProactiveAlerts] = useState([]);
  const scrollRef = useRef(null);

  const { data: patients = [] } = useQuery({
    queryKey: ['patients'],
    queryFn: () => base44.entities.Patient.list('-created_date', 50),
    enabled: isOpen
  });

  const { data: recentVisits = [] } = useQuery({
    queryKey: ['recent-visits'],
    queryFn: () => base44.entities.VisitRecord.list('-visit_date', 20),
    enabled: isOpen
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (recentVisits.length > 0 && isOpen) {
      analyzePatientTrends();
    }
  }, [recentVisits, isOpen]);

  const analyzePatientTrends = async () => {
    try {
      const alerts = [];
      const patientVisits = {};
      
      recentVisits.forEach(visit => {
        if (!patientVisits[visit.patient_id]) patientVisits[visit.patient_id] = [];
        patientVisits[visit.patient_id].push(visit);
      });

      for (const [patientId, visits] of Object.entries(patientVisits)) {
        if (visits.length < 2) continue;
        const sorted = visits.sort((a, b) => new Date(b.visit_date) - new Date(a.visit_date));
        const latest = sorted[0];
        const previous = sorted[1];
        const patient = patients.find(p => p.id === patientId);

        // BP trend analysis
        if (latest.physical_examination?.bp_systolic && previous.physical_examination?.bp_systolic) {
          const latestSys = latest.physical_examination.bp_systolic;
          const prevSys = previous.physical_examination.bp_systolic;
          
          if (latestSys > 130 && latestSys > prevSys + 10) {
            alerts.push({
              type: 'critical',
              patientId,
              patient: patient?.patient_name || 'Patient',
              message: `Rising BP: ${prevSys} → ${latestSys} mmHg. Consider HTN pathway.`,
              pathway: 'htn-emergency',
              action: 'Review BP medication dosing'
            });
          }
        }

        // Weight trend analysis
        if (latest.physical_examination?.weight && previous.physical_examination?.weight) {
          const weightChange = latest.physical_examination.weight - previous.physical_examination.weight;
          const percentChange = (weightChange / previous.physical_examination.weight) * 100;
          
          if (Math.abs(percentChange) > 10) {
            alerts.push({
              type: 'warning',
              patientId,
              patient: patient?.patient_name || 'Patient',
              message: `Weight ${weightChange > 0 ? 'gain' : 'loss'}: ${Math.abs(weightChange).toFixed(1)}kg (${Math.abs(percentChange).toFixed(1)}%). ${weightChange > 0 ? 'Fluid overload?' : 'Dehydration/malnutrition?'}`,
              pathway: weightChange > 0 ? 'severe-edema-ns' : 'fluid-calculator',
              action: 'Assess fluid status and adjust management'
            });
          }
        }

        // Lab trend analysis
        if (latest.lab_results?.serum_creatinine && previous.lab_results?.serum_creatinine) {
          const crChange = ((latest.lab_results.serum_creatinine - previous.lab_results.serum_creatinine) / previous.lab_results.serum_creatinine) * 100;
          
          if (crChange > 25) {
            alerts.push({
              type: 'critical',
              patientId,
              patient: patient?.patient_name || 'Patient',
              message: `Creatinine rising: ${previous.lab_results.serum_creatinine} → ${latest.lab_results.serum_creatinine} mg/dL (${crChange.toFixed(0)}%). AKI?`,
              pathway: 'aki-prifle',
              action: 'Urgent: Stage AKI and review management'
            });
          }
        }

        // Proteinuria worsening
        if (latest.lab_results?.urine_protein && previous.lab_results?.urine_protein) {
          if (latest.lab_results.urine_protein > 3 && latest.lab_results.urine_protein > previous.lab_results.urine_protein * 1.5) {
            alerts.push({
              type: 'warning',
              patientId,
              patient: patient?.patient_name || 'Patient',
              message: `Proteinuria worsening: ${previous.lab_results.urine_protein} → ${latest.lab_results.urine_protein} g/day. Nephrotic relapse?`,
              pathway: 'nephrotic-syndrome',
              action: 'Consider nephrotic pathway and treatment escalation'
            });
          }
        }
      }

      setProactiveAlerts(alerts.slice(0, 5));
    } catch (error) {
      console.error('Trend analysis error:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const patientData = JSON.parse(localStorage.getItem('clinicalc_patient_data') || '{}');
      
      const historyBlock = messages.length > 0
        ? `\nConversation so far:\n${messages.slice(-6).map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n')}\n`
        : '';

      const contextPrompt = `You are a friendly paediatric nephrology clinical assistant.

Patient Data: ${JSON.stringify(patientData)}
Patients in System: ${patients.length}
Recent Visits: ${recentVisits.length}
${historyBlock}
Question: ${userMessage}

Give a clinically accurate, complete answer. Start with the direct answer, then add key details (doses, thresholds, red flags) when clinically relevant. Explain medical terms simply. If the question needs more detail than a chat bubble allows, summarise and point to the relevant app section.`;

      const { response, fromCache } = await invokeGrounded({
        prompt: contextPrompt,
        add_context_from_internet: false
      }, { cache: false }); // patient-specific context — never cache across patients

      setMessages(prev => [...prev, { role: 'assistant', content: String(response ?? '') }]);
    } catch (error) {
      toast.error('Failed to get response');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-40">
        {proactiveAlerts.length > 0 && (
          <div className="mb-2 animate-pulse">
            <Badge className="bg-red-500 text-white">
              {proactiveAlerts.length} Alert{proactiveAlerts.length > 1 ? 's' : ''}
            </Badge>
          </div>
        )}
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-blue-600 to-purple-600"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl z-50 flex flex-col">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            <CardTitle className="text-base">Health Monitor AI</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-white/20 h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {proactiveAlerts.length > 0 && (
          <div className="space-y-2">
            {proactiveAlerts.map((alert, idx) => (
              <Alert key={idx} className={
                alert.type === 'critical' ? 'bg-red-50 border-red-300' : 'bg-amber-50 border-amber-300'
              }>
                {alert.type === 'critical' ? (
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                ) : (
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                )}
                <AlertDescription className="text-xs">
                  <div className="font-semibold">{alert.patient}</div>
                  <div className="mb-1">{alert.message}</div>
                  {alert.action && <div className="text-xs font-semibold mt-1">→ {alert.action}</div>}
                  {alert.pathway && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2 h-6 text-xs"
                      onClick={() => window.open(`/pages/ClinicalSupport?pathway=${alert.pathway}`, '_blank')}
                    >
                      Open Pathway
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {messages.length === 0 && proactiveAlerts.length === 0 && (
          <div className="text-center py-8">
            <Bot className="w-12 h-12 mx-auto mb-3 text-slate-400" />
            <p className="text-sm text-slate-500 mb-4">I monitor trends and answer questions!</p>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-left justify-start text-xs"
                onClick={() => setInput("What was the last patient's BP?")}
              >
                What was the last patient's BP?
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-left justify-start text-xs"
                onClick={() => setInput("Any concerning patient trends?")}
              >
                Any concerning patient trends?
              </Button>
            </div>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            <div className={`rounded-lg px-3 py-2 max-w-[80%] ${
              msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-900'
            }`}>
              <p className="text-sm">{msg.content}</p>
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-slate-600" />
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-2 justify-start">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-slate-100 rounded-lg px-3 py-2">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          </div>
        )}
      </div>
      
      <CardContent className="p-3 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about patient data..."
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-r from-blue-600 to-purple-600"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}