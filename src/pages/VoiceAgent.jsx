import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Mic, MicOff, Volume2, VolumeX, Loader2, AlertCircle, 
  BookOpen, Calculator, Brain, GraduationCap, Settings,
  Globe, Sparkles
} from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function VoiceAgent() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [conversation, setConversation] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState("assistant"); // assistant, teaching, calculator
  const [language, setLanguage] = useState("en-US");
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);
  const [showSettings, setShowSettings] = useState(false);
  
  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);

  const languages = [
    { code: "en-US", name: "English (US)" },
    { code: "en-IN", name: "English (India)" },
    { code: "hi-IN", name: "हिन्दी (Hindi)" },
    { code: "ta-IN", name: "தமிழ் (Tamil)" },
    { code: "te-IN", name: "తెలుగు (Telugu)" },
    { code: "kn-IN", name: "ಕನ್ನಡ (Kannada)" },
    { code: "ml-IN", name: "മലയാളം (Malayalam)" },
    { code: "mr-IN", name: "मराठी (Marathi)" },
    { code: "gu-IN", name: "ગુજરાતી (Gujarati)" },
    { code: "bn-IN", name: "বাংলা (Bengali)" }
  ];

  const quickCommands = {
    assistant: [
      "Calculate eGFR for a 5-year-old",
      "Explain KDIGO AKI staging",
      "Drug dose for tacrolimus",
      "Guidelines for nephrotic syndrome"
    ],
    teaching: [
      "Teach me about RTA classification",
      "Explain CKD staging",
      "What are the indications for dialysis?",
      "How do I manage hyperkalemia?"
    ],
    calculator: [
      "Calculate fluid maintenance",
      "Schwartz GFR formula",
      "Sodium correction calculator",
      "Drug dosing for 20 kg child"
    ]
  };

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError("Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setError(null);
      isListeningRef.current = true;
    };

    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      setTranscript(speechResult);
      handleVoiceInput(speechResult);
    };

    recognition.onerror = (event) => {
      if (event.error !== 'aborted' && event.error !== 'no-speech') {
        setError(`Recognition error: ${event.error}`);
      }
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
        } catch (e) {
          // Ignore cleanup errors
        }
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [language]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setError("Speech recognition not initialized");
      return;
    }

    if (isListening) {
      isListeningRef.current = false;
      setIsListening(false);
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore
      }
    } else {
      setTranscript("");
      setError(null);
      isListeningRef.current = true;
      setIsListening(true);
      try {
        recognitionRef.current.start();
      } catch (e) {
        setError("Could not start speech recognition. Please try again.");
        setIsListening(false);
        isListeningRef.current = false;
      }
    }
  };

  const handleVoiceInput = async (text) => {
    setIsProcessing(true);
    isListeningRef.current = false;
    setIsListening(false);

    try {
      recognitionRef.current?.stop();
    } catch (e) {
      // Ignore
    }

    const userMessage = { role: "user", content: text, timestamp: new Date().toISOString() };
    setConversation(prev => [...prev, userMessage]);

    try {
      // Enhanced AI prompt with action detection and teaching capabilities
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a pediatric nephrology digital teaching companion and clinical assistant with voice interaction capabilities.

USER REQUEST: "${text}"

YOUR CAPABILITIES:
1. TEACHING MODE: Explain guidelines (KDIGO, IPNA, ISPN), clinical scenarios, step-by-step protocols
2. CALCULATIONS: Guide users to calculators (GFR, drug doses, fluids, electrolytes)
3. CLINICAL QUERIES: Provide evidence-based guidance on diagnoses, treatments, monitoring
4. DIET PLANNING: Suggest dietary modifications for renal patients
5. GUIDELINE NAVIGATION: Cite and explain specific guideline recommendations

RESPONSE FORMAT:
- Keep responses conversational and concise (2-4 sentences max for voice)
- For complex topics, offer to provide detailed written notes
- If the request requires a calculator, say: "I'll help you calculate that. For [calculation name], you need [inputs]. Would you like me to walk you through it?"
- For teaching requests, structure as: Definition → Clinical significance → Key points → Guidelines reference
- For drug doses: Provide weight-based calculation, renal adjustment if needed, and key monitoring parameters

IMPORTANT: Be warm, supportive, and conversational. This is voice interaction, so keep it natural and easy to understand.

Provide your response now:`,
        add_context_from_internet: false
      });

      // Detect if action is needed
      let actionPerformed = null;
      const lowerText = text.toLowerCase();
      
      if (lowerText.includes('calculate') || lowerText.includes('dose') || lowerText.includes('gfr')) {
        actionPerformed = "calculation_suggested";
      } else if (lowerText.includes('guideline') || lowerText.includes('protocol')) {
        actionPerformed = "guideline_referenced";
      } else if (lowerText.includes('teach') || lowerText.includes('explain')) {
        actionPerformed = "teaching_mode";
      }

      const assistantMessage = { 
        role: "assistant", 
        content: response, 
        timestamp: new Date().toISOString(),
        action: actionPerformed
      };
      setConversation(prev => [...prev, assistantMessage]);

      speak(response);
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

  const speak = (text) => {
    if (!window.speechSynthesis) {
      return;
    }

    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = voiceSpeed;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      utterance.lang = language;

      // Try to find a voice that matches the language
      const voices = window.speechSynthesis.getVoices();
      const matchingVoice = voices.find(voice => voice.lang === language);
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 100);
    } catch (e) {
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } catch (e) {
        // Ignore
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
            <Mic className="w-9 h-9 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Voice AI Assistant</h1>
            <p className="text-slate-600 mt-1">Ask clinical questions using your voice</p>
          </div>
        </div>

        {error && (
          <Alert className="bg-red-50 border-red-300">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <AlertDescription className="text-red-900">{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={mode} onValueChange={setMode} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="assistant" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Assistant
            </TabsTrigger>
            <TabsTrigger value="teaching" className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              Teaching
            </TabsTrigger>
            <TabsTrigger value="calculator" className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Calculator
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Alert className="bg-blue-50 border-blue-200">
          <AlertCircle className="w-5 h-5 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>{mode === "teaching" ? "Teaching Mode" : mode === "calculator" ? "Calculator Mode" : "Assistant Mode"}:</strong> 
            {mode === "teaching" && " Ask me to explain guidelines, protocols, or teach you clinical concepts."}
            {mode === "calculator" && " Request calculations like drug doses, GFR, fluids, or electrolytes."}
            {mode === "assistant" && " General clinical questions, quick consultations, and guidance."}
          </AlertDescription>
        </Alert>

        <Card className="bg-white shadow-2xl border-2 border-purple-200">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b-2">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                Voice Controls
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                  className="h-8 w-8 p-0"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </span>
              <div className="flex gap-2">
                {isListening && (
                  <Badge className="bg-red-600 text-white animate-pulse">
                    <Mic className="w-3 h-3 mr-1" />
                    Listening...
                  </Badge>
                )}
                {isSpeaking && (
                  <Badge className="bg-purple-600 text-white animate-pulse">
                    <Volume2 className="w-3 h-3 mr-1" />
                    Speaking...
                  </Badge>
                )}
                {isProcessing && (
                  <Badge className="bg-blue-600 text-white">
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Processing...
                  </Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {showSettings && (
              <Card className="mb-6 bg-slate-50">
                <CardContent className="p-4 space-y-4">
                  <div>
                    <Label className="text-sm font-semibold mb-2 flex items-center gap-2">
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
                    <Label className="text-sm font-semibold mb-2 flex items-center gap-2">
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
                        <SelectItem value="1.5">1.5x (Very Fast)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={() => setShowSettings(false)} 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                  >
                    Done
                  </Button>
                </CardContent>
              </Card>
            )}
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={toggleListening}
                disabled={isProcessing || isSpeaking}
                size="lg"
                className={`w-32 h-32 rounded-full ${
                  isListening 
                    ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                    : 'bg-purple-600 hover:bg-purple-700'
                } shadow-2xl transition-all`}
              >
                {isListening ? (
                  <MicOff className="w-16 h-16 text-white" />
                ) : (
                  <Mic className="w-16 h-16 text-white" />
                )}
              </Button>

              <Button
                onClick={stopSpeaking}
                disabled={!isSpeaking}
                size="lg"
                variant="outline"
                className="w-24 h-24 rounded-full border-2"
              >
                {isSpeaking ? (
                  <VolumeX className="w-12 h-12" />
                ) : (
                  <Volume2 className="w-12 h-12 text-slate-400" />
                )}
              </Button>
            </div>

            {transcript && (
              <div className="mt-6 p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                <p className="text-sm text-purple-900 font-semibold mb-1">You said:</p>
                <p className="text-lg text-slate-900">{transcript}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {conversation.length === 0 && !showSettings && (
          <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-6 h-6 text-purple-600" />
                <h3 className="font-bold text-slate-900">Quick Commands</h3>
              </div>
              <div className="space-y-2">
                {quickCommands[mode].map((cmd, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-3 hover:bg-purple-100"
                    onClick={() => {
                      setTranscript(cmd);
                      handleVoiceInput(cmd);
                    }}
                  >
                    <span className="text-sm text-slate-700">{cmd}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {conversation.length > 0 && (
          <Card className="bg-white shadow-xl border-2 border-slate-200">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="flex items-center gap-2">
                {mode === "teaching" && <GraduationCap className="w-5 h-5 text-purple-600" />}
                {mode === "calculator" && <Calculator className="w-5 h-5 text-blue-600" />}
                {mode === "assistant" && <Brain className="w-5 h-5 text-indigo-600" />}
                Conversation History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 max-h-[500px] overflow-y-auto">
              <div className="space-y-4">
                {conversation.map((msg, idx) => (
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
                      <div className="flex items-center gap-2 mb-1">
                        {msg.role === 'user' ? (
                          <Mic className="w-4 h-4" />
                        ) : (
                          <Volume2 className="w-4 h-4" />
                        )}
                        <span className="text-xs font-semibold">
                          {msg.role === 'user' ? 'You' : 'AI Assistant'}
                        </span>
                        {msg.action && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            {msg.action === "teaching_mode" && <BookOpen className="w-3 h-3 mr-1" />}
                            {msg.action === "calculation_suggested" && <Calculator className="w-3 h-3 mr-1" />}
                            {msg.action === "guideline_referenced" && <BookOpen className="w-3 h-3 mr-1" />}
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
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Alert className="bg-amber-50 border-amber-200">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          <AlertDescription className="text-amber-900">
            <strong>Browser Compatibility:</strong> Voice features work best in Chrome, Edge, and Safari. Firefox has limited support. Ensure microphone permissions are granted.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}