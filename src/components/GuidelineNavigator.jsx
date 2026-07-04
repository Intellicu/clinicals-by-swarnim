import React, { useState } from "react";
import { base44 } from "@/api/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Search, BookOpen, ExternalLink, Sparkles } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from 'react-markdown';

export default function GuidelineNavigator() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState(null);

  const { data: guidelines = [] } = useQuery({
    queryKey: ['guidelines'],
    queryFn: () => base44.entities.Guideline.list()
  });

  const searchGuidelines = async () => {
    if (!query.trim()) {
      toast.error("Please enter a question");
      return;
    }

    setIsSearching(true);
    toast.info("Searching guidelines...", { id: "guideline-search", duration: Infinity });

    try {
      const guidelineContext = guidelines.map(g => ({
        title: g.title,
        source: g.source,
        year: g.year,
        summary: g.summary,
        key_recommendations: g.key_recommendations
      }));

      const prompt = `You are a clinical guideline expert assistant. Answer the following question using KDIGO, IPNA, ISPN, AAP, and other major pediatric nephrology guidelines.

QUESTION: "${query}"

AVAILABLE GUIDELINES:
${JSON.stringify(guidelineContext, null, 2)}

INSTRUCTIONS:
1. Provide direct, evidence-based answer
2. Cite specific guidelines with year (e.g., "KDIGO 2024 recommends...")
3. Quote relevant excerpts
4. Include BP targets, staging criteria, or dosing if applicable
5. Note any differences between guidelines
6. Keep answer clear and actionable for clinicians

Format response as:
## Direct Answer
[Concise answer to the question]

## Relevant Guidelines
[Specific recommendations with citations]

## Key Points
- [Actionable takeaways]

## Additional Context
[Any caveats or special considerations]

Respond now:`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true
      });

      const relevantGuidelines = guidelines.filter(g => 
        g.title.toLowerCase().includes(query.toLowerCase()) ||
        g.summary?.toLowerCase().includes(query.toLowerCase()) ||
        g.category.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 3);

      setResults({
        answer: response,
        relatedGuidelines: relevantGuidelines,
        query: query
      });

      toast.success("Guidelines found!", { id: "guideline-search" });
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Search failed. Please try again.", { id: "guideline-search" });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Card className="shadow-2xl border-2 border-blue-200">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b-2 border-blue-200">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          AI Guideline Navigator
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Alert className="mb-4 bg-blue-50 border-blue-200">
          <AlertDescription className="text-sm text-blue-900">
            Ask natural language questions about guidelines. AI retrieves KDIGO, IPNA, ISPN recommendations.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., What are KDIGO 2024 BP targets for CKD stage 3?"
              onKeyPress={(e) => e.key === 'Enter' && searchGuidelines()}
              className="flex-1"
            />
            <Button onClick={searchGuidelines} disabled={isSearching} className="bg-blue-600 hover:bg-blue-700">
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>

          {results && (
            <div className="space-y-4">
              <Card className="bg-green-50 border-2 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-2 mb-3">
                    <BookOpen className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-green-900 mb-1">Your Question:</h3>
                      <p className="text-sm text-green-800">{results.query}</p>
                    </div>
                  </div>
                  <ReactMarkdown className="prose prose-sm max-w-none text-slate-800">
                    {results.answer}
                  </ReactMarkdown>
                </CardContent>
              </Card>

              {results.relatedGuidelines.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Related Guidelines:</h3>
                  <div className="space-y-2">
                    {results.relatedGuidelines.map(guideline => (
                      <Card key={guideline.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-900 mb-1">{guideline.title}</h4>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline">{guideline.source}</Badge>
                                <Badge variant="outline">{guideline.year}</Badge>
                              </div>
                              <p className="text-sm text-slate-600">{guideline.summary?.substring(0, 200)}...</p>
                            </div>
                            <Button size="sm" variant="outline" className="ml-4">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}