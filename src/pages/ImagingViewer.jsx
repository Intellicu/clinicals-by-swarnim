import React, { useState } from 'react';
import DICOMImageViewer from '@/components/imaging/DICOMImageViewer';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { base44 } from "@/api/base44Client";
import { Search, User, Eye, Activity, FileText, ChevronDown, ChevronUp, CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const RADIOLOGY_GUIDES = [
  {
    id: "cakut_us",
    title: "CAKUT Ultrasound Interpretation",
    badge: "Renal USS",
    color: "from-blue-600 to-indigo-700",
    sections: [
      { heading: "Renal Size & Echogenicity", items: [
        "Normal renal length (cm) ≈ 6 + 0.27 × age (years); neonatal normal: 4–5 cm",
        "Echogenicity: neonates — cortex normally more echogenic than adult (may equal or exceed liver in first weeks — normal)",
        "Increased echogenicity (brighter than liver): suggests medical renal disease (glomerulonephritis, AKI, dysplasia)",
        "Decreased echogenicity: difficult to assess; compare with contralateral kidney",
        "Loss of corticomedullary differentiation: significant — suggests severe parenchymal disease",
        "Medullary pyramids: hypoechoic, triangular — normal finding (not cysts); prominent in neonates",
      ]},
      { heading: "CAKUT Patterns", items: [
        "Renal agenesis: absent kidney; compensatory hypertrophy of contralateral side",
        "Multicystic dysplastic kidney (MCDK): multiple non-communicating cysts; no normal renal tissue; involutes with time",
        "Horseshoe kidney: lower poles fused at midline; isthmus anterior to aorta/IVC",
        "Duplex collecting system: two renal pelves; upper moiety often obstructed (ureterocele); lower moiety prone to VUR",
        "Renal ectopia: pelvic kidney most common; confirm vascularity with Doppler",
        "Pelvi-ureteric junction (PUJ) obstruction: hydronephrosis without ureteral dilation; measure AP pelvis diameter (>10 mm antenatal; >15 mm postnatal — significant)",
      ]},
      { heading: "Hydronephrosis Grading (SFU)", items: [
        "Grade 0: no hydronephrosis",
        "Grade 1: mild pyelectasis; renal pelvis visualised only",
        "Grade 2: pelvis + calyces; no parenchymal thinning",
        "Grade 3: pelvis + calyces + parenchymal thinning beginning",
        "Grade 4: gross hydronephrosis; marked parenchymal thinning",
        "AP pelvis diameter: >7 mm (neonate) or >10 mm (child) warrants follow-up; >15 mm consider MAG3 renogram",
      ]},
    ],
  },
  {
    id: "mcu",
    title: "MCU (Micturating Cystourethrogram) Interpretation",
    badge: "MCU / VCUG",
    color: "from-purple-600 to-violet-700",
    sections: [
      { heading: "Performing MCU", items: [
        "Indication: first febrile UTI (if <2y or abnormal USS), abnormal antenatal USS, recurrent UTIs",
        "Exclude active UTI before procedure: urine culture negative",
        "Catheterise bladder; inject iodinated contrast; image in filling and voiding phases",
        "Fluoroscopy views: AP pelvis + oblique views at bladder capacity and during voiding",
        "Document: bladder outline, ureteric reflux (side + grade), bladder neck, urethra",
      ]},
      { heading: "VUR Grading (International System)", items: [
        "Grade I: reflux into ureter only, no pelvis involvement",
        "Grade II: reflux into ureter, pelvis, calyces; no dilation",
        "Grade III: mild-moderate ureteral/pelvic dilation; mild calyceal blunting",
        "Grade IV: moderate dilation; moderate calyceal blunting; impressions of papillae maintained",
        "Grade V: gross dilation and tortuosity; papillary impressions lost; complete calyceal obliteration",
        "Bilateral reflux: document each side separately",
      ]},
      { heading: "Bladder & Urethral Assessment", items: [
        "Trabeculated bladder: thick irregular wall — suggests neuropathic bladder or BOO",
        "Post-void residual: significant if >10% of expected bladder capacity",
        "Posterior urethral valves (PUV): posterior urethral dilation + thick bladder wall + bilateral VUR — exclusively males",
        "Ureterocele: filling defect at bladder base — cobra head sign",
        "Bladder diverticula: document size and location",
        "Bladder neck: assess opening on voiding; failure to open — neurogenic origin",
      ]},
    ],
  },
  {
    id: "dmsa",
    title: "DMSA Scan Interpretation",
    badge: "Nuclear Medicine",
    color: "from-green-600 to-teal-700",
    sections: [
      { heading: "DMSA Basics", items: [
        "Tracer: 99mTc-DMSA (dimercaptosuccinic acid) — binds to proximal tubular cells",
        "Primary use: assess cortical function and scarring; estimate split renal function",
        "Timing: acute phase (within 6 months of UTI) — detects acute pyelonephritis; delayed (>6 months) — detects permanent scarring",
        "Contraindications: pregnancy; minimise radiation; not routinely needed for first simple UTI",
      ]},
      { heading: "DMSA Interpretation", items: [
        "Normal: homogeneous tracer uptake bilaterally; smooth cortical outline",
        "Acute pyelonephritis: focal cortical defects (photopenia) — may resolve; wedge-shaped pattern",
        "Permanent scar: persistent focal defect at 6 months post-UTI; cortical thinning / contour irregularity",
        "Global reduction: poor uptake throughout kidney — reflects reduced total function",
        "Split renal function: normal 45–55% each side; <40% one side suggests significant impairment",
        "Horseshoe kidney / ectopic kidney: DMSA better than USS for functional assessment",
      ]},
      { heading: "Clinical Decision Points", items: [
        "Scar present on DMSA → annual BP monitoring; proteinuria screen; renal function follow-up",
        "DMSA not routinely indicated after first simple febrile UTI if USS normal and clinically resolved",
        "Repeat DMSA at 4–6 months post-infection to determine if defects are permanent",
        "Bilateral DMSA defects: CKD risk — refer to paediatric nephrology",
        "Equivalent to MAG3 for scar assessment but MAG3 preferred if drainage assessment needed",
      ]},
    ],
  },
  {
    id: "mag3",
    title: "MAG3 Renogram Interpretation",
    badge: "Dynamic Renal Scintigraphy",
    color: "from-cyan-600 to-blue-700",
    sections: [
      { heading: "MAG3 Basics & Phases", items: [
        "Tracer: 99mTc-MAG3 (mercaptoacetyl triglycine) — excreted by tubular secretion",
        "Superior to DTPA in children (better image quality at lower GFR)",
        "3 phases: Perfusion (0–2 min) → Cortical uptake/parenchymal transit (2–5 min) → Drainage/excretion (5–30 min)",
        "Furosemide diuresis renogram (F+20): furosemide given 20 min before tracer (optimal) or F+0",
        "Indications: hydronephrosis workup (PUJ/VUJ obstruction), split renal function, post-surgical assessment",
      ]},
      { heading: "Split Renal Function", items: [
        "Normal differential function: 45–55% each side",
        "Relative function <40% affected side: significant impairment → discuss intervention",
        "Relative function <10%: poorly functional kidney — assess clinical significance",
        "Note: split function may recover post-obstruction relief (surgery / stenting)",
      ]},
      { heading: "Drainage Assessment (Obstructed vs Dilated)", items: [
        "T½ < 10 min: good drainage — non-obstructed (even if dilated on USS)",
        "T½ 10–20 min: equivocal — interpret with clinical context",
        "T½ > 20 min: delayed drainage — likely obstructed; consider intervention",
        "Pelvic retention curve: if pelvis curve falls after furosemide → mechanical obstruction less likely (dilated but not obstructed)",
        "No response to furosemide + T½ >20 min → true obstruction → surgical referral",
        "Kaplen-Scintimager curve patterns: document morphology — type I (normal), II (delayed peak), III/IV (obstructed)",
      ]},
      { heading: "Post-operative MAG3", items: [
        "Pyeloplasty: repeat MAG3 at 3–6 months; expect improvement in T½ and differential function",
        "Ureteral reimplantation: assess drainage pattern and split function",
        "Single kidney or duplex system: MAG3 gives functional mapping better than USS alone",
      ]},
    ],
  },
];

function RadiologyGuide({ guide }) {
  const [openSection, setOpenSection] = useState(null);
  return (
    <Card className="overflow-hidden">
      <div className={`bg-gradient-to-r ${guide.color} p-3 text-white`}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm">{guide.title}</h3>
          <Badge className="bg-white/20 text-white text-xs">{guide.badge}</Badge>
        </div>
      </div>
      <CardContent className="p-0 divide-y divide-slate-100">
        {guide.sections.map((s, sIdx) => (
          <div key={sIdx}>
            <button className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-slate-50 transition-colors" onClick={() => setOpenSection(openSection === sIdx ? null : sIdx)}>
              <span className="text-xs font-semibold text-slate-800">{s.heading}</span>
              {openSection === sIdx ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
            </button>
            {openSection === sIdx && (
              <div className="px-4 pb-3 space-y-1.5 bg-slate-50">
                {s.items.map((item, iIdx) => (
                  <div key={iIdx} className="flex items-start gap-2 text-xs text-slate-700 py-1">
                    <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function ImagingViewer() {
  const [patientId, setPatientId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [activeGuide, setActiveGuide] = useState(null);

  const urlParams = new URLSearchParams(window.location.search);
  const preloadedId = urlParams.get('patient_id');
  const preloadedName = urlParams.get('patient_name');

  React.useEffect(() => {
    if (preloadedId) { setPatientId(preloadedId); setPatientName(preloadedName || ''); }
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const pts = await base44.entities.Patient.list('-created_date', 20);
      const filtered = pts.filter(p =>
        (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.uhid || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
      setResults(filtered);
    } catch {
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="p-3 max-w-5xl mx-auto space-y-4">
      <div className="mb-1">
        <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Badge className="bg-blue-600 text-white text-xs">Imaging Hub</Badge>
          Pediatric Radiology & Imaging
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">Upload images · Annotate · Interpret CAKUT / MCU / DMSA / MAG3</p>
      </div>

      {/* Radiology Guides */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Eye className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-bold text-slate-700">Imaging Interpretation Guides</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 mb-3" style={{ scrollbarWidth: "none" }}>
          {RADIOLOGY_GUIDES.map(g => (
            <button key={g.id} onClick={() => setActiveGuide(activeGuide === g.id ? null : g.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${activeGuide === g.id ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"}`}>
              {g.badge}
            </button>
          ))}
        </div>
        {activeGuide && <RadiologyGuide guide={RADIOLOGY_GUIDES.find(g => g.id === activeGuide)} />}
      </div>

      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4 text-slate-500" />
        <span className="text-sm font-bold text-slate-700">Image Viewer</span>
      </div>

      {!patientId ? (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-4">
          <p className="text-sm font-semibold text-slate-700 mb-3">Search Patient</p>
          <div className="flex gap-2">
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Patient name or UHID..."
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={searching} className="bg-blue-600 hover:bg-blue-700">
              <Search className="w-4 h-4 mr-1" /> Search
            </Button>
          </div>

          {results.length > 0 && (
            <div className="mt-3 space-y-2">
              {results.map(p => (
                <button
                  key={p.id}
                  className="w-full text-left flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  onClick={() => { setPatientId(p.id); setPatientName(p.name); }}
                >
                  <User className="w-8 h-8 p-1.5 bg-slate-100 rounded-full text-slate-600" />
                  <div>
                    <p className="font-semibold text-sm text-slate-800">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.uhid && `UHID: ${p.uhid}`} {p.age && `· Age: ${p.age}y`}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="mt-4 border-t pt-4">
            <p className="text-xs text-slate-500 mb-2">Or open viewer without patient context:</p>
            <Button variant="outline" size="sm" onClick={() => setPatientId('anonymous')}>
              Open Anonymous Viewer
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-800">{patientName || 'Patient'}</Badge>
            <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => { setPatientId(''); setPatientName(''); setResults([]); }}>
              Change Patient
            </Button>
          </div>
          <DICOMImageViewer patientId={patientId === 'anonymous' ? null : patientId} patientName={patientName} />
        </div>
      )}
    </div>
  );
}