import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight, Droplet } from "lucide-react";

const STEPS = {
  START: "start",
  CONFIRM: "confirm",
  PLASMA_OSMO: "plasma_osmo",
  HYPERNATREMIA: "hypernatremia",
  NORMAL_OSMO: "normal_osmo",
  WATER_DEPRIVATION: "water_deprivation",
  DDAVP_TEST: "ddavp_test",
  CENTRAL_DI: "central_di",
  NEPHROGENIC_DI: "nephrogenic_di",
  PRIMARY_POLYDIPSIA: "primary_polydipsia",
  SOLUTE_DIURESIS: "solute_diuresis",
  TUBULAR_CAUSES: "tubular_causes",
};

const InfoBox = ({ title, color = "blue", items, children, referral }) => {
  const styles = { blue: "border-blue-300 bg-blue-50", green: "border-green-300 bg-green-50", amber: "border-amber-300 bg-amber-50", red: "border-red-300 bg-red-50", violet: "border-violet-300 bg-violet-50", slate: "border-slate-200 bg-slate-50" };
  const titleC = { blue: "text-blue-900", green: "text-green-900", amber: "text-amber-900", red: "text-red-900", violet: "text-violet-900", slate: "text-slate-800" };
  return (
    <div className={`rounded-xl border-2 p-3 ${styles[color]}`}>
      <p className={`font-bold text-sm mb-2 ${titleC[color]}`}>{title}</p>
      {items && <ul className="space-y-1">{items.map((it, i) => <li key={i} className="text-xs text-slate-700 flex gap-2"><span className="text-blue-500 flex-shrink-0 mt-0.5">→</span><span>{it}</span></li>)}</ul>}
      {children}
      {referral && <div className="mt-2 p-2 bg-violet-50 border border-violet-200 rounded-lg text-xs text-violet-800 font-medium">📋 {referral}</div>}
    </div>
  );
};

const Q = ({ question, note, options, onSelect }) => (
  <div className="space-y-2">
    <p className="font-semibold text-sm text-slate-800">{question}</p>
    {note && <p className="text-xs text-slate-500 italic">{note}</p>}
    {options.map(opt => (
      <button key={opt.label} onClick={() => onSelect(opt.next)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50 transition-all text-left">
        <span className="text-sm font-medium text-slate-700">{opt.label}</span>
        <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0 ml-2" />
      </button>
    ))}
  </div>
);

export default function PolyuriaEngine() {
  const [step, setStep] = useState(STEPS.START);
  const [history, setHistory] = useState([]);

  const go = (next) => { setHistory(h => [...h, step]); setStep(next); };
  const back = () => { const prev = history[history.length - 1]; if (prev) { setHistory(h => h.slice(0, -1)); setStep(prev); } };
  const reset = () => { setStep(STEPS.START); setHistory([]); };
  const NavBtns = () => (
    <div className="flex gap-2 pt-2">
      {history.length > 0 && <Button variant="outline" size="sm" className="flex-1" onClick={back}><ArrowLeft className="w-3.5 h-3.5 mr-1" />Back</Button>}
      <Button variant="outline" size="sm" className="flex-1" onClick={reset}>Restart</Button>
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case STEPS.START:
        return (
          <div className="space-y-3">
            <InfoBox title="Polyuria — Definition & Initial Assessment" color="blue">
              <div className="mt-2 text-xs space-y-1">
                <p className="font-bold text-blue-900">Definition of Polyuria (KDIGO / Consensus):</p>
                {["Neonates: >3 mL/kg/h (or >150 mL/kg/day)", "Infants/Children: >2 mL/kg/h or >100 mL/kg/day", "Older children/Adults: >40 mL/kg/day or >2.5 L/1.73m²/day"].map((c, i) => <p key={i} className="text-blue-800">• {c}</p>)}
                <p className="font-bold text-blue-900 mt-2">Key History:</p>
                {["Onset: sudden (central DI) vs gradual (polyuric CKD, tubular)", "Nocturia/nocturia (distinguishes from primary polydipsia — less nocturia)", "Thirst: severe (DI) vs variable (polydipsia, solute diuresis)", "Salt craving (nephrogenic DI, Bartter)", "Drug history: lithium, amphotericin, aminoglycosides, cisplatin, demeclocycline", "Family history: NDI (X-linked AVPR2), Bartter, cystinosis, ADPKD", "Head trauma / CNS surgery / pituitary tumour / infiltrative disease"].map((c, i) => <p key={i} className="text-blue-800">• {c}</p>)}
              </div>
            </InfoBox>
            <Button className="w-full bg-blue-700 hover:bg-blue-800 text-white" onClick={() => go(STEPS.CONFIRM)}>Start Evaluation →</Button>
          </div>
        );

      case STEPS.CONFIRM:
        return (
          <div className="space-y-3">
            <InfoBox title="Step 1: Confirm Polyuria + Initial Investigations" color="slate"
              items={[
                "24h urine collection (or timed — confirm volume threshold)",
                "Simultaneous plasma osmolality and serum sodium",
                "Spot urine osmolality (first-morning void — most concentrated)",
                "Serum glucose (exclude diabetes mellitus as solute diuresis cause)",
                "Urine glucose (glycosuria — renal tubular or DM)",
                "Serum electrolytes (Na, K, Cl, HCO₃, Ca, Mg, PO₄), creatinine",
                "Serum urea/BUN ratio (urea diuresis or uraemia)",
              ]}
            />
            <Q question="Plasma osmolality result:" onSelect={go} options={[
              { label: "Elevated (>295 mOsm/kg) — with inappropriately dilute urine", next: STEPS.HYPERNATREMIA },
              { label: "Normal (270–295 mOsm/kg) with dilute urine (Uosm <300)", next: STEPS.NORMAL_OSMO },
              { label: "Elevated glucose — solute (osmotic) diuresis", next: STEPS.SOLUTE_DIURESIS },
              { label: "Normal glucose; urine osmolality >300 with polyuria", next: STEPS.TUBULAR_CAUSES },
            ]} />
          </div>
        );

      case STEPS.HYPERNATREMIA:
        return (
          <div className="space-y-3">
            <InfoBox title="Hypernatraemia + Dilute Urine → DI confirmed" color="red"
              items={[
                "Plasma Na >145 + Uosm <300 mOsm/kg = definite diabetes insipidus (do NOT need water deprivation test)",
                "Proceed directly to DDAVP test to differentiate Central vs Nephrogenic DI",
                "Urgent correction if Na >155: use hypotonic fluids (0.45% NaCl or D5W) cautiously",
                "Max Na correction rate: 10–12 mEq/L/24h (rapid correction → cerebral oedema)",
              ]}
            />
            <Button className="w-full bg-red-700 hover:bg-red-800 text-white" onClick={() => go(STEPS.DDAVP_TEST)}>Proceed to DDAVP Test →</Button>
            <NavBtns />
          </div>
        );

      case STEPS.NORMAL_OSMO:
        return (
          <Q question="Normal or near-normal plasma osmolality + dilute urine — proceed with water deprivation test?"
            note="Only safe if patient is haemodynamically stable, not severely hypernatraemic"
            onSelect={go} options={[
              { label: "YES — perform formal water deprivation test", next: STEPS.WATER_DEPRIVATION },
              { label: "Suspect primary polydipsia (drinking history, psychiatric, no nocturia)", next: STEPS.PRIMARY_POLYDIPSIA },
            ]} />
        );

      case STEPS.WATER_DEPRIVATION:
        return (
          <div className="space-y-3">
            <InfoBox title="Water Deprivation Test Protocol (Miller/Moses)" color="blue">
              <div className="mt-2 text-xs space-y-2">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <p className="font-bold text-blue-900">Protocol</p>
                  {["Start 06:00 (after adequate overnight fluid — not standard overnight deprivation in children)", "Baseline: weight, serum Na, plasma osmolality, urine osmolality", "Withhold all fluids — monitor hourly: weight, urine output, urine osmolality, plasma osmolality, serum Na", "Repeat bloods every 2h during test", "Stop if: weight loss >3% body weight OR serum Na >150 OR plasma Osm >305 OR severe thirst/distress", "Test duration: usually 4–8h (shorter in children/infants — dangerous if prolonged)"].map((c, i) => <p key={i} className="text-blue-800">• {c}</p>)}
                </div>
                <div className="p-2 bg-slate-50 rounded-lg">
                  <p className="font-bold text-slate-800">End-Point Analysis</p>
                  {["Normal/polydipsia: urine Osm >600 mOsm/kg (concentrating ability intact)", "Central or Nephrogenic DI: urine Osm remains dilute (<300 mOsm/kg) despite rising plasma Osm", "Partial DI: urine Osm 300–600 — incomplete response"].map((c, i) => <p key={i} className="text-slate-700">• {c}</p>)}
                </div>
              </div>
            </InfoBox>
            <Q question="Water deprivation test result:" onSelect={go} options={[
              { label: "Urine Osm remains <300 mOsm/kg — DI confirmed → proceed to DDAVP test", next: STEPS.DDAVP_TEST },
              { label: "Urine Osm >600 mOsm/kg — concentrating ability intact → primary polydipsia", next: STEPS.PRIMARY_POLYDIPSIA },
              { label: "Urine Osm 300–600 — partial DI or primary polydipsia → DDAVP test needed", next: STEPS.DDAVP_TEST },
            ]} />
          </div>
        );

      case STEPS.DDAVP_TEST:
        return (
          <div className="space-y-3">
            <InfoBox title="DDAVP (Desmopressin) Challenge Test" color="violet">
              <div className="mt-2 text-xs space-y-2">
                <div className="p-2 bg-violet-50 rounded-lg">
                  <p className="font-bold text-violet-900">Protocol</p>
                  {["Measure urine Osm at baseline (end of water deprivation)", "Administer desmopressin:", "— IV/IM/SC: 0.1–0.4 µg (child); 1–4 µg (adult)", "— Intranasal: 10 µg (child); 20 µg (adult)", "Measure urine Osm every 30–60 min × 2h post-DDAVP"].map((c, i) => <p key={i} className="text-violet-800">• {c}</p>)}
                </div>
                <div className="p-2 bg-slate-50 rounded-lg">
                  <p className="font-bold text-slate-800">Interpretation</p>
                  {["Complete Central DI: urine Osm rises >50% (or to >750 mOsm/kg) — intact tubular response to ADH", "Nephrogenic DI: urine Osm rises <10% — tubular resistance to ADH", "Partial Central DI: 10–50% rise in urine Osm", "Primary polydipsia: urine Osm rises >50% (but water deprivation usually normalises first)", "Note: chronic primary polydipsia can blunt medullary gradient → partial response even if polydipsia"].map((c, i) => <p key={i} className="text-slate-700">• {c}</p>)}
                </div>
              </div>
            </InfoBox>
            <Q question="DDAVP response:" onSelect={go} options={[
              { label: "Urine Osm rise >50% — Central DI", next: STEPS.CENTRAL_DI },
              { label: "Urine Osm rise <10% — Nephrogenic DI", next: STEPS.NEPHROGENIC_DI },
            ]} />
          </div>
        );

      case STEPS.CENTRAL_DI:
        return (
          <div className="space-y-3">
            <InfoBox title="Central DI — Aetiology & Treatment" color="blue">
              <div className="mt-2 text-xs space-y-2">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <p className="font-bold text-blue-900">Causes</p>
                  {["Idiopathic (most common — investigate for autoimmune)", "Post-neurosurgical (pituitary/hypothalamic surgery — transient or permanent)", "Tumours: craniopharyngioma, germinoma, optic glioma, Langerhans cell histiocytosis", "Trauma: head injury, birth injury", "Infiltrative: sarcoidosis, autoimmune hypophysitis, Wegener's granulomatosis", "Genetic: AVP gene mutation (AD familial neurohypophyseal DI); septo-optic dysplasia", "Wolfram syndrome (WFS1): DI + DM + optic atrophy + deafness (DIDMOAD)"].map((c, i) => <p key={i} className="text-blue-800">• {c}</p>)}
                </div>
                <div className="p-2 bg-green-50 rounded-lg">
                  <p className="font-bold text-green-900">Investigations for Aetiology</p>
                  {["MRI pituitary + hypothalamus (gadolinium): posterior pituitary bright spot absent in ADH deficiency; thickened stalk → infiltrative/tumour", "Anterior pituitary function: TSH, free T4, IGF-1, cortisol, LH, FSH, prolactin", "Anti-AVP antibodies (autoimmune hypophysitis)", "Genetic panel if familial or syndromic"].map((c, i) => <p key={i} className="text-green-800">• {c}</p>)}
                </div>
                <div className="p-2 bg-violet-50 rounded-lg">
                  <p className="font-bold text-violet-900">Treatment</p>
                  {["Desmopressin (DDAVP) — synthetic ADH analogue:", "— Intranasal: 5–10 µg BD (children); 10–20 µg BD (adults)", "— Oral: 50–200 µg BD–TDS (children); 100–400 µg BD–TDS", "— SC/IV: 0.1–0.4 µg BD (precise dosing)", "Titrate to control polyuria without hyponatraemia", "Monitor serum Na weekly initially (risk of hyponatraemia — excess DDAVP)", "Allow 1h/day drug holiday (prevents tachyphylaxis + allows breakthrough thirst)", "Treat underlying cause if identified (tumour, infiltrative)"].map((c, i) => <p key={i} className="text-violet-800">• {c}</p>)}
                </div>
              </div>
            </InfoBox>
            <NavBtns />
          </div>
        );

      case STEPS.NEPHROGENIC_DI:
        return (
          <div className="space-y-3">
            <InfoBox title="Nephrogenic DI (NDI) — Aetiology & Treatment" color="amber">
              <div className="mt-2 text-xs space-y-2">
                <div className="p-2 bg-amber-50 rounded-lg">
                  <p className="font-bold text-amber-900">Causes</p>
                  {["X-linked NDI: AVPR2 gene (V2 receptor) — males; carrier females partially affected", "AR NDI: AQP2 gene (aquaporin-2 water channel)", "Acquired: lithium (most common drug cause — long-term use damages collecting duct)", "Hypercalcaemia / hypercalciuria: inhibits AQP2 insertion", "Hypokalaemia: chronic (tubular resistance)", "Chronic obstructive uropathy: PUV, bilateral UPJ obstruction", "CKD (tubular damage) / medullary disease", "Drugs: amphotericin B, demeclocycline, foscarnet, cidofovir"].map((c, i) => <p key={i} className="text-amber-800">• {c}</p>)}
                </div>
                <div className="p-2 bg-green-50 rounded-lg">
                  <p className="font-bold text-green-900">Treatment (NDI)</p>
                  {["Low-solute diet (low sodium + low protein) — reduces obligatory urine volume by reducing solute load", "Adequate hydration (free access to water; avoid dehydration)", "Hydrochlorothiazide 1–2 mg/kg/day (paradoxical — creates mild volume depletion → proximal Na reabsorption → reduces distal flow)", "Amiloride 0.1–0.3 mg/kg/day: add-on to HCTZ; also protective in lithium NDI", "Indomethacin 1–2 mg/kg/day (with food): reduces prostaglandin-mediated inhibition of ADH; use with caution", "Treat underlying cause: correct Ca²⁺, K⁺; remove offending drug (lithium — may not fully reverse)", "Genetic NDI (AVPR2): vasopressin V2 receptor agonist trials (MCF-2 type pharmacochaperones) — investigational"].map((c, i) => <p key={i} className="text-green-800">• {c}</p>)}
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <p className="font-bold text-blue-900">Monitoring NDI</p>
                  {["Serum Na weekly (dehydration risk), electrolytes", "Urine output daily (monitor response to treatment)", "Renal USS annually (bladder capacity + upper tract dilatation from high output)", "Growth and nutrition monitoring", "Genetic counselling (X-linked: family screening)"].map((c, i) => <p key={i} className="text-blue-800">• {c}</p>)}
                </div>
              </div>
            </InfoBox>
            <NavBtns />
          </div>
        );

      case STEPS.PRIMARY_POLYDIPSIA:
        return (
          <div className="space-y-3">
            <InfoBox title="Primary (Psychogenic) Polydipsia" color="green"
              items={[
                "Excessive voluntary fluid intake (not driven by ADH deficiency or tubular resistance)",
                "Low or normal plasma osmolality; urine concentrates normally with water deprivation",
                "Often in: psychiatric conditions (schizophrenia, OCD, anxiety), institutional settings, developmental disability",
                "Also: habitual or cultural excess drinking; medications (antipsychotics — dry mouth)",
                "Hyponatraemia risk: dilutional (SIADH-like picture) — can be severe and life-threatening",
              ]}
            >
              <div className="mt-2 p-2 bg-green-50 rounded-lg text-xs">
                <p className="font-bold text-green-900">Management</p>
                {["Behavioural therapy + fluid restriction plan (structured schedule)", "Treat underlying psychiatric condition", "Monitor serum Na closely (hyponatraemia risk)", "No DDAVP (risk of severe hyponatraemia)", "MDT: psychiatry + nephrology + psychology", "Exercise-associated polydipsia: education re appropriate fluid intake"].map((c, i) => <p key={i} className="text-green-800">• {c}</p>)}
              </div>
            </InfoBox>
            <NavBtns />
          </div>
        );

      case STEPS.SOLUTE_DIURESIS:
        return (
          <div className="space-y-3">
            <InfoBox title="Solute (Osmotic) Diuresis" color="amber"
              items={[
                "Glucose: uncontrolled diabetes mellitus → glycosuria → osmotic diuresis",
                "Urea: high-protein diet, hypercatabolic state, post-AKI recovery (urea diuresis)",
                "Mannitol: IV infusion (raised ICP treatment) → osmotic diuresis",
                "Post-obstructive diuresis: massive diuresis after relief of bilateral obstruction",
                "Post-AKI recovery: tubular dysfunction → inability to concentrate",
              ]}
            >
              <div className="mt-2 p-2 bg-amber-50 rounded-lg text-xs">
                <p className="font-bold text-amber-900">Management by Cause</p>
                {["DM: optimise insulin; monitor glucose + ketones", "Post-obstructive diuresis: replace output 50–75% (avoid hypovolaemia; avoid perpetuating diuresis with over-replacement)", "Urea diuresis: adequate hydration; reduce dietary protein if needed", "Monitor: Na, K, Mg, PO₄ (rapid electrolyte losses with high-volume diuresis)"].map((c, i) => <p key={i} className="text-amber-800">• {c}</p>)}
              </div>
            </InfoBox>
            <NavBtns />
          </div>
        );

      case STEPS.TUBULAR_CAUSES:
        return (
          <div className="space-y-3">
            <InfoBox title="Tubular Causes of Polyuria (Isosthenuria)" color="violet"
              items={[
                "CKD with tubular damage: fixed urine Osm 250–350 (isosthenuria) — tubular concentrating defect",
                "Bartter syndrome: polyuria + hypokalaemia + metabolic alkalosis + normal/low BP",
                "Fanconi syndrome: generalised tubular dysfunction → polyuria, glucosuria, aminoaciduria, phosphaturia",
                "Nephronophthisis (NPHP): concentrating defect + corticomedullary cysts → progressive CKD",
                "Sickle cell nephropathy: medullary infarcts → papillary necrosis → concentrating defect",
                "Post-ATN recovery: tubular damage → temporary concentrating defect",
              ]}
            >
              <div className="mt-2 p-2 bg-violet-50 rounded-lg text-xs">
                <p className="font-bold text-violet-900">Key Distinguishing Tests</p>
                {["Spot urine: Na, K, Cl, Mg, PO₄, glucose, amino acids, β₂-microglobulin", "Serum K, HCO₃ (Bartter: low K, high HCO₃)", "Urine pH (dRTA: fixed high pH >5.5)", "Renal USS (cysts → NPHP / cystic disease)", "Genetic panel (Bartter — SLC12A1/KCNJ1/BSND/CLCNKB; NPHP gene panel)"].map((c, i) => <p key={i} className="text-violet-800">• {c}</p>)}
              </div>
            </InfoBox>
            <NavBtns />
          </div>
        );

      default:
        return <Button onClick={reset}>Restart</Button>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-cyan-700 to-blue-700 p-4 text-white">
        <div className="flex items-center gap-2">
          <Droplet className="w-5 h-5" />
          <div>
            <h3 className="font-bold text-sm">Polyuria & Diabetes Insipidus Engine</h3>
            <p className="text-xs text-cyan-200">KDIGO · Miller/Moses Protocol · ISPAD · Paediatric Consensus Guidelines</p>
          </div>
        </div>
      </div>
      {history.length > 0 && <Badge variant="outline" className="text-xs">Step {history.length + 1}</Badge>}
      <Card><CardContent className="p-4">{renderStep()}</CardContent></Card>
      <div className="text-xs text-slate-400 text-center">KDIGO · ISPAD · Paediatric DI Consensus · Miller-Moses Protocol</div>
    </div>
  );
}