import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Loader2, Sparkles, Filter } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function SemanticSearch({ guidelines, onResultsFound }) {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [filters, setFilters] = useState({
    evidenceLevel: 'all',
    yearFrom: 'all',
    hasMultimedia: 'all'
  });

  const performSemanticSearch = async () => {
    if (!query.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setSearching(true);
    try {
      const prompt = `You are a clinical guideline search assistant. 

User query: "${query}"

Available guidelines:
${guidelines.map(g => `- ${g.title} (${g.category}, ${g.source} ${g.year}): ${g.scope_and_population || g.summary || ''}`).join('\n')}

Analyze the user's query and return the IDs of the most relevant guidelines in order of relevance. Consider:
- Clinical context and intent
- Synonyms and related terms
- Category matching
- Population and scope alignment

Return up to 10 most relevant guideline titles.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            relevant_guideline_titles: {
              type: 'array',
              items: { type: 'string' }
            },
            search_reasoning: { type: 'string' }
          }
        }
      });

      // Match titles to actual guidelines
      const results = guidelines.filter(g => 
        response.relevant_guideline_titles.some(title => 
          g.title.toLowerCase().includes(title.toLowerCase()) || 
          title.toLowerCase().includes(g.title.toLowerCase())
        )
      );

      // Apply additional filters
      let filteredResults = results;

      if (filters.evidenceLevel !== 'all') {
        filteredResults = filteredResults.filter(g => 
          g.evidence_level?.includes(filters.evidenceLevel)
        );
      }

      if (filters.yearFrom !== 'all') {
        const yearThreshold = parseInt(filters.yearFrom);
        filteredResults = filteredResults.filter(g => g.year >= yearThreshold);
      }

      if (filters.hasMultimedia === 'yes') {
        filteredResults = filteredResults.filter(g => 
          g.multimedia?.video_overview_url || 
          g.multimedia?.slides_url || 
          g.multimedia?.infographics?.length > 0
        );
      }

      onResultsFound(filteredResults, response.search_reasoning);
      toast.success(`Found ${filteredResults.length} relevant guidelines`);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && performSemanticSearch()}
            placeholder="Ask in natural language: 'How to manage nephrotic syndrome with severe edema?'"
            className="pl-10 h-12 text-base"
          />
        </div>
        <Button
          onClick={performSemanticSearch}
          disabled={searching || !query.trim()}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6"
        >
          {searching ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              AI Search
            </>
          )}
        </Button>
      </div>

      <div className="flex gap-2 items-center flex-wrap">
        <Badge variant="outline" className="text-xs">
          <Filter className="w-3 h-3 mr-1" />
          Filters:
        </Badge>
        
        <Select value={filters.evidenceLevel} onValueChange={(val) => setFilters({...filters, evidenceLevel: val})}>
          <SelectTrigger className="w-40 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Evidence</SelectItem>
            <SelectItem value="High">High Quality</SelectItem>
            <SelectItem value="Moderate">Moderate Quality</SelectItem>
            <SelectItem value="Low">Low Quality</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.yearFrom} onValueChange={(val) => setFilters({...filters, yearFrom: val})}>
          <SelectTrigger className="w-32 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            <SelectItem value="2023">2023+</SelectItem>
            <SelectItem value="2020">2020+</SelectItem>
            <SelectItem value="2015">2015+</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.hasMultimedia} onValueChange={(val) => setFilters({...filters, hasMultimedia: val})}>
          <SelectTrigger className="w-40 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Content</SelectItem>
            <SelectItem value="yes">With Media Only</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}