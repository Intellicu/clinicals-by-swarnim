import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mic, Square, Loader2, Languages, FileText } from 'lucide-react';
import { base44 } from '@/api/client';
import { toast } from 'sonner';

export default function AIScribe({ onTranscriptComplete, autoFillEnabled = true }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [rawTranscript, setRawTranscript] = useState('');
  const [language, setLanguage] = useState('en-US');
  const recognitionRef = useRef(null);

  const languages = [
    { code: 'en-US', name: 'English' },
    { code: 'hi-IN', name: 'Hindi (हिन्दी)' },
    { code: 'bn-IN', name: 'Bengali (বাংলা)' },
    { code: 'ta-IN', name: 'Tamil (தமிழ்)' },
    { code: 'te-IN', name: 'Telugu (తెలుగు)' },
    { code: 'mr-IN', name: 'Marathi (मराठी)' }
  ];

  React.useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = language;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let fullTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        fullTranscript += event.results[i][0].transcript + ' ';
      }
      setRawTranscript(fullTranscript);
    };

    recognition.onerror = (event) => {
      if (event.error !== 'aborted' && event.error !== 'no-speech') {
        toast.error(`Recognition error: ${event.error}`);
      }
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      if (rawTranscript.trim()) {
        processTranscript(rawTranscript);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, [language]);

  const startRecording = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition not supported in this browser. Use Chrome, Edge, or Safari.');
      return;
    }

    setRawTranscript('');
    setTranscript('');
    try {
      recognitionRef.current.start();
      setIsRecording(true);
      toast.success('Recording started - speak clearly...');
    } catch (error) {
      console.error('Recognition error:', error);
      toast.error('Could not start recording. Please try again.');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
  };

  const processTranscript = async (rawText) => {
    setIsProcessing(true);
    try {
      const languageName = languages.find(l => l.code === language)?.name || 'English';
      const isNonEnglish = !language.startsWith('en');
      
      const prompt = `${isNonEnglish ? 'TRANSLATE TO ENGLISH and then s' : 'S'}tructure this medical consultation transcript.

RAW TRANSCRIPT (${languageName}):
${rawText}

${isNonEnglish ? 'First translate everything to English medical terminology, then e' : 'E'}xtract and organize into:
- Chief Complaint (concise, in English)
- History of Present Illness (detailed, in English)
- Past Medical History (in English)
- Family History (in English)  
- Physical Examination findings (in English)
- Assessment/Impression (in English)
- Plan (in English)

Convert all regional language terms to proper English medical terminology. Be thorough and professional.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            chiefComplaint: { type: 'string' },
            presentingComplaints: { type: 'string' },
            pastHistory: { type: 'string' },
            familyHistory: { type: 'string' },
            general: { type: 'string' },
            cardiovascular: { type: 'string' },
            respiratory: { type: 'string' },
            abdomen: { type: 'string' },
            nervous: { type: 'string' },
            diagnosis: { type: 'string' },
            plan: { type: 'string' }
          }
        }
      });

      setTranscript(JSON.stringify(response, null, 2));
      
      if (autoFillEnabled) {
        // Smooth delayed insertion to avoid UI shake
        setTimeout(() => {
          onTranscriptComplete?.(response);
          toast.success('✅ Transcription inserted smoothly!', { id: 'transcribe' });
        }, 300);
      } else {
        toast.success('Transcription complete!', { id: 'transcribe' });
      }
    } catch (error) {
      console.error('Processing error:', error);
      toast.error('Failed to structure transcript');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="bg-white shadow-lg border-2 border-purple-200">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
        <CardTitle className="flex items-center gap-2">
          <Languages className="w-5 h-5 text-purple-600" />
          AI Medical Scribe (Multilingual)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-4">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {!isRecording ? (
            <Button
              onClick={startRecording}
              disabled={isProcessing}
              className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
            >
              <Mic className="w-5 h-5 mr-2" />
              Start Recording
            </Button>
          ) : (
            <Button
              onClick={stopRecording}
              className="flex-1 bg-gradient-to-r from-gray-600 to-slate-600 hover:from-gray-700 hover:to-slate-700 animate-pulse"
            >
              <Square className="w-5 h-5 mr-2" />
              Stop Recording
            </Button>
          )}
        </div>

        <Alert className="bg-blue-50 border-blue-200">
          <FileText className="w-4 h-4 text-blue-600" />
          <AlertDescription className="text-blue-800 text-sm">
            <strong>How to use:</strong> Select language, click "Start Recording", conduct your consultation naturally, then click "Stop" when done. AI will structure the conversation into clinical format.
          </AlertDescription>
        </Alert>

        {isRecording && (
          <Alert className="bg-red-50 border-red-300 animate-pulse">
            <Mic className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-900">
              <strong>Recording in progress...</strong> Speak clearly about the patient consultation.
            </AlertDescription>
          </Alert>
        )}

        {rawTranscript && !isProcessing && (
          <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
            <strong className="text-blue-900 text-sm">Raw Transcript:</strong>
            <p className="text-sm text-slate-700 mt-2">{rawTranscript}</p>
          </div>
        )}

        {isProcessing && (
          <Alert className="bg-blue-50 border-blue-300">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <AlertDescription className="text-blue-900">
              Processing audio and generating structured transcript...
            </AlertDescription>
          </Alert>
        )}

        {transcript && (
          <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-green-600" />
              <strong className="text-green-900">Structured Transcript:</strong>
            </div>
            <pre className="whitespace-pre-wrap text-sm text-slate-700">{transcript}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}