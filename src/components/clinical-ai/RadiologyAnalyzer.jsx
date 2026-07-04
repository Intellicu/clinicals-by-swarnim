import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, Loader2, ScanLine, BookOpen, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

// ── Modality-specific AI prompts ──────────────────────────────────────────────
const MODALITY_PROMPTS = {
  Ultrasound: `You are an expert pediatric radiologist. Analyze this renal/bladder ultrasound image. 
IMPORTANT: This is a clinical teaching tool — you MUST actively look for and report any pathology even if subtle.
Look specifically for: hydronephrosis (SFU grade 0-4), echogenicity changes, cortical thinning, medullary pyramids, scarring, cysts, stones, bladder wall thickening, post-void residual, ureteric dilatation, increased renal parenchymal echogenicity suggesting CKD/nephrotic syndrome.
DO NOT default to "normal" without careful assessment. Report all subtle findings.`,

  CT: `You are an expert pediatric radiologist reviewing a CT scan of the abdomen/pelvis/kidneys.
IMPORTANT: Actively look for ALL pathology — do not default to normal.
Look for: stones (size, location, HU density), obstruction, masses, cortical defects, enhancement patterns suggesting pyelonephritis or abscess, vascular anomalies, lymph nodes, incidental findings.`,

  MRI: `You are an expert pediatric radiologist reviewing an MRI of kidneys/urinary tract.
IMPORTANT: Report all findings actively.
Look for: signal characteristics, enhancement patterns, masses, cystic lesions, diffusion restriction, vascular findings, adrenal pathology.`,

  'X-Ray': `You are an expert pediatric radiologist reviewing a plain X-ray (KUB or chest).
IMPORTANT: Actively look for calcifications, opacities, bones, bowel gas pattern, any abnormality.
Look for: renal/ureteric/vesical calculi (radiopaque), nephrocalcinosis, vertebral anomalies, rib anomalies (fractures in NAI), pulmonary edema (in nephrotic), pleural effusions.`,

  VCUG: `You are an expert pediatric uroradiologist analyzing a Voiding Cystourethrogram (VCUG/MCUG).
CRITICAL: This study is done specifically to detect VUR, PUV, and bladder abnormalities. DO NOT report as normal unless clearly so.

MANDATORY reporting:
1. Vesicoureteric Reflux (VUR): Grade I-V for EACH kidney separately. Look for contrast entering ureters at any phase.
2. Posterior Urethral Valves (PUV): Dilated posterior urethra, abrupt caliber change, keyhole sign in male patients.
3. Bladder: Shape (normal/trabeculated/diverticula/saccules), capacity, wall irregularity, ureterocoele.
4. Urethra: Caliber, strictures, diverticula.
5. Timing: Filling phase vs voiding phase findings.

Grade VUR if present:
- Grade I: contrast in ureter only
- Grade II: contrast to renal pelvis, no dilatation  
- Grade III: mild dilatation ureter/pelvis
- Grade IV: moderate dilatation, blunting of calyces
- Grade V: gross dilatation, tortuous ureter, intraparenchymal reflux

Be vigilant — small amounts of reflux are commonly missed.`,

  DMSA: `You are an expert pediatric nuclear medicine radiologist analyzing a DMSA renal scan.
CRITICAL: Look actively for cortical defects/scars — this is the main purpose of the scan.

MANDATORY reporting:
1. Overall renal uptake: differential function (left vs right kidney %, normal = 45-55% each)
2. Cortical defects: location (upper/mid/lower pole), laterality, depth, photopenic areas
3. Scarring: acute pyelonephritis (photopenic on acute scan) vs chronic scars (persistent defects)
4. Kidney size/shape: relative size difference, contour irregularity
5. Overall impression: Normal / Cortical defect suggesting pyelonephritis / Chronic scarring / Reduced differential function

Acute pyelonephritis: photopenic (cold) areas with some residual uptake
Chronic scar: persistent cold area, cortical thinning, reduced pole uptake`,

  DTPA: `You are an expert pediatric nuclear medicine radiologist analyzing a DTPA/MAG3 renal scan (diuretic renogram).

MANDATORY reporting:
1. Differential renal function: left vs right % (normal 45-55% each)
2. Time-activity curves: shape, peak time (Tmax), T½ drainage time
3. Response to furosemide (Lasix):
   - Normal: rapid drainage, T½ < 10 minutes
   - Equivocal: T½ 10-20 minutes  
   - Obstructed: T½ > 20 minutes, poor response to furosemide
4. Drainage pattern: pelvic vs calyceal
5. Cortical transit time
6. Overall impression: Normal / Dilated non-obstructed / Obstructive uropathy

Report specifically: Is the hydronephrosis obstructive or non-obstructive?`,
};

// ── Educational content per modality ─────────────────────────────────────────
const MODALITY_EDUCATION = {
  VCUG: {
    title: "How to Read a VCUG (Voiding Cystourethrogram)",
    sections: [
      {
        heading: "What is VCUG?",
        content: "VCUG (also called MCUG — Micturating Cystourethrogram) is a fluoroscopic study of the bladder and urethra. A urethral catheter is inserted, contrast injected under gravity, and images taken during filling and voiding phases.",
      },
      {
        heading: "Antibiotic Prophylaxis",
        content: "Give prophylactic antibiotics before VCUG: Trimethoprim 2 mg/kg OD or Co-trimoxazole for 3 days (day before, day of, day after). Continue prophylaxis until VUR is excluded.",
      },
      {
        heading: "Steps of Interpretation",
        steps: [
          "1. Check patient details and indication",
          "2. Filling phase: Assess bladder outline, shape, wall (trabeculation/diverticula)",
          "3. Look for early reflux during filling (Grade I–III may be seen early)",
          "4. Voiding phase: Urethra caliber — look for posterior urethral dilation in boys (PUV)",
          "5. Check for ureterocoele (filling defect at bladder base)",
          "6. Post-void: Residual urine, any reflux draining back",
          "7. Grade any VUR bilaterally",
        ],
      },
      {
        heading: "VUR Grading (International Classification)",
        steps: [
          "Grade I: Reflux into ureter only (no pelvis)",
          "Grade II: Reflux to renal pelvis, no dilatation",
          "Grade III: Mild dilatation of ureter and pelvis, mild calyceal blunting",
          "Grade IV: Moderate dilatation, blunting of calyces, tortuous ureter",
          "Grade V: Gross dilatation, tortuous ureter, intraparenchymal reflux",
        ],
      },
      {
        heading: "Common Patterns to Recognize",
        steps: [
          "PUV (Posterior Urethral Valves): Dilated posterior urethra in males, 'keyhole' bladder on US, trabeculated bladder on VCUG",
          "High-grade VUR: Dilated tortuous ureter, dilated pelvis, intraparenchymal reflux",
          "Neurogenic bladder: Large, trabeculated, Christmas-tree shape, high-grade bilateral VUR",
          "Ureterocoele: Filling defect at ureteral orifice, 'cobra head' appearance",
          "Bladder diverticulum: Outpouching from bladder wall, may retain contrast post-void",
        ],
      },
    ],
  },
  DMSA: {
    title: "How to Read a DMSA Scan",
    sections: [
      {
        heading: "What is DMSA?",
        content: "DMSA (Dimercaptosuccinic acid) is a static renal cortical scintigram. It binds to proximal tubular cells and shows functioning renal cortical tissue. Gold standard for detecting renal scars and acute pyelonephritis.",
      },
      {
        heading: "Indications",
        steps: [
          "Acute pyelonephritis — detect cortical involvement",
          "Renal scarring after UTI — follow-up at 6 months post-infection",
          "Differential renal function assessment",
          "Ectopic kidney localization",
          "Post-VUR surgery — document scar burden",
        ],
      },
      {
        heading: "Steps of Interpretation",
        steps: [
          "1. Check overall kidney shape, size, and position",
          "2. Compare cortical uptake bilaterally (normal: smooth, homogeneous)",
          "3. Calculate differential function: Left vs Right % (normal 45–55%)",
          "4. Look for photopenic (cold/dark) areas — these are defects",
          "5. Location of defects: upper pole, lower pole, interpolar region",
          "6. Is the defect surface-based (cortical scar) or deep?",
          "7. Compare with prior scan if available (new vs old scarring)",
        ],
      },
      {
        heading: "Interpretation Patterns",
        steps: [
          "Normal: Uniform uptake, smooth outline, DF 45–55% each",
          "Acute pyelonephritis: Cold area WITH preserved outer cortical rim (rim sign)",
          "Chronic scar: Cold area, cortical thinning, volume loss at that pole",
          "Global reduction: Reduced overall uptake — CKD/reflux nephropathy",
          "Duplex kidney: Two separate collecting areas, assess each separately",
        ],
      },
    ],
  },
  DTPA: {
    title: "How to Read a DTPA / MAG3 Diuretic Renogram",
    sections: [
      {
        heading: "What is DTPA/MAG3?",
        content: "Dynamic renal scan using DTPA (filtered by glomeruli) or MAG3 (secreted by tubules — preferred in children). Assesses differential renal function AND drainage. Used to determine if hydronephrosis is obstructive.",
      },
      {
        heading: "The Three Phases",
        steps: [
          "Phase 1 (0–2 min): Vascular phase — perfusion assessment",
          "Phase 2 (2–5 min): Cortical uptake — tubular function",
          "Phase 3 (5+ min): Drainage phase — ureteric/pelvic emptying",
          "Furosemide given at 15–20 min to challenge drainage",
        ],
      },
      {
        heading: "Steps of Interpretation",
        steps: [
          "1. Differential function: Read from 2–3 min data (before drainage). Normal = 45–55%",
          "2. Time-activity curve shape: Rising, plateau, or falling?",
          "3. Tmax (time to peak): Normal < 5 min. Delayed = obstruction/poor function",
          "4. Post-Lasix T½: < 10 min = non-obstructed; 10–20 min = equivocal; > 20 min = obstructed",
          "5. Drainage pattern: Does collecting system empty? Any residual?",
          "6. Background subtraction: Important for accurate DF calculation",
        ],
      },
      {
        heading: "Clinical Interpretation",
        steps: [
          "Well-hydrated child essential — dehydration causes false obstruction pattern",
          "UPJO: Dilated pelvis, slow drainage, T½ > 20 min post-Lasix",
          "VUJ obstruction: Ureteric hold-up, late pelvic drainage",
          "Non-obstructive hydronephrosis: Good drainage post-Lasix, T½ < 10 min",
          "Poor differential function (< 40%): May need repeat with optimal hydration",
        ],
      },
    ],
  },
};

function EducationPanel({ modality }) {
  const edu = MODALITY_EDUCATION[modality];
  const [open, setOpen] = useState(false);
  if (!edu) return null;

  return (
    <Card className="border-blue-200 bg-blue-50">
      <button className="w-full flex items-center justify-between px-4 py-3" onClick={() => setOpen(v => !v)}>
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-bold text-blue-900">{edu.title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-blue-600" /> : <ChevronDown className="w-4 h-4 text-blue-600" />}
      </button>
      {open && (
        <CardContent className="pt-0 px-4 pb-4 space-y-4">
          {edu.sections.map((sec, i) => (
            <div key={i} className="bg-white rounded-xl p-3 border border-blue-100">
              <p className="text-xs font-bold text-blue-800 mb-2">{sec.heading}</p>
              {sec.content && <p className="text-xs text-slate-700">{sec.content}</p>}
              {sec.steps && (
                <ul className="space-y-1">
                  {sec.steps.map((s, j) => (
                    <li key={j} className="text-xs text-slate-700 leading-snug">{s}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  );
}

const MODALITIES = ['Ultrasound', 'CT', 'MRI', 'X-Ray', 'VCUG', 'DMSA', 'DTPA'];

export default function RadiologyAnalyzer() {
  const [radiologyImage, setRadiologyImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [modalityType, setModalityType] = useState('Ultrasound');
  const [analysis, setAnalysis] = useState(null);

  const handleImageSelect = (file) => {
    setRadiologyImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
    setAnalysis(null);
  };

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const uploadResult = await base44.integrations.Core.UploadFile({ file: radiologyImage });
      const modalityPrompt = MODALITY_PROMPTS[modalityType] || MODALITY_PROMPTS.Ultrasound;

      const result = await base44.integrations.Core.InvokeLLM({
        model: 'claude_sonnet_4_6',
        prompt: `${modalityPrompt}

Provide a STRUCTURED DETAILED REPORT. 
IMPORTANT RULES:
- Do NOT default to "normal" — actively describe ALL findings including subtle ones
- For VCUG: specifically grade VUR if ANY reflux is visible
- For DMSA: specifically describe ANY photopenic areas with location
- For DTPA: specifically state if obstruction is present and drainage times
- If image quality limits interpretation, say what CAN be assessed and what cannot
- Always give a specific impression — avoid vague non-committal statements
- This is for educational purposes — highlight teaching points`,
        file_urls: [uploadResult.file_url],
        response_json_schema: {
          type: "object",
          properties: {
            image_quality: { type: "string" },
            modality_specific_findings: { type: "string" },
            kidney_findings: {
              type: "object",
              properties: {
                right_kidney: { type: "string" },
                left_kidney: { type: "string" },
                sizes: { type: "string" },
                echogenicity: { type: "string" }
              }
            },
            abnormal_findings: { type: "array", items: { type: "string" } },
            vur_grading: { type: "string" },
            differential_function: { type: "string" },
            drainage_assessment: { type: "string" },
            hydronephrosis: { type: "string" },
            bladder_findings: { type: "string" },
            impression: { type: "string" },
            differential_diagnosis: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } },
            severity_grade: { type: "string" },
            teaching_points: { type: "array", items: { type: "string" } },
          }
        }
      });

      return result;
    },
    onSuccess: (data) => {
      setAnalysis(data);
      toast.success('Radiology analysis complete!');
    },
    onError: () => toast.error('Analysis failed — please try again'),
  });

  return (
    <div className="space-y-4">
      {/* Educational panel for nuclear/VCUG modalities */}
      <EducationPanel modality={modalityType} />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ScanLine className="w-5 h-5 text-blue-600" />
            Radiology AI Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-semibold mb-2 block">Imaging Modality</label>
            <div className="flex gap-1.5 flex-wrap">
              {MODALITIES.map(modality => (
                <Button
                  key={modality}
                  variant={modalityType === modality ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => { setModalityType(modality); setAnalysis(null); }}
                  className="text-xs h-8"
                >
                  {modality}
                </Button>
              ))}
            </div>
          </div>

          {(modalityType === 'VCUG' || modalityType === 'DMSA' || modalityType === 'DTPA') && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800">
                  <p className="font-bold mb-1">
                    {modalityType === 'VCUG' && 'VCUG/MCUG: Specifically optimized to detect VUR (Grade I–V) and PUV'}
                    {modalityType === 'DMSA' && 'DMSA: Optimized to detect renal cortical defects and scarring'}
                    {modalityType === 'DTPA' && 'DTPA/MAG3: Optimized to assess differential function and obstruction'}
                  </p>
                  <p>Read the educational guide above before uploading images for best learning.</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-semibold mb-2 block">Upload Image</label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files[0] && handleImageSelect(e.target.files[0])}
                className="hidden"
                id="radiology-upload"
              />
              <label htmlFor="radiology-upload" className="cursor-pointer">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded" />
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600">Click to upload {modalityType} image</p>
                    <p className="text-xs text-slate-400 mt-1">JPG, PNG supported</p>
                  </>
                )}
              </label>
            </div>
          </div>

          <Button
            onClick={() => analyzeMutation.mutate()}
            disabled={!radiologyImage || analyzeMutation.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {analyzeMutation.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyzing {modalityType}...</>
            ) : (
              <><ScanLine className="w-4 h-4 mr-2" />Analyze {modalityType}</>
            )}
          </Button>
        </CardContent>
      </Card>

      {analysis && (
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Radiology Report — {modalityType}</span>
              <Badge className="bg-blue-600 text-white text-xs">AI Analysis</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-semibold mb-2 text-sm">Image Quality</h4>
              <p className="text-sm text-slate-700">{analysis.image_quality}</p>
            </div>

            {/* Modality-specific findings shown prominently */}
            {analysis.modality_specific_findings && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-sm text-indigo-900">
                  {modalityType === 'VCUG' ? 'VUR Grading & Urethral Findings' :
                   modalityType === 'DMSA' ? 'Cortical Defect Analysis' :
                   modalityType === 'DTPA' ? 'Differential Function & Drainage' :
                   'Key Findings'}
                </h4>
                <p className="text-sm text-indigo-800 whitespace-pre-line">{analysis.modality_specific_findings}</p>
              </div>
            )}

            {/* VUR grading for VCUG */}
            {analysis.vur_grading && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-sm text-red-900">VUR Assessment</h4>
                <p className="text-sm text-red-800">{analysis.vur_grading}</p>
              </div>
            )}

            {/* Nuclear medicine specific */}
            {analysis.differential_function && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-sm text-purple-900">Differential Renal Function</h4>
                <p className="text-sm text-purple-800">{analysis.differential_function}</p>
              </div>
            )}
            {analysis.drainage_assessment && (
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-sm text-teal-900">Drainage Assessment</h4>
                <p className="text-sm text-teal-800">{analysis.drainage_assessment}</p>
              </div>
            )}

            {analysis.kidney_findings && (
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold mb-3 text-sm">Kidney Findings</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <Badge className="mb-2 bg-blue-600 text-xs">Right Kidney</Badge>
                    <p className="text-sm text-slate-700">{analysis.kidney_findings.right_kidney}</p>
                  </div>
                  <div>
                    <Badge className="mb-2 bg-blue-600 text-xs">Left Kidney</Badge>
                    <p className="text-sm text-slate-700">{analysis.kidney_findings.left_kidney}</p>
                  </div>
                </div>
                {analysis.kidney_findings.sizes && (
                  <div className="mt-3 pt-3 border-t text-sm">
                    <p><strong>Sizes:</strong> {analysis.kidney_findings.sizes}</p>
                    {analysis.kidney_findings.echogenicity && <p className="mt-1"><strong>Echogenicity:</strong> {analysis.kidney_findings.echogenicity}</p>}
                  </div>
                )}
              </div>
            )}

            {analysis.abnormal_findings?.length > 0 && (
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <h4 className="font-semibold mb-2 text-sm text-red-900">Abnormal Findings</h4>
                <ul className="space-y-1">
                  {analysis.abnormal_findings.map((finding, idx) => (
                    <li key={idx} className="text-sm text-red-800">⚠ {finding}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.hydronephrosis && (
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-sm">Hydronephrosis</h4>
                <p className="text-sm text-slate-700">{analysis.hydronephrosis}</p>
              </div>
            )}

            {analysis.bladder_findings && (
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-sm">Bladder Findings</h4>
                <p className="text-sm text-slate-700">{analysis.bladder_findings}</p>
              </div>
            )}

            <div className="bg-white rounded-lg p-4">
              <h4 className="font-semibold mb-2 text-sm">Impression</h4>
              <p className="text-sm text-slate-700 mb-3">{analysis.impression}</p>
              {analysis.severity_grade && (
                <Badge className="bg-orange-600 text-white">{analysis.severity_grade}</Badge>
              )}
            </div>

            {analysis.differential_diagnosis?.length > 0 && (
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-sm">Differential Diagnosis</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.differential_diagnosis.map((dx, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">{dx}</Badge>
                  ))}
                </div>
              </div>
            )}

            {analysis.recommendations?.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold mb-2 text-sm text-blue-900">Recommendations</h4>
                <ul className="space-y-1">
                  {analysis.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm text-blue-800">→ {rec}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.teaching_points?.length > 0 && (
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h4 className="font-semibold mb-2 text-sm text-green-900">📚 Teaching Points</h4>
                <ul className="space-y-1">
                  {analysis.teaching_points.map((pt, idx) => (
                    <li key={idx} className="text-sm text-green-800">• {pt}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs text-amber-800"><strong>⚠️ Disclaimer:</strong> AI analysis is for educational and decision-support purposes only. Clinical correlation and expert radiologist review is mandatory before clinical action.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}