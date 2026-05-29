import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronDown, ChevronUp, AlertTriangle, BookOpen, Stethoscope, Activity } from "lucide-react";

const GASTRO_TOPICS = [
  {
    id: "gerd",
    name: "GERD / GOR",
    color: "orange",
    overview: "Gastro-oesophageal reflux (GOR) = physiological in infants; GERD = when causing symptoms/complications. Peak at 4 months, resolves by 12–18 months in most. Distinguished from bilious vomiting, pyloric stenosis, metabolic causes.",
    red_flags: ["Bilious (green) vomiting", "Haematemesis", "Forceful/projectile vomiting at 3–6w (pyloric stenosis)", "Weight loss/faltering growth", "Dysphagia/odynophagia", "Apnoea/ALTEs", "Dystonic neck posturing (Sandifer syndrome)", "Blood in stool"],
    diagnosis: ["Clinical diagnosis in uncomplicated reflux", "Trial of thickened feeds in infants", "pH-impedance monitoring: gold standard for acid + non-acid reflux", "Endoscopy: if alarm features or refractory; for eosinophilic oesophagitis", "Upper GI series: rules out malrotation/obstruction — not for GERD diagnosis"],
    management: ["Reassurance + parental education in uncomplicated GOR (<12m)", "Positional: head elevated 30°; prone ONLY when awake/supervised", "Thickened feeds: Gaviscon Infant (sodium alginate) in formula-fed", "Dairy-free trial 2–4 weeks in breastfed (CMPA co-exists in 40%)", "PPI: omeprazole 0.5–1 mg/kg/day for erosive oesophagitis; not for uncomplicated reflux", "H2RA: ranitidine withdrawn; famotidine 0.5 mg/kg BD", "Prokinetics: domperidone (limited evidence, QTc risk); metoclopramide avoid <1y", "Fundoplication: for severe refractory GERD with aspiration/failure to thrive"],
    monitoring: ["Weight monthly in infants", "Trial of stopping PPI after 4–8 weeks: reassess need", "Eosinophilic oesophagitis: endoscopy + dietary elimination/steroids"],
    references: ["ESPGHAN/NASPGHAN GERD Guidelines 2018", "IAP Reflux Advisory 2022"]
  },
  {
    id: "crohns",
    name: "IBD (Crohn's / UC)",
    color: "red",
    overview: "Paediatric IBD onset <16 years = 25% of all IBD. Crohn's: transmural, skip lesions, any segment mouth-to-anus. UC: mucosal, continuous, rectum upward. Very early onset IBD (VEO-IBD <6y) often monogenic — screen for IL-10RA/IL-10RB, XIAP etc.",
    red_flags: ["Chronic diarrhoea >4 weeks ± blood", "Weight loss + growth failure", "Perianal disease (fistula, abscess, skin tags) — Crohn's specific", "Arthritis + IBD (IBD-associated arthropathy)", "Uveitis / episcleritis", "Pyoderma gangrenosum / erythema nodosum", "FHx of IBD/colorectal cancer"],
    diagnosis: ["CBC: anaemia, thrombocytosis, low albumin, elevated ESR/CRP", "Faecal calprotectin >200 µg/g: highly sensitive for mucosal inflammation", "Endoscopy + biopsy: essential for diagnosis (ileocolonoscopy + upper endoscopy)", "MRI enterography: for small bowel Crohn's, perianal disease", "PCDAI (Crohn's) / PUCAI (UC): disease activity scoring", "VEO-IBD workup: immunology, genetics (WES) in <6y"],
    management: ["Crohn's induction: Exclusive Enteral Nutrition (EEN) × 6–8w — first-line (mucosal healing = steroids)", "UC induction: mesalazine 30–50 mg/kg/day; prednisolone 1 mg/kg/day if moderate-severe", "Biologics: infliximab (anti-TNF) for moderate-severe; anti-integrin (vedolizumab) for UC", "Maintenance: azathioprine 2–2.5 mg/kg/day OR 6-mercaptopurine", "Surgery: fulminant colitis, strictures, TPMT-deficient patient on aza", "Monitoring: CBC, LFT, albumin, TPMT before thiopurines; TDM for infliximab"],
    monitoring: ["PCDAI/PUCAI every 3 months", "Faecal calprotectin to monitor mucosal healing", "Annual colonoscopy surveillance after 8–10 years of disease", "Growth velocity + bone density (steroids)", "EBV/CMV serology before biologics"],
    references: ["ECCO/ESPGHAN IBD Guidelines 2021", "PIBD Porto Criteria 2014", "IAP IBD 2022"]
  },
  {
    id: "celiac",
    name: "Coeliac Disease",
    color: "amber",
    overview: "HLA-DQ2/DQ8-associated autoimmune enteropathy triggered by gluten in genetically susceptible individuals. Prevalence 1 in 100. Classic: diarrhoea + FTT; atypical: short stature, anaemia, constipation, elevated transaminases, infertility.",
    red_flags: ["Short stature without explanation", "Iron deficiency anaemia unresponsive to iron", "Unexplained osteoporosis/fractures", "Dermatitis herpetiformis (intensely pruritic blistering)", "Down syndrome or Turner syndrome: screen annually", "T1DM + celiac: ~5–10% co-occurrence", "Family history of celiac in 1st-degree relative"],
    diagnosis: ["Anti-TTG IgA (most sensitive): >10× ULN = no-biopsy pathway (ESPGHAN 2020)", "Total IgA: exclude IgA deficiency (use IgG-TTG if IgA deficient)", "Anti-DGP (deamidated gliadin peptide): useful in young children <2y", "HLA typing: DQ2.5/DQ8 negative = virtually excludes celiac (NPV >99%)", "Duodenal biopsy: Marsh 3 (villous atrophy) if TTG 3–10× ULN", "Do NOT start GFD before diagnosis is confirmed"],
    management: ["Strict gluten-free diet (GFD) for life: no wheat, barley, rye, sometimes oats", "Dietitian referral: food labelling, hidden gluten sources", "Correction of micronutrients: iron, folate, vitamin D, calcium (initially)", "Annual monitoring: anti-TTG IgA (should normalise in 12–18m), growth, bone density", "Refractory celiac: poor TTG normalisation → repeat biopsy, consider non-adherence first"],
    monitoring: ["Anti-TTG IgA at 3, 6, 12 months then annually", "Growth and pubertal assessment", "DEXA: after 2 years if initial low bone density", "Annual thyroid antibodies, iron studies"],
    references: ["ESPGHAN Celiac Guidelines 2020", "NASPGHAN 2016", "BSG/NICE 2022"]
  },
  {
    id: "nec",
    name: "NEC (Necrotising Enterocolitis)",
    color: "red",
    overview: "Neonatal GI emergency predominantly in preterm infants <32w or <1500g. Mucosal injury → bacterial invasion → pneumatosis intestinalis → perforation/peritonitis. Mortality 20–30% overall; >50% if requires surgery. Human breast milk is the best prevention.",
    red_flags: ["Bilious/bloody gastric aspirates in preterm", "Abdominal distension + abdominal wall erythema", "Bloody stools + systemic deterioration", "Apnoea + bradycardia + temperature instability", "Metabolic acidosis + thrombocytopenia", "Rising CRP + falling WBC"],
    diagnosis: ["Bell's staging: I (suspected), II (proven), III (advanced)", "AXR: pneumatosis intestinalis (pathognomonic), portal venous gas, fixed dilated loops, free air", "USS abdomen: superior to AXR — portal gas, free fluid, bowel wall thickening", "Labs: CBC, CRP, blood gas, culture (blood + peritoneal if perforated)", "Serial AXR every 6–8h in Bell's II+"],
    management: ["Stage I: NPO 72h, IV antibiotics (ampicillin + gentamicin ± metronidazole)", "Stage II: NPO 7–14 days, TPN, antibiotics, surgical team review", "Stage III: Emergency laparotomy — resection + stoma (if peritonitis/perforation)", "Medical management: decompression via OGT, bowel rest", "Antibiotics: empirical coverage — Gram-negative, Gram-positive, anaerobes", "Prevention: exclusive human milk, probiotic supplementation, standardised feeding protocols"],
    monitoring: ["Bell's staging progression — reassess every 6–8h", "Stoma output + fluid balance post-op", "Intestinal failure team for short bowel syndrome", "Neurodevelopmental follow-up: high risk of adverse outcomes"],
    references: ["ESPGHAN NEC Consensus 2020", "Vermont Oxford Network NEC Protocol", "IAP Neonatology 2022"]
  },
  {
    id: "alagi",
    name: "Cholestasis / Alagille",
    color: "amber",
    overview: "Neonatal jaundice persisting >2 weeks (term) or >3 weeks (preterm) with elevated direct (conjugated) bilirubin >1 mg/dL = pathological cholestasis. Biliary atresia is the leading cause of paediatric liver transplantation; early Kasai portoenterostomy (<6–8 weeks) is time-critical.",
    red_flags: ["Jaundice at >2 weeks with pale/acholic stools", "Dark urine + pale stools (biliary obstruction)", "Hepatomegaly ± splenomegaly", "Failure to thrive + fat-soluble vitamin deficiency", "Bleeding tendency (Vitamin K malabsorption)", "Pruritus (refractory in Alagille)", "Family history of cholestatic liver disease"],
    diagnosis: ["Split bilirubin: conjugated >1 mg/dL or >20% total = pathological", "GGT: elevated in biliary atresia, PFIC type 1–2 (low/normal GGT)", "Biliary USS: absent GB or non-contractile GB in biliary atresia", "HIDA scan: poor hepatic uptake → biliary atresia (vs. intrahepatic cholestasis)", "Liver biopsy: bile duct paucity (Alagille), bridging fibrosis, bile plugs", "JAG1/NOTCH2 mutations (Alagille)", "ABCB11/ATP8B1 mutations (PFIC)"],
    management: ["Biliary atresia: Kasai portoenterostomy URGENTLY (<6–8w) — 80% bile drainage if done <6w", "Fat-soluble vitamins: A (5000–10000 IU/day), D (800–1200 IU/day), E (25 IU/kg/day), K (5–10 mg/week)", "Ursodeoxycholic acid 10–20 mg/kg/day: cholestasis management", "Pruritus (Alagille): rifampicin, cholestyramine, naltrexone, IBAT inhibitors (maralixibat)", "Biliary atresia progressing: liver transplantation when hepatic decompensation"],
    monitoring: ["Liver function + synthetic function (PT/INR, albumin) monthly", "Fat-soluble vitamin levels every 3–6 months", "USS liver + portal Doppler 6-monthly", "DEXA scan for bone disease", "Hepatocellular carcinoma surveillance in cirrhosis"],
    references: ["ESPGHAN Neonatal Cholestasis Guidelines 2017", "AASLD Alagille 2020", "JPGN Biliary Atresia 2021"]
  },
  {
    id: "gi_bleed",
    name: "GI Bleeding in Children",
    color: "red",
    overview: "Upper GI bleed (UGIB): haematemesis + melaena; below Treitz ligament. Lower GI bleed (LGIB): haematochezia, typically from colonic/rectal source. Age of child narrows diagnosis significantly.",
    red_flags: ["Haemodynamic instability: tachycardia, hypotension, pallor", "Haematemesis with clots", "Haematochezia with shock", "Painless large volume rectal bleed → Meckel's diverticulum", "Infant with bloody stool → NEC, intussusception, volvulus", "Post-op child: stress ulcer"],
    diagnosis: ["Blood group + crossmatch urgently", "CBC, coagulation, LFT, renal function", "UGIB: urgent endoscopy after stabilisation", "LGIB: colonoscopy after prep; Meckel's scan (Tc-99m pertechnetate) for painless rectal bleed", "Intussusception: USS abdomen (target sign) + therapeutic air enema", "CT angiography: for massive obscure GI bleeding"],
    management: ["UGIB resuscitation: IV access × 2, crossmatch, PPI infusion (omeprazole 1–2 mg/kg IV)", "Octreotide (variceal bleed): 1–2 µg/kg bolus → 1–2 µg/kg/hr infusion", "Variceal band ligation: UGIB from portal hypertension", "Intussusception: air enema reduction 90% success; surgical if failed/peritonism", "Meckel's diverticulum: surgical resection", "Avoid NSAIDs + aspirin; PPI for stress ulcer prophylaxis in PICU"],
    monitoring: ["Haemoglobin trend post-bleed", "Haemodynamic monitoring every 30 min until stable", "Recurrence risk after variceal bleed: propranolol prophylaxis"],
    references: ["ESPGHAN GI Bleed Guidelines 2019", "NASPGHAN Practice Guidelines 2014"]
  },
];

const COLOR_MAP = {
  orange: { bg: "bg-orange-50", border: "border-orange-200", badge: "bg-orange-100 text-orange-800", header: "bg-orange-100" },
  red: { bg: "bg-red-50", border: "border-red-200", badge: "bg-red-100 text-red-800", header: "bg-red-100" },
  amber: { bg: "bg-amber-50", border: "border-amber-200", badge: "bg-amber-100 text-amber-800", header: "bg-amber-100" },
  teal: { bg: "bg-teal-50", border: "border-teal-200", badge: "bg-teal-100 text-teal-800", header: "bg-teal-100" },
};

const SECTION_DEFS = [
  { key: "red_flags", label: "🚩 Red Flags", colorClass: "bg-red-50 border-red-100 text-red-800" },
  { key: "diagnosis", label: "🔬 Diagnosis", colorClass: "bg-blue-50 border-blue-100 text-blue-800" },
  { key: "management", label: "💊 Management", colorClass: "bg-green-50 border-green-100 text-green-800" },
  { key: "monitoring", label: "📊 Monitoring", colorClass: "bg-purple-50 border-purple-100 text-purple-800" },
];

function GastroCard({ topic }) {
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState("red_flags");
  const c = COLOR_MAP[topic.color] || COLOR_MAP.orange;
  return (
    <Card className={`border-2 ${c.border} bg-white`}>
      <CardHeader className={`${c.header} pb-2 cursor-pointer`} onClick={() => setOpen(o => !o)}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm">{topic.name}</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{topic.overview.substring(0, 120)}…</p>
          </div>
          {open ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0 ml-2" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />}
        </div>
      </CardHeader>
      {open && (
        <CardContent className="pt-0 space-y-3">
          <p className="text-xs text-slate-600 px-1 py-2 bg-slate-50 rounded-lg">{topic.overview}</p>
          <div className="flex gap-1 flex-wrap">
            {SECTION_DEFS.map(s => (
              <button key={s.key} onClick={() => setSection(s.key)}
                className={`text-xs px-2.5 py-1 rounded-lg font-semibold border transition-colors ${section === s.key ? "bg-slate-700 text-white border-transparent" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>
                {s.label}
              </button>
            ))}
          </div>
          {SECTION_DEFS.filter(s => s.key === section).map(s => (
            <div key={s.key} className={`rounded-lg p-3 border ${s.colorClass}`}>
              {topic[s.key]?.map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-xs mb-1 last:mb-0">
                  <span className="font-bold shrink-0">{i + 1}.</span>{item}
                </div>
              ))}
            </div>
          ))}
          <p className="text-xs text-slate-400">📚 {topic.references?.join(" · ")}</p>
        </CardContent>
      )}
    </Card>
  );
}

export default function GastroenterologySection() {
  const [search, setSearch] = useState("");
  const filtered = GASTRO_TOPICS.filter(t =>
    !search || t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.overview.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <Alert className="bg-orange-50 border-orange-200">
        <Stethoscope className="w-4 h-4 text-orange-600" />
        <AlertDescription className="text-xs text-orange-900">
          <strong>Pediatric Gastroenterology:</strong> GERD · IBD · Coeliac · NEC · Cholestasis · GI Bleed — ESPGHAN/NASPGHAN/IAP guidelines
        </AlertDescription>
      </Alert>
      <div className="relative">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search GI conditions…"
          className="w-full text-xs border-2 rounded-xl px-3 py-2 pl-8 focus:outline-none focus:ring-2 focus:ring-orange-300" />
        <Activity className="absolute left-2.5 top-2.5 w-3 h-3 text-slate-400" />
      </div>
      {filtered.map(t => <GastroCard key={t.id} topic={t} />)}
    </div>
  );
}