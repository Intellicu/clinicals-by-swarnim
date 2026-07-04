import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Globe, Search, Loader2, Download } from 'lucide-react';
import { base44 } from '@/api/client';
import { toast } from 'sonner';

export default function WebImporter({ onImportComplete }) {
  const [url, setUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [importing, setImporting] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [rightsConfirmed, setRightsConfirmed] = useState(false);

  const searchWeb = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const results = await base44.integrations.Core.InvokeLLM({
        prompt: `Search for clinical guidelines about: ${searchQuery}. Find 5 authoritative sources (KDIGO, IPNA, IAP, WHO, AAP, etc.).`,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            results: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  url: { type: 'string' },
                  source: { type: 'string' },
                  summary: { type: 'string' }
                }
              }
            }
          }
        }
      });

      setSearchResults(results.results || []);
      toast.success(`Found ${results.results?.length || 0} guidelines`);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  };

  const importFromUrl = async (importUrl) => {
    if (!rightsConfirmed) {
      toast.error('Please confirm rights to use this content');
      return;
    }

    setImporting(true);
    try {
      // Fetch and extract content from URL
      const extractPrompt = `Extract guideline content from this URL: ${importUrl}

Provide structured data including:
- Title
- Organization/Source
- Summary
- Key recommendations
- Full text content`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: extractPrompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            source: { type: 'string' },
            summary: { type: 'string' },
            key_recommendations: { type: 'array', items: { type: 'string' } },
            full_content: { type: 'string' }
          }
        }
      });

      const importedData = {
        ...response,
        provenance: {
          import_source: 'web',
          import_url: importUrl,
          import_date: new Date().toISOString(),
          rights_confirmation: rightsConfirmed
        }
      };

      onImportComplete(importedData);
      toast.success('Guideline imported!');
      setUrl('');
      setRightsConfirmed(false);
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Import failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <Card className="border-2 border-cyan-200">
      <CardHeader className="bg-cyan-50 border-b">
        <CardTitle className="text-base flex items-center gap-2">
          <Globe className="w-4 h-4 text-cyan-600" />
          Import from Web
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div>
          <Label className="text-xs font-semibold text-slate-700 mb-2 block">
            Search for Guidelines
          </Label>
          <div className="flex gap-2">
            <Input
              placeholder="e.g., KDIGO AKI guidelines 2023"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchWeb()}
            />
            <Button
              onClick={searchWeb}
              disabled={searching || !searchQuery.trim()}
              className="bg-cyan-600"
            >
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {searchResults.length > 0 && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {searchResults.map((result, idx) => (
              <Card key={idx} className="bg-white border border-cyan-200">
                <CardContent className="p-3">
                  <h4 className="font-semibold text-sm text-slate-900 mb-1">{result.title}</h4>
                  <div className="text-xs text-slate-600 mb-2">{result.source}</div>
                  <p className="text-xs text-slate-700 mb-2">{result.summary}</p>
                  <Button
                    size="sm"
                    onClick={() => importFromUrl(result.url)}
                    disabled={importing || !rightsConfirmed}
                    className="w-full"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Import
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="border-t pt-3">
          <Label className="text-xs font-semibold text-slate-700 mb-2 block">
            Or Import by URL
          </Label>
          <Input
            placeholder="https://..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="mb-3"
          />

          <div className="flex items-start gap-2 mb-3">
            <Checkbox
              id="rights"
              checked={rightsConfirmed}
              onCheckedChange={setRightsConfirmed}
            />
            <Label htmlFor="rights" className="text-xs text-slate-700 cursor-pointer">
              I confirm rights to use this content or it is available under open license (required)
            </Label>
          </div>

          <Button
            onClick={() => importFromUrl(url)}
            disabled={importing || !url.trim() || !rightsConfirmed}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600"
          >
            {importing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Import Guideline
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}