import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { base44 } from '@/api/client';
import { BarChart3, Upload, Brain, TrendingUp, Calculator, FileSpreadsheet, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function StatisticalAnalysis({ projectId }) {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
      toast.error('Please upload CSV or Excel file');
      return;
    }

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploadedFile({ name: file.name, url: file_url });
      toast.success('Dataset uploaded!');
    } catch (error) {
      toast.error('Upload failed');
    }
  };

  const analyzeDataset = async () => {
    if (!uploadedFile) return;

    setIsAnalyzing(true);
    try {
      const prompt = `Analyze this research dataset for a pediatric nephrology study.

FILE: ${uploadedFile.name}

Perform comprehensive statistical analysis:

1. DATA STRUCTURE ANALYSIS:
   - Identify all variables (continuous, categorical, ordinal)
   - Detect variable types automatically
   - Flag missing data
   - Identify outliers

2. DESCRIPTIVE STATISTICS:
   - For continuous: mean, SD, median, IQR, range
   - For categorical: frequencies, percentages
   - Summary tables ready for publication

3. STATISTICAL TEST RECOMMENDATIONS:
   - Suggest appropriate tests based on:
     * Variable types
     * Distribution (normality tests)
     * Sample size
     * Study design
   - Explain why each test is chosen
   - Flag assumption violations

4. HYPOTHESIS GENERATION:
   - Suggest research questions based on data
   - Identify potential associations
   - Highlight interesting patterns

5. SAMPLE SIZE ADEQUACY:
   - Evaluate if sample size is sufficient
   - Power calculations
   - Effect size estimates

6. VISUALIZATION RECOMMENDATIONS:
   - Suggest appropriate charts
   - Generate plot specifications

Provide structured output ready for research publication.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        file_urls: [uploadedFile.url],
        response_json_schema: {
          type: 'object',
          properties: {
            data_summary: {
              type: 'object',
              properties: {
                total_rows: { type: 'number' },
                total_columns: { type: 'number' },
                variable_types: { type: 'object' },
                missing_data: { type: 'object' }
              }
            },
            descriptive_statistics: {
              type: 'object',
              properties: {
                continuous_variables: { type: 'array', items: { type: 'object' } },
                categorical_variables: { type: 'array', items: { type: 'object' } }
              }
            },
            statistical_tests: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  test_name: { type: 'string' },
                  variables: { type: 'string' },
                  rationale: { type: 'string' },
                  assumptions: { type: 'array', items: { type: 'string' } },
                  interpretation_guide: { type: 'string' }
                }
              }
            },
            hypotheses: {
              type: 'array',
              items: { type: 'string' }
            },
            sample_size_assessment: { type: 'string' },
            visualizations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  variables: { type: 'string' },
                  purpose: { type: 'string' }
                }
              }
            },
            publication_ready_tables: {
              type: 'array',
              items: { type: 'string' }
            }
          }
        }
      });

      setAnalysis(response);
      toast.success('Analysis complete!');
    } catch (error) {
      toast.error('Analysis failed');
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-xl">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            AI Statistical Analysis Engine
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <Alert className="bg-blue-50 border-blue-200">
            <FileSpreadsheet className="w-4 h-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Upload your dataset (CSV/Excel) for AI-powered statistical analysis, test recommendations, and hypothesis generation.
            </AlertDescription>
          </Alert>

          <div className="border-2 border-dashed border-purple-300 rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <input
              type="file"
              accept=".csv,.xlsx"
              onChange={handleFileUpload}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
            />
            {uploadedFile && (
              <div className="mt-4">
                <Badge className="bg-green-100 text-green-800">
                  ✓ {uploadedFile.name}
                </Badge>
              </div>
            )}
          </div>

          <Button
            onClick={analyzeDataset}
            disabled={!uploadedFile || isAnalyzing}
            className="w-full bg-purple-600"
          >
            {isAnalyzing ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
            ) : (
              <><Brain className="w-4 h-4 mr-2" /> Analyze with AI</>
            )}
          </Button>
        </CardContent>
      </Card>

      {analysis && (
        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardHeader>
              <CardTitle>Dataset Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">{analysis.data_summary?.total_rows}</div>
                  <div className="text-sm text-slate-600">Total Records</div>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">{analysis.data_summary?.total_columns}</div>
                  <div className="text-sm text-slate-600">Variables</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {analysis.statistical_tests && (
            <Card>
              <CardHeader className="bg-green-50">
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-green-600" />
                  Recommended Statistical Tests
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {analysis.statistical_tests.map((test, idx) => (
                  <div key={idx} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <h4 className="font-semibold text-slate-900 mb-2">{test.test_name}</h4>
                    <p className="text-sm text-slate-700 mb-2"><strong>Variables:</strong> {test.variables}</p>
                    <p className="text-sm text-slate-700 mb-2"><strong>Rationale:</strong> {test.rationale}</p>
                    {test.assumptions && test.assumptions.length > 0 && (
                      <div className="mt-2">
                        <strong className="text-xs text-slate-600">Assumptions:</strong>
                        <ul className="mt-1 space-y-1">
                          {test.assumptions.map((assumption, i) => (
                            <li key={i} className="text-xs text-slate-600 ml-4">• {assumption}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {analysis.hypotheses && analysis.hypotheses.length > 0 && (
            <Card className="bg-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  AI-Generated Hypotheses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.hypotheses.map((hyp, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-purple-900">
                      <Badge className="bg-purple-200 text-purple-900 mt-0.5">{idx + 1}</Badge>
                      {hyp}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {analysis.visualizations && analysis.visualizations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Recommended Visualizations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.visualizations.map((viz, idx) => (
                    <div key={idx} className="bg-blue-50 p-3 rounded-lg">
                      <div className="font-semibold text-blue-900">{viz.type}</div>
                      <div className="text-sm text-blue-700">Variables: {viz.variables}</div>
                      <div className="text-xs text-blue-600 mt-1">{viz.purpose}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}