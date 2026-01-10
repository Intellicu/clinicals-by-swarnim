import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Printer, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function PrescriptionPrintCustomizer({ formData, patient, printSections, setPrintSections }) {
  const generatePrintView = () => {
    const printData = [];

    if (printSections.history) {
      printData.push(`CHIEF COMPLAINT:\n${formData.chiefComplaint || 'N/A'}\n`);
      printData.push(`HISTORY:\n${formData.presentingComplaints || 'N/A'}\n`);
    }

    if (printSections.vitals) {
      printData.push(`VITALS:\nTemp: ${formData.temperature}°C, BP: ${formData.bp_systolic}/${formData.bp_diastolic} mmHg\nHR: ${formData.heartRate} bpm, RR: ${formData.respiratoryRate}\n`);
    }

    if (printSections.examination) {
      printData.push(`EXAMINATION:\n${formData.general || 'N/A'}\n`);
    }

    if (printSections.labs && formData.lab_results) {
      printData.push(`LABS:\n${JSON.stringify(formData.lab_results, null, 2)}\n`);
    }

    if (printSections.diagnosis) {
      printData.push(`DIAGNOSIS:\n${formData.diagnosis || 'N/A'}\n`);
    }

    if (printSections.medications && formData.prescriptions?.length > 0) {
      printData.push(`MEDICATIONS:\n${formData.prescriptions.map((m, i) => `${i+1}. ${m.drug} - ${m.dose}, ${m.frequency}`).join('\n')}\n`);
    }

    if (printSections.followUp) {
      printData.push(`FOLLOW-UP:\nNext visit as scheduled\n`);
    }

    const printContent = printData.join('\n');
    
    // Open print window
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Prescription - ${patient.patient_name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            h1 { color: #1e40af; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
            pre { white-space: pre-wrap; font-family: inherit; }
          </style>
        </head>
        <body>
          <h1>CliniCals Prescription</h1>
          <p><strong>Patient:</strong> ${patient.patient_name} (${patient.cr_number})</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          <hr />
          <pre>${printContent}</pre>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
    toast.success('Print preview opened');
  };

  return (
    <Card className="border-2 border-slate-200">
      <CardHeader className="bg-slate-50 border-b">
        <CardTitle className="text-base flex items-center gap-2">
          <Printer className="w-4 h-4 text-slate-600" />
          Print Prescription Options
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: 'history', label: 'History' },
            { key: 'vitals', label: 'Vitals' },
            { key: 'examination', label: 'Examination' },
            { key: 'labs', label: 'Lab Results' },
            { key: 'diagnosis', label: 'Diagnosis' },
            { key: 'medications', label: 'Medications' },
            { key: 'followUp', label: 'Follow-up' }
          ].map((section) => (
            <div key={section.key} className="flex items-center gap-2">
              <Checkbox
                id={section.key}
                checked={printSections[section.key]}
                onCheckedChange={(checked) => setPrintSections({...printSections, [section.key]: checked})}
              />
              <Label htmlFor={section.key} className="text-sm cursor-pointer">
                {section.label}
              </Label>
            </div>
          ))}
        </div>

        <Button
          onClick={generatePrintView}
          className="w-full bg-gradient-to-r from-slate-600 to-gray-600"
        >
          <Printer className="w-4 h-4 mr-2" />
          Generate Prescription Print
        </Button>
      </CardContent>
    </Card>
  );
}