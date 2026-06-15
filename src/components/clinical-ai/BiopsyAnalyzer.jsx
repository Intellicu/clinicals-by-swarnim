import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Upload, Loader2, Microscope, AlertCircle, BookOpen, ExternalLink, ArrowRight, Stethoscope } from 'lucide-react';
import { toast } from 'sonner';

// ── Pattern → Pathway/Engine mappings ────────────────────────────────────────
const PATTERN_LINKS = {
  "FSGS": [
    { label: "SRNS Pathway", page: "ClinicalSupport", params: "?tab=pathways&search=SRNS" },
    { label: "Nephrotic Syndrome Engine", page: "ClinicalAIHub", params: "?tab=nephroticengine" },
    { label: "FSGS Guidelines", page: "GuidelinesLibrary", params: "?search=FSGS" },
  ],
  "MCD": [
    { label: "Nephrotic Syndrome Pathway", page: "ClinicalSupport", params: "?tab=pathways&search=nephrotic" },
    { label: "NS Engine", page: "ClinicalAIHub", params: "?tab=nephroticengine" },
  ],
  "IgAN": [
    { label: "IgA Nephropathy Guidelines", page: "GuidelinesLibrary", params: "?search=IgAN" },
    { label: "GN Approaches", page: "GlomerularDiseases", params: "?search=IgA" },
  ],
  "Membranous": [
    { label: "Membranous Nephropathy", page: "GlomerularDiseases", params: "?search=membranous" },
    { label: "KDIGO MN Guidelines", page: "GuidelinesLibrary", params: "?search=membranous" },
  ],
  "Lupus": [
    { label: "Lupus Nephritis Pathway", page: "ClinicalSupport", params: "?tab=pathways&search=lupus" },
    { label: "LN Engine", page: "ClinicalAIHub", params: "?tab=lupus" },
  ],
  "ANCA": [
    { label: "ANCA Vasculitis Pathway", page: "GlomerularDiseases", params: "?search=ANCA" },
    { label: "RPGN Engine", page: "ClinicalAIHub", params: "?tab=rpgn" },
  ],
  "Alport": [
    { label: "Alport/HNF1B Engine", page: "ClinicalAIHub", params: "?tab=alport" },
    { label: "Genetic Testing", page: "GeneticReportAnalyzer", params: "" },
  ],
  "Diabetic": [
    { label: "CKD Pathway", page: "ClinicalSupport", params: "?tab=pathways&search=CKD" },
    { label: "CKD Engine", page: "ClinicalAIHub", params: "?tab=ckd" },
  ],
  "TMA": [
    { label: "aHUS/TMA Engine", page: "ClinicalAIHub", params: "?tab=ahus" },
    { label: "Emergency Hub", page: "EmergencyHub", params: "?search=TMA" },
  ],
  "default": [
    { label: "Glomerular Diseases", page: "GlomerularDiseases", params: "" },
    { label: "Guidelines Library", page: "GuidelinesLibrary", params: "" },
    { label: "CKD Engine", page: "ClinicalAIHub", params: "?tab=ckd" },
  ],
};

function getPatternLinks(diagnosis) {
  if (!diagnosis) return PATTERN_LINKS.default;
  const d = diagnosis.toUpperCase();
  for (const [key, links] of Object.entries(PATTERN_LINKS)) {
    if (key !== "default" && d.includes(key.toUpperCase())) return links;
  }
  return PATTERN_LINKS.default;
}

// ── Educational content ───────────────────────────────────────────────────────
const BIOPSY_EDUCATION = [
  {
    heading: "Light Microscopy Patterns",
    items: [
      { pattern: "Minimal Change Disease (MCD)", lm: "Normal or minimal changes", if: "Negative", em: "Podocyte foot process effacement", clinical: "Nephrotic syndrome, corticosteroid-responsive" },
      { pattern: "FSGS", lm: "Segmental sclerosis with hyalinosis", if: "Variable IgM, C3", em: "Foot process effacement", clinical: "Nephrotic syndrome, often steroid-resistant" },
      { pattern: "Membranous Nephropathy", lm: "GBM thickening, spikes on silver stain", if: "IgG, C3 granular subepithelial", em: "Subepithelial deposits", clinical: "Nephrotic syndrome; check PLA2R Ab" },
      { pattern: "IgA Nephropathy", lm: "Mesangial proliferation", if: "IgA dominant mesangial", em: "Mesangial deposits", clinical: "Haematuria, proteinuria; OXFORD classification" },
      { pattern: "Lupus Nephritis (Class IV)", lm: "Diffuse endocapillary proliferation, wire loops", if: "Full house (IgG/IgA/IgM/C3/C1q)", em: "Subendothelial deposits", clinical: "Nephrotic + nephritic; SLICC criteria" },
      { pattern: "MPGN", lm: "Mesangial + endocapillary proliferation, double contours", if: "C3 ± IgG/IgM", em: "Intramembranous/subendothelial deposits", clinical: "Nephrotic/nephritic, C3/C4 assessment" },
    ]
  },
  {
    heading: "Oxford Classification (IgAN)",
    items: [
      { pattern: "M (Mesangial hypercellularity)", lm: ">0.5 mesangial cells per mesangial area", if: "—", em: "—", clinical: "M0: ≤50% glomeruli; M1: >50%" },
      { pattern: "E (Endocapillary proliferation)", lm: "Hypercellularity within capillary lumen", if: "—", em: "—", clinical: "E0: absent; E1: present" },
      { pattern: "S (Segmental sclerosis)", lm: "Adhesion, sclerosis, collapse", if: "—", em: "—", clinical: "S0: absent; S1: present" },
      { pattern: "T (Tubular atrophy/Interstitial fibrosis)", lm: "Percentage of cortical area", if: "—", em: "—", clinical: "T0: 0–25%; T1: 26–50%; T2: >50%" },
    ]
  },
  {
    heading: "Immunofluorescence Key Patterns",
    items: [
      { pattern: "Full-house", lm: "—", if: "IgG + IgA + IgM + C3 + C1q", em: "—", clinical: "Lupus nephritis until proven otherwise" },
      { pattern: "Granular subepithelial IgG", lm: "—", if: "IgG C3 subepithelial granular", em: "—", clinical: "Membranous nephropathy" },
      { pattern: "Mesangial IgA dominant", lm: "—", if: "IgA > IgG, mesangial", em: "—", clinical: "IgA nephropathy / IgAV nephritis" },
      { pattern: "Linear IgG on GBM", lm: "—", if: "Linear IgG, sometimes IgA", em: "—", clinical: "Anti-GBM disease (Goodpasture)" },
      { pattern: "Pauci-immune", lm: "Necrotising crescentic GN", if: "Negative/minimal", em: "No immune deposits", clinical: "ANCA vasculitis (PR3-ANCA/MPO-ANCA)" },
    ]
  }
];

// ── Main Component ────────────────────────────────────────────────────────────
export default function BiopsyAnalyzer() {
  const [biopsyImage, setBiopsyImage] = useState(null);
  const [biopsyText, setBiopsyText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState('analyze');

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      let imageUrl = null;
      if (biopsyImage) {
        const uploadResult = await base44.integrations.Core.UploadFile({ file: biopsyImage });
        imageUrl = uploadResult.file_url;
      }

      const result = await base44.integrations.Core.InvokeLLM({
        model: "claude_sonnet_4_6",
        prompt: `You are a senior nephropathologist with expertise in paediatric renal biopsies. Provide expert-level histopathological analysis.
        
        ${biopsyText ? `Report text: ${biopsyText}` : ''}
        
        Provide comprehensive analysis including:
        1. Primary diagnosis with confidence level
        2. Key histopathological features (LM, IF, EM)
        3. Severity grading and prognosis
        4. Treatment recommendations (reference KDIGO/IPNA guidelines)
        5. Differential diagnoses
        6. Follow-up biopsy indications
        7. Key references (specific guidelines/papers)
        
        Be specific with nephrology terminology and reference KDIGO guidelines where applicable.`,
        file_urls: imageUrl ? [imageUrl] : undefined,
        response_json_schema: {
          type: "object",
          properties: {
            primary_diagnosis: { type: "string" },
            confidence_level: { type: "string" },
            glomerular_findings: { type: "array", items: { type: "string" } },
            tubular_findings: { type: "array", items: { type: "string" } },
            interstitial_findings: { type: "array", items: { type: "string" } },
            vascular_findings: { type: "array", items: { type: "string" } },
            immunofluorescence: { type: "string" },
            electron_microscopy: { type: "string" },
            severity_grade: { type: "string" },
            prognosis: { type: "string" },
            treatment_recommendations: { type: "array", items: { type: "string" } },
            differential_diagnoses: { type: "array", items: { type: "string" } },
            follow_up_needed: { type: "boolean" },
            key_references: { type: "array", items: { type: "string" } }
          }
        }
      });

      return result;
    },
    onSuccess: (data) => {
      setAnalysis(data);
      setActiveTab('results');
      toast.success('Biopsy analysis complete!');
    },
    onError: () => {
      toast.error('Analysis failed');
    }
  });

  const patternLinks = getPatternLinks(analysis?.primary_diagnosis);

  return (
    <div className="space-y-4">
      {/* Tab Bar */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
        <button onClick={() => setActiveTab('analyze')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'analyze' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
          <Microscope className="w-3.5 h-3.5" /> Analyse Biopsy
        </button>
        {analysis && (
          <button onClick={() => setActiveTab('results')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'results' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <Stethoscope className="w-3.5 h-3.5" /> Results
          </button>
        )}
        <button onClick={() => setActiveTab('education')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'education' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
          <BookOpen className="w-3.5 h-3.5" /> Pattern Guide
        </button>
      </div>

      {/* ── Analyse Tab ── */}
      {activeTab === 'analyze' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Microscope className="w-5 h-5 text-purple-600" />
              Renal Biopsy AI Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-2 block">Upload Biopsy Images/Report</label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors relative cursor-pointer">
                <input type="file" accept="image/*,.pdf" onChange={(e) => setBiopsyImage(e.target.files[0])}
                  className="absolute inset-0 opacity-0 cursor-pointer" id="biopsy-upload" />
                <label htmlFor="biopsy-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600">
                    {biopsyImage ? biopsyImage.name : 'Click to upload biopsy images or PDF report'}
                  </p>
                </label>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold mb-2 block">Or Paste Biopsy Report Text</label>
              <Textarea value={biopsyText} onChange={(e) => setBiopsyText(e.target.value)} rows={8}
                placeholder="Paste histopathology report, immunofluorescence findings, electron microscopy details..." />
            </div>

            <Button onClick={() => analyzeMutation.mutate()}
              disabled={(!biopsyImage && !biopsyText) || analyzeMutation.isPending}
              className="w-full bg-purple-600 hover:bg-purple-700">
              {analyzeMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing Biopsy...</>
              ) : (
                <><Microscope className="w-4 h-4 mr-2" /> Analyze Biopsy</>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── Results Tab ── */}
      {activeTab === 'results' && analysis && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-200 p-4 space-y-4">
            {/* Primary diagnosis */}
            <div className="bg-white rounded-xl p-4 border-2 border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-base">Primary Diagnosis</h3>
                <Badge className="bg-purple-600 text-white">{analysis.confidence_level}</Badge>
              </div>
              <p className="text-purple-900 font-bold text-lg">{analysis.primary_diagnosis}</p>
              <Badge className="mt-1">{analysis.severity_grade}</Badge>
            </div>

            {/* Histology findings grid */}
            <div className="grid grid-cols-1 gap-3">
              {analysis.glomerular_findings?.length > 0 && (
                <div className="bg-white rounded-xl p-3">
                  <h4 className="font-semibold text-sm mb-2 text-purple-800">Glomerular Findings</h4>
                  <ul className="space-y-1">{analysis.glomerular_findings.map((f, i) => <li key={i} className="text-xs text-slate-700">• {f}</li>)}</ul>
                </div>
              )}
              {(analysis.tubular_findings?.length > 0 || analysis.interstitial_findings?.length > 0) && (
                <div className="bg-white rounded-xl p-3">
                  <h4 className="font-semibold text-sm mb-2 text-slate-800">Tubular & Interstitial</h4>
                  <ul className="space-y-1">
                    {[...(analysis.tubular_findings || []), ...(analysis.interstitial_findings || [])].map((f, i) => <li key={i} className="text-xs text-slate-700">• {f}</li>)}
                  </ul>
                </div>
              )}
              {analysis.immunofluorescence && (
                <div className="bg-white rounded-xl p-3">
                  <h4 className="font-semibold text-sm mb-2 text-blue-800">Immunofluorescence</h4>
                  <p className="text-xs text-slate-700">{analysis.immunofluorescence}</p>
                </div>
              )}
              {analysis.electron_microscopy && (
                <div className="bg-white rounded-xl p-3">
                  <h4 className="font-semibold text-sm mb-2 text-slate-800">Electron Microscopy</h4>
                  <p className="text-xs text-slate-700">{analysis.electron_microscopy}</p>
                </div>
              )}
            </div>

            {/* Prognosis */}
            {analysis.prognosis && (
              <div className="bg-white rounded-xl p-3">
                <h4 className="font-semibold text-sm mb-1">Prognosis</h4>
                <p className="text-xs text-slate-700">{analysis.prognosis}</p>
              </div>
            )}

            {/* Treatment */}
            {analysis.treatment_recommendations?.length > 0 && (
              <div className="bg-green-50 rounded-xl p-3 border border-green-200">
                <h4 className="font-semibold text-sm mb-2 text-green-900">Treatment Recommendations</h4>
                <ul className="space-y-1">{analysis.treatment_recommendations.map((r, i) => <li key={i} className="text-xs text-green-800">✓ {r}</li>)}</ul>
              </div>
            )}

            {/* Differentials */}
            {analysis.differential_diagnoses?.length > 0 && (
              <div className="bg-white rounded-xl p-3">
                <h4 className="font-semibold text-sm mb-2">Differential Diagnoses</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.differential_diagnoses.map((dx, i) => <Badge key={i} variant="outline" className="text-xs">{dx}</Badge>)}
                </div>
              </div>
            )}

            {/* References */}
            {analysis.key_references?.length > 0 && (
              <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
                <h4 className="font-semibold text-sm mb-2 text-amber-900">📚 Key References</h4>
                <ul className="space-y-1">{analysis.key_references.map((r, i) => <li key={i} className="text-xs text-amber-800">• {r}</li>)}</ul>
              </div>
            )}

            {analysis.follow_up_needed && (
              <div className="bg-yellow-50 rounded-xl p-3 border border-yellow-200">
                <AlertCircle className="w-4 h-4 text-yellow-600 inline mr-2" />
                <span className="text-xs text-yellow-800 font-semibold">Follow-up biopsy may be indicated</span>
              </div>
            )}

            {/* Pathway links */}
            <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
              <h4 className="font-semibold text-sm mb-2 text-blue-900">📎 Related Pathways & Tools</h4>
              <div className="flex flex-wrap gap-2">
                {patternLinks.map((link, i) => (
                  <Link key={i} to={`/${link.page}${link.params}`}
                    className="flex items-center gap-1 text-xs bg-blue-100 text-blue-800 border border-blue-300 rounded-lg px-2.5 py-1.5 hover:bg-blue-200 transition-colors">
                    {link.label} <ArrowRight className="w-3 h-3" />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <Button variant="outline" size="sm" className="w-full" onClick={() => setActiveTab('analyze')}>
            Analyse Another Biopsy
          </Button>
        </div>
      )}

      {/* ── Education Tab ── */}
      {activeTab === 'education' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
            <p className="text-xs font-bold text-blue-800 mb-1 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> Paediatric Renal Biopsy Pattern Guide
            </p>
            <p className="text-xs text-blue-700">Quick reference for key histopathological patterns — LM, IF, EM findings and clinical correlation.</p>
          </div>

          {BIOPSY_EDUCATION.map((section, si) => (
            <div key={si} className="space-y-2">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-widest">{section.heading}</p>
              {section.items.map((item, ii) => (
                <div key={ii} className="bg-white border border-slate-200 rounded-xl p-3">
                  <p className="text-xs font-bold text-purple-800 mb-1.5">{item.pattern}</p>
                  <div className="grid grid-cols-1 gap-1 text-xs">
                    {item.lm && item.lm !== "—" && <p><span className="font-semibold text-slate-600">LM: </span><span className="text-slate-700">{item.lm}</span></p>}
                    {item.if && item.if !== "—" && <p><span className="font-semibold text-slate-600">IF: </span><span className="text-slate-700">{item.if}</span></p>}
                    {item.em && item.em !== "—" && <p><span className="font-semibold text-slate-600">EM: </span><span className="text-slate-700">{item.em}</span></p>}
                    <p><span className="font-semibold text-green-700">Clinical: </span><span className="text-slate-700">{item.clinical}</span></p>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* Quick links to related tools */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
            <p className="text-xs font-bold text-slate-700 mb-2">🔗 Related Clinical Tools</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "GN / Glomerular Diseases", page: "GlomerularDiseases", params: "" },
                { label: "RPGN Engine", page: "ClinicalAIHub", params: "?tab=rpgn" },
                { label: "NS Pathway", page: "ClinicalSupport", params: "?tab=pathways&search=nephrotic" },
                { label: "Genetics Analyzer", page: "GeneticReportAnalyzer", params: "" },
                { label: "Guidelines Library", page: "GuidelinesLibrary", params: "" },
              ].map((link, i) => (
                <Link key={i} to={`/${link.page}${link.params}`}
                  className="flex items-center gap-1 text-xs bg-white text-slate-700 border border-slate-300 rounded-lg px-2.5 py-1.5 hover:bg-blue-50 hover:border-blue-300 transition-colors">
                  {link.label} <ArrowRight className="w-3 h-3" />
                </Link>
              ))}
            </div>
          </div>

          <p className="text-[10px] text-slate-400 text-center px-2">Educational reference only. All findings should be interpreted by a qualified nephropathologist in clinical context.</p>
        </div>
      )}
    </div>
  );
}