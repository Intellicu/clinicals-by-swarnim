import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChevronRight, HelpCircle, Loader2, Check, X } from 'lucide-react';
import { base44 } from '@/api/client';
import { toast } from 'sonner';

const SYMPTOM_CLUSTERS = {
  fever: {
    tier2: ['Duration of fever?', 'Pattern (continuous/intermittent)?', 'Associated chills?', 'Night sweats?', 'Weight loss?'],
    tier3: {
      'rash': ['Type of rash?', 'Distribution?', 'Blanching?', 'Itchy or painful?'],
      'joint_pain': ['Which joints affected?', 'Swelling present?', 'Morning stiffness?', 'Migratory?']
    }
  },
  edema: {
    tier2: ['Location (periorbital/pedal/generalized)?', 'Duration?', 'Progression (worse AM/PM)?', 'Urine output?', 'Foamy urine?'],
    tier3: {
      'oliguria': ['Last void time?', 'Estimated output?', 'Fluid intake?', 'Vomiting/diarrhea?'],
      'hematuria': ['Color (cola/tea/bright red)?', 'Painful?', 'Clots?', 'Throughout stream?']
    }
  },
  cough: {
    tier2: ['Dry or productive?', 'Wheeze?', 'Nocturnal?', 'Exercise-induced?', 'Previous asthma?'],
    tier3: {
      'wheeze': ['Breathing difficulty?', 'Previous episodes?', 'Triggers?', 'Relieving factors?']
    }
  },
  oliguria: {
    tier2: ['Duration?', 'Last void time?', 'Fluid intake?', 'Associated edema?', 'Recent medications?'],
    tier3: {
      'edema': ['Location of swelling?', 'Timing?', 'Progression?'],
      'vomiting': ['Frequency?', 'Blood stained?', 'Bile stained?', 'Associated abdominal pain?']
    }
  },
  hematuria: {
    tier2: ['Color?', 'Onset?', 'Painful/painless?', 'Timing in stream?', 'Clots?', 'Recent throat infection?'],
    tier3: {
      'dysuria': ['Frequency?', 'Urgency?', 'Fever?', 'Suprapubic pain?'],
      'rash': ['Location?', 'Type?', 'Joint pain?', 'Abdominal pain?']
    }
  }
};

export default function DynamicHistoryBranching({ 
  chiefComplaint, 
  currentHistory, 
  patientData,
  onHistoryUpdate 
}) {
  const [activeSymptoms, setActiveSymptoms] = useState({});
  const [tier2Questions, setTier2Questions] = useState([]);
  const [tier3Questions, setTier3Questions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);

  useEffect(() => {
    if (chiefComplaint) {
      analyzeChiefComplaint();
    }
  }, [chiefComplaint]);

  const analyzeChiefComplaint = () => {
    const normalized = chiefComplaint.toLowerCase();
    const detected = {};
    
    Object.keys(SYMPTOM_CLUSTERS).forEach(symptom => {
      if (normalized.includes(symptom)) {
        detected[symptom] = true;
        setTier2Questions(prev => [...prev, ...SYMPTOM_CLUSTERS[symptom].tier2]);
      }
    });

    setActiveSymptoms(detected);
  };

  const handleAnswerChange = (question, value) => {
    setAnswers(prev => ({ ...prev, [question]: value }));

    // Check for tier3 triggers
    const normalized = value.toLowerCase();
    Object.keys(activeSymptoms).forEach(symptom => {
      const tier3 = SYMPTOM_CLUSTERS[symptom]?.tier3;
      if (tier3) {
        Object.keys(tier3).forEach(trigger => {
          if (normalized.includes(trigger)) {
            setTier3Questions(prev => [...prev, ...tier3[trigger]]);
          }
        });
      }
    });
  };

  const addAnswerToHistory = async (question, answer) => {
    if (!answer.trim()) return;

    try {
      // Format Q&A into prose using AI
      const prompt = `Convert this Q&A into a natural medical history prose format:

Question: ${question}
Answer: ${answer}

Format as a single coherent sentence or phrase suitable for "History of Presenting Illness" section. Don't include the question. Just state the finding naturally.

Example:
Q: Duration of fever?
A: 3 days
Output: Patient has had fever for 3 days.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            prose: { type: 'string' }
          }
        }
      });

      const proseText = response.prose || `${question} ${answer}`;
      const updatedHistory = currentHistory ? `${currentHistory} ${proseText}` : proseText;
      
      onHistoryUpdate(updatedHistory);
      toast.success('Added to history');
    } catch (error) {
      // Fallback to simple format
      const formattedText = `${answer}. `;
      const updatedHistory = currentHistory ? `${currentHistory}${formattedText}` : formattedText;
      onHistoryUpdate(updatedHistory);
      toast.success('Added to history');
    }
  };

  const generateAISuggestions = async () => {
    setIsGeneratingAI(true);
    try {
      const contextData = `
Chief Complaint: ${chiefComplaint}
Current History: ${currentHistory}
Patient Age: ${patientData.age_years}y
Gender: ${patientData.gender}
Existing Answers: ${JSON.stringify(answers)}
      `.trim();

      const prompt = `Based on this pediatric nephrology case:

${contextData}

Suggest 5-7 specific, targeted follow-up questions to ask next for history of presenting illness. Make them clinically relevant and specific to the entered data. Format as a simple array of questions.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            questions: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      setAiSuggestions(response.questions || []);
      toast.success('AI suggestions generated!');
    } catch (error) {
      console.error('AI suggestion error:', error);
      toast.error('Failed to generate AI suggestions');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const allQuestions = [...tier2Questions, ...tier3Questions, ...aiSuggestions];

  return (
    <div className="space-y-4">
      {Object.keys(activeSymptoms).length > 0 && (
        <Alert className="bg-blue-50 border-blue-200">
          <HelpCircle className="w-4 h-4 text-blue-600" />
          <AlertDescription className="text-blue-900 text-sm">
            <strong>Detected Symptoms:</strong> {Object.keys(activeSymptoms).join(', ')}
            <br />
            Dynamic questions activated below
          </AlertDescription>
        </Alert>
      )}

      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={generateAISuggestions}
          disabled={isGeneratingAI || !chiefComplaint}
          className="bg-gradient-to-r from-purple-600 to-indigo-600"
        >
          {isGeneratingAI ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <HelpCircle className="w-4 h-4 mr-2" />
              Get AI Suggestions
            </>
          )}
        </Button>
        {allQuestions.length > 0 && (
          <Badge variant="outline" className="px-3">
            {allQuestions.length} Questions
          </Badge>
        )}
      </div>

      {allQuestions.length > 0 && (
        <div className="space-y-3">
          {allQuestions.map((question, idx) => (
            <Card key={idx} className="border-2 border-purple-200 hover:border-purple-400 transition-all">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div className="flex-1 space-y-2">
                    <h4 className="font-semibold text-slate-900">{question}</h4>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type answer..."
                        value={answers[question] || ''}
                        onChange={(e) => handleAnswerChange(question, e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && answers[question]?.trim()) {
                            addAnswerToHistory(question, answers[question]);
                          }
                        }}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        onClick={() => addAnswerToHistory(question, answers[question])}
                        disabled={!answers[question]?.trim()}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {allQuestions.length === 0 && !isGeneratingAI && (
        <Alert className="bg-slate-50 border-slate-200">
          <AlertDescription className="text-slate-600 text-sm">
            Enter chief complaint to activate dynamic branching questions, or click "Get AI Suggestions"
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}