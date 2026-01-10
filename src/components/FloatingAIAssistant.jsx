import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bot,
  Send,
  Minimize2,
  X,
  Loader2,
  Settings,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Sparkles,
  Info,
  CheckCircle2,
  Upload,
  Image as ImageIcon,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  ArrowLeft
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

const QUICK_QUESTIONS = [
  "Steroid dosing for nephrotic syndrome?",
  "KDIGO AKI staging criteria?",
  "Tacrolimus target levels in SRNS?",
  "Hypercalciuria management in stone formers?",
  "When to start RRT in pediatric AKI?"
];

export default function FloatingAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const messagesEndRef = useRef(null);
  
  // Voice/Video agent integration
  const [agentMode, setAgentMode] = useState('text'); // text, voice, video
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: userPreferences } = useQuery({
    queryKey: ['userPreferences', user?.email],
    queryFn: async () => {
      const prefs = await base44.entities.UserPreferences.filter({ user_email: user.email });
      return prefs[0] || null;
    },
    enabled: !!user
  });

  const [localPreferences, setLocalPreferences] = useState({
    ai_persona: 'empathetic',
    guideline_preference: 'KDIGO,IPNA,IAP',
    drug_info_depth: 'detailed',
    include_generic_availability: true,
    include_side_effects: true,
    drug_interaction_severity: 'major_moderate'
  });

  useEffect(() => {
    if (userPreferences) {
      setLocalPreferences({
        ai_persona: userPreferences.ai_persona || 'empathetic',
        guideline_preference: userPreferences.guideline_preference || 'KDIGO,IPNA,IAP',
        drug_info_depth: userPreferences.drug_info_depth || 'detailed',
        include_generic_availability: userPreferences.include_generic_availability !== false,
        include_side_effects: userPreferences.include_side_effects !== false,
        drug_interaction_severity: userPreferences.drug_interaction_severity || 'major_moderate'
      });
    }
  }, [userPreferences]);

  // Voice recognition setup
  useEffect(() => {
    if (agentMode !== 'voice' && agentMode !== 'video') return;
    
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      handleSendMessage(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
      isListeningRef.current = false;
    };

    recognition.onend = () => {
      if (isListeningRef.current) {
        try {
          recognition.start();
        } catch (e) {
          setIsListening(false);
          isListeningRef.current = false;
        }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [agentMode]);

  const updatePreferencesMutation = useMutation({
    mutationFn: async (newPrefs) => {
      if (userPreferences?.id) {
        return base44.entities.UserPreferences.update(userPreferences.id, newPrefs);
      } else {
        return base44.entities.UserPreferences.create({
          user_email: user.email,
          ...newPrefs
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPreferences'] });
      toast.success('Preferences saved!');
      setShowSettings(false);
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const buildSystemPrompt = () => {
    const personaPrompts = {
      empathetic: "You are a warm, supportive pediatric nephrologist. Explain concepts clearly with analogies. Use simple language.",
      concise: "You are a precise, efficient pediatric nephrologist. Give direct answers with bullet points. Focus on actionable information only.",
      technical: "You are a highly technical pediatric nephrologist. Use medical terminology. Cite specific studies and guidelines.",
      balanced: "You are a balanced pediatric nephrologist. Combine clinical expertise with clear explanations."
    };

    return `${personaPrompts[localPreferences.ai_persona]}

PREFERRED GUIDELINES: ${localPreferences.guideline_preference}
DRUG INFO DEPTH: ${localPreferences.drug_info_depth}

Always cite sources. Include dose calculations with formulas where relevant. Flag off-label use. Recommend specialist referral for complex cases.`;
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const uploadPromises = files.map(async (file) => {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      return { name: file.name, url: file_url, type: file.type };
    });

    const uploaded = await Promise.all(uploadPromises);
    setUploadedImages(prev => [...prev, ...uploaded]);
    toast.success(`${files.length} image(s) uploaded`);
  };

  const handleSendMessage = async (textOverride = null) => {
    const messageText = textOverride || input;
    if (!messageText.trim() && uploadedImages.length === 0) return;
    if (isLoading) return;

    const userMessage = { 
      role: 'user', 
      content: messageText,
      images: uploadedImages.length > 0 ? [...uploadedImages] : null
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    const imagesToSend = [...uploadedImages];
    setUploadedImages([]);
    setIsLoading(true);

    try {
      const fullPrompt = `${buildSystemPrompt()}

USER QUESTION: ${messageText}

${imagesToSend.length > 0 ? `The user has uploaded ${imagesToSend.length} image(s) (lab reports, clinical photos, prescriptions, etc.). Analyze them and provide relevant clinical insights.` : ''}

IMPORTANT: DO NOT use asterisks or markdown bold formatting (no **). Use plain text with clear structure.

Provide a helpful, evidence-based response.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: fullPrompt,
        add_context_from_internet: true,
        file_urls: imagesToSend.length > 0 ? imagesToSend.map(img => img.url) : undefined
      });

      const cleanedResponse = response.replace(/\*\*/g, '');
      const responseWithDisclaimer = cleanedResponse + "\n\n---\nAI Disclaimer: This response is AI-generated for educational purposes based on clinical guidelines. Always exercise independent clinical judgment and verify all recommendations with current evidence-based sources.";

      const assistantMessage = {
        role: 'assistant',
        content: responseWithDisclaimer,
        feedback: null,
        timestamp: new Date().toISOString(),
        editable: user?.role === 'admin'
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      if (agentMode === 'voice' || agentMode === 'video') {
        speak(cleanedResponse);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        error: true
      }]);
      toast.error('Failed to get response');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditMessage = (messageIndex, newContent) => {
    setMessages(prev => prev.map((msg, idx) =>
      idx === messageIndex ? { ...msg, content: newContent, isEditing: false } : msg
    ));
    toast.success('Response updated');
  };

  const speak = (text) => {
    if (!window.speechSynthesis) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.substring(0, 500));
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      setTimeout(() => window.speechSynthesis.speak(utterance), 100);
    } catch (e) {
      setIsSpeaking(false);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      isListeningRef.current = false;
      setIsListening(false);
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    } else {
      isListeningRef.current = true;
      setIsListening(true);
      try {
        recognitionRef.current.start();
      } catch (e) {
        setIsListening(false);
        isListeningRef.current = false;
      }
    }
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } catch (e) {}
    }
  };

  const handleQuickQuestion = (question) => {
    setInput(question);
  };

  const handleFeedback = (messageIndex, feedbackType) => {
    setMessages(prev => prev.map((msg, idx) =>
      idx === messageIndex ? { ...msg, feedback: feedbackType } : msg
    ));
    toast.success('Thank you for your feedback!');
  };

  const handleNewChat = () => {
    setMessages([]);
    setUploadedImages([]);
    toast.info('Chat cleared');
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
    if (agentMode !== 'text') {
      setAgentMode('text');
      if (isListening) toggleListening();
      if (isSpeaking) stopSpeaking();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg z-50 flex items-center justify-center"
      >
        <Bot className="w-7 h-7 text-white" />
      </Button>
    );
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Card className="w-80 bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-2xl cursor-pointer" onClick={() => setIsMinimized(false)}>
          <CardHeader className="p-4 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <span className="font-semibold">AI Assistant</span>
            </div>
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-white hover:bg-white/20" onClick={(e) => { e.stopPropagation(); handleClose(); }}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[420px] h-[650px] flex flex-col shadow-2xl">
      <Card className="flex flex-col h-full border-2 border-purple-200">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-3 flex-shrink-0 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">AI Clinical Assistant</CardTitle>
                <p className="text-xs text-purple-100">
                  {agentMode === 'video' ? '🎥 Video' : agentMode === 'voice' ? '🎤 Voice' : '💬 Text'} · {localPreferences.ai_persona}
                </p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-white hover:bg-white/20" onClick={() => setShowSettings(!showSettings)} title="Settings">
                <Settings className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-white hover:bg-white/20" onClick={handleNewChat} title="New Chat">
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-white hover:bg-white/20" onClick={() => setIsMinimized(true)} title="Minimize">
                <Minimize2 className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-white hover:bg-white/20" onClick={handleClose} title="Close">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {showSettings ? (
          <CardContent className="flex-1 p-4 overflow-y-auto">
            <Button variant="outline" size="sm" onClick={() => setShowSettings(false)} className="mb-4 w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Chat
            </Button>
            
            <Tabs defaultValue="persona">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="persona">Persona</TabsTrigger>
                <TabsTrigger value="mode">Mode</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>

              <TabsContent value="persona" className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold mb-2 block">AI Style</Label>
                  <Select value={localPreferences.ai_persona} onValueChange={(val) => setLocalPreferences({...localPreferences, ai_persona: val})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="empathetic">Empathetic</SelectItem>
                      <SelectItem value="concise">Concise</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="balanced">Balanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-semibold mb-2 block">Drug Info Depth</Label>
                  <Select value={localPreferences.drug_info_depth} onValueChange={(val) => setLocalPreferences({...localPreferences, drug_info_depth: val})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic - Dosing only</SelectItem>
                      <SelectItem value="detailed">Detailed - Dosing + monitoring</SelectItem>
                      <SelectItem value="comprehensive">Comprehensive - Full profile</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="mode" className="space-y-3">
                <Label className="font-semibold">Interaction Mode</Label>
                <div className="space-y-2">
                  <Button
                    variant={agentMode === 'text' ? 'default' : 'outline'}
                    onClick={() => setAgentMode('text')}
                    className="w-full justify-start"
                  >
                    💬 Text Chat
                  </Button>
                  <Button
                    variant={agentMode === 'voice' ? 'default' : 'outline'}
                    onClick={() => setAgentMode('voice')}
                    className="w-full justify-start"
                  >
                    🎤 Voice Assistant
                  </Button>
                  <Button
                    variant={agentMode === 'video' ? 'default' : 'outline'}
                    onClick={() => setAgentMode('video')}
                    className="w-full justify-start"
                  >
                    🎥 Video Companion
                  </Button>
                </div>
                {agentMode !== 'text' && !('webkitSpeechRecognition' in window) && (
                  <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded mt-2">
                    Voice features require Chrome or Edge browser
                  </div>
                )}
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4">
                <p className="text-xs text-slate-500">Advanced settings coming soon</p>
              </TabsContent>
            </Tabs>

            <div className="mt-4 pt-4 border-t">
              <Button onClick={() => updatePreferencesMutation.mutate(localPreferences)} disabled={updatePreferencesMutation.isPending} className="w-full bg-purple-600">
                {updatePreferencesMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                Save Preferences
              </Button>
            </div>
          </CardContent>
        ) : (
          <>
            <ScrollArea className="flex-1 p-4">
              {messages.length === 0 ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900">AI Clinical Assistant</h3>
                  <p className="text-sm text-slate-600">Ask clinical questions, upload images</p>
                  
                  <div className="space-y-2 mt-6">
                    <p className="text-xs font-semibold text-slate-700 uppercase">Quick Questions:</p>
                    {QUICK_QUESTIONS.map((q, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        className="w-full text-left justify-start h-auto py-2 px-3 text-xs hover:bg-purple-50"
                        onClick={() => handleQuickQuestion(q)}
                      >
                        {q}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, idx) => (
                    <div key={idx} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] ${message.role === 'user' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-900'} rounded-lg p-3`}>
                        {message.role === 'user' ? (
                          <>
                            <p className="text-sm">{message.content}</p>
                            {message.images && message.images.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {message.images.map((img, i) => (
                                  <div key={i} className="w-16 h-16 bg-white/20 rounded border border-white/30 flex items-center justify-center">
                                    <ImageIcon className="w-6 h-6" />
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            {message.isEditing ? (
                              <div className="space-y-2">
                                <Textarea
                                  value={message.content}
                                  onChange={(e) => setMessages(prev => prev.map((m, i) => i === idx ? {...m, content: e.target.value} : m))}
                                  className="min-h-[200px] text-sm"
                                />
                                <div className="flex gap-2 mt-2">
                                  <Button size="sm" onClick={() => handleEditMessage(idx, message.content)} className="bg-green-600 hover:bg-green-700">
                                    Save
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => setMessages(prev => prev.map((m, i) => i === idx ? {...m, isEditing: false} : m))}>
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <ReactMarkdown className="text-sm prose prose-sm max-w-none prose-purple">
                                  {message.content}
                                </ReactMarkdown>
                                {!message.error && message.editable && (
                                  <div className="mt-2 pt-2 border-t border-slate-200">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => setMessages(prev => prev.map((m, i) => i === idx ? {...m, isEditing: true} : m))}
                                      className="h-6 px-2 text-xs"
                                    >
                                      Edit Response
                                    </Button>
                                  </div>
                                )}
                                {!message.error && (
                                  <div className="flex items-center gap-2 mt-2">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className={`h-6 px-2 ${message.feedback === 'up' ? 'bg-green-100' : ''}`}
                                      onClick={() => handleFeedback(idx, 'up')}
                                    >
                                      <ThumbsUp className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className={`h-6 px-2 ${message.feedback === 'down' ? 'bg-red-100' : ''}`}
                                      onClick={() => handleFeedback(idx, 'down')}
                                    >
                                      <ThumbsDown className="w-3 h-3" />
                                    </Button>
                                  </div>
                                )}
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-slate-100 rounded-lg p-3 flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                        <span className="text-sm text-slate-600">Thinking...</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            <CardContent className="p-3 border-t flex-shrink-0">
              {uploadedImages.length > 0 && (
                <div className="flex gap-2 mb-2 flex-wrap">
                  {uploadedImages.map((img, idx) => (
                    <Badge key={idx} variant="outline" className="bg-blue-50">
                      <ImageIcon className="w-3 h-3 mr-1" />
                      Image {idx + 1}
                      <button onClick={() => setUploadedImages(prev => prev.filter((_, i) => i !== idx))} className="ml-1">×</button>
                    </Badge>
                  ))}
                </div>
              )}
              
              {(agentMode === 'voice' || agentMode === 'video') && (
                <div className="flex gap-2 mb-2">
                  <Button
                    onClick={toggleListening}
                    disabled={isLoading}
                    size="sm"
                    variant={isListening ? "destructive" : "outline"}
                    className="flex-1"
                  >
                    {isListening ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
                    {isListening ? 'Stop' : 'Speak'}
                  </Button>
                  <Button
                    onClick={stopSpeaking}
                    disabled={!isSpeaking}
                    size="sm"
                    variant="outline"
                  >
                    <VolumeX className="w-4 h-4" />
                  </Button>
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload">
                  <Button type="button" size="sm" variant="outline" className="cursor-pointer" asChild>
                    <span>
                      <Upload className="w-4 h-4" />
                    </span>
                  </Button>
                </label>
                
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask a question..."
                  className="flex-1 h-9"
                  disabled={isLoading}
                />
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={(!input.trim() && uploadedImages.length === 0) || isLoading}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}