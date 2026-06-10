import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, Info, Plus, X, AlertCircle, Zap } from "lucide-react";

// Known interactions: { chemo_drug, new_drug, severity, type, mechanism, action }
const INTERACTION_DATABASE = [
  // Vincristine interactions
  { chemo: "vincristine", drug: "fluconazole", severity: "MAJOR", type: "Increased toxicity", mechanism: "Azole antifungals inhibit CYP3A4 → increased vincristine exposure → severe neurotoxicity", action: "Avoid concomitant use. Switch to non-azole antifungal (micafungin, anidulafungin). If unavoidable, reduce VCR dose 50% and monitor closely." },
  { chemo: "vincristine", drug: "voriconazole", severity: "MAJOR", type: "Increased toxicity", mechanism: "Potent CYP3A4 inhibition → markedly increased vincristine AUC → life-threatening neurotoxicity", action: "CONTRAINDICATED together. Use alternative antifungal. If azole essential, hold VCR and reassess timing." },
  { chemo: "vincristine", drug: "itraconazole", severity: "MAJOR", type: "Increased toxicity", mechanism: "CYP3A4 inhibition → vincristine accumulation", action: "Avoid. Use echinocandin antifungal instead." },
  { chemo: "vincristine", drug: "posaconazole", severity: "MAJOR", type: "Increased toxicity", mechanism: "CYP3A4 inhibition → vincristine toxicity", action: "Avoid. Use echinocandin." },

  // Methotrexate interactions
  { chemo: "methotrexate", drug: "ibuprofen", severity: "MAJOR", type: "Increased MTX toxicity", mechanism: "NSAIDs reduce renal MTX clearance → MTX accumulation → mucositis, myelosuppression, renal failure", action: "AVOID ALL NSAIDs during and 1 week after MTX. Use paracetamol for pain/fever only." },
  { chemo: "methotrexate", drug: "naproxen", severity: "MAJOR", type: "Increased MTX toxicity", mechanism: "NSAID-induced reduced renal clearance of MTX", action: "Contraindicated. No NSAIDs during MTX therapy." },
  { chemo: "methotrexate", drug: "diclofenac", severity: "MAJOR", type: "Increased MTX toxicity", mechanism: "NSAID reduces MTX renal tubular secretion", action: "Contraindicated with MTX." },
  { chemo: "methotrexate", drug: "aspirin", severity: "MAJOR", type: "Increased MTX toxicity", mechanism: "Aspirin displaces MTX from protein binding + reduces renal clearance", action: "Avoid aspirin during MTX." },
  { chemo: "methotrexate", drug: "cotrimoxazole", severity: "MAJOR", type: "Increased toxicity + myelosuppression", mechanism: "Both are antifolates — additive myelosuppression + mucositis", action: "Avoid cotrimoxazole during MTX-containing phases. Use pentamidine or dapsone for PCP prophylaxis if needed." },
  { chemo: "methotrexate", drug: "omeprazole", severity: "MODERATE", type: "Increased MTX levels", mechanism: "PPIs reduce renal clearance of MTX via OAT transporter inhibition", action: "Avoid PPIs during HD-MTX infusion. Withhold omeprazole/lansoprazole 48h before and during HD-MTX. Use ranitidine if needed." },
  { chemo: "methotrexate", drug: "pantoprazole", severity: "MODERATE", type: "Increased MTX levels", mechanism: "OAT3 inhibition reduces MTX renal clearance", action: "Hold pantoprazole during HD-MTX courses." },
  { chemo: "methotrexate", drug: "penicillin", severity: "MODERATE", type: "Increased MTX levels", mechanism: "Penicillins reduce tubular secretion of MTX", action: "Monitor MTX levels closely if penicillin co-administration unavoidable." },

  // 6-MP interactions
  { chemo: "6-mp", drug: "allopurinol", severity: "MAJOR", type: "Life-threatening 6-MP toxicity", mechanism: "Allopurinol inhibits xanthine oxidase → prevents 6-MP metabolism → 5–10× increased 6-MP levels → fatal myelosuppression", action: "REDUCE 6-MP DOSE TO 25–33% if allopurinol is essential (e.g. TLS prophylaxis). Preferably use rasburicase instead of allopurinol during TLS risk." },
  { chemo: "6-mercaptopurine", drug: "allopurinol", severity: "MAJOR", type: "Life-threatening 6-MP toxicity", mechanism: "Xanthine oxidase inhibition → 6-MP accumulation", action: "Reduce 6-MP to 25–33% of dose. Consider rasburicase for TLS instead." },
  { chemo: "6-mp", drug: "warfarin", severity: "MODERATE", type: "Reduced anticoagulation", mechanism: "6-MP may induce warfarin metabolism → reduced INR", action: "Monitor INR more frequently. Adjust warfarin dose as needed." },
  { chemo: "6-mp", drug: "mesalazine", severity: "MODERATE", type: "Increased 6-MP toxicity", mechanism: "Aminosalicylates inhibit TPMT enzyme → increased 6-MP active metabolites", action: "Monitor CBC closely. Consider TPMT genotyping." },

  // Cyclophosphamide interactions
  { chemo: "cyclophosphamide", drug: "succinylcholine", severity: "MODERATE", type: "Prolonged neuromuscular blockade", mechanism: "CPM inhibits pseudocholinesterase → delayed succinylcholine metabolism", action: "Alert anaesthetist. Consider non-depolarising agent for intubation." },

  // Anthracyclines (general)
  { chemo: "doxorubicin", drug: "trastuzumab", severity: "MAJOR", type: "Severe cardiotoxicity", mechanism: "Additive cardiotoxicity — both cause cardiomyopathy; combination markedly increases risk of heart failure", action: "Not typically used together in paediatric protocols. If sequential, ensure full cardiac recovery. Echo monitoring mandatory." },
  { chemo: "doxorubicin", drug: "verapamil", severity: "MODERATE", type: "Increased doxorubicin toxicity", mechanism: "P-gp inhibition increases intracellular doxorubicin accumulation", action: "Avoid calcium channel blockers during anthracycline therapy if possible." },

  // Ifosfamide
  { chemo: "ifosfamide", drug: "aprepitant", severity: "MODERATE", type: "Altered ifosfamide metabolism", mechanism: "Aprepitant (NK1 antagonist) inhibits CYP3A4 → altered ifosfamide/metabolite balance → possible reduced efficacy or altered encephalopathy risk", action: "Use ondansetron ± dexamethasone for CINV instead. Avoid aprepitant with ifosfamide." },
  { chemo: "ifosfamide", drug: "phenytoin", severity: "MODERATE", type: "Reduced ifosfamide efficacy", mechanism: "Enzyme-inducing antiepileptics induce CYP3A4 → altered ifosfamide activation", action: "Prefer levetiracetam for seizure prophylaxis during ifosfamide. Avoid phenytoin, carbamazepine." },
  { chemo: "ifosfamide", drug: "carbamazepine", severity: "MODERATE", type: "Reduced ifosfamide efficacy", mechanism: "CYP3A4 induction → altered IFO metabolism", action: "Switch to levetiracetam or valproate." },

  // Cisplatin
  { chemo: "cisplatin", drug: "aminoglycosides", severity: "MAJOR", type: "Severe nephrotoxicity + ototoxicity", mechanism: "Additive renal and cochlear toxicity", action: "Avoid aminoglycosides (amikacin, gentamicin) during cisplatin courses. Use alternative antibiotics. If unavoidable, monitor renal function and BAER closely." },
  { chemo: "cisplatin", drug: "amikacin", severity: "MAJOR", type: "Nephrotoxicity + ototoxicity", mechanism: "Additive tubular toxicity and cochlear damage", action: "Avoid during cisplatin cycles. Use beta-lactams or vancomycin for bacterial coverage." },
  { chemo: "cisplatin", drug: "gentamicin", severity: "MAJOR", type: "Nephrotoxicity + ototoxicity", mechanism: "Additive damage to renal tubules and cochlea", action: "Contraindicated together. Use alternative antibiotics." },
  { chemo: "cisplatin", drug: "furosemide", severity: "MODERATE", type: "Ototoxicity", mechanism: "Loop diuretics + cisplatin = additive cochlear damage — especially with rapid furosemide infusion", action: "If diuresis needed during cisplatin, use cautiously. Slow rate of furosemide infusion. Monitor hearing." },

  // L-Asparaginase
  { chemo: "asparaginase", drug: "prednisolone", severity: "MODERATE", type: "Increased thrombosis risk", mechanism: "Both deplete coagulation factors — combined effect on antithrombin III and fibrinogen → DVT/stroke risk", action: "Monitor fibrinogen, AT-III, D-dimer. Replace FFP if fibrinogen <100 mg/dL. VTE prophylaxis protocols vary by centre." },
  { chemo: "peg-asparaginase", drug: "prednisolone", severity: "MODERATE", type: "Thrombosis risk", mechanism: "Additive coagulopathy", action: "Fibrinogen monitoring before each ASNase dose. FFP replacement if <100." },

  // Busulfan
  { chemo: "busulfan", drug: "phenytoin", severity: "MAJOR", type: "Reduced busulfan efficacy", mechanism: "Phenytoin induces CYP enzymes → increased busulfan clearance → inadequate conditioning → engraftment failure risk", action: "Use levetiracetam for seizure prophylaxis during BuMel conditioning (not phenytoin)." },
  { chemo: "busulfan", drug: "itraconazole", severity: "MODERATE", type: "Increased busulfan AUC", mechanism: "Azole inhibits busulfan metabolism → increased exposure → more toxicity", action: "Use micafungin for antifungal prophylaxis during busulfan conditioning." },

  // Corticosteroids general
  { chemo: "dexamethasone", drug: "live vaccines", severity: "MAJOR", type: "Vaccine contraindication", mechanism: "Immunosuppression from steroids renders live vaccines dangerous → disseminated vaccine-strain infection", action: "No live vaccines (MMR, varicella, rotavirus, oral polio, BCG) during or within 3 months of immunosuppressive chemotherapy." },
  { chemo: "prednisolone", drug: "live vaccines", severity: "MAJOR", type: "Vaccine contraindication", mechanism: "Immunosuppression — live vaccines contraindicated", action: "Defer all live vaccines until ≥3 months after completion of immunosuppressive therapy and immune reconstitution confirmed." },
];

// Active chemo regimen for each protocol
const PROTOCOL_CHEMO = {
  "all-all": ["vincristine", "methotrexate", "6-mp", "6-mercaptopurine", "prednisolone", "dexamethasone", "asparaginase", "peg-asparaginase"],
  "all-aml": ["cytarabine", "idarubicin", "doxorubicin", "etoposide", "cyclophosphamide"],
  "wilms": ["actinomycin-d", "vincristine", "doxorubicin", "ifosfamide", "carboplatin"],
  "neuroblastoma-hr": ["carboplatin", "cisplatin", "etoposide", "cyclophosphamide", "busulfan", "isotretinoin"],
  "b-nhl": ["methotrexate", "cyclophosphamide", "doxorubicin", "vincristine", "rituximab"],
  "medulloblastoma": ["cisplatin", "cyclophosphamide", "vincristine"],
  "rms-sts": ["vincristine", "actinomycin-d", "ifosfamide", "doxorubicin"],
  "febrile_neutropenia": [],
};

const SEVERITY_CONFIG = {
  MAJOR: { color: "bg-red-600", textColor: "text-red-800", bg: "bg-red-50 border-red-200", icon: AlertTriangle },
  MODERATE: { color: "bg-amber-500", textColor: "text-amber-800", bg: "bg-amber-50 border-amber-200", icon: AlertCircle },
  MINOR: { color: "bg-blue-500", textColor: "text-blue-800", bg: "bg-blue-50 border-blue-200", icon: Info },
};

export default function InteractionChecker() {
  const [protocol, setProtocol] = useState("");
  const [newDrug, setNewDrug] = useState("");
  const [checkedDrugs, setCheckedDrugs] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [noInteractionFound, setNoInteractionFound] = useState(false);

  function checkInteractions(drugName) {
    const d = drugName.toLowerCase().trim();
    if (!d) return;
    const chemoList = PROTOCOL_CHEMO[protocol] || [];
    const found = INTERACTION_DATABASE.filter(inter =>
      chemoList.some(c => c === inter.chemo || inter.chemo.includes(c.split("-")[0])) &&
      (inter.drug === d || d.includes(inter.drug) || inter.drug.includes(d))
    );
    setCheckedDrugs(prev => [...prev.filter(x => x !== d), d]);
    setInteractions(prev => {
      const existing = prev.filter(i => !(checkedDrugs.includes(i.drug)));
      return [...existing, ...found];
    });
    setNoInteractionFound(found.length === 0 && !interactions.some(i => i.drug === d));
    setNewDrug("");
  }

  function removeChecked(drug) {
    setCheckedDrugs(prev => prev.filter(d => d !== drug));
    setInteractions(prev => prev.filter(i => i.drug !== drug));
  }

  const major = interactions.filter(i => i.severity === "MAJOR");
  const moderate = interactions.filter(i => i.severity === "MODERATE");
  const chemoList = PROTOCOL_CHEMO[protocol] || [];

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-red-700 to-rose-700 rounded-xl p-4 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-5 h-5 text-red-200" />
          <h2 className="font-bold text-base">Drug Interaction Checker</h2>
        </div>
        <p className="text-xs text-red-200">Flags contraindications & interactions when adding medications to an active chemo regimen</p>
      </div>

      <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800">This tool screens for known significant interactions. It does not replace pharmacist review. Always confirm with hospital pharmacist and treating oncologist before adding any new medication.</p>
      </div>

      {/* Protocol selection */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1.5">Active Chemotherapy Protocol</label>
          <select className="w-full px-3 py-2.5 text-sm border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
            value={protocol} onChange={e => { setProtocol(e.target.value); setCheckedDrugs([]); setInteractions([]); }}>
            <option value="">— Select active protocol —</option>
            <option value="all-all">ALL (ICiCLe / BFM) — induction/consolidation</option>
            <option value="all-aml">AML (BFM/MRC)</option>
            <option value="wilms">Wilms Tumour (SIOP-RTSG)</option>
            <option value="neuroblastoma-hr">Neuroblastoma HR (HR-NBL-1/COJEC)</option>
            <option value="b-nhl">Burkitt / B-NHL (LMB96)</option>
            <option value="medulloblastoma">Medulloblastoma (SIOP-E maintenance)</option>
            <option value="rms-sts">RMS / STS (CWS/EpSSG)</option>
          </select>
        </div>

        {protocol && chemoList.length > 0 && (
          <div>
            <p className="text-xs text-slate-500 mb-1.5">Active chemo agents being screened:</p>
            <div className="flex flex-wrap gap-1.5">
              {chemoList.map(d => (
                <span key={d} className="text-xs bg-red-100 text-red-800 border border-red-200 rounded-full px-2 py-0.5 font-medium capitalize">{d}</span>
              ))}
            </div>
          </div>
        )}

        {/* New drug input */}
        {protocol && (
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">New Medication to Add</label>
            <div className="flex gap-2">
              <input
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300"
                placeholder="e.g. fluconazole, ibuprofen, allopurinol, amikacin..."
                value={newDrug}
                onChange={e => setNewDrug(e.target.value)}
                onKeyDown={e => e.key === "Enter" && checkInteractions(newDrug)}
              />
              <button onClick={() => checkInteractions(newDrug)}
                className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-1">
                <Plus className="w-4 h-4" /> Check
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1">Common to check: fluconazole, voriconazole, ibuprofen, allopurinol, amikacin, omeprazole, cotrimoxazole</p>
          </div>
        )}

        {/* Checked drugs list */}
        {checkedDrugs.length > 0 && (
          <div>
            <p className="text-xs text-slate-500 mb-1.5">Checked medications:</p>
            <div className="flex flex-wrap gap-1.5">
              {checkedDrugs.map(d => (
                <span key={d} className="text-xs bg-slate-100 text-slate-700 border border-slate-200 rounded-full px-2 py-0.5 flex items-center gap-1">
                  {d}
                  <button onClick={() => removeChecked(d)} className="hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {interactions.length > 0 && (
        <div className="space-y-3">
          {/* Summary banner */}
          <div className={`rounded-xl p-3 flex items-center gap-3 ${major.length > 0 ? "bg-red-600" : "bg-amber-500"} text-white`}>
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-bold text-sm">{interactions.length} interaction{interactions.length > 1 ? "s" : ""} found</p>
              <p className="text-xs opacity-90">
                {major.length > 0 && `${major.length} MAJOR `}
                {moderate.length > 0 && `${moderate.length} MODERATE`}
              </p>
            </div>
          </div>

          {/* MAJOR interactions first */}
          {interactions
            .sort((a, b) => (a.severity === "MAJOR" ? -1 : 1))
            .map((inter, i) => {
              const cfg = SEVERITY_CONFIG[inter.severity] || SEVERITY_CONFIG.MINOR;
              const Icon = cfg.icon;
              return (
                <div key={i} className={`border-2 rounded-xl overflow-hidden ${cfg.bg}`}>
                  <div className={`${cfg.color} text-white px-4 py-2.5 flex items-center gap-2`}>
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="font-bold text-sm">{inter.severity} — {inter.type}</span>
                  </div>
                  <div className="px-4 py-3 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-700 capitalize bg-white border border-slate-200 rounded px-2 py-0.5">{inter.chemo}</span>
                      <span className="text-xs text-slate-500 font-bold">+</span>
                      <span className="text-xs font-bold text-red-700 bg-white border border-red-200 rounded px-2 py-0.5 capitalize">{inter.drug}</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-600">Mechanism:</p>
                      <p className="text-xs text-slate-700">{inter.mechanism}</p>
                    </div>
                    <div className={`rounded-lg p-2.5 ${inter.severity === "MAJOR" ? "bg-red-100 border border-red-300" : "bg-amber-100 border border-amber-300"}`}>
                      <p className="text-xs font-bold text-slate-800">⚡ Recommended Action:</p>
                      <p className="text-xs text-slate-800 leading-relaxed mt-0.5">{inter.action}</p>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {checkedDrugs.length > 0 && interactions.length === 0 && (
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-green-800">No significant interactions found</p>
            <p className="text-xs text-green-700 mt-0.5">Checked: {checkedDrugs.join(", ")} against active {protocol} regimen. Always confirm with hospital pharmacist.</p>
          </div>
        </div>
      )}

      {!protocol && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
          <Zap className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">Select the active chemotherapy protocol to start checking interactions</p>
        </div>
      )}
    </div>
  );
}