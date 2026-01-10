import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Languages, Loader2, Copy } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function PrescriptionTranslator({ prescriptionText }) {
  const [translatedText, setTranslatedText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('hi');
  const [isTranslating, setIsTranslating] = useState(false);

  const languages = [
    { code: 'hi', name: 'Hindi (हिंदी)' },
    { code: 'bn', name: 'Bengali (বাংলা)' },
    { code: 'ta', name: 'Tamil (தமிழ்)' },
    { code: 'te', name: 'Telugu (తెలుగు)' },
    { code: 'mr', name: 'Marathi (मराठी)' },
    { code: 'gu', name: 'Gujarati (ગુજરાતી)' },
    { code: 'kn', name: 'Kannada (ಕನ್ನಡ)' },
    { code: 'ml', name: 'Malayalam (മലയാളം)' }
  ];

  const translatePrescription = async () => {
    setIsTranslating(true);
    try {
      const languageName = languages.find(l => l.code === targetLanguage)?.name || 'Hindi';
      
      const prompt = `Translate this medical prescription from English to ${languageName}. 

Make it SIMPLE and EASY TO UNDERSTAND for patients with basic literacy. Use common words, not medical jargon.

Prescription:
${prescriptionText}

Instructions:
1. Translate drug names (keep English + add ${languageName} pronunciation in brackets if helpful)
2. Translate dosage instructions in SIMPLE ${languageName}
3. Use everyday language for timing (e.g., सुबह = morning, शाम = evening)
4. Add clear instructions like "खाने के बाद" (after food) or "खाली पेट" (empty stomach)
5. Include warnings in simple ${languageName}

Format clearly with line breaks. Make it look like a prescription a patient can follow easily.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            translated_prescription: { type: 'string' },
            simplified_instructions: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      setTranslatedText(response.translated_prescription || 'Translation failed');
      toast.success('Prescription translated!');
    } catch (error) {
      console.error('Translation error:', error);
      toast.error('Translation failed. Check your internet connection.');
    } finally {
      setIsTranslating(false);
    }
  };

  const copyTranslation = () => {
    navigator.clipboard.writeText(translatedText);
    toast.success('Copied to clipboard!');
  };

  return (
    <Card className="bg-white shadow-lg border-2 border-indigo-200">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
        <CardTitle className="flex items-center gap-2">
          <Languages className="w-5 h-5 text-indigo-600" />
          Prescription Translator
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-4">
          <Select value={targetLanguage} onValueChange={setTargetLanguage}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={translatePrescription}
            disabled={isTranslating || !prescriptionText}
            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            {isTranslating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Translating...
              </>
            ) : (
              <>
                <Languages className="w-5 h-5 mr-2" />
                Translate to {languages.find(l => l.code === targetLanguage)?.name.split(' ')[0]}
              </>
            )}
          </Button>
        </div>

        {translatedText && (
          <div className="space-y-3">
            <div className="flex justify-end">
              <Button size="sm" variant="outline" onClick={copyTranslation}>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
            </div>
            <div className="border-2 border-indigo-200 rounded-lg p-4 bg-indigo-50">
              <pre className="whitespace-pre-wrap text-base font-medium text-slate-800" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
                {translatedText}
              </pre>
            </div>
          </div>
        )}

        {!prescriptionText && (
          <div className="text-center text-slate-500 py-8">
            Generate a management plan first to translate prescription
          </div>
        )}
      </CardContent>
    </Card>
  );
}