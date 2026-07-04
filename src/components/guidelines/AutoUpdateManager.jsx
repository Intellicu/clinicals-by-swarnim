import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, CheckCircle, AlertCircle, Globe } from 'lucide-react';
import { toast } from 'sonner';

export default function AutoUpdateManager() {
  const [searchResults, setSearchResults] = useState([]);
  const [selectedGuidelines, setSelectedGuidelines] = useState([]);
  const queryClient = useQueryClient();

  const searchMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Search for the latest pediatric nephrology clinical guidelines published in 2024-2026. 
        
        Focus on:
        - KDIGO (Kidney Disease: Improving Global Outcomes)
        - ISPN (International Society of Pediatric Nephrology)
        - IAP (Indian Academy of Pediatrics)
        - ESPGHAN (European Society for Paediatric Gastroenterology Hepatology and Nutrition)
        - AAP (American Academy of Pediatrics)
        
        Return updated or new guidelines for:
        - CKD Management
        - AKI Guidelines
        - Nephrotic Syndrome
        - Hypertension in children
        - Dialysis protocols
        - Transplantation guidelines
        
        For each guideline, provide: title, organization, year, summary, and official URL.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            guidelines: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  organization: { type: "string" },
                  year: { type: "number" },
                  category: { type: "string" },
                  summary: { type: "string" },
                  key_updates: { type: "array", items: { type: "string" } },
                  source_url: { type: "string" },
                  is_new: { type: "boolean" }
                }
              }
            }
          }
        }
      });
      return result.guidelines || [];
    },
    onSuccess: (data) => {
      setSearchResults(data);
      toast.success(`Found ${data.length} guideline updates`);
    },
    onError: () => {
      toast.error('Failed to search for updates');
    }
  });

  const importMutation = useMutation({
    mutationFn: async (guideline) => {
      return base44.entities.Guideline.create({
        title: guideline.title,
        source: guideline.organization,
        organization: guideline.organization,
        year: guideline.year,
        category: guideline.category || 'General',
        summary: guideline.summary,
        key_recommendations: guideline.key_updates || [],
        external_link: guideline.source_url,
        status: 'Published',
        created_by: (await base44.auth.me()).email,
        scope_and_population: guideline.summary,
        region: guideline.organization.includes('India') || guideline.organization.includes('IAP') ? 'India' : 'Global'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guidelines'] });
      toast.success('Guideline imported successfully!');
    }
  });

  const toggleSelection = (guideline) => {
    if (selectedGuidelines.find(g => g.title === guideline.title)) {
      setSelectedGuidelines(selectedGuidelines.filter(g => g.title !== guideline.title));
    } else {
      setSelectedGuidelines([...selectedGuidelines, guideline]);
    }
  };

  const importSelected = async () => {
    toast.loading('Importing selected guidelines...', { id: 'import' });
    for (const guideline of selectedGuidelines) {
      await importMutation.mutateAsync(guideline);
    }
    toast.success(`Imported ${selectedGuidelines.length} guidelines`, { id: 'import' });
    setSelectedGuidelines([]);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-blue-600" />
            Auto-Update Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 mb-4">
            Search for latest clinical guidelines from major pediatric nephrology organizations
          </p>
          <Button 
            onClick={() => searchMutation.mutate()}
            disabled={searchMutation.isPending}
            className="w-full bg-blue-600"
          >
            {searchMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Searching for updates...
              </>
            ) : (
              <>
                <Globe className="w-4 h-4 mr-2" />
                Search for New Guidelines
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Search Results ({searchResults.length})</CardTitle>
              {selectedGuidelines.length > 0 && (
                <Button onClick={importSelected} size="sm" className="bg-green-600">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Import {selectedGuidelines.length} Selected
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {searchResults.map((guideline, idx) => (
                <div key={idx} className="border rounded-lg p-4 hover:bg-slate-50">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedGuidelines.find(g => g.title === guideline.title)}
                      onChange={() => toggleSelection(guideline)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{guideline.title}</h4>
                        {guideline.is_new && (
                          <Badge className="bg-green-100 text-green-800">New</Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mb-2">
                        {guideline.organization} • {guideline.year} • {guideline.category}
                      </p>
                      <p className="text-sm text-slate-700 mb-2">{guideline.summary}</p>
                      {guideline.key_updates && guideline.key_updates.length > 0 && (
                        <div className="bg-blue-50 p-2 rounded mt-2">
                          <p className="text-xs font-semibold mb-1">Key Updates:</p>
                          <ul className="text-xs space-y-1">
                            {guideline.key_updates.slice(0, 3).map((update, i) => (
                              <li key={i}>• {update}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {guideline.source_url && (
                        <a href={guideline.source_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-2 inline-block">
                          View Original →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}