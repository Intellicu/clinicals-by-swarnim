import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, BookOpen, Languages, Download, Printer, FileText } from 'lucide-react';
import { base44 } from '@/api/client';
import { toast } from 'sonner';

export default function PatientEducationGenerator({ diagnosis: diagnosisProp, treatmentPlan, medications }) {
  // When mounted standalone (no prop), accept a typed diagnosis so the tool is
  // usable on its own (e.g. the Patient Education Hub "AI Generator" tab).
  const [diagnosisInput, setDiagnosisInput] = useState('');
  const diagnosis = diagnosisProp ?? diagnosisInput;
  const standalone = diagnosisProp == null;
  const [generating, setGenerating] = useState(false);
  const [language, setLanguage] = useState('english');
  const [educationMaterial, setEducationMaterial] = useState(null);
  const [generatingAudio, setGeneratingAudio] = useState(false);
  const [generatingInfographic, setGeneratingInfographic] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [infographicUrl, setInfographicUrl] = useState(null);

  const languages = [
    { code: 'english', name: 'English' },
    { code: 'hindi', name: 'Hindi (हिन्दी)' },
    { code: 'tamil', name: 'Tamil (தமிழ்)' },
    { code: 'telugu', name: 'Telugu (తెలుగు)' },
    { code: 'bengali', name: 'Bengali (বাংলা)' },
    { code: 'marathi', name: 'Marathi (मराठी)' }
  ];

  const generateEducation = async () => {
    if (!diagnosis) {
      toast.error('Please enter a diagnosis first');
      return;
    }

    setGenerating(true);
    try {
      const prompt = `You are a pediatric nephrologist creating patient education material in ${language}.

DIAGNOSIS: ${diagnosis}
TREATMENT PLAN: ${treatmentPlan || 'Not specified'}
MEDICATIONS: ${medications || 'Not specified'}

Create comprehensive, patient-friendly education material in ${language} that parents can understand:

1. What is this condition? (Simple explanation avoiding complex medical terms)
2. Why did this happen? (Causes in simple language)
3. What are we doing to treat it? (Explain the treatment plan)
4. What medicines will my child take? (Explain each medication's purpose, how to give it, and simple side effects to watch)
5. What should I watch for at home? (Warning signs to report immediately)
6. When should we come back? (Follow-up guidance)
7. Diet and lifestyle tips (Simple, practical advice)

Use ${language} throughout. Convert medical terms to simple language. Be reassuring but honest. Format clearly with headings.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            what_is_condition: { type: 'string' },
            why_happened: { type: 'string' },
            treatment_explanation: { type: 'string' },
            medication_guide: { type: 'string' },
            warning_signs: { type: 'array', items: { type: 'string' } },
            followup_guidance: { type: 'string' },
            diet_lifestyle: { type: 'array', items: { type: 'string' } },
            key_takeaways: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      setEducationMaterial(response);
      toast.success('Education material generated!');
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to generate education material');
    } finally {
      setGenerating(false);
    }
  };

  const generateAudio = async () => {
    if (!educationMaterial) return;
    
    setGeneratingAudio(true);
    try {
      const textToSpeak = `${educationMaterial.title}. ${educationMaterial.what_is_condition}. ${educationMaterial.treatment_explanation}`;
      
      // Use browser's speech synthesis
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = language === 'hindi' ? 'hi-IN' : 
                       language === 'tamil' ? 'ta-IN' :
                       language === 'telugu' ? 'te-IN' :
                       'en-US';
      utterance.rate = 0.9;
      
      window.speechSynthesis.speak(utterance);
      toast.success('Audio narration started');
    } catch (error) {
      console.error('Audio error:', error);
      toast.error('Audio generation failed');
    } finally {
      setGeneratingAudio(false);
    }
  };

  const generateInfographic = async () => {
    if (!educationMaterial) return;
    
    setGeneratingInfographic(true);
    try {
      const prompt = `Create a simple, visual infographic description for: ${diagnosis}

Key Points to Visualize:
${educationMaterial.key_takeaways.join('\n')}

Warning Signs:
${educationMaterial.warning_signs.join('\n')}

Describe a clean, parent-friendly infographic layout with icons, colors, and text positioning. Include visual metaphors that parents can understand.`;

      const imagePrompt = `Medical infographic for ${diagnosis}: simple icons, clean layout, visual guide for parents, colorful, educational, professional healthcare design`;

      const { url } = await base44.integrations.Core.GenerateImage({
        prompt: imagePrompt
      });

      setInfographicUrl(url);
      toast.success('Infographic generated!');
    } catch (error) {
      console.error('Infographic error:', error);
      toast.error('Infographic generation failed');
    } finally {
      setGeneratingInfographic(false);
    }
  };

  const printMaterial = () => {
    if (!educationMaterial) return;

    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>${educationMaterial.title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
            h1 { color: #1e40af; border-bottom: 3px solid #3b82f6; padding-bottom: 10px; }
            h2 { color: #1e40af; margin-top: 20px; }
            ul { margin: 10px 0; padding-left: 20px; }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
            .important { background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <h1>${educationMaterial.title}</h1>
          
          <h2>यह बीमारी क्या है? / What is this condition?</h2>
          <p>${educationMaterial.what_is_condition}</p>
          
          <h2>ऐसा क्यों हुआ? / Why did this happen?</h2>
          <p>${educationMaterial.why_happened}</p>
          
          <h2>इलाज कैसे होगा? / How will we treat it?</h2>
          <p>${educationMaterial.treatment_explanation}</p>
          
          <h2>दवाइयाँ / Medications</h2>
          <p>${educationMaterial.medication_guide}</p>
          
          <div class="warning">
            <h2>⚠️ चेतावनी के संकेत / Warning Signs</h2>
            <ul>
              ${educationMaterial.warning_signs.map(sign => `<li>${sign}</li>`).join('')}
            </ul>
          </div>
          
          <h2>फॉलो-अप / Follow-up</h2>
          <p>${educationMaterial.followup_guidance}</p>
          
          <div class="important">
            <h2>आहार और जीवनशैली / Diet & Lifestyle</h2>
            <ul>
              ${educationMaterial.diet_lifestyle.map(tip => `<li>${tip}</li>`).join('')}
            </ul>
          </div>
          
          <h2>मुख्य बातें याद रखें / Key Takeaways</h2>
          <ul>
            ${educationMaterial.key_takeaways.map(point => `<li>${point}</li>`).join('')}
          </ul>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Card className="border-2 border-green-200">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
        <CardTitle className="text-base flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-green-600" />
          Patient Education Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        {standalone && (
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-2 block">Diagnosis / Condition</label>
            <Input
              value={diagnosisInput}
              onChange={(e) => setDiagnosisInput(e.target.value)}
              placeholder="e.g. Nephrotic syndrome, UTI, CKD stage 3..."
            />
          </div>
        )}
        <div>
          <label className="text-xs font-semibold text-slate-700 mb-2 block">Language</label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={generateEducation}
          disabled={generating || !diagnosis}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <BookOpen className="w-4 h-4 mr-2" />
              Generate Patient Handout
            </>
          )}
        </Button>

        {educationMaterial && (
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-green-900">{educationMaterial.title}</h3>
                <Badge className="bg-green-600 text-white">{languages.find(l => l.code === language)?.name}</Badge>
              </div>
              
              <div className="max-h-64 overflow-y-auto bg-white p-3 rounded border text-sm space-y-3">
                <div>
                  <strong className="text-green-900">What is this condition?</strong>
                  <p className="text-slate-700 mt-1">{educationMaterial.what_is_condition}</p>
                </div>
                
                <div>
                  <strong className="text-green-900">Treatment:</strong>
                  <p className="text-slate-700 mt-1">{educationMaterial.treatment_explanation}</p>
                </div>

                <div className="bg-red-50 p-2 rounded border-l-4 border-red-500">
                  <strong className="text-red-900">⚠️ Warning Signs:</strong>
                  <ul className="mt-1 space-y-1 text-sm text-red-800 list-disc ml-4">
                    {educationMaterial.warning_signs.slice(0, 3).map((sign, idx) => (
                      <li key={idx}>{sign}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={printMaterial} size="sm" variant="outline" className="flex-1">
                  <Printer className="w-3 h-3 mr-1" />
                  Print
                </Button>
                <Button 
                  onClick={generateAudio} 
                  size="sm" 
                  variant="outline"
                  disabled={generatingAudio}
                >
                  {generatingAudio ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <>🔊</>
                  )}
                </Button>
                <Button 
                  onClick={generateInfographic} 
                  size="sm" 
                  variant="outline"
                  disabled={generatingInfographic}
                >
                  {generatingInfographic ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <>📊</>
                  )}
                </Button>
              </div>

              {infographicUrl && (
                <div className="mt-3">
                  <img src={infographicUrl} alt="Infographic" className="w-full rounded border-2 border-green-300" />
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}