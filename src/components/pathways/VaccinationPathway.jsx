import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Syringe, CheckCircle2, AlertTriangle, Clock, Info, BarChart2, ExternalLink, Eye, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";

const STORAGE_KEY = "nis_iap_vaccination_tracker";

// National Immunization Schedule + IAP 2023 Complete Schedule
const COMPLETE_SCHEDULE = [
  { id: "bcg", name: "BCG", age: "Birth", ageMonths: 0, category: "mandatory", disease: "Tuberculosis", doses: 1, route: "Intra-dermal", site: "Left Upper Arm", dose: "0.1ml (0.05ml until 1 month age)", notes: "Scar appears in 2-4 weeks. Mandatory in NIS.", refs: [{title:"NIS 2024",url:"https://nhm.gov.in/"}] },
  { id: "hepb_birth", name: "Hepatitis B - Birth dose", age: "Birth", ageMonths: 0, category: "mandatory", disease: "Hepatitis B", doses: 1, route: "Intra-muscular", site: "Anterolateral side of midthigh", dose: "0.5 ml", notes: "Within 24 hours of birth. Critical for prevention.", refs: [{title:"IAP HepB Guidelines",url:"https://www.iapindia.org"}] },
  { id: "opv0", name: "OPV-0 (Zero dose)", age: "Birth", ageMonths: 0, category: "mandatory", disease: "Polio", doses: 1, route: "Oral", site: "Oral", dose: "2 drops", notes: "Within first 15 days. OPV can be given till 5 years.", refs: [{title:"Polio Eradication",url:"https://polioeradication.org"}] },
  
  { id: "opv1", name: "OPV-1", age: "6 weeks", ageMonths: 1.5, category: "mandatory", disease: "Polio", doses: 1, route: "Oral", site: "Oral", dose: "2 drops", notes: "First primary dose of OPV series.", refs: [] },
  { id: "penta1", name: "Pentavalent-1 (DTPw+HepB+Hib)", age: "6 weeks", ageMonths: 1.5, category: "mandatory", disease: "Diphtheria, Tetanus, Pertussis, Hep B, Hib", doses: 1, route: "Intra-muscular", site: "Anterolateral side of midthigh", dose: "0.5 ml", notes: "Can be given till 1 year. DTPa (acellular) in private sector preferred.", refs: [{title:"Pentavalent Vaccine Intro",url:"https://www.iapindia.org"}] },
  { id: "rvv1", name: "Rotavirus-1 (RVV)", age: "6 weeks", ageMonths: 1.5, category: "mandatory", disease: "Rotavirus diarrhea", doses: 1, route: "Oral", site: "Oral", dose: "5 drops (liquid) / 2.5ml (lyophilized)", notes: "Start before 15 weeks. Rotavac or Rotarix. Can be given till 1 year.", refs: [{title:"Rotavirus Info",url:"https://www.who.int/teams/immunization-vaccines-and-biologicals/diseases/rotavirus"}] },
  { id: "fipv1", name: "fIPV-1 (Fractional IPV)", age: "6 weeks", ageMonths: 1.5, category: "mandatory", disease: "Polio (injectable)", doses: 1, route: "Intra-dermal", site: "Right upper arm", dose: "0.1 ml", notes: "Fractional dose (ID). Full dose IPV available in private sector.", refs: [] },
  { id: "pcv1", name: "PCV-1 (Pneumococcal)", age: "6 weeks", ageMonths: 1.5, category: "recommended", disease: "Pneumococcal infections", doses: 1, route: "Intra-muscular", site: "Anterolateral side of midthigh", dose: "0.5 ml", notes: "PCV13/PCV15. Selected states in NIS: Bihar, HP, MP, UP, Rajasthan, Haryana. IAP recommends 3+1 schedule universally.", refs: [{title:"PCV Guidelines",url:"https://www.cdc.gov/vaccines/vpd/pneumo/"}] },
  
  { id: "opv2", name: "OPV-2", age: "10 weeks", ageMonths: 2.5, category: "mandatory", disease: "Polio", doses: 1, route: "Oral", site: "Oral", dose: "2 drops", notes: "Second primary dose.", refs: [] },
  { id: "penta2", name: "Pentavalent-2", age: "10 weeks", ageMonths: 2.5, category: "mandatory", disease: "Diphtheria, Tetanus, Pertussis, Hep B, Hib", doses: 1, route: "Intra-muscular", site: "Anterolateral side of midthigh", dose: "0.5 ml", notes: "Second primary dose of pentavalent.", refs: [] },
  { id: "rvv2", name: "Rotavirus-2", age: "10 weeks", ageMonths: 2.5, category: "mandatory", disease: "Rotavirus", doses: 1, route: "Oral", site: "Oral", dose: "5 drops / 2.5ml", notes: "Second dose.", refs: [] },
  
  { id: "opv3", name: "OPV-3", age: "14 weeks", ageMonths: 3.5, category: "mandatory", disease: "Polio", doses: 1, route: "Oral", site: "Oral", dose: "2 drops", notes: "Third primary dose.", refs: [] },
  { id: "penta3", name: "Pentavalent-3", age: "14 weeks", ageMonths: 3.5, category: "mandatory", disease: "Diphtheria, Tetanus, Pertussis, Hep B, Hib", doses: 1, route: "Intra-muscular", site: "Anterolateral side of midthigh", dose: "0.5 ml", notes: "Third primary dose.", refs: [] },
  { id: "fipv2", name: "fIPV-2", age: "14 weeks", ageMonths: 3.5, category: "mandatory", disease: "Polio", doses: 1, route: "Intra-dermal", site: "Right upper arm", dose: "0.1 ml", notes: "Second fractional IPV dose.", refs: [] },
  { id: "rvv3", name: "Rotavirus-3", age: "14 weeks", ageMonths: 3.5, category: "mandatory", disease: "Rotavirus", doses: 1, route: "Oral", site: "Oral", dose: "5 drops / 2.5ml", notes: "Third dose (if 3-dose schedule).", refs: [] },
  { id: "pcv2", name: "PCV-2", age: "14 weeks", ageMonths: 3.5, category: "recommended", disease: "Pneumococcal", doses: 1, route: "Intra-muscular", site: "Anterolateral side of midthigh", dose: "0.5 ml", notes: "Second primary dose.", refs: [] },
  
  { id: "mr1", name: "MR-1 (Measles & Rubella)", age: "9-12 months", ageMonths: 9, category: "mandatory", disease: "Measles, Rubella", doses: 1, route: "Sub-cutaneous", site: "Right upper Arm", dose: "0.5 ml", notes: "Measles can be given till 5 years. MMR preferred in private sector (includes Mumps).", refs: [{title:"Measles Elimination",url:"https://www.who.int/news-room/fact-sheets/detail/measles"}] },
  { id: "je1", name: "JE-1 (Japanese Encephalitis)", age: "9-12 months", ageMonths: 9, category: "situational", disease: "Japanese Encephalitis", doses: 1, route: "Sub-cutaneous (Live) / IM (Killed)", site: "Left upper Arm (Live) / Anterolateral thigh (Killed)", dose: "0.5 ml", notes: "Endemic districts only (NIS). SA14-14-2 live or inactivated JE vaccine.", refs: [{title:"JE Info",url:"https://www.who.int/teams/immunization-vaccines-and-biologicals/diseases/japanese-encephalitis"}] },
  { id: "pcv_booster", name: "PCV-Booster", age: "9-12 months", ageMonths: 9, category: "recommended", disease: "Pneumococcal", doses: 1, route: "Intra-muscular", site: "Anterolateral side of midthigh", dose: "0.5 ml", notes: "Booster dose in 3+1 schedule. Critical for long-term immunity.", refs: [] },
  { id: "vita1", name: "Vitamin A (1st dose)", age: "9 months", ageMonths: 9, category: "mandatory", disease: "Vit A deficiency", doses: 1, route: "Oral", site: "Oral", dose: "1 ml (1 lakh IU)", notes: "Given with MR-1. Reduces child mortality.", refs: [] },
  { id: "typhoid", name: "Typhoid Conjugate Vaccine (TCV)", age: "9-12 months", ageMonths: 10, category: "recommended", disease: "Typhoid fever", doses: 1, route: "Intra-muscular", site: "Thigh or upper arm", dose: "0.5 ml", notes: "Typbar-TCV. IAP recommends universal TCV. Booster every 3 years. Not in NIS.", refs: [{title:"IAP TCV Reco",url:"https://www.iapindia.org"}] },
  { id: "hepa1", name: "Hepatitis A - 1", age: "12 months", ageMonths: 12, category: "recommended", disease: "Hepatitis A", doses: 1, route: "Intra-muscular", site: "Upper arm or thigh", dose: "0.5 ml", notes: "IAP recommends universal. 2-dose series (0, 6 months). Inactivated vaccine preferred.", refs: [{title:"Hepatitis A",url:"https://www.cdc.gov/vaccines/vpd/hepa/"}] },
  { id: "mmr1", name: "MMR-1 (Measles, Mumps, Rubella)", age: "12-15 months", ageMonths: 12, category: "recommended", disease: "Measles, Mumps, Rubella", doses: 1, route: "Sub-cutaneous", site: "Upper arm", dose: "0.5 ml", notes: "IAP recommends MMR over MR (adds Mumps protection). Private sector.", refs: [] },
  { id: "varicella1", name: "Varicella-1", age: "15 months", ageMonths: 15, category: "recommended", disease: "Chickenpox", doses: 1, route: "Sub-cutaneous", site: "Upper arm", dose: "0.5 ml", notes: "IAP recommends universal varicella. Not in NIS.", refs: [{title:"Varicella Vaccine",url:"https://www.cdc.gov/vaccines/vpd/varicella/"}] },
  
  { id: "dpt_b1", name: "DPT Booster-1", age: "16-24 months", ageMonths: 18, category: "mandatory", disease: "Diphtheria, Pertussis, Tetanus", doses: 1, route: "Intra-muscular", site: "Anterolateral side of midthigh", dose: "0.5 ml", notes: "First booster. DTPa + IPV preferred in private.", refs: [] },
  { id: "mr2", name: "MR-2", age: "16-24 months", ageMonths: 18, category: "mandatory", disease: "Measles, Rubella", doses: 1, route: "Sub-cutaneous", site: "Right upper Arm", dose: "0.5 ml", notes: "Second MR dose (NIS). MMR-2 in private sector.", refs: [] },
  { id: "opv_b", name: "OPV-Booster", age: "16-24 months", ageMonths: 18, category: "mandatory", disease: "Polio", doses: 1, route: "Oral", site: "Oral", dose: "2 drops", notes: "OPV booster dose.", refs: [] },
  { id: "je2", name: "JE-2", age: "16-24 months", ageMonths: 18, category: "situational", disease: "Japanese Encephalitis", doses: 1, route: "SC (Live) / IM (Killed)", site: "Left upper Arm / Thigh", dose: "0.5 ml", notes: "Endemic districts only. Second dose.", refs: [] },
  { id: "vita2_9", name: "Vitamin A (2nd to 9th dose)", age: "16-18 mo, then q6mo", ageMonths: 18, category: "mandatory", disease: "Vit A deficiency", doses: 8, route: "Oral", site: "Oral", dose: "2 ml (2 lakh IU)", notes: "Every 6 months till 5 years. ICDS collaboration biannual rounds.", refs: [] },
  { id: "hepa2", name: "Hepatitis A - 2", age: "18 months", ageMonths: 18, category: "recommended", disease: "Hepatitis A", doses: 1, route: "Intra-muscular", site: "Upper arm", dose: "0.5 ml", notes: "6 months after first dose. Completes series.", refs: [] },
  { id: "mmr2", name: "MMR-2 / MR-2", age: "4-6 years", ageMonths: 54, category: "mandatory", disease: "Measles, Mumps, Rubella", doses: 1, route: "Sub-cutaneous", site: "Right upper Arm", dose: "0.5 ml", notes: "School entry dose. MR in NIS, MMR in IAP.", refs: [] },
  { id: "varicella2", name: "Varicella-2", age: "4-6 years", ageMonths: 54, category: "recommended", disease: "Chickenpox", doses: 1, route: "Sub-cutaneous", site: "Upper arm", dose: "0.5 ml", notes: "Second dose. Min 3 months after first. IAP recommendation.", refs: [] },
  { id: "dpt_b2", name: "DPT Booster-2", age: "5-6 years", ageMonths: 60, category: "mandatory", disease: "Diphtheria, Pertussis, Tetanus", doses: 1, route: "Intra-muscular", site: "Upper Arm", dose: "0.5 ml", notes: "Pre-school booster (NIS).", refs: [] },
  { id: "typhoid_b1", name: "Typhoid TCV Booster-1", age: "3-4 years after first", ageMonths: 48, category: "recommended", disease: "Typhoid", doses: 1, route: "Intra-muscular", site: "Upper arm", dose: "0.5 ml", notes: "Booster every 3 years. IAP recommendation.", refs: [] },
  { id: "hpv", name: "HPV Vaccine (Girls 9-14y)", age: "9-14 years (girls)", ageMonths: 120, category: "recommended", disease: "HPV (Cervical cancer)", doses: 2, route: "Intra-muscular", site: "Upper arm", dose: "0.5 ml per dose", notes: "2 doses 6 months apart if <15y. 3 doses if immunocompromised or >15y. IAP recommends universal for girls.", refs: [{title:"HPV Vaccine",url:"https://www.who.int/teams/immunization-vaccines-and-biologicals/diseases/human-papillomavirus-vaccines-(HPV)"}] },
  { id: "td10", name: "Td (Tetanus & adult Diphtheria)", age: "10 years", ageMonths: 120, category: "mandatory", disease: "Tetanus, Diphtheria", doses: 1, route: "Intra-muscular", site: "Upper Arm", dose: "0.5 ml", notes: "NIS booster at 10 years. IAP prefers Tdap (with Pertussis).", refs: [] },
  { id: "tdap", name: "Tdap (Tetanus, Diphtheria, acellular Pertussis)", age: "10-12 years", ageMonths: 132, category: "recommended", disease: "Tetanus, Diphtheria, Pertussis", doses: 1, route: "Intra-muscular", site: "Upper arm", dose: "0.5 ml", notes: "IAP prefers Tdap over Td (booster protects against Pertussis).", refs: [] },
  { id: "td16", name: "Td", age: "16 years", ageMonths: 192, category: "mandatory", disease: "Tetanus, Diphtheria", doses: 1, route: "Intra-muscular", site: "Upper Arm", dose: "0.5 ml", notes: "NIS booster.", refs: [] },
  
  // IAP Additional Recommendations
  { id: "men_acwy", name: "Meningococcal ACWY", age: "9 months+", ageMonths: 9, category: "recommended", disease: "Meningococcal disease", doses: 1, route: "Intra-muscular", site: "Upper arm or thigh", dose: "0.5 ml", notes: "IAP recommends for all. Booster at 3-5 years. High-risk groups, travelers, college students.", refs: [{title:"Meningococcal Vaccine",url:"https://www.cdc.gov/vaccines/vpd/mening/"}] },
  { id: "influenza", name: "Influenza (Annual)", age: "6 months+", ageMonths: 6, category: "recommended", disease: "Seasonal influenza", doses: 1, route: "Intra-muscular", site: "Upper arm or thigh", dose: "0.25ml (<3y) / 0.5ml (≥3y)", notes: "Annual vaccination. IAP recommends for all children 6mo-5y and high-risk. 2 doses (4 weeks apart) for first year <9y.", refs: [{title:"Seasonal Flu Vaccine",url:"https://www.cdc.gov/flu/prevent/vaccinations.htm"}] },
  { id: "covid19", name: "COVID-19 Vaccine", age: "12 years+", ageMonths: 144, category: "recommended", disease: "COVID-19", doses: 2, route: "Intra-muscular", site: "Upper arm", dose: "0.5 ml", notes: "Corbevax (protein), Covaxin (inactivated). As per GOI/IAP advisory. Boosters as per guidelines.", refs: [{title:"COVID Vaccines India",url:"https://www.mohfw.gov.in"}] },
];

const SPECIAL_NOTES = [
  { title: "Catch-up Immunization", text: "If missed vaccines, refer to IAP catch-up schedule. Most vaccines can be given simultaneously at different sites.", ref: "https://www.iapindia.org" },
  { title: "Immunocompromised Children", text: "Avoid live vaccines if severely immunosuppressed. Consult specialist for modified schedules.", ref: "https://www.cdc.gov/vaccines/hcp/acip-recs/general-recs/immunocompetence.html" },
  { title: "Premature Infants", text: "Vaccinate according to chronological age (not corrected age), except BCG (<2kg: defer till 2kg).", ref: "https://www.iapindia.org" },
];

const NEPHROLOGY_SPECIAL = [
  { point: "CKD/Nephrotic Syndrome: Avoid live vaccines if on high-dose steroids (>2 mg/kg/day or >20 mg/day prednisolone equivalent)", severity: "critical" },
  { point: "CKD: Vaccinate BEFORE dialysis initiation if possible (better immune response)", severity: "important" },
  { point: "Hepatitis B: Double dose (40 mcg vs 20 mcg) for CKD/dialysis patients. Check anti-HBs titers annually. Revaccinate if <10 mIU/mL.", severity: "critical" },
  { point: "Pneumococcal: PCV13 + PPSV23 for CKD/nephrotic. PPSV23 at ≥2 years, revaccinate every 5 years.", severity: "critical" },
  { point: "Influenza: Annual flu vaccine mandatory for CKD/nephrotic syndrome (higher infection risk)", severity: "important" },
  { point: "Transplant: All live vaccines must be given ≥4 weeks BEFORE transplant. POST-transplant: only inactivated vaccines.", severity: "critical" },
  { point: "Varicella: If seronegative, vaccinate ≥4 weeks before transplant. Post-transplant varicella exposure → VZIG immediately.", severity: "critical" },
  { point: "Meningococcal, Hib: Recommended for nephrotic syndrome (functional asplenia/complement deficiency risk)", severity: "important" },
  { point: "Steroid timing: Live vaccines can be given if <2 mg/kg/day AND <20 mg/day total, OR ≥1 month after stopping high-dose steroids", severity: "important" },
];

export default function VaccinationPathway() {
  const [patientAge, setPatientAge] = useState("");
  const [isNephro, setIsNephro] = useState(false);
  const [givenVaccines, setGivenVaccines] = useState({});
  const [dueVaccines, setDueVaccines] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selectedVaccine, setSelectedVaccine] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setGivenVaccines(JSON.parse(saved));
  }, []);

  const saveRecord = (updated) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    toast.success("Vaccination record saved");
  };

  const toggleVaccine = (id) => {
    const updated = { ...givenVaccines, [id]: givenVaccines[id] ? null : new Date().toLocaleDateString() };
    setGivenVaccines(updated);
    saveRecord(updated);
  };

  const calculateDue = () => {
    if (!patientAge) { toast.error("Enter patient age in months"); return; }
    const ageM = parseFloat(patientAge);

    // CATCH-UP LOGIC: any vaccine whose scheduled age has passed and hasn't been given
    // Group by disease to avoid giving completed series twice
    const catchUpDue = COMPLETE_SCHEDULE.filter(v => {
      if (givenVaccines[v.id]) return false;
      // Skip vaccines that have an upper age limit beyond which catch-up is not meaningful
      const upperLimits = { bcg: 12, opv0: 0.5, hepb_birth: 1, vita1: 12 };
      if (upperLimits[v.id] && ageM > upperLimits[v.id]) return false;
      // Catch-up: vaccine was due at or before current age
      return v.ageMonths <= ageM;
    });

    // Also flag vaccines due SOON (within next 2 months)
    const dueSoon = COMPLETE_SCHEDULE.filter(v => {
      if (givenVaccines[v.id]) return false;
      return v.ageMonths > ageM && v.ageMonths <= ageM + 2;
    });

    const allDue = [
      ...catchUpDue.map(v => ({ ...v, catchUp: true })),
      ...dueSoon.map(v => ({ ...v, catchUp: false }))
    ];
    // Deduplicate
    const seen = new Set();
    const deduped = allDue.filter(v => { if (seen.has(v.id)) return false; seen.add(v.id); return true; });

    setDueVaccines(deduped);
    if (deduped.length === 0) toast.info("All vaccines up to date for this age");
    else toast.success(`${catchUpDue.length} catch-up + ${dueSoon.length} due soon`);
  };

  const filtered = filter === "all" ? COMPLETE_SCHEDULE : COMPLETE_SCHEDULE.filter(v => v.category === filter);
  const categoryColors = { mandatory: "bg-red-100 text-red-800 border-red-300", recommended: "bg-blue-100 text-blue-800 border-blue-300", situational: "bg-amber-100 text-amber-800 border-amber-300" };

  const coverageByCategory = ["mandatory","recommended","situational"].map(cat => {
    const catVaccines = COMPLETE_SCHEDULE.filter(v => v.category === cat);
    const given = catVaccines.filter(v => givenVaccines[v.id]).length;
    return { name: cat.charAt(0).toUpperCase() + cat.slice(1), total: catVaccines.length, given, pct: catVaccines.length ? Math.round((given / catVaccines.length) * 100) : 0 };
  });

  const pieCoverage = [
    { name: "Given", value: Object.keys(givenVaccines).filter(k => givenVaccines[k]).length },
    { name: "Pending", value: COMPLETE_SCHEDULE.length - Object.keys(givenVaccines).filter(k => givenVaccines[k]).length },
  ];

  return (
    <div className="space-y-6">
      <Alert className="bg-gradient-to-r from-green-50 to-teal-50 border-green-300">
        <Syringe className="w-5 h-5 text-green-700" />
        <AlertDescription className="text-green-900 text-sm">
          <strong>National Immunization Schedule (NIS) 2024 + IAP 2023 Recommendations.</strong> Click any vaccine to see detailed administration info (dose, route, site, references). Records saved offline.
        </AlertDescription>
      </Alert>

      {/* Due Calculator */}
      <Card className="bg-white shadow-lg border-2 border-green-200">
        <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 border-b">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-600" />Due Vaccine Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div className="flex gap-3 items-end flex-wrap">
            <div className="flex-1 min-w-[150px]">
              <Label className="text-xs font-semibold">Patient Age (months)</Label>
              <Input type="number" value={patientAge} onChange={e => setPatientAge(e.target.value)} placeholder="e.g. 18" className="mt-1" />
            </div>
            <div className="flex items-center gap-2 pb-1">
              <Checkbox id="nephro" checked={isNephro} onCheckedChange={setIsNephro} />
              <Label htmlFor="nephro" className="text-xs cursor-pointer font-semibold">CKD/Nephrotic/Transplant</Label>
            </div>
            <Button onClick={calculateDue} className="bg-green-600 hover:bg-green-700">Calculate Due</Button>
          </div>
          {dueVaccines.length > 0 && (
            <div className="space-y-2 mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <h4 className="font-bold text-sm text-amber-900 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                Catch-up &amp; Due Vaccines ({dueVaccines.length})
              </h4>
              {/* Catch-up group */}
              {dueVaccines.filter(v => v.catchUp).length > 0 && (
                <div>
                  <p className="text-xs font-bold text-red-700 mb-1 flex items-center gap-1"><RefreshCw className="w-3 h-3" />CATCH-UP REQUIRED (missed, give now)</p>
                  {dueVaccines.filter(v => v.catchUp).map(v => (
                    <div key={v.id} className="flex items-center justify-between p-2 bg-red-50 rounded border border-red-200 mb-1">
                      <div>
                        <span className="font-semibold text-sm text-red-900">{v.name}</span>
                        <span className="text-xs text-red-700 ml-2">Was due at {v.age}</span>
                        {v.id === "hepb_birth" && <span className="text-xs text-red-600 ml-1">(double dose 40mcg for CKD)</span>}
                      </div>
                      <Badge className={categoryColors[v.category]}>{v.category}</Badge>
                    </div>
                  ))}
                </div>
              )}
              {/* Due soon group */}
              {dueVaccines.filter(v => !v.catchUp).length > 0 && (
                <div>
                  <p className="text-xs font-bold text-amber-700 mb-1 flex items-center gap-1"><Clock className="w-3 h-3" />DUE SOON (within 2 months)</p>
                  {dueVaccines.filter(v => !v.catchUp).map(v => (
                    <div key={v.id} className="flex items-center justify-between p-2 bg-amber-50 rounded border mb-1">
                      <div>
                        <span className="font-semibold text-sm text-slate-900">{v.name}</span>
                        <span className="text-xs text-amber-700 ml-2">Due at {v.age}</span>
                      </div>
                      <Badge className={categoryColors[v.category]}>{v.category}</Badge>
                    </div>
                  ))}
                </div>
              )}
              {/* IAP Catch-up note */}
              <Alert className="bg-blue-50 border-blue-200 mt-2">
                <Info className="w-3 h-3 text-blue-600" />
                <AlertDescription className="text-xs text-blue-900">
                  <strong>IAP Catch-up Principle:</strong> Give all missed vaccines simultaneously (different sites). No need to restart series. Minimum intervals: DTP doses ≥4 weeks apart; MMR doses ≥4 weeks apart; Hep B doses: 0, 1, 6 month pattern if restarting.
                </AlertDescription>
              </Alert>
              {isNephro && (
                <Alert className="bg-red-50 border-red-300 mt-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <AlertDescription className="text-xs text-red-900 font-semibold">
                    ⚠️ Nephrology patient — DEFER live vaccines (Varicella, MMR, OPV) if on high-dose steroids. Check steroid dose before proceeding. Double-dose Hepatitis B (40mcg) if CKD/dialysis.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Full Schedule */}
      <Card className="bg-white shadow-lg border-2">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Syringe className="w-5 h-5 text-blue-600" />NIS 2024 + IAP 2023 Complete Schedule
            </CardTitle>
            <div className="flex gap-1 flex-wrap">
              {["all","mandatory","recommended","situational"].map(f => (
                <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)} className="text-xs capitalize h-7">
                  {f}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 mb-3 text-xs text-slate-500 flex-wrap">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-100 border-2 border-red-300 rounded inline-block" />Mandatory (NIS)</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-100 border-2 border-blue-300 rounded inline-block" />Recommended (IAP)</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-amber-100 border-2 border-amber-300 rounded inline-block" />Situational</span>
            <span className="ml-auto text-slate-600 font-semibold">Click vaccine name for details</span>
          </div>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {filtered.map(v => (
              <div key={v.id} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${givenVaccines[v.id] ? "bg-green-50 border-green-300" : "bg-white border-slate-200 hover:border-blue-400 hover:shadow-sm"}`}>
                <Checkbox checked={!!givenVaccines[v.id]} onCheckedChange={() => toggleVaccine(v.id)} className="mt-0.5 flex-shrink-0" onClick={e => e.stopPropagation()} />
                <div className="flex-1 min-w-0" onClick={() => toggleVaccine(v.id)}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-semibold text-sm ${givenVaccines[v.id] ? "text-green-700" : "text-slate-900"}`}>{v.name}</span>
                    <Badge className={`${categoryColors[v.category]} text-xs border`}>{v.category}</Badge>
                    <Badge variant="outline" className="text-xs">{v.age}</Badge>
                    <Badge variant="outline" className="text-xs">{v.route}</Badge>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{v.disease}</p>
                  {givenVaccines[v.id] && <p className="text-xs text-green-700 mt-0.5 font-medium">✓ Given on: {givenVaccines[v.id]}</p>}
                </div>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 flex-shrink-0" onClick={(e) => { e.stopPropagation(); setSelectedVaccine(v); }}>
                  <Eye className="w-4 h-4 text-blue-600" />
                </Button>
                {givenVaccines[v.id] && <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />}
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t flex items-center justify-between text-sm">
            <span className="text-slate-600 font-semibold">{Object.keys(givenVaccines).filter(k => givenVaccines[k]).length} / {COMPLETE_SCHEDULE.length} completed</span>
            <Button size="sm" variant="outline" onClick={() => { setGivenVaccines({}); localStorage.removeItem(STORAGE_KEY); toast.info("Record cleared"); }}>
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Coverage Charts */}
      <Card className="bg-white shadow-lg">
        <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 border-b">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-teal-600" />Vaccination Coverage Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center justify-center">
              <p className="text-xs font-semibold text-slate-600 mb-2">Overall Coverage</p>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieCoverage} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={70} startAngle={90} endAngle={-270}>
                    <Cell fill="#10b981" />
                    <Cell fill="#e2e8f0" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <p className="text-2xl font-bold text-green-600">{Math.round((pieCoverage[0].value / COMPLETE_SCHEDULE.length) * 100)}%</p>
              <p className="text-xs text-slate-500">{pieCoverage[0].value}/{COMPLETE_SCHEDULE.length} vaccines</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-xs font-semibold text-slate-600 mb-2">Coverage by Category (%)</p>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={coverageByCategory} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={90} />
                  <Tooltip />
                  <Bar dataKey="pct" radius={[0, 4, 4, 0]} name="Coverage %">
                    {coverageByCategory.map((entry, i) => (
                      <Cell key={i} fill={entry.pct >= 80 ? "#10b981" : entry.pct >= 50 ? "#f59e0b" : "#ef4444"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Special Notes */}
      <Card className="bg-blue-50 border-blue-300 shadow-lg">
        <CardHeader className="border-b border-blue-300">
          <CardTitle className="text-base text-blue-900 flex items-center gap-2">
            <Info className="w-5 h-5" />Special Vaccination Scenarios
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-2">
          {SPECIAL_NOTES.map((note, i) => (
            <div key={i} className="p-2 bg-white rounded border border-blue-200">
              <div className="font-semibold text-sm text-blue-900 flex items-center gap-2">
                {note.title}
                <a href={note.ref} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
                  <ExternalLink className="w-3 h-3" />Reference
                </a>
              </div>
              <p className="text-xs text-slate-700 mt-0.5">{note.text}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Nephrology Special */}
      <Card className="bg-red-50 border-red-300 shadow-lg border-2">
        <CardHeader className="border-b border-red-300">
          <CardTitle className="text-base text-red-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />Nephrology Special Considerations (IPNA/KDIGO)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-2">
          {NEPHROLOGY_SPECIAL.map((item, i) => (
            <div key={i} className={`flex items-start gap-2 text-sm p-2 rounded ${item.severity === "critical" ? "bg-red-100 border-2 border-red-400 text-red-900" : "bg-red-50 border border-red-200 text-red-800"}`}>
              <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${item.severity === "critical" ? "text-red-700" : "text-red-600"}`} />
              <span className={item.severity === "critical" ? "font-semibold" : ""}>{item.point}</span>
            </div>
          ))}
          <Alert className="bg-white border-red-400 mt-3">
            <Info className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-xs text-red-900">
              <strong>References:</strong> IPNA Clinical Practice Recommendations on Vaccination in CKD (2020), KDIGO 2024 CKD Guidelines, IAP Guidebook on Immunization 2023-25. Always verify steroid dose and immune status before live vaccines.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Vaccine Detail Dialog */}
      {selectedVaccine && (
        <Dialog open={!!selectedVaccine} onOpenChange={() => setSelectedVaccine(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Syringe className="w-5 h-5 text-blue-600" />
                {selectedVaccine.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-slate-50 p-2 rounded border"><strong>Age:</strong> {selectedVaccine.age}</div>
                <div className="bg-slate-50 p-2 rounded border"><strong>Category:</strong> <Badge className={`${categoryColors[selectedVaccine.category]} text-xs ml-1`}>{selectedVaccine.category}</Badge></div>
                <div className="bg-slate-50 p-2 rounded border"><strong>Disease:</strong> {selectedVaccine.disease}</div>
                <div className="bg-slate-50 p-2 rounded border"><strong>Doses:</strong> {selectedVaccine.doses}</div>
                <div className="bg-blue-50 p-2 rounded border border-blue-200 col-span-2"><strong>Route:</strong> {selectedVaccine.route}</div>
                <div className="bg-green-50 p-2 rounded border border-green-200 col-span-2"><strong>Site:</strong> {selectedVaccine.site}</div>
                <div className="bg-purple-50 p-2 rounded border border-purple-200 col-span-2"><strong>Dose:</strong> {selectedVaccine.dose}</div>
              </div>
              <Alert className="bg-amber-50 border-amber-200">
                <Info className="w-4 h-4 text-amber-600" />
                <AlertDescription className="text-xs text-amber-900">
                  <strong>Notes:</strong> {selectedVaccine.notes}
                </AlertDescription>
              </Alert>
              {selectedVaccine.refs?.length > 0 && (
                <div className="border-t pt-2">
                  <p className="text-xs font-semibold text-slate-600 mb-1">References:</p>
                  {selectedVaccine.refs.map((r, i) => (
                    <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1">
                      <ExternalLink className="w-3 h-3" />{r.title}
                    </a>
                  ))}
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <Button onClick={() => { toggleVaccine(selectedVaccine.id); setSelectedVaccine(null); }} className={givenVaccines[selectedVaccine.id] ? "bg-slate-500" : "bg-green-600"}>
                  {givenVaccines[selectedVaccine.id] ? "Mark as Not Given" : "Mark as Given"}
                </Button>
                <Button variant="outline" onClick={() => setSelectedVaccine(null)}>Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}