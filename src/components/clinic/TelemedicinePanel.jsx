import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Video, Phone, MessageSquare, Calendar, Clock, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function TelemedicinePanel() {
  const [whatsappConnected, setWhatsappConnected] = useState(false);

  const handleWhatsAppConnect = () => {
    const whatsappURL = `https://wa.me/?text=${encodeURIComponent('Connect to CliniCals WhatsApp Bot for appointment reminders and queries')}`;
    window.open(whatsappURL, '_blank');
    toast.success('WhatsApp bot opened!');
  };

  const startVideoCall = () => {
    toast.info('Video consultation feature - integrate with your preferred telemedicine platform');
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            <MessageSquare className="w-5 h-5" />
            WhatsApp Patient Communication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Alert className="bg-white border-green-300">
            <AlertDescription className="text-sm">
              <strong>Automated Features:</strong>
              <ul className="ml-4 mt-2 space-y-1 text-xs">
                <li>• Appointment reminders 24h before visit</li>
                <li>• Lab report notifications</li>
                <li>• Medication refill reminders</li>
                <li>• Basic Q&A (diet, medications, symptoms)</li>
              </ul>
            </AlertDescription>
          </Alert>

          <Button
            onClick={handleWhatsAppConnect}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Connect WhatsApp Bot
          </Button>

          {whatsappConnected && (
            <Badge className="w-full justify-center bg-green-500 text-white">
              ✓ WhatsApp Bot Active
            </Badge>
          )}
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Video className="w-5 h-5" />
            Telemedicine Consultation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={startVideoCall}
              variant="outline"
              className="border-2 border-blue-300 hover:bg-blue-50"
            >
              <Video className="w-4 h-4 mr-2" />
              Video Call
            </Button>
            <Button
              variant="outline"
              className="border-2 border-blue-300 hover:bg-blue-50"
            >
              <Phone className="w-4 h-4 mr-2" />
              Voice Call
            </Button>
          </div>

          <Alert className="bg-white border-blue-300">
            <Clock className="w-4 h-4 text-blue-600" />
            <AlertDescription className="text-xs text-blue-900">
              <strong>Next Teleconsultation:</strong> Configure your schedule in Settings
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card className="border-2 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-900 text-sm">
            <Calendar className="w-4 h-4" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button size="sm" variant="outline" className="w-full justify-start text-xs">
              <Users className="w-3 h-3 mr-2" />
              Send Bulk Appointment Reminders
            </Button>
            <Button size="sm" variant="outline" className="w-full justify-start text-xs">
              <MessageSquare className="w-3 h-3 mr-2" />
              Broadcast Health Tips (WhatsApp)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}