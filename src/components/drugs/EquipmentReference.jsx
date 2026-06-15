import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, Info } from "lucide-react";

const EQUIPMENT_DATA = [
  {
    category: "Hemodialysis Catheters",
    color: "bg-blue-50 border-blue-200",
    headerColor: "bg-blue-700",
    icon: "🩸",
    items: [
      {
        name: "Temporary HD Catheter (Non-tunnelled)",
        sizes: [
          { range: "Neonate / <5 kg", size: "5–6 Fr, dual lumen", site: "Internal jugular or femoral", length: "8–10 cm (IJ)", ref: "ISPN 2020" },
          { range: "1–5 years / 5–20 kg", size: "7 Fr, dual lumen", site: "Internal jugular preferred", length: "10–12 cm (IJ)", ref: "ISPN 2020" },
          { range: "6–12 years / 20–40 kg", size: "8–9 Fr, dual lumen", site: "Internal jugular", length: "12–15 cm (IJ)", ref: "ISPN 2020" },
          { range: "Adolescent / >40 kg", size: "11.5 Fr, dual lumen (adult)", site: "Internal jugular or femoral", length: "15–20 cm (IJ)", ref: "ISPN 2020" },
        ],
        brands: "Arrow International, Medline, Vygon",
        pearls: "Internal jugular preferred over femoral (lower infection risk). Subclavian: avoid in children due to subclavian steal and vein thrombosis risk. Tip should be at SVC-RA junction for optimal flow.",
        references: ["ISPN Pediatric Dialysis Guidelines 2020", "KDOQI Pediatric Hemodialysis 2019"],
      },
      {
        name: "Tunnelled Permcath (Long-term HD)",
        sizes: [
          { range: "<10 kg / <2 years", size: "7 Fr, split-tip or step-tip", site: "Right internal jugular", length: "12–14 cm", ref: "ISPN 2020" },
          { range: "10–20 kg / 2–8 years", size: "8–9 Fr, step-tip (Palindrome/HemoSplit)", site: "Right internal jugular", length: "14–16 cm", ref: "ISPN 2020" },
          { range: "20–40 kg", size: "10–11 Fr, step-tip", site: "Right internal jugular", length: "17–19 cm", ref: "ISPN 2020" },
          { range: ">40 kg / Adolescent", size: "12–14.5 Fr (adult Palindrome/Tesio)", site: "Right internal jugular", length: "19–22 cm", ref: "ISPN 2020" },
        ],
        brands: "Palindrome (Medtronic), HemoSplit (Bard), Tesio (Medcomp)",
        pearls: "Step-tip or split-tip designs have lower recirculation. Tip position: SVC-RA junction or right atrium confirmed by fluoroscopy. Exit site: anterior chest wall. Cuff 2 cm from exit site.",
        references: ["ISPN 2020", "KDOQI HD Adequacy 2015"],
      },
    ],
  },
  {
    category: "Peritoneal Dialysis Catheters",
    color: "bg-purple-50 border-purple-200",
    headerColor: "bg-purple-700",
    icon: "🫀",
    items: [
      {
        name: "PD Catheter — Neonatal / Acute",
        sizes: [
          { range: "Neonate / Premature", size: "8 Fr, neonatal straight (Cook/Arrow)", site: "Left iliac fossa, paramedian approach", ref: "ISPD 2023" },
          { range: "Infant <10 kg", size: "9 Fr single cuff straight Tenckhoff", site: "Paramedian, below umbilicus", ref: "ISPD 2023" },
        ],
        brands: "Cook Critical Care (neonatal), SHAL Products (India), Arrow",
        pearls: "Acute PD: Tenckhoff-type catheter preferred even for acute PD — reduces leak risk vs semi-rigid stylet catheters. Percutaneous insertion technique under ultrasound guidance.",
        references: ["ISPD Pediatric Guidelines 2023", "Warady et al ISPD 2019"],
      },
      {
        name: "PD Catheter — Paediatric Tenckhoff",
        sizes: [
          { range: "Infant <10 kg", size: "Straight Tenckhoff, single cuff, 37 cm", site: "Paramedian below umbilicus", ref: "ISPD 2023" },
          { range: "1–8 years, 10–25 kg", size: "Straight Tenckhoff, double cuff, 40 cm", site: "Lateral paramedian, left iliac fossa", ref: "ISPD 2023" },
          { range: "8–12 years, 25–40 kg", size: "Straight or curled, double cuff, 42–47 cm", site: "Paramedian, caudal direction", ref: "ISPD 2023" },
          { range: "Adolescent >40 kg", size: "Adult Tenckhoff curled, double cuff, 47–56 cm", site: "Paramedian, adult position", ref: "ISPD 2023" },
        ],
        brands: "SHAL Products (India), Medcomp, Kendall-Sherwood, Fresenius",
        pearls: "Curled ('pigtail') tip reduces catheter migration. Double cuff preferred for tunnelled permanent access. Deep cuff: rectus muscle. Superficial cuff: 2 cm from exit site. Downward exit site orientation reduces infections. Lifespan: 2–5+ years if no complications.",
        references: ["ISPD Pediatric PD Guidelines 2023", "NAPRTCS 2022"],
      },
    ],
  },
  {
    category: "Renal Biopsy Equipment",
    color: "bg-rose-50 border-rose-200",
    headerColor: "bg-rose-700",
    icon: "🔬",
    items: [
      {
        name: "Biopsy Needle (Semi-automatic Gun)",
        sizes: [
          { range: "All paediatric patients", size: "16G × 20 cm — standard paediatric", site: "Ultrasound-guided, left kidney lower pole", ref: "KDI 2020" },
          { range: "Adolescents / larger children", size: "18G × 20 cm — if 16G tissue haematoma concern", site: "Left kidney, US-guided", ref: "KDI 2020" },
          { range: "Infant/neonate (specialist only)", size: "18G × 15 cm — careful US guidance", site: "Infant: right kidney may be more accessible", ref: "KDI 2020" },
        ],
        brands: "Bard Magnum 16G (BD), Precisa 16G, Achieve semi-automatic (Merit Medical), TSK Ultra-Core",
        pearls: "Two cores minimum: one for light microscopy (LM), one for immunofluorescence (IF). Electron microscopy (EM) from LM block or extra core. Two-shot biopsy gun: spring-loaded action for precise depth. US guidance in real-time. Prone position. Local anaesthesia + IV sedation standard in children.",
        references: ["KDIGO GN Guidelines 2021", "British Association for Paediatric Nephrology Biopsy Protocol 2020"],
      },
    ],
  },
  {
    category: "Vascular Access (IV Cannulas)",
    color: "bg-green-50 border-green-200",
    headerColor: "bg-green-700",
    icon: "💉",
    items: [
      {
        name: "Peripheral IV Cannula",
        sizes: [
          { range: "Premature neonate", size: "26G (yellow)", site: "Scalp, dorsum of hand, wrist", ref: "Standard" },
          { range: "Term neonate / Infant", size: "24G (yellow/orange)", site: "Dorsum of hand, foot", ref: "Standard" },
          { range: "1–3 years", size: "22G (blue)", site: "Dorsum of hand, antecubital", ref: "Standard" },
          { range: "3–12 years", size: "20–22G (pink/blue)", site: "Antecubital fossa, dorsum of hand", ref: "Standard" },
          { range: "Adolescent", size: "18–20G (green/pink)", site: "Antecubital fossa, forearm", ref: "Standard" },
        ],
        brands: "BD Insyte (Becton Dickinson), Venflon (BD), Jelco (ICU Medical)",
        pearls: "Largest bore feasible for intended use. Antecubital fossa: 18–20G for rapid fluid/blood products. Avoid antecubital fossa if prolonged use planned (extravasation on flexion). EMLA cream reduces insertion pain in all ages.",
        references: [],
      },
      {
        name: "Central Venous Catheter (CVC)",
        sizes: [
          { range: "Neonate / <5 kg", size: "3 Fr or 4 Fr, 8–10 cm", site: "Internal jugular or umbilical venous catheter", ref: "ESPNIC 2020" },
          { range: "Infant 5–10 kg", size: "4 Fr, 3-lumen, 8–10 cm", site: "Internal jugular", ref: "ESPNIC 2020" },
          { range: "Child 10–30 kg", size: "5 Fr, 3-lumen, 12–15 cm", site: "Internal jugular or femoral", ref: "ESPNIC 2020" },
          { range: "Adolescent >30 kg", size: "7 Fr, 3-lumen, 15–20 cm (adult)", site: "Internal jugular, subclavian", ref: "ESPNIC 2020" },
        ],
        brands: "Arrow Triple Lumen (Teleflex), Vygon CVC, BD Pressure Guard",
        pearls: "Rule of 3s: Fr = 3× patient weight/10 (approximate). Femoral: tip at IVC-hepatic vein junction. IJ: tip at SVC-RA junction. Subclavian: avoid in children <10 kg. US guidance reduces complications.",
        references: ["ESPNIC CVC Guidelines 2020", "NHSN Central Line Bundle 2023"],
      },
    ],
  },
  {
    category: "PICC Lines",
    color: "bg-cyan-50 border-cyan-200",
    headerColor: "bg-cyan-700",
    icon: "🧵",
    items: [
      {
        name: "Peripherally Inserted Central Catheter (PICC)",
        sizes: [
          { range: "Premature neonate", size: "1.0 Fr silicone (Premicath)", site: "Cephalic, basilic, saphenous", ref: "ESPNIC 2020" },
          { range: "Term neonate / Infant", size: "1.9–2.0 Fr, single lumen", site: "Basilic, cephalic forearm", ref: "ESPNIC 2020" },
          { range: "Child 1–10 years", size: "3 Fr single / 4 Fr double lumen", site: "Basilic/cephalic, above antecubital", ref: "ESPNIC 2020" },
          { range: "10+ years / Adolescent", size: "4 Fr double lumen", site: "Basilic vein (preferred)", ref: "ESPNIC 2020" },
        ],
        brands: "Bard Groshong PICC, Arrow PICC, Becton Dickinson PowerPICC, Covidien Turboject",
        pearls: "Tip confirmation: CXR for upper body PICCs — SVC-RA junction. Saphenous/leg PICCs: IVC. Maximum dwell time 3–6 months. Weekly dressing change with chlorhexidine. Valved PICCs (Groshong) reduce flush frequency. US guidance + microintroducer technique for small paediatric patients.",
        references: ["INS Infusion Therapy Standards 2021", "ESPNIC PICC Guidelines 2020"],
      },
    ],
  },
  {
    category: "Urinary Catheters",
    color: "bg-amber-50 border-amber-200",
    headerColor: "bg-amber-700",
    icon: "🚰",
    items: [
      {
        name: "Urethral Catheter (Foley)",
        sizes: [
          { range: "Premature neonate", size: "4–5 Fr feeding tube (repurposed)", site: "Urethra", ref: "Standard" },
          { range: "Neonates / Infants", size: "5–6 Fr", site: "Urethra", ref: "Standard" },
          { range: "1–5 years", size: "6–8 Fr", site: "Urethra", ref: "Standard" },
          { range: "6–12 years", size: "8–10 Fr", site: "Urethra", ref: "Standard" },
          { range: "Adolescent", size: "10–14 Fr (adult: 12–14 Fr)", site: "Urethra", ref: "Standard" },
        ],
        brands: "Rüsch, Bard, SISCO (India), Teleflex",
        pearls: "Paediatric Foley: balloon 3–5 mL in small children (never exceed). Hydrophilic coating reduces trauma. 12 French approximate in school age. Suprapubic: larger Fr catheter needed for drainage. Neurogenic bladder/CIC: use straight catheter (no balloon) for intermittent catheterisation.",
        references: [],
      },
      {
        name: "Intermittent Catheter (CIC)",
        sizes: [
          { range: "Infant", size: "6 Fr", site: "Urethra, self-catheterisation or carer", ref: "NICE 2019" },
          { range: "Child 1–6 years", size: "6–8 Fr", site: "Urethra", ref: "NICE 2019" },
          { range: "Child 6–12 years", size: "8–10 Fr", site: "Urethra", ref: "NICE 2019" },
          { range: "Adolescent female", size: "12–14 Fr", site: "Urethra", ref: "NICE 2019" },
          { range: "Adolescent male", size: "10–12 Fr, 40 cm length", site: "Urethra", ref: "NICE 2019" },
        ],
        brands: "Lofric (Wellspect), Speedicath (Coloplast), SpeediCath Compact, Cure Medical",
        pearls: "CIC frequency: every 3–4 hours for neurogenic bladder. Hydrophilic catheters: pre-lubricated, reduce UTI and trauma vs standard. Female short catheters (Speedicath Compact) improve discreet use. Clean technique adequate vs sterile in most community CIC.",
        references: ["ICCS/ESPU Neurogenic Bladder Guidelines 2019", "NICE Urinary Catheters CG 2019"],
      },
    ],
  },
  {
    category: "Intraosseous Access",
    color: "bg-red-50 border-red-200",
    headerColor: "bg-red-700",
    icon: "🦴",
    items: [
      {
        name: "Intraosseous Needle",
        sizes: [
          { range: "All emergency paediatric patients", size: "15G or 45 mm (EZ-IO driver)", site: "Proximal tibia (first-line), proximal humerus", ref: "PALS 2020" },
          { range: "Neonate", size: "18G Jamshidi IO needle (manual)", site: "Proximal tibia — medial flat surface", ref: "PALS 2020" },
          { range: "Child / Adolescent (EZ-IO)", size: "15G × 25 mm (standard EZ-IO)", site: "Proximal tibia, proximal humerus", ref: "PALS 2020" },
        ],
        brands: "Arrow EZ-IO (Teleflex), Jamshidi IO, Bone Injection Gun (Waismed)",
        pearls: "EZ-IO drill-powered: fastest in PALS. Proximal tibia: 1–2 cm below tibial tuberosity, medial flat surface. IO flush with 5 mL NS before use; IO flushes painlessly confirm placement. Max dwell 24–48h (place IV ASAP). All PALS drugs, fluids, blood products can be given IO.",
        references: ["PALS Guidelines AHA 2020", "ERC Paediatric Life Support 2021"],
      },
    ],
  },
];

export default function EquipmentReference() {
  const [expandedCat, setExpandedCat] = useState(null);
  const [expandedItem, setExpandedItem] = useState(null);

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-2xl p-4 text-white">
        <h2 className="text-base font-bold">Equipment & Consumables Reference</h2>
        <p className="text-xs text-slate-300 mt-0.5">Paediatric nephrology procedural equipment — size selection, Indian options, clinical pearls</p>
        <p className="text-[10px] text-amber-300 mt-1.5">⚠️ Costs not shown per institutional policy. Always verify current sizes with your institution.</p>
      </div>

      {EQUIPMENT_DATA.map((cat, ci) => (
        <div key={ci} className={`rounded-2xl border-2 overflow-hidden ${cat.color}`}>
          <button
            className="w-full flex items-center gap-3 px-4 py-3"
            onClick={() => setExpandedCat(expandedCat === ci ? null : ci)}
          >
            <span className="text-xl">{cat.icon}</span>
            <div className="flex-1 text-left">
              <p className="text-sm font-bold text-slate-800">{cat.category}</p>
              <p className="text-xs text-slate-500">{cat.items.length} item{cat.items.length !== 1 ? "s" : ""}</p>
            </div>
            {expandedCat === ci
              ? <ChevronDown className="w-4 h-4 text-slate-500" />
              : <ChevronRight className="w-4 h-4 text-slate-500" />
            }
          </button>

          {expandedCat === ci && (
            <div className="px-4 pb-4 space-y-3">
              {cat.items.map((item, ii) => {
                const key = `${ci}-${ii}`;
                const isOpen = expandedItem === key;
                return (
                  <div key={ii} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <button
                      className="w-full flex items-center justify-between px-3 py-2.5 text-left"
                      onClick={() => setExpandedItem(isOpen ? null : key)}
                    >
                      <span className="text-sm font-semibold text-slate-800">{item.name}</span>
                      {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />}
                    </button>

                    {isOpen && (
                      <div className="px-3 pb-3 space-y-3">
                        {/* Size table */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs border-collapse">
                            <thead>
                              <tr className={cat.headerColor + " text-white"}>
                                <th className="text-left px-2 py-1.5 font-semibold rounded-tl-lg">Age / Weight</th>
                                <th className="text-left px-2 py-1.5 font-semibold">Size / Fr</th>
                                <th className="text-left px-2 py-1.5 font-semibold hidden sm:table-cell">Site</th>
                                <th className="text-left px-2 py-1.5 font-semibold rounded-tr-lg hidden md:table-cell">Ref</th>
                              </tr>
                            </thead>
                            <tbody>
                              {item.sizes.map((row, si) => (
                                <tr key={si} className={si % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                                  <td className="px-2 py-1.5 font-medium text-slate-700">{row.range}</td>
                                  <td className="px-2 py-1.5 font-bold text-teal-700">{row.size}</td>
                                  <td className="px-2 py-1.5 text-slate-500 hidden sm:table-cell">{row.site}</td>
                                  <td className="px-2 py-1.5 text-slate-400 hidden md:table-cell">{row.ref}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Brands */}
                        {item.brands && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                            <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wide mb-1">Indian / Available Brands</p>
                            <p className="text-xs text-blue-800">{item.brands}</p>
                          </div>
                        )}

                        {/* Clinical Pearls */}
                        {item.pearls && (
                          <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                            <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                              <Info className="w-3 h-3" /> Clinical Pearls
                            </p>
                            <p className="text-xs text-emerald-800 leading-relaxed">{item.pearls}</p>
                          </div>
                        )}

                        {/* References */}
                        {item.references?.length > 0 && (
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">References</p>
                            {item.references.map((ref, ri) => (
                              <p key={ri} className="text-[10px] text-slate-500">• {ref}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
        <p className="text-xs text-amber-800">
          <strong>⚠️ Disclaimer:</strong> Size recommendations are general guidelines. Always confirm with your institution's protocols, consult vascular access specialists for placement, and verify current catalogue sizes with suppliers. Equipment availability varies by region.
        </p>
      </div>
    </div>
  );
}