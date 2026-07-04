import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { base44 } from "@/api/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Video, Mic, MicOff, Volume2, VolumeX, Loader2, AlertCircle,
  Calculator, Pill, Activity, Droplet, BookOpen, User, Play, Pause,
  Brain, Sparkles, CheckCircle, MessageCircle, Settings, Globe
} from "lucide-react";
import { toast } from "sonner";

export default function VideoTeachingAgent() {
  const location = useLocation();
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [conversation, setConversation] = useState([]);
  const [currentAction, setCurrentAction] = useState(null);
  const [language, setLanguage] = useState("en-US");
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);
  const [showSettings, setShowSettings] = useState(false);
  const [avatarState, setAvatarState] = useState("idle"); // idle, listening, thinking, speaking
  const [savedTimestamps, setSavedTimestamps] = useState([]);
  const [currentVideoTime, setCurrentVideoTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [followUpMode, setFollowUpMode] = useState(false);
  
  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);
  const videoRef = useRef(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: currentPatient } = useQuery({
    queryKey: ['selectedPatient'],
    queryFn: () => {
      const stored = localStorage.getItem('selectedPatient');
      return stored ? JSON.parse(stored) : null;
    }
  });

  const languages = [
    { code: "en-US", name: "English (US)" },
    { code: "en-IN", name: "English (India)" },
    { code: "hi-IN", name: "हिन्दी" },
    { code: "ta-IN", name: "தமிழ்" },
    { code: "te-IN", name: "తెలుగు" },
    { code: "kn-IN", name: "ಕನ್ನಡ" },
    { code: "ml-IN", name: "മലയാളം" },
    { code: "mr-IN", name: "मराठी" },
    { code: "gu-IN", name: "ગુજરાતી" },
    { code: "bn-IN", name: "বাংলা" }
  ];

  // Voice recognition setup
  useEffect(() => {
    if (!isActive) return;

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error("Speech recognition not supported in this browser");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      isListeningRef.current = true;
      setAvatarState("listening");
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setTranscript(transcript);
      handleVoiceCommand(transcript);
    };

    recognition.onerror = (event) => {
      if (event.error !== 'aborted' && event.error !== 'no-speech') {
        toast.error(`Recognition error: ${event.error}`);
      }
      setIsListening(false);
      isListeningRef.current = false;
      setAvatarState("idle");
    };

    recognition.onend = () => {
      if (isListeningRef.current) {
        try {
          recognition.start();
        } catch (e) {
          setIsListening(false);
          isListeningRef.current = false;
          setAvatarState("idle");
        }
      } else {
        setIsListening(false);
        setAvatarState("idle");
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
  }, [isActive, language]);

  const getContextPrompt = () => {
    let context = "";
    
    if (location.pathname.includes("Clinic")) {
      context = "The user is in Clinic Mode, managing patient records.";
      if (currentPatient) {
        context += ` Current patient: ${currentPatient.patient_name}, Age: ${currentPatient.age_years || 'N/A'}, Diagnosis: ${currentPatient.diagnosis || 'N/A'}.`;
      }
    } else if (location.pathname.includes("Calculator") || location.pathname.includes("GFR") || location.pathname.includes("Fluid")) {
      context = "The user is in Calculator/Clinical Tools mode.";
    }
    
    return context;
  };

  const detectActionType = (text) => {
    const lower = text.toLowerCase();
    
    if (lower.includes('calculate') || lower.includes('compute')) {
      if (lower.includes('gfr') || lower.includes('creatinine')) return 'calculate_gfr';
      if (lower.includes('dose') || lower.includes('drug')) return 'calculate_dose';
      if (lower.includes('fluid')) return 'calculate_fluids';
      if (lower.includes('bmi') || lower.includes('weight')) return 'calculate_bmi';
      return 'calculate_generic';
    }
    
    if (lower.includes('diet') || lower.includes('nutrition')) return 'create_diet';
    if (lower.includes('monitoring') || lower.includes('follow')) return 'suggest_monitoring';
    if (lower.includes('guideline') || lower.includes('protocol')) return 'cite_guideline';
    if (lower.includes('teach') || lower.includes('explain')) return 'teaching';
    if (lower.includes('appointment') || lower.includes('schedule')) return 'schedule';
    
    return 'general_query';
  };

  const handleVoiceCommand = async (text) => {
    setIsProcessing(true);
    setAvatarState("thinking");
    isListeningRef.current = false;
    setIsListening(false);

    try {
      recognitionRef.current?.stop();
    } catch (e) {}

    const userMessage = { 
      role: "user", 
      content: text, 
      timestamp: new Date().toISOString() 
    };
    setConversation(prev => [...prev, userMessage]);

    try {
      const actionType = detectActionType(text);
      setCurrentAction(actionType);

      // Check if user wants to save current moment
      if (text.toLowerCase().includes('save') || text.toLowerCase().includes('bookmark')) {
        const timestamp = {
          time: currentVideoTime,
          note: text,
          timestamp: new Date().toISOString()
        };
        setSavedTimestamps(prev => [...prev, timestamp]);
        toast.success("Timestamp saved!");
      }

      const contextPrompt = getContextPrompt();
      
      const systemPrompt = `You are a pediatric nephrology digital teaching companion with interactive video and voice capabilities.

CONTEXT: ${contextPrompt}
${followUpMode ? "This is a FOLLOW-UP question during video teaching." : ""}

USER COMMAND: "${text}"
DETECTED ACTION: ${actionType}

INTERACTIVE FEATURES:
- You can pause video to explain complex terms
- Users can ask follow-up questions anytime
- You can save important timestamps with notes
- Provide step-by-step explanations when asked

YOUR CAPABILITIES:
1. CALCULATIONS: Execute drug dose calculations, GFR, fluids, electrolytes, BMI
2. TEACHING: Explain guidelines (KDIGO, IPNA, ISPN), protocols, clinical concepts
3. CLINICAL GUIDANCE: Provide evidence-based recommendations
4. DIET PLANNING: Create renal-specific diet charts
5. MONITORING PLANS: Suggest follow-up schedules and lab monitoring
6. APPOINTMENT SCHEDULING: Help schedule patient appointments

RESPONSE GUIDELINES:
- For calculations: Provide step-by-step math with clear results
- For teaching: Use structured format (Definition → Significance → Key Points → Guidelines)
- For patient-specific queries: Use current patient context
- Keep voice responses concise (3-5 sentences), offer detailed written notes
- Always cite sources (KDIGO 2023, IPNA 2022, etc.)
- Flag critical alerts or red flags clearly

Respond conversationally and helpfully:`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: systemPrompt,
        add_context_from_internet: actionType === 'cite_guideline'
      });

      const assistantMessage = {
        role: "assistant",
        content: response,
        action: actionType,
        timestamp: new Date().toISOString()
      };

      setConversation(prev => [...prev, assistantMessage]);
      setAvatarState("speaking");
      speak(response);

      // Execute action if needed
      if (actionType !== 'general_query' && actionType !== 'teaching') {
        executeAction(actionType, text);
      }

    } catch (error) {
      const errorMsg = "I'm sorry, I encountered an error. Please try again.";
      setConversation(prev => [...prev, {
        role: "assistant",
        content: errorMsg,
        timestamp: new Date().toISOString()
      }]);
      speak(errorMsg);
    } finally {
      setIsProcessing(false);
      setTranscript("");
    }
  };

  const executeAction = (actionType, command) => {
    toast.info(`Executing: ${actionType.replace(/_/g, ' ')}`);
    
    // These would link to actual calculator/tool pages
    const actionMap = {
      calculate_gfr: '/SchwartzGFR',
      calculate_dose: '/DoseCalculator',
      calculate_fluids: '/FluidCalculator',
      calculate_bmi: '/Anthropometry',
      create_diet: '/DietChartGenerator',
      suggest_monitoring: '/MonitoringHub',
      cite_guideline: '/Guidelines'
    };

    if (actionMap[actionType]) {
      toast.success(`Opening ${actionType.replace(/_/g, ' ')} tool...`, {
        action: {
          label: 'Open',
          onClick: () => window.location.href = actionMap[actionType]
        }
      });
    }
  };

  const speak = (text) => {
    if (!window.speechSynthesis) return;

    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text.substring(0, 800));
      utterance.rate = voiceSpeed;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      utterance.lang = language;

      const voices = window.speechSynthesis.getVoices();
      const matchingVoice = voices.find(voice => voice.lang === language);
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        setAvatarState("speaking");
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setAvatarState("idle");
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        setAvatarState("idle");
      };

      setTimeout(() => window.speechSynthesis.speak(utterance), 100);
    } catch (e) {
      setIsSpeaking(false);
      setAvatarState("idle");
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
        toast.error("Could not start voice recognition");
      }
    }
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setAvatarState("idle");
      } catch (e) {}
    }
  };

  const getActionIcon = (action) => {
    const icons = {
      calculate_gfr: Activity,
      calculate_dose: Pill,
      calculate_fluids: Droplet,
      calculate_bmi: Activity,
      create_diet: User,
      suggest_monitoring: CheckCircle,
      cite_guideline: BookOpen,
      teaching: Brain,
      general_query: MessageCircle
    };
    return icons[action] || MessageCircle;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-3xl p-8 shadow-2xl text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              <Video className="w-9 h-9" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Digital Teaching Companion</h1>
              <p className="text-purple-100">AI-Powered Voice & Video Clinical Assistant</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-white/20 backdrop-blur">🎤 Voice Commands</Badge>
            <Badge className="bg-white/20 backdrop-blur">🎓 Interactive Teaching</Badge>
            <Badge className="bg-white/20 backdrop-blur">🧮 Live Calculations</Badge>
            <Badge className="bg-white/20 backdrop-blur">🌍 Multi-Language</Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="shadow-2xl border-2 border-purple-200">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Video className="w-5 h-5 text-purple-600" />
                    Video Agent
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSettings(!showSettings)}
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                {showSettings ? (
                  <div className="space-y-4">
                    <div>
                      <Label className="flex items-center gap-2 mb-2">
                        <Globe className="w-4 h-4" />
                        Language
                      </Label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {languages.map(lang => (
                            <SelectItem key={lang.code} value={lang.code}>
                              {lang.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="flex items-center gap-2 mb-2">
                        <Volume2 className="w-4 h-4" />
                        Voice Speed
                      </Label>
                      <Select value={voiceSpeed.toString()} onValueChange={(val) => setVoiceSpeed(parseFloat(val))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0.75">0.75x (Slower)</SelectItem>
                          <SelectItem value="1.0">1.0x (Normal)</SelectItem>
                          <SelectItem value="1.25">1.25x (Faster)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button onClick={() => setShowSettings(false)} className="w-full">
                      Done
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="relative bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl aspect-video flex items-center justify-center mb-6 overflow-hidden">
                      <div className={`absolute inset-0 transition-all duration-500 ${
                        avatarState === 'listening' ? 'bg-blue-500/20 animate-pulse' :
                        avatarState === 'thinking' ? 'bg-purple-500/20 animate-pulse' :
                        avatarState === 'speaking' ? 'bg-green-500/20 animate-pulse' :
                        'bg-slate-500/10'
                      }`} />
                      <div className="relative z-10 text-center">
                        <div className={`w-32 h-32 rounded-full mx-auto mb-4 flex items-center justify-center transition-all ${
                          avatarState === 'listening' ? 'bg-blue-500 animate-pulse scale-110' :
                          avatarState === 'thinking' ? 'bg-purple-500 animate-spin' :
                          avatarState === 'speaking' ? 'bg-green-500 animate-pulse scale-110' :
                          'bg-slate-400'
                        }`}>
                          {avatarState === 'listening' && <Mic className="w-16 h-16 text-white" />}
                          {avatarState === 'thinking' && <Brain className="w-16 h-16 text-white" />}
                          {avatarState === 'speaking' && <Volume2 className="w-16 h-16 text-white" />}
                          {avatarState === 'idle' && <Video className="w-16 h-16 text-white" />}
                        </div>
                        <Badge className="text-lg px-4 py-2">
                          {avatarState === 'listening' && '🎤 Listening...'}
                          {avatarState === 'thinking' && '🧠 Processing...'}
                          {avatarState === 'speaking' && '🗣️ Speaking...'}
                          {avatarState === 'idle' && '💤 Ready'}
                        </Badge>
                      </div>
                    </div>

                    {transcript && (
                      <Alert className="mb-4 bg-blue-50 border-blue-200">
                        <MessageCircle className="w-4 h-4 text-blue-600" />
                        <AlertDescription className="text-blue-900">
                          <strong>You said:</strong> {transcript}
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="flex gap-3 justify-center">
                      <Button
                        onClick={toggleListening}
                        disabled={isProcessing || isSpeaking}
                        size="lg"
                        className={`w-32 h-32 rounded-full ${
                          isListening 
                            ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                            : 'bg-purple-600 hover:bg-purple-700'
                        } shadow-2xl`}
                      >
                        {isListening ? (
                          <MicOff className="w-16 h-16" />
                        ) : (
                          <Mic className="w-16 h-16" />
                        )}
                      </Button>

                      <Button
                        onClick={stopSpeaking}
                        disabled={!isSpeaking}
                        size="lg"
                        variant="outline"
                        className="w-24 h-24 rounded-full"
                      >
                        <VolumeX className="w-12 h-12" />
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="shadow-lg border-2 border-blue-200">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Quick Commands
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                {[
                  { cmd: "Calculate GFR for 5-year-old", icon: Activity },
                  { cmd: "Drug dose for tacrolimus", icon: Pill },
                  { cmd: "Create diet chart", icon: User },
                  { cmd: "Explain KDIGO AKI staging", icon: BookOpen },
                  { cmd: "Suggest monitoring plan", icon: CheckCircle }
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start h-auto py-3 text-left hover:bg-blue-50"
                      onClick={() => handleVoiceCommand(item.cmd)}
                    >
                      <Icon className="w-4 h-4 mr-2 text-blue-600" />
                      <span className="text-xs">{item.cmd}</span>
                    </Button>
                  );
                })}
              </CardContent>
            </Card>

            {currentPatient && (
              <Card className="shadow-lg border-2 border-green-200">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <User className="w-4 h-4 text-green-600" />
                    Current Patient
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="font-semibold text-slate-900">{currentPatient.patient_name}</p>
                  <p className="text-xs text-slate-600">Age: {currentPatient.age_years || 'N/A'}</p>
                  <p className="text-xs text-slate-600">Diagnosis: {currentPatient.diagnosis || 'N/A'}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {conversation.length > 0 && (
          <Card className="shadow-xl border-2 border-slate-200">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-purple-600" />
                Conversation Log
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 max-h-[400px] overflow-y-auto">
              <div className="space-y-4">
                {conversation.map((msg, idx) => {
                  const ActionIcon = msg.action ? getActionIcon(msg.action) : MessageCircle;
                  return (
                    <div
                      key={idx}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-4 rounded-2xl ${
                          msg.role === 'user'
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-100 text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {msg.role === 'user' ? (
                            <Mic className="w-4 h-4" />
                          ) : (
                            <ActionIcon className="w-4 h-4" />
                          )}
                          <span className="text-xs font-semibold">
                            {msg.role === 'user' ? 'You' : 'AI Companion'}
                          </span>
                          {msg.action && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              {msg.action.replace(/_/g, ' ')}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        <p className="text-xs opacity-70 mt-2">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}