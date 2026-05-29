import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronDown, ChevronUp, Activity } from "lucide-react";

const HAEM_TOPICS = [
  {
    id: "ida",
    name: "Iron Deficiency Anaemia (IDA)",
    color: "red",
    overview: "Most common nutritional deficiency globally. Prevalence ~50% in Indian under-5 children (NFHS-5 2021). Iron deficiency precedes anaemia; neurocognitive effects occur before Hb falls.",
    red_flags: ["Hb <7 g/dL (severe anaemia)", "High output cardiac failure (gallop rhythm, cardiomegaly)", "Severe pallor + tachycardia + breathlessness", "Hb <4 g/dL or 4–6 with respiratory distress → transfusion threshold", "Pica (eating soil, paper) = severe IDA", "Plummer-Vinson: dysphagia + anaemia (adolescent girls)", "Developmental regression with severe IDA"],
    diagnosis: ["CBC: microcytic hypochromic anaemia; MCV <70 fl (<2y), <75 fl (2–12y)", "Peripheral smear: pencil cells, microcytes, hypochromia, anisocytosis", "Serum ferritin: <12 µg/L (deficiency); <30 µg/L (depletion)", "Serum iron low + TIBC high + transferrin saturation <16%", "Reticulocyte Hb (CHr) <27 pg: early marker of iron-restricted erythropoiesis", "Exclude thalassaemia: MCV/RBC ratio (Mentzer index <13 = thalassaemia)", "If no response to iron in 4 weeks: check for H. pylori, coeliac, CMPA"],
    management: ["Elemental iron: 3–6 mg/kg/day (therapeutic dose, not prophylactic)", "Duration: treat for 3 months after Hb normalisation (replenish stores)", "Side effects: constipation, dark stools, GI upset — take with food if needed", "Vitamin C 50 mg with iron dose enhances absorption", "Avoid: cow's milk within 1h of iron dose (phytates reduce absorption)", "Severe anaemia (Hb <7) with haemodynamic compromise: transfuse pRBC 10 mL/kg slowly over 4h", "IV iron (ferric carboxymaltose): if oral intolerance, IBD, renal anaemia — use in older children"],
    monitoring: ["Hb at 4 weeks: should rise >1 g/dL (confirms diagnosis)", "Ferritin at 3 months: should normalise before stopping", "WIFS programme: weekly iron supplementation in school-age children (NHM India)"],
    references: ["IAP IDA Guidelines 2020", "WHO Iron Supplementation Guidelines 2016", "AIIMS Iron Deficiency Protocol 2021"]
  },
  {
    id: "thal",
    name: "Thalassaemia",
    color: "violet",
    overview: "Inherited haemoglobinopathy — beta-thal major: transfusion-dependent from 6 months. India has ~10,000 new beta-thal major births/year; carrier rate 3–4%. Cure: HSCT; management: regular transfusions + chelation.",
    red_flags: ["Severe pallor + hepatosplenomegaly in infant 6–18 months", "Hb <7 g/dL with thalassaemic facies", "Growth retardation + endocrinopathy in older child", "Cardiac failure from iron overload (ferritin >2500 µg/L)", "Infection in splenectomised patient (penicillin prophylaxis essential)", "Haemoglobin Bart's hydrops fetalis: intrauterine death (alpha-thal major)"],
    diagnosis: ["HPLC (High-Performance Liquid Chromatography): gold standard — elevated HbA2 (>3.5%) in carrier; absent HbA in major", "CBC: severe microcytic anaemia (Hb 2–7 g/dL in major)", "Serum ferritin: iron overload monitoring", "Liver MRI T2*: liver iron concentration (LIC)", "Cardiac MRI T2*: cardiac iron (<20ms = significant)", "Genetic: HBB gene mutations (>200 mutations — common in India: IVSI-5, Cd6, 619bp deletion)"],
    management: ["Regular transfusions: every 3–4 weeks; target pre-transfusion Hb 9–10 g/dL", "Iron chelation (start when ferritin >1000 µg/L or after 10–20 transfusions)", "  → Deferasirox (Exjade/Jadenu): 14–28 mg/kg/day OD oral — preferred", "  → Desferrioxamine (DFO): 40–60 mg/kg/day SC over 8–12h × 5–7 nights/week", "  → Deferiprone: 25–33 mg/kg TID; good cardiac iron clearance; monitor CBC (agranulocytosis)", "HSCT: curative; HLA-matched sibling donor; best before age 10 with low Pesaro risk", "Splenectomy: if hypersplenism causing ↑ transfusion requirement; delay until >5y", "Endocrine: growth hormone, pubertal induction, diabetes management as complications arise"],
    monitoring: ["Ferritin every 3 months (target <1000 µg/L on chelation)", "Cardiac MRI T2* annually from age 10", "LFT + renal function with deferasirox (nephrotoxic)", "Endocrine: TFT, IGF-1, HbA1c, LH/FSH annually from age 10", "CBC for agranulocytosis with deferiprone (weekly)"],
    references: ["TIF Guidelines Beta-Thalassaemia 2023", "IAP Thalassaemia 2020", "ICSH Thalassaemia Management 2019"]
  },
  {
    id: "itp",
    name: "ITP (Immune Thrombocytopenia)",
    color: "blue",
    overview: "Autoimmune platelet destruction. Acute ITP: post-viral, self-limiting in 80% within 6 months. Chronic ITP: >12 months. Second-line therapies needed if platelet <30,000 + symptomatic.",
    red_flags: ["Platelet <10,000 with active mucosal bleeding", "Intracranial haemorrhage (ICH) — <1% but life-threatening", "Wet purpura (mucosal bleeds = worse than dry purpura)", "Fever + thrombocytopenia → exclude sepsis/HLH/TTP", "Organomegaly + cytopenias → AIHA + ITP = Evans syndrome"],
    diagnosis: ["CBC: isolated thrombocytopenia; normal Hb, WBC, morphology", "Peripheral smear: reduced platelets, no fragments (excludes TTP/HUS), large platelets", "No BMA required for typical acute ITP", "Anti-platelet antibodies: low sensitivity, not routinely recommended", "DAT (direct antiglobulin test): if anaemia present (Evans syndrome)", "ANA/APLA: in adolescent girls (secondary ITP from SLE/APS)"],
    management: ["Observation if platelet >20,000 + no significant bleeding", "IVIG 0.8–1 g/kg single dose: rapid platelet rise (24–48h); for active bleeding/surgery", "IV anti-D 75 µg/kg: for Rh(D)+ non-splenectomised patients; cheaper than IVIG", "Prednisolone 2–4 mg/kg/day × 4–7 days: first-line for significant bleeding", "Chronic ITP (>12m) second-line: TPO-RA (eltrombopag, romiplostim), rituximab", "Splenectomy: rarely needed in children; delay >5y; vaccinate first (Pneumo/Meningo/Hib)", "Avoid aspirin, NSAIDs, IM injections when platelet <50,000"],
    monitoring: ["Platelet count weekly until stable", "Monitor for ICH symptoms: headache, visual changes, altered sensorium", "Bone density with prolonged steroids", "TPO-RA: CBC monthly (rebound thrombocytosis on stopping)"],
    references: ["ASH ITP Guidelines 2019", "IAP ITP 2021", "ICON Expert Consensus on ITP 2019"]
  },
  {
    id: "haemophilia",
    name: "Haemophilia",
    color: "red",
    overview: "Haemophilia A (factor VIII deficiency, X-linked) and B (factor IX deficiency, X-linked). Severity: severe (<1%), moderate (1–5%), mild (5–40%). Presents as haemarthroses, muscle haematomas, life-threatening bleeds. Diagnosis usually by 2 years.",
    red_flags: ["Joint bleed: warmth, swelling, pain — target joint if >3 bleeds in 6 months", "Intracranial bleed: headache + vomiting + altered consciousness", "Iliopsoas bleed: hip pain + flexion deformity", "Neonatal haemorrhage: intracranial bleed, prolonged bleeding circumcision", "Inhibitor (antibody against factor): poor response to factor replacement"],
    diagnosis: ["Prolonged APTT with normal PT and TT", "Factor VIII assay (Haemophilia A) or Factor IX assay (Haemophilia B)", "Bethesda inhibitor assay: detect inhibitors (>0.6 BU = positive)", "Carrier detection: female relatives — factor level + genetic testing (F8/F9 gene sequencing)", "FVIII/FIX gene analysis: identifies mutation, predicts inhibitor risk"],
    management: ["Prophylaxis (severe Haemophilia): primary prophylaxis ASAP; FVIII 25–40 IU/kg 3×/week or every other day", "Factor IX prophylaxis: 40–60 IU/kg twice weekly (longer t½)", "On-demand therapy for bleeds: FVIII 25–50 IU/kg (joint/muscle); 50 IU/kg (intracranial/surgery)", "Emicizumab (Hemlibra): subcutaneous, bispecific antibody; long-acting prophylaxis for HA with/without inhibitors", "Inhibitor management: immune tolerance induction (ITI) — high-dose FVIII", "Desmopressin (DDAVP): mild HA — IV/intranasal; check response first (peak FVIII >50%)"],
    monitoring: ["Factor levels 6-monthly; inhibitor screen annually or after intensive exposure", "Joint assessment: HJHS (Haemophilia Joint Health Score) annually", "MRI joints: detect early haemophilic arthropathy", "LFT: viral hepatitis screening (older patients)"],
    references: ["WFH Haemophilia Guidelines 2020", "NHC India Protocol 2021", "ISTH Standards 2022"]
  },
  {
    id: "sickle",
    name: "Sickle Cell Disease",
    color: "amber",
    overview: "Autosomal recessive Hb disorder — HbSS most severe; HbSC, HbS-β-thal milder. Common in Odisha, Chhattisgarh, Jharkhand, Maharashtra (India). Vaso-occlusive crises, acute chest syndrome, splenic sequestration, stroke are life-threatening.",
    red_flags: ["Acute chest syndrome: fever + chest pain + new infiltrate → medical emergency", "Splenic sequestration: sudden splenomegaly + Hb drop >2g/dL → transfuse urgently", "Stroke: acute neurological deficit → exchange transfusion", "Aplastic crisis (parvovirus B19): Hb crash + reticulocytopenia", "Fever in asplenic patient → sepsis (Pneumococcus, Salmonella)", "Priapism (>4h) → penile ischaemia"],
    diagnosis: ["HPLC: HbS + absent HbA (HbSS); HbS + HbC (HbSC)", "Newborn screening: HPLC or IEF (isoelectric focusing) at birth", "Peripheral smear: sickle cells, target cells, polychromasia", "CBC: chronic haemolytic anaemia Hb 6–9 g/dL; reticulocytosis", "TCD (transcranial Doppler): annual from age 2 — velocity >200 cm/s = high stroke risk"],
    management: ["Hydroxyurea: 15–35 mg/kg/day; reduces crises by 50%; start by age 9 months (all HbSS)", "Folic acid 1–5 mg/day (haemolysis support)", "Penicillin prophylaxis: from 2 months until 5 years (asplenia)", "Vaccines: Pneumococcal (13 + 23v), Meningococcal, Hib, Influenza annually", "VOC management: IV fluids (1.5× maintenance), analgesia (paracetamol → NSAIDs → morphine ladder), O2 if SpO2 <95%", "Acute chest syndrome: antibiotics + incentive spirometry + simple/exchange transfusion", "TCD >200 cm/s: monthly chronic transfusion program (target HbS <30%)"],
    monitoring: ["CBC + reticulocytes every 3 months on hydroxyurea", "TCD annually from age 2 until 16y", "Urine microalbumin annually from age 5 (sickle nephropathy)", "Echocardiogram annually (pulmonary hypertension)", "Ophthalmology annually from age 10 (proliferative retinopathy in HbSC)"],
    references: ["NHLBI SCD Evidence-Based Guidelines 2014", "ASH SCD 2020", "IAP SCD India 2019"]
  },
  {
    id: "hlh",
    name: "HLH (Haemophagocytic Lymphohistiocytosis)",
    color: "red",
    overview: "Life-threatening hyperinflammatory syndrome from dysregulated cytokine storm. Primary (genetic: PRF1, UNC13D, STX11) or secondary (infection-triggered — EBV, CMV; malignancy; autoimmune). Mortality >50% without treatment. HScore helps diagnosis.",
    red_flags: ["Prolonged fever >7 days + organomegaly + cytopenias = think HLH", "Ferritin >10,000 µg/L is highly specific (sensitivity 90%)", "CNS involvement: seizures, altered consciousness, CSF pleocytosis", "Skin: morbilliform rash, jaundice (hepatitis)", "Previous sibling with fatal fever illness (primary HLH)", "EBV + massive splenomegaly in young child"],
    diagnosis: ["HLH-2004 criteria: ≥5 of 8: fever, splenomegaly, cytopenias ×2, hypertriglyceridaemia/hypofibrinogenaemia, haemophagocytosis on BM/LN/spleen, low/absent NK activity, ferritin >500 µg/L, sIL-2R >2400 U/mL", "Ferritin + triglycerides + fibrinogen: key screening labs", "Bone marrow biopsy: haemophagocytosis (macrophages engulfing blood cells)", "NK cell function (flow cytometry): absent in familial HLH", "Perforin/SAP/XIAP staining: abnormal in genetic forms", "Genetic panel: PRF1, UNC13D, STX11, STX4B, RAB27A"],
    management: ["HLH-2004 protocol: dexamethasone 10 mg/m²/day + etoposide 150 mg/m² twice weekly × 8 weeks", "Ciclosporin: added in week 2 if not improving", "Intrathecal therapy: if CNS involvement (methotrexate + prednisolone)", "HSCT: definitive for familial HLH — plan from diagnosis", "EBV-HLH: rituximab may be added; reduce immunosuppression in other secondary HLH if infection-driven", "Biologics: anakinra (IL-1R antagonist), emapalumab (anti-IFN-γ) for refractory HLH"],
    monitoring: ["Ferritin every 3–5 days: falling ferritin = response to treatment", "CBC + coagulation + triglycerides weekly", "CNS monitoring: LP repeated if neurological features", "NK cell function monthly", "Viral titres monthly (EBV/CMV)"],
    references: ["HLH-2004 Protocol Henter JI Blood 2007", "HLH India Guidelines 2021", "ESID/EBMT Consensus 2020"]
  },
];

const COLOR_MAP = {
  red: { border: "border-red-200", header: "bg-red-50" },
  violet: { border: "border-violet-200", header: "bg-violet-50" },
  blue: { border: "border-blue-200", header: "bg-blue-50" },
  amber: { border: "border-amber-200", header: "bg-amber-50" },
};

const SECTIONS = [
  { key: "red_flags", label: "🚩 Red Flags" },
  { key: "diagnosis", label: "🔬 Diagnosis" },
  { key: "management", label: "💊 Management" },
  { key: "monitoring", label: "📊 Monitoring" },
];

function HaemCard({ topic }) {
  const [open, setOpen] = useState(false);
  const [sec, setSec] = useState("red_flags");
  const c = COLOR_MAP[topic.color] || COLOR_MAP.red;
  return (
    <Card className={`border-2 ${c.border} bg-white`}>
      <CardHeader className={`${c.header} pb-2 cursor-pointer`} onClick={() => setOpen(o => !o)}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm">{topic.name}</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{topic.overview.substring(0, 100)}…</p>
          </div>
          {open ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0 ml-2" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />}
        </div>
      </CardHeader>
      {open && (
        <CardContent className="pt-0 space-y-3">
          <p className="text-xs text-slate-600 px-2 py-2 bg-slate-50 rounded-lg">{topic.overview}</p>
          <div className="flex gap-1 flex-wrap">
            {SECTIONS.map(s => (
              <button key={s.key} onClick={() => setSec(s.key)}
                className={`text-xs px-2.5 py-1 rounded-lg font-semibold border transition-colors ${sec === s.key ? "bg-slate-700 text-white border-transparent" : "bg-white text-slate-600 border-slate-200"}`}>
                {s.label}
              </button>
            ))}
          </div>
          <div className="space-y-1">
            {topic[sec]?.map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-xs p-2 bg-slate-50 border border-slate-100 rounded">
                <span className="font-bold text-slate-500 shrink-0">{i + 1}.</span>{item}
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400">📚 {topic.references?.join(" · ")}</p>
        </CardContent>
      )}
    </Card>
  );
}

export default function HaematologySection() {
  const [search, setSearch] = useState("");
  const filtered = HAEM_TOPICS.filter(t =>
    !search || t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.overview.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="space-y-3">
      <Alert className="bg-red-50 border-red-200">
        <Activity className="w-4 h-4 text-red-600" />
        <AlertDescription className="text-xs text-red-900">
          <strong>Pediatric Haematology:</strong> IDA · Thalassaemia · ITP · Haemophilia · Sickle Cell · HLH — ASH/IAP/WFH guidelines
        </AlertDescription>
      </Alert>
      <div className="relative">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search haematology conditions…"
          className="w-full text-xs border-2 rounded-xl px-3 py-2 pl-8 focus:outline-none focus:ring-2 focus:ring-red-300" />
        <Activity className="absolute left-2.5 top-2.5 w-3 h-3 text-slate-400" />
      </div>
      {filtered.map(t => <HaemCard key={t.id} topic={t} />)}
    </div>
  );
}