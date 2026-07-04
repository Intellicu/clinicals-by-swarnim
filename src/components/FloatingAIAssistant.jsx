import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bot, Send, Minimize2, X, Loader2, Settings, MessageCircle,
  ThumbsUp, ThumbsDown, RefreshCw, Sparkles, CheckCircle2,
  Upload, Mic, MicOff, VolumeX, ArrowLeft, FileText,
  Save, Maximize2, Trash2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import { invokeGrounded } from '@/lib/ai/groundedLLM';

const QUICK_QUESTIONS = [
  "Steroid dosing for nephrotic syndrome?",
  "KDIGO AKI staging criteria?",
  "Tacrolimus target levels in SRNS?",
  "Hypercalciuria management in stone formers?",
  "When to start RRT in pediatric AKI?"
];

const SIZES = {
  small: { width: '420px', height: '600px' },
  medium: { width: '600px', height: '75vh' },
  large: { width: '860px', height: '88vh' },
};

export default function FloatingAIAssistant() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [size, setSize] = useState('medium');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]); // {name, url, type, saved}
  const [savedDocs, setSavedDocs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ai_saved_docs') || '[]'); } catch { return []; }
  });
  const [agentMode, setAgentMode] = useState('text');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

  const { data: userPreferences } = useQuery({
    queryKey: ['userPreferences', user?.email],
    queryFn: async () => {
      const prefs = await base44.entities.UserPreferences.filter({ user_email: user.email });
      return prefs[0] || null;
    },
    enabled: !!user
  });

  const [localPreferences, setLocalPreferences] = useState({
    ai_persona: 'balanced',
    guideline_preference: 'KDIGO,IPNA,IAP',
    drug_info_depth: 'detailed',
  });

  useEffect(() => {
    if (userPreferences) {
      setLocalPreferences(p => ({ ...p, ...userPreferences }));
    }
  }, [userPreferences]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Speech recognition
  useEffect(() => {
    if (agentMode !== 'voice') return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.continuous = false;
    r.interimResults = false;
    r.onresult = (e) => { const t = e.results[0][0].transcript; setInput(t); handleSendMessage(t); };
    r.onerror = () => { setIsListening(false); isListeningRef.current = false; };
    r.onend = () => {
      if (isListeningRef.current) { try { r.start(); } catch { setIsListening(false); isListeningRef.current = false; } }
      else setIsListening(false);
    };
    recognitionRef.current = r;
    return () => { try { r.abort(); } catch {} };
  }, [agentMode]);

  const updatePreferencesMutation = useMutation({
    mutationFn: (p) => userPreferences?.id
      ? base44.entities.UserPreferences.update(userPreferences.id, p)
      : base44.entities.UserPreferences.create({ user_email: user.email, ...p }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['userPreferences'] }); toast.success('Saved!'); setShowSettings(false); }
  });

  const buildSystemPrompt = () => {
    const docContext = uploadedFiles.length > 0
      ? `\n\nThe user has uploaded the following documents: ${uploadedFiles.map(f => f.name).join(', ')}. Answer questions based on these documents when relevant.`
      : '';
    const savedContext = savedDocs.length > 0
      ? `\n\nSaved documents in library: ${savedDocs.map(d => d.name).join(', ')}`
      : '';
    return `You are a comprehensive AI clinical assistant for pediatric nephrology. Style: ${localPreferences.ai_persona}. Guidelines: ${localPreferences.guideline_preference}.

Capabilities: clinical questions, drug dosing, differential diagnosis, patient summaries, dietary advice, monitoring plans, follow-up recommendations, document analysis.

Always cite sources. Include formulas where relevant. Flag off-label use.${docContext}${savedContext}`;
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    toast.info('Uploading files...', { id: 'ai-upload' });
    try {
      const results = await Promise.all(files.map(async f => {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
        return { name: f.name, url: file_url, type: f.type, saved: false };
      }));
      setUploadedFiles(p => [...p, ...results]);
      toast.success(`${files.length} file(s) uploaded. You can now ask questions about them.`, { id: 'ai-upload' });
    } catch (err) {
      console.error('Upload failed:', err);
      toast.error('File upload failed — check connection and try again.', { id: 'ai-upload' });
    }
  };

  const saveDocToLibrary = (doc) => {
    const updated = [...savedDocs, { ...doc, saved: true, savedAt: new Date().toISOString() }];
    setSavedDocs(updated);
    localStorage.setItem('ai_saved_docs', JSON.stringify(updated));
    toast.success(`"${doc.name}" saved to document library!`);
  };

  const removeSavedDoc = (idx) => {
    const updated = savedDocs.filter((_, i) => i !== idx);
    setSavedDocs(updated);
    localStorage.setItem('ai_saved_docs', JSON.stringify(updated));
  };

  const handleSendMessage = async (textOverride = null) => {
    const messageText = textOverride || input;
    if (!messageText.trim() && uploadedFiles.length === 0) return;
    if (isLoading) return;

    const userMsg = { role: 'user', content: messageText, files: uploadedFiles.length > 0 ? [...uploadedFiles] : null };
    setMessages(p => [...p, userMsg]);
    setInput('');
    const filesToSend = [...uploadedFiles];
    setUploadedFiles([]);
    setIsLoading(true);

    try {
      const allFileUrls = [
        ...filesToSend.map(f => f.url),
        ...savedDocs.map(d => d.url)
      ].filter(Boolean);

      // Include recent turns so follow-up questions keep their context
      const historyBlock = messages.length > 0
        ? `\n\nConversation so far:\n${messages.slice(-8).map(m => `${m.role === 'user' ? 'Clinician' : 'Assistant'}: ${m.content}`).join('\n')}\n`
        : '';

      const { response: rawResponse, fromCache } = await invokeGrounded({
        prompt: `${buildSystemPrompt()}${historyBlock}\n\nUSER: ${messageText}\n\n${filesToSend.length > 0 ? `Uploaded documents: ${filesToSend.map(f => f.name).join(', ')}. Analyze and answer based on these.` : ''}\n\nProvide a comprehensive, evidence-based response.`,
        add_context_from_internet: true,
        file_urls: allFileUrls.length > 0 ? allFileUrls : undefined
      });
      const response = String(rawResponse ?? '') + (fromCache ? '\n\n_(served from offline cache)_' : '');

      setMessages(p => [...p, {
        role: 'assistant',
        content: response + "\n\n---\n*AI-generated for educational purposes. Verify all recommendations clinically.*",
        timestamp: new Date().toISOString()
      }]);

      if (agentMode === 'voice' && window.speechSynthesis) {
        const u = new SpeechSynthesisUtterance(response.substring(0, 400));
        window.speechSynthesis.speak(u);
      }
    } catch {
      setMessages(p => [...p, { role: 'assistant', content: 'Sorry, an error occurred. Please try again.', error: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      isListeningRef.current = false;
      try { recognitionRef.current.stop(); } catch {}
    } else {
      isListeningRef.current = true;
      setIsListening(true);
      try { recognitionRef.current.start(); } catch { setIsListening(false); }
    }
  };

  const exportChat = () => {
    const text = messages.map(m => `${m.role === 'user' ? 'You' : 'AI'}: ${m.content}`).join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `ai_chat_${new Date().toISOString().split('T')[0]}.txt`; a.click();
    toast.success('Chat exported!');
  };

  const { width, height } = SIZES[size];

  if (!isOpen) {
    return (
      <div className="fixed bottom-20 lg:bottom-6 right-4 z-50">
        <Button
          onClick={() => navigate('/AIAgentsHub')}
          className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 shadow-xl p-0 hover:scale-105 transition-transform"
          title="AI Agents Hub"
        >
          <Bot className="w-5 h-5 text-white" />
        </Button>
      </div>
    );
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-20 lg:bottom-6 right-4 z-50">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-xl cursor-pointer" onClick={() => setIsMinimized(false)}>
          <Bot className="w-5 h-5" />
          <span className="font-semibold text-sm">AI Assistant</span>
          {messages.length > 0 && <Badge className="bg-white/20 text-xs">{messages.length}</Badge>}
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-white hover:bg-white/20 ml-2" onClick={e => { e.stopPropagation(); setIsOpen(false); setIsMinimized(false); }}>
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 z-50 flex flex-col shadow-2xl transition-all duration-300"
      style={{ width: window.innerWidth < 640 ? 'calc(100vw - 32px)' : width, height }}>
      <Card className="flex flex-col h-full border-2 border-purple-300 rounded-2xl overflow-hidden">
        {/* Header */}
        <CardHeader className="bg-gradient-to-r from-purple-700 to-indigo-700 text-white p-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold">AI Clinical Assistant</CardTitle>
                <p className="text-xs text-purple-200">{agentMode === 'voice' ? '🎤 Voice' : '💬 Text'} · {localPreferences.ai_persona}</p>
              </div>
            </div>
            <div className="flex gap-1 items-center">
              {/* Size controls */}
              <div className="hidden sm:flex gap-0.5 border border-white/30 rounded-lg overflow-hidden mr-1">
                {['small', 'medium', 'large'].map(s => (
                  <button key={s} onClick={() => setSize(s)}
                    className={`px-1.5 py-0.5 text-xs ${size === s ? 'bg-white/30' : 'hover:bg-white/20'}`}>
                    {s[0].toUpperCase()}
                  </button>
                ))}
              </div>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-white hover:bg-white/20" onClick={() => setShowSettings(!showSettings)}><Settings className="w-3.5 h-3.5" /></Button>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-white hover:bg-white/20" onClick={() => { setMessages([]); }}><RefreshCw className="w-3.5 h-3.5" /></Button>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-white hover:bg-white/20" onClick={exportChat}><Save className="w-3.5 h-3.5" /></Button>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-white hover:bg-white/20" onClick={() => setIsMinimized(true)}><Minimize2 className="w-3.5 h-3.5" /></Button>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-white hover:bg-white/20" onClick={() => { setIsOpen(false); setIsMinimized(false); }}><X className="w-3.5 h-3.5" /></Button>
            </div>
          </div>
        </CardHeader>

        {showSettings ? (
          <CardContent className="flex-1 p-4 overflow-y-auto space-y-4">
            <Button variant="outline" size="sm" onClick={() => setShowSettings(false)} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />Back to Chat
            </Button>

            <Tabs defaultValue="persona">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="persona">Style</TabsTrigger>
                <TabsTrigger value="mode">Mode</TabsTrigger>
                <TabsTrigger value="docs">Saved Docs</TabsTrigger>
              </TabsList>

              <TabsContent value="persona" className="space-y-3 mt-3">
                <div>
                  <Label className="text-xs">AI Persona</Label>
                  <Select value={localPreferences.ai_persona} onValueChange={v => setLocalPreferences(p => ({ ...p, ai_persona: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['empathetic', 'concise', 'technical', 'balanced'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Drug Info Depth</Label>
                  <Select value={localPreferences.drug_info_depth} onValueChange={v => setLocalPreferences(p => ({ ...p, drug_info_depth: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="detailed">Detailed</SelectItem>
                      <SelectItem value="comprehensive">Comprehensive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Guidelines</Label>
                  <Input value={localPreferences.guideline_preference} onChange={e => setLocalPreferences(p => ({ ...p, guideline_preference: e.target.value }))} placeholder="KDIGO,IPNA,IAP" />
                </div>
                <Button onClick={() => updatePreferencesMutation.mutate(localPreferences)} className="w-full bg-purple-600">
                  {updatePreferencesMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                  Save Preferences
                </Button>
              </TabsContent>

              <TabsContent value="mode" className="space-y-2 mt-3">
                {[['text', '💬 Text Chat'], ['voice', '🎤 Voice Mode']].map(([m, label]) => (
                  <Button key={m} variant={agentMode === m ? 'default' : 'outline'} className="w-full justify-start" onClick={() => setAgentMode(m)}>{label}</Button>
                ))}
              </TabsContent>

              <TabsContent value="docs" className="mt-3">
                <p className="text-xs text-slate-500 mb-3">Documents saved here are included as context in all chats.</p>
                {savedDocs.length === 0 ? (
                  <div className="text-center py-6 text-slate-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No saved documents</p>
                  </div>
                ) : savedDocs.map((doc, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 border rounded-lg mb-2">
                    <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                    <span className="text-xs flex-1 truncate">{doc.name}</span>
                    <Button size="sm" variant="ghost" onClick={() => removeSavedDoc(i)}><Trash2 className="w-3 h-3 text-red-500" /></Button>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        ) : (
          <>
            <ScrollArea className="flex-1 p-4">
              {messages.length === 0 ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                    <Sparkles className="w-7 h-7 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">AI Clinical Assistant</h3>
                    <p className="text-xs text-slate-500 mt-1">Upload PDFs/documents or ask anything clinical</p>
                  </div>
                  <div className="space-y-1.5 mt-4">
                    {QUICK_QUESTIONS.map((q, i) => (
                      <button key={i} onClick={() => setInput(q)}
                        className="w-full text-left text-xs px-3 py-2 rounded-lg border border-slate-200 hover:bg-purple-50 hover:border-purple-300 transition-all">
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`${size === 'large' ? 'max-w-[80%]' : 'max-w-[90%]'} ${msg.role === 'user' ? 'bg-purple-600 text-white' : 'bg-slate-50 border border-slate-200 text-slate-900'} rounded-2xl px-4 py-3`}>
                        {msg.role === 'user' ? (
                          <>
                            <p className="text-sm">{msg.content}</p>
                            {msg.files?.map((f, i) => (
                              <div key={i} className="mt-1.5 flex items-center gap-1 bg-white/20 rounded px-2 py-1">
                                <FileText className="w-3 h-3" /><span className="text-xs truncate">{f.name}</span>
                              </div>
                            ))}
                          </>
                        ) : (
                          <ReactMarkdown className="text-sm prose prose-sm max-w-none prose-headings:text-slate-900 prose-p:text-slate-700">
                            {msg.content}
                          </ReactMarkdown>
                        )}
                        {msg.role === 'assistant' && !msg.error && (
                          <div className="flex gap-1 mt-2 pt-2 border-t border-slate-200">
                            <Button size="sm" variant="ghost" className="h-6 px-2 text-xs text-slate-500" onClick={() => { navigator.clipboard.writeText(msg.content); toast.success('Copied!'); }}>Copy</Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-slate-100 rounded-2xl px-4 py-3 flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                        <span className="text-sm text-slate-600">Thinking...</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            <CardContent className="p-3 border-t flex-shrink-0 bg-white">
              {uploadedFiles.length > 0 && (
                <div className="flex gap-2 mb-2 flex-wrap">
                  {uploadedFiles.map((f, i) => (
                    <div key={i} className="flex items-center gap-1 bg-blue-50 border border-blue-200 rounded-lg px-2 py-1">
                      <FileText className="w-3 h-3 text-blue-600" />
                      <span className="text-xs text-blue-700 max-w-[100px] truncate">{f.name}</span>
                      <button onClick={() => saveDocToLibrary(f)} className="text-green-600 hover:text-green-800 ml-1 text-xs" title="Save to library">💾</button>
                      <button onClick={() => setUploadedFiles(p => p.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 ml-0.5">×</button>
                    </div>
                  ))}
                </div>
              )}

              {agentMode === 'voice' && (
                <Button onClick={toggleListening} disabled={isLoading} size="sm"
                  variant={isListening ? 'destructive' : 'outline'} className="w-full mb-2">
                  {isListening ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
                  {isListening ? 'Stop Listening' : 'Start Speaking'}
                </Button>
              )}

              <div className="flex gap-2">
                <input type="file" accept="image/*,.pdf,.doc,.docx,.txt" multiple onChange={handleFileUpload}
                  className="hidden" id="ai-file-upload" />
                <label htmlFor="ai-file-upload">
                  <Button type="button" size="sm" variant="outline" className="cursor-pointer h-9 w-9 p-0" asChild>
                    <span><Upload className="w-4 h-4" /></span>
                  </Button>
                </label>
                <Input value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder="Ask anything, or upload a document..."
                  className="flex-1" disabled={isLoading} />
                <Button onClick={() => handleSendMessage()} disabled={(!input.trim() && uploadedFiles.length === 0) || isLoading}
                  size="sm" className="bg-purple-600 hover:bg-purple-700 h-9 w-9 p-0">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-slate-400 mt-1.5 text-center">Upload PDF/DOC/images — AI will answer based on the document</p>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}