import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Video, Pause, Play, Square, Volume2, Bookmark } from "lucide-react";
import { toast } from "sonner";

export default function EnhancedVideoAgent({ onClose }) {
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [savedTimestamps, setSavedTimestamps] = useState([]);
  const [avatarState, setAvatarState] = useState("idle");

  const recognitionRef = useRef(null);

  const handleVoiceCommand = async (text) => {
    if (text.toLowerCase().includes('pause') || text.toLowerCase().includes('stop')) {
      setIsPaused(true);
      setAvatarState("idle");
      window.speechSynthesis.cancel();
      toast.info("Video paused");
      return;
    }

    if (text.toLowerCase().includes('resume') || text.toLowerCase().includes('continue')) {
      setIsPaused(false);
      setAvatarState("speaking");
      toast.info("Video resumed");
      return;
    }

    if (text.toLowerCase().includes('bookmark') || text.toLowerCase().includes('save')) {
      const timestamp = {
        time: new Date().toISOString(),
        note: text,
        timestamp: Date.now()
      };
      setSavedTimestamps(prev => [...prev, timestamp]);
      toast.success("Timestamp saved!");
      return;
    }

    setAvatarState("thinking");
    
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Interactive video teaching: "${text}". Provide concise, clear explanation. If complex term mentioned, offer to pause and explain.`
      });

      speak(response);
    } catch (error) {
      toast.error("Error processing command");
    }
  };

  const speak = (text) => {
    if (!window.speechSynthesis) return;
    
    const utterance = new SpeechSynthesisUtterance(text.substring(0, 500));
    utterance.onstart = () => {
      setIsSpeaking(true);
      setAvatarState("speaking");
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setAvatarState("idle");
    };
    
    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      recognitionRef.current?.stop();
    } else {
      setIsListening(true);
      setAvatarState("listening");
      // Voice recognition would start here
      toast.info("Listening...");
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
    if (!isPaused) {
      window.speechSynthesis.cancel();
      setAvatarState("idle");
    }
  };

  const stopAll = () => {
    setIsListening(false);
    setIsPaused(true);
    window.speechSynthesis.cancel();
    recognitionRef.current?.stop();
    setAvatarState("idle");
  };

  return (
    <Card className="shadow-2xl border-2 border-purple-200">
      <CardContent className="p-6">
        <div className="relative bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl aspect-video flex items-center justify-center mb-4">
          <div className={`w-32 h-32 rounded-full flex items-center justify-center ${
            avatarState === 'listening' ? 'bg-blue-500 animate-pulse' :
            avatarState === 'thinking' ? 'bg-purple-500 animate-spin' :
            avatarState === 'speaking' ? 'bg-green-500 animate-pulse' :
            'bg-slate-400'
          }`}>
            {avatarState === 'listening' && <Mic className="w-16 h-16 text-white" />}
            {avatarState === 'thinking' && <Video className="w-16 h-16 text-white" />}
            {avatarState === 'speaking' && <Volume2 className="w-16 h-16 text-white" />}
            {avatarState === 'idle' && <Video className="w-16 h-16 text-white" />}
          </div>
          <Badge className="absolute top-3 right-3">
            {avatarState}
          </Badge>
        </div>

        <div className="flex gap-2 justify-center mb-4">
          <Button
            onClick={toggleListening}
            size="lg"
            className={`rounded-full ${isListening ? 'bg-red-600' : 'bg-purple-600'}`}
          >
            {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </Button>
          
          <Button onClick={togglePause} size="lg" variant="outline" className="rounded-full">
            {isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
          </Button>
          
          <Button onClick={stopAll} size="lg" variant="outline" className="rounded-full">
            <Square className="w-6 h-6" />
          </Button>

          <Button
            onClick={() => handleVoiceCommand("bookmark this moment")}
            size="lg"
            variant="outline"
            className="rounded-full"
          >
            <Bookmark className="w-6 h-6" />
          </Button>
        </div>

        {savedTimestamps.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Saved Bookmarks:</h4>
            {savedTimestamps.slice(-3).map((ts, idx) => (
              <div key={idx} className="text-xs p-2 bg-purple-50 rounded border">
                {new Date(ts.time).toLocaleTimeString()}: {ts.note}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}