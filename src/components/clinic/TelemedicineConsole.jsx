import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Video, VideoOff, Mic, MicOff, MonitorUp,
  Phone, FileText, Shield
} from 'lucide-react';
import { toast } from 'sonner';
import AIScribe from './AIScribe';

export default function TelemedicineConsole({ patient, onSessionData }) {
  const [sessionActive, setSessionActive] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [scribeActive, setScribeActive] = useState(false);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);

  const startSession = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error('Your browser does not support video calls');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      setSessionActive(true);
      toast.success('Telemedicine session started');
    } catch (error) {
      console.error('Session start error:', error);
      
      if (error.name === 'NotFoundError') {
        toast.error('Camera or microphone not found. Please check your device.');
      } else if (error.name === 'NotAllowedError') {
        toast.error('Camera/microphone access denied. Please allow permissions.');
      } else {
        toast.error('Failed to start session. Please check your camera/mic.');
      }
    }
  };

  const endSession = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    setSessionActive(false);
    setScribeActive(false);
    toast.info('Session ended');
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setVideoEnabled(videoTrack.enabled);
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setAudioEnabled(audioTrack.enabled);
    }
  };

  const startScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      setScreenSharing(true);
      toast.success('Screen sharing started');
      
      screenStream.getVideoTracks()[0].onended = () => {
        setScreenSharing(false);
      };
    } catch (error) {
      toast.error('Screen sharing failed');
    }
  };

  return (
    <Card className="border-2 border-indigo-300">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5 text-indigo-600" />
            Secure Telemedicine
          </CardTitle>
          <Badge className="bg-green-500 text-white">
            <Shield className="w-3 h-3 mr-1" />
            End-to-End Encrypted
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {patient && (
          <Alert className="bg-blue-50 border-blue-200">
            <AlertDescription className="text-blue-900">
              <strong>Patient:</strong> {patient.patient_name} ({patient.cr_number})
            </AlertDescription>
          </Alert>
        )}

        {!sessionActive ? (
          <div className="text-center py-12">
            <Video className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 mb-4">Start a secure video consultation</p>
            <Button onClick={startSession} className="bg-gradient-to-r from-indigo-600 to-purple-600">
              <Video className="w-4 h-4 mr-2" />
              Start Video Call
            </Button>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative bg-slate-900 rounded-lg overflow-hidden aspect-video">
                <video 
                  ref={localVideoRef} 
                  autoPlay 
                  muted 
                  playsInline
                  className="w-full h-full object-cover"
                />
                <Badge className="absolute bottom-2 left-2 bg-blue-600 text-white">
                  You
                </Badge>
              </div>
              
              <div className="relative bg-slate-900 rounded-lg overflow-hidden aspect-video">
                <video 
                  ref={remoteVideoRef} 
                  autoPlay 
                  playsInline
                  className="w-full h-full object-cover"
                />
                <Badge className="absolute bottom-2 left-2 bg-green-600 text-white">
                  {patient?.patient_name || 'Patient'}
                </Badge>
              </div>
            </div>

            <div className="flex gap-2 justify-center">
              <Button
                size="lg"
                variant={videoEnabled ? "default" : "destructive"}
                onClick={toggleVideo}
              >
                {videoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </Button>
              <Button
                size="lg"
                variant={audioEnabled ? "default" : "destructive"}
                onClick={toggleAudio}
              >
                {audioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </Button>
              <Button
                size="lg"
                variant={screenSharing ? "default" : "outline"}
                onClick={startScreenShare}
              >
                <MonitorUp className="w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant={scribeActive ? "default" : "outline"}
                onClick={() => setScribeActive(!scribeActive)}
              >
                <FileText className="w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="destructive"
                onClick={endSession}
              >
                <Phone className="w-5 h-5" />
              </Button>
            </div>

            {scribeActive && (
              <AIScribe
                onTranscriptComplete={(data) => {
                  onSessionData?.({
                    ...data,
                    session_type: 'telemedicine',
                    session_date: new Date().toISOString()
                  });
                  toast.success('Consultation documented via AI Scribe');
                }}
                autoFillEnabled={true}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}