import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Music, Podcast, Download } from 'lucide-react';
import { base44 } from '@/api/client';
import { toast } from 'sonner';

export default function AudioSummaryGenerator({ guidelineText, onGenerated }) {
  const [generating, setGenerating] = useState(false);
  const [language, setLanguage] = useState('english');
  const [generatedAudio, setGeneratedAudio] = useState(null);

  const generateAudio = async () => {
    if (!guidelineText) {
      toast.error('No guideline text available');
      return;
    }

    setGenerating(true);
    try {
      // Generate narration script using LLM
      const scriptPrompt = `Convert this clinical guideline into a natural, conversational audio script for a podcast-style overview. Make it engaging and suitable for ${language} narration:

${guidelineText}

Format as a clear narration script with natural transitions. Target 3-5 minutes duration.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: scriptPrompt,
        response_json_schema: {
          type: 'object',
          properties: {
            script: { type: 'string' },
            title: { type: 'string' },
            duration_estimate: { type: 'string' }
          }
        }
      });

      // Note: In production, you would integrate with a TTS service (Google Cloud TTS, Amazon Polly, etc.)
      // For now, we'll create a mock audio object
      const audioData = {
        title: response.title,
        script: response.script,
        duration: response.duration_estimate,
        language: language,
        status: 'generated'
      };

      setGeneratedAudio(audioData);
      onGenerated?.(audioData);
      toast.success('Audio script generated! (TTS integration pending)');
    } catch (error) {
      console.error('Audio generation error:', error);
      toast.error('Failed to generate audio');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card className="border-2 border-indigo-200">
      <CardHeader className="bg-indigo-50 border-b">
        <CardTitle className="text-base flex items-center gap-2">
          <Podcast className="w-4 h-4 text-indigo-600" />
          Auto-Generate Audio Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div>
          <label className="text-xs font-semibold text-slate-700 mb-2 block">Language</label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="english">English</SelectItem>
              <SelectItem value="hindi">Hindi (हिन्दी)</SelectItem>
              <SelectItem value="tamil">Tamil (தமிழ்)</SelectItem>
              <SelectItem value="telugu">Telugu (తెలుగు)</SelectItem>
              <SelectItem value="bengali">Bengali (বাংলা)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={generateAudio}
          disabled={generating || !guidelineText}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Script...
            </>
          ) : (
            <>
              <Music className="w-4 h-4 mr-2" />
              Generate Podcast Script
            </>
          )}
        </Button>

        {generatedAudio && (
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-3 space-y-2">
              <div className="font-semibold text-sm text-green-900">{generatedAudio.title}</div>
              <div className="text-xs text-green-700">Duration: {generatedAudio.duration}</div>
              <div className="text-xs text-green-700">Language: {generatedAudio.language}</div>
              <div className="bg-white p-2 rounded text-xs text-slate-700 max-h-32 overflow-y-auto">
                {generatedAudio.script}
              </div>
              <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                💡 TTS Integration Required: Connect Google Cloud TTS, Amazon Polly, or similar service to generate actual audio files
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}