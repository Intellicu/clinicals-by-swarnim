import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Bell, Send, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/client';
import { toast } from 'sonner';

export default function FollowUpScheduler({ patientId, patientEmail, patientName, diagnosis }) {
  const [followUpDate, setFollowUpDate] = useState('');
  const [reminderNote, setReminderNote] = useState('');
  const [scheduled, setScheduled] = useState(false);

  const scheduleFollowUp = async () => {
    if (!followUpDate) {
      toast.error('Please select a follow-up date');
      return;
    }

    try {
      // Send reminder email if patient has email
      if (patientEmail) {
        const emailBody = `Dear ${patientName},

This is a reminder for your follow-up appointment scheduled on ${new Date(followUpDate).toLocaleDateString()}.

Diagnosis: ${diagnosis || 'As discussed'}

${reminderNote ? `Additional Notes:\n${reminderNote}` : ''}

Please bring all previous reports and medications.

If you need to reschedule, please contact the clinic.

Best regards,
Your Healthcare Team`;

        await base44.integrations.Core.SendEmail({
          to: patientEmail,
          subject: `Follow-up Appointment Reminder - ${new Date(followUpDate).toLocaleDateString()}`,
          body: emailBody
        });
      }

      setScheduled(true);
      toast.success('Follow-up scheduled and reminder sent!');
    } catch (error) {
      console.error('Scheduling error:', error);
      toast.error('Failed to send reminder');
    }
  };

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader className="bg-blue-50 border-b">
        <CardTitle className="text-sm flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          Schedule Follow-up
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div>
          <Label className="text-xs">Follow-up Date</Label>
          <Input
            type="date"
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-xs">Reminder Note (Optional)</Label>
          <Textarea
            value={reminderNote}
            onChange={(e) => setReminderNote(e.target.value)}
            placeholder="Bring lab reports, fasting required, etc."
            className="mt-1 h-16 text-sm"
          />
        </div>

        {!scheduled ? (
          <Button
            onClick={scheduleFollowUp}
            disabled={!followUpDate}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
          >
            <Send className="w-4 h-4 mr-2" />
            Schedule & Send Reminder
          </Button>
        ) : (
          <div className="bg-green-50 p-3 rounded border-2 border-green-300 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div className="flex-1">
              <div className="font-semibold text-green-900 text-sm">Scheduled!</div>
              <div className="text-xs text-green-700">{new Date(followUpDate).toLocaleDateString()}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}