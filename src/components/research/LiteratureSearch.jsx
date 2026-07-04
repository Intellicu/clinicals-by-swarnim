import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/client';
import { 
  Search, BookOpen, Sparkles, Download, FileText, TrendingUp,
  Database, Loader2, CheckCircle2, XCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function LiteratureSearch({ projectId }) {
  const [query, setQuery] = useState('');
  const [picoSearch, setPicoSearch] = useState({
    population: '',
    intervention: '',
    comparison: '',
    outcome: ''
  });
  const [sources, setSources] = useState({
    pubmed: true,
    scholar: true,
    cochrane: false,
    clinicaltrials: false
  });
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [savedPapers, setSavedPapers] = useState([]);

  const performSearch = async () => {
    setIsSearching(true);
    try {
      const searchPrompt = `Perform a comprehensive literature search for a pediatric nephrology research study.

${picoSearch.population ? `Population: ${picoSearch.population}` : ''}
${picoSearch.intervention ? `Intervention/Exposure: ${picoSearch.intervention}` : ''}
${picoSearch.comparison ? `Comparison: ${picoSearch.comparison}` : ''}
${picoSearch.outcome ? `Outcome: ${picoSearch.outcome}` : ''}

Search Query: ${query}

Search the following databases: ${Object.entries(sources).filter(([k, v]) => v).map(([k]) => k).join(', ')}

For each relevant paper found, extract:
- Title
- Authors
- Journal
- Year
- Study design
- Sample size
- Key findings
- Limitations
- Relevance to the research question

Also identify:
1. What is already known (evidence summary)
2. What gaps exist in the literature
3. Why this study would add value

Provide results in structured format.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: searchPrompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            papers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  authors: { type: 'string' },
                  journal: { type: 'string' },
                  year: { type: 'number' },
                  design: { type: 'string' },
                  sample_size: { type: 'string' },
                  key_findings: { type: 'string' },
                  limitations: { type: 'string' },
                  relevance_score: { type: 'number' }
                }
              }
            },
            evidence_summary: { type: 'string' },
            knowledge_gaps: { type: 'array', items: { type: 'string' } },
            study_justification: { type: 'string' }
          }
        }
      });

      setResults(response);
      toast.success(`Found ${response.papers?.length || 0} relevant papers`);
    } catch (error) {
      toast.error('Search failed');
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  const savePaper = (paper) => {
    setSavedPapers([...savedPapers, paper]);
    toast.success('Paper saved to project library');
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-600" />
            Literature Intelligence Engine
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="pico">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="pico">PICO Search</TabsTrigger>
              <TabsTrigger value="simple">Simple Search</TabsTrigger>
            </TabsList>

            <TabsContent value="pico" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Population</Label>
                  <Input
                    value={picoSearch.population}
                    onChange={(e) => setPicoSearch({...picoSearch, population: e.target.value})}
                    placeholder="e.g., Children with nephrotic syndrome"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Intervention/Exposure</Label>
                  <Input
                    value={picoSearch.intervention}
                    onChange={(e) => setPicoSearch({...picoSearch, intervention: e.target.value})}
                    placeholder="e.g., Arsenic exposure"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Comparison (optional)</Label>
                  <Input
                    value={picoSearch.comparison}
                    onChange={(e) => setPicoSearch({...picoSearch, comparison: e.target.value})}
                    placeholder="e.g., No exposure"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Outcome</Label>
                  <Input
                    value={picoSearch.outcome}
                    onChange={(e) => setPicoSearch({...picoSearch, outcome: e.target.value})}
                    placeholder="e.g., Relapse frequency"
                    className="mt-1"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="simple">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter search keywords..."
                className="text-lg"
              />
            </TabsContent>
          </Tabs>

          <div className="mt-4">
            <Label className="mb-2 block">Data Sources</Label>
            <div className="flex flex-wrap gap-3">
              {Object.entries(sources).map(([source, enabled]) => (
                <div key={source} className="flex items-center gap-2">
                  <Checkbox
                    checked={enabled}
                    onCheckedChange={(checked) => setSources({...sources, [source]: checked})}
                  />
                  <Label className="capitalize cursor-pointer">{source}</Label>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={performSearch}
            disabled={isSearching || (!query && !picoSearch.population)}
            className="w-full mt-4 bg-blue-600"
          >
            {isSearching ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Searching...</>
            ) : (
              <><Search className="w-4 h-4 mr-2" /> Search Literature</>
            )}
          </Button>
        </CardContent>
      </Card>

      {results.evidence_summary && (
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <Sparkles className="w-5 h-5" />
              Evidence Summary & Gaps
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-purple-900 mb-2">What is Known</h4>
              <p className="text-sm text-purple-800 leading-relaxed">{results.evidence_summary}</p>
            </div>

            {results.knowledge_gaps && results.knowledge_gaps.length > 0 && (
              <div>
                <h4 className="font-semibold text-purple-900 mb-2">Knowledge Gaps</h4>
                <ul className="space-y-1">
                  {results.knowledge_gaps.map((gap, idx) => (
                    <li key={idx} className="text-sm text-purple-800 flex items-start gap-2">
                      <TrendingUp className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      {gap}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {results.study_justification && (
              <Alert className="bg-green-50 border-green-300">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Study Justification:</strong> {results.study_justification}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {results.papers && results.papers.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xl font-bold">Search Results ({results.papers.length} papers)</h3>
          {results.papers.map((paper, idx) => (
            <Card key={idx} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 mb-1">{paper.title}</h4>
                    <p className="text-sm text-slate-600 mb-2">{paper.authors}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
                      <span>{paper.journal}</span>
                      <span>•</span>
                      <span>{paper.year}</span>
                      <span>•</span>
                      <Badge variant="outline">{paper.design}</Badge>
                      <span>•</span>
                      <span>n={paper.sample_size}</span>
                    </div>
                    <p className="text-sm text-slate-700">{paper.key_findings}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge className={`${
                      paper.relevance_score >= 8 ? 'bg-green-100 text-green-800' :
                      paper.relevance_score >= 6 ? 'bg-amber-100 text-amber-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      Relevance: {paper.relevance_score}/10
                    </Badge>
                    <Button
                      size="sm"
                      onClick={() => savePaper(paper)}
                      className="bg-blue-600"
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}