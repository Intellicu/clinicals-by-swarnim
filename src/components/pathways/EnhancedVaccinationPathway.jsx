import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Syringe, CheckCircle2, AlertTriangle, Clock, Info, BarChart2, ExternalLink, X } from "lucide-react";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";

const STORAGE_KEY = "nis_iap_vaccination_tracker";

// Complete NIS + IAP 2023 Schedule with full administration details
const VACCINE_DATABASE = [
  // BIRTH
  { id: "bcg", name: "BCG", age: "Birth", ageMonths: 0, category: "mandatory", disease: "Tuberculosis", dose: "0.1 ml (0.05 ml <1 month)", route: "Intra-dermal", site: "Left Upper Arm", notes: "Scar appears 2-4 weeks. Live attenuated.", reference: "https://www.who.int/teams/health-product-policy-and-standards/standards-and-specifications/vaccines-quality/bcg" },
  { id: "opv0", name: "OPV-0", age: "Birth", ageMonths: 0, category: "mandatory", disease: "Poliomyelitis", dose: "2 drops", route: "Oral", site: "Oral", notes: "Within 15 days of birth. Live attenuated.", reference: "https://www.who.int/teams/health-product-policy-and-standards/standards-and-specifications/vaccines-quality/polio" },
  { id: "hepb0", name: "Hepatitis B Birth Dose", age: "Birth", ageMonths: 0, category: "mandatory", disease: "Hepatitis B", dose: "0.5 ml", route: "Intra-muscular", site: "Antero-lateral mid-thigh", notes: "Within 24 hours of birth. Prevents vertical transmission.", reference: "https://www.who.int/teams/immunization-vaccines-and-biologicals/diseases/hepatitis-b" },
  
  // 6 WEEKS
  { id: "opv1", name: "OPV-1", age: "6 weeks", ageMonths: 1.5, category: "mandatory", disease: "Polio", dose: "2 drops", route: "Oral", site: "Oral", notes: "First primary dose. Can give till 5 years.", reference: "https://www.who.int/teams/health-product-policy-and-standards/standards-and-specifications/vaccines-quality/polio" },
  { id: "penta1", name: "Pentavalent-1 (DTPw+HepB+Hib)", age: "6 weeks", ageMonths: 1.5, category: "mandatory", disease: "Diphtheria, Tetanus, Pertussis, HepB, Hib", dose: "0.5 ml", route: "Intra-muscular", site: "Antero-lateral mid-thigh", notes: "Combination vaccine. Can give till 1 year.", reference: "https://main.mohfw.gov.in/sites/default/files/5628564789562315.pdf" },
  { id: "rota1", name: "Rotavirus-1 (RVV)", age: "6 weeks", ageMonths: 1.5, category: "mandatory", disease: "Rotavirus Gastroenteritis", dose: "5 drops (liquid) OR 2.5 ml (lyophilized)", route: "Oral", site: "Oral", notes: "Live attenuated. Start before 15 weeks. ROTAVAC/ROTASIL/Rotarix.", reference: "https://www.who.int/teams/health-product-policy-and-standards/standards-and-specifications/vaccines-quality/rotavirus" },
  { id: "fipv1", name: "fIPV-1 (Fractional IPV)", age: "6 weeks", ageMonths: 1.5, category: "mandatory", disease: "Polio", dose: "0.1 ml", route: "Intra-dermal", site: "Right upper arm", notes: "Fractional intradermal dose. NIS uses 2-dose schedule.", reference: "https://www.who.int/teams/health-product-policy-and-standards/standards-and-specifications/vaccines-quality/ipv" },
  { id: "pcv1", name: "PCV-1 (Pneumococcal)", age: "6 weeks", ageMonths: 1.5, category: "mandatory_select", disease: "Pneumococcal Infections", dose: "0.5 ml", route: "Intra-muscular", site: "Antero-lateral mid-thigh", notes: "PCV13/PCV15. NIS in select states. IAP recommends universally. 3+1 schedule.", reference: "https://www.iapindia.org/pdf/Ch-005-Recommended-Immunization-Schedule-2023.pdf" },
  
  // 10 WEEKS
  { id: "opv2", name: "OPV-2", age: "10 weeks", ageMonths: 2.5, category: "mandatory", disease: "Polio", dose: "2 drops", route: "Oral", site: "Oral", notes: "Second primary dose", reference: "https://www.who.int/teams/health-product-policy-and-standards/standards-and-specifications/vaccines-quality/polio" },
  { id: "penta2", name: "Pentavalent-2", age: "10 weeks", ageMonths: 2.5, category: "mandatory", disease: "Diphtheria, Tetanus, Pertussis, HepB, Hib", dose: "0.5 ml", route: "Intra-muscular", site: "Antero-lateral mid-thigh", notes: "Second dose", reference: "https://main.mohfw.gov.in/sites/default/files/5628564789562315.pdf" },
  { id: "rota2", name: "Rotavirus-2", age: "10 weeks", ageMonths: 2.5, category: "mandatory", disease: "Rotavirus", dose: "5 drops OR 2.5 ml", route: "Oral", site: "Oral", notes: "Second dose", reference: "https://www.who.int/teams/health-product-policy-and-standards/standards-and-specifications/vaccines-quality/rotavirus" },
  
  // 14 WEEKS
  { id: "opv3", name: "OPV-3", age: "14 weeks", ageMonths: 3.5, category: "mandatory", disease: "Polio", dose: "2 drops", route: "Oral", site: "Oral", notes: "Third primary dose", reference: "https://www.who.int/teams/health-product-policy-and-standards/standards-and-specifications/vaccines-quality/polio" },
  { id: "penta3", name: "Pentavalent-3", age: "14 weeks", ageMonths: 3.5, category: "mandatory", disease: "Diphtheria, Tetanus, Pertussis, HepB, Hib", dose: "0.5 ml", route: "Intra-muscular", site: "Antero-lateral mid-thigh", notes: "Third dose. Completion of primary series.", reference: "https://main.mohfw.gov.in/sites/default/files/5628564789562315.pdf" },
  { id: "fipv2", name: "fIPV-2", age: "14 weeks", ageMonths: 3.5, category: "mandatory", disease: "Polio", dose: "0.1 ml", route: "Intra-dermal", site: "Right upper arm", notes: "Second fractional dose", reference: "https://www.who.int/teams/health-product-policy-and-standards/standards-and-specifications/vaccines-quality/ipv" },
  { id: "rota3", name: "Rotavirus-3", age: "14 weeks", ageMonths: 3.5, category: "mandatory", disease: "Rotavirus", dose: "5 drops OR 2.5 ml", route: "Oral", site: "Oral", notes: "Third dose (ROTAVAC 3-dose schedule)", reference: "https://www.who.int/teams/health-product-policy-and-standards/standards-and-specifications/vaccines-quality/rotavirus" },
  { id: "pcv2", name: "PCV-2", age: "14 weeks", ageMonths: 3.5, category: "mandatory_select", disease: "Pneumococcal", dose: "0.5 ml", route: "Intra-muscular", site: "Antero-lateral mid-thigh", notes: "Second primary dose", reference: "https://www.iapindia.org/pdf/Ch-005-Recommended-Immunization-Schedule-2023.pdf" },
  
  // 9-12 MONTHS
  { id: "mr1", name: "MR-1 (Measles & Rubella)", age: "9-12 months", ageMonths: 10, category: "mandatory", disease: "Measles, Rubella", dose: "0.5 ml", route: "Sub-cutaneous", site: "Right upper arm", notes: "Can give till 5 years. Live attenuated. IAP recommends MMR instead.", reference: "https://www.who.int/teams/health-product-policy-and-standards/standards-and-specifications/vaccines-quality/measles" },
  { id: "je1", name: "JE-1 (Japanese Encephalitis)", age: "9-12 months", ageMonths: 10, category: "situational", disease: "Japanese Encephalitis", dose: "0.5 ml", route: "Sub-cutaneous (live) OR IM (killed)", site: "Left upper arm OR Antero-lateral thigh", notes: "Endemic districts only. SA14-14-2 (live) or inactivated JE-Vax.", reference: "https://www.who.int/teams/health-product-policy-and-standards/standards-and-specifications/vaccines-quality/japanese-encephalitis" },
  { id: "pcvbooster", name: "PCV-Booster", age: "9-12 months", ageMonths: 10, category: "mandatory_select", disease: "Pneumococcal", dose: "0.5 ml", route: "Intra-muscular", site: "Antero-lateral mid-thigh", notes: "Booster dose in 3+1 schedule", reference: "https://www.iapindia.org/pdf/Ch-005-Recommended-Immunization-Schedule-2023.pdf" },
  { id: "mmr1", name: "MMR-1 (IAP Recommendation)", age: "9 months", ageMonths: 9, category: "recommended", disease: "Measles, Mumps, Rubella", dose: "0.5 ml", route: "Sub-cutaneous", site: "Right upper arm", notes: "IAP prefers MMR over MR. Live attenuated. Better coverage.", reference: "https://www.iapindia.org/pdf/Ch-005-Recommended-Immunization-Schedule-2023.pdf" },
  { id: "vita1", name: "Vitamin A-1", age: "9 months", ageMonths: 9, category: "mandatory", disease: "Vitamin A Deficiency", dose: "1 ml (1 lakh IU)", route: "Oral", site: "Oral", notes: "Given with MR-1. Reduces child mortality.", reference: "https://www.who.int/news-room/fact-sheets/detail/vitamin-a-deficiency" },
  
  // 16-24 MONTHS
  { id: "mr2", name: "MR-2", age: "16-24 months", ageMonths: 18, category: "mandatory", disease: "Measles, Rubella", dose: "0.5 ml", route: "Sub-cutaneous", site: "Right upper arm", notes: "Second dose for better immunity", reference: "https://www.who.int/teams/health-product-policy-and-standards/standards-and-specifications/vaccines-quality/measles" },
  { id: "je2", name: "JE-2", age: "16-24 months", ageMonths: 18, category: "situational", disease: "Japanese Encephalitis", dose: "0.5 ml", route: "SC (live) OR IM (killed)", site: "Left upper arm OR Thigh", notes: "Endemic areas only", reference: "https://www.who.int/teams/health-product-policy-and-standards/standards-and-specifications/vaccines-quality/japanese-encephalitis" },
  { id: "dptb1", name: "DPT Booster-1", age: "16-24 months", ageMonths: 18, category: "mandatory", disease: "Diphtheria, Tetanus, Pertussis", dose: "0.5 ml", route: "Intra-muscular", site: "Antero-lateral mid-thigh", notes: "First booster. IAP recommends DTPa over DTPw for fewer side effects.", reference: "https://www.iapindia.org/pdf/Ch-005-Recommended-Immunization-Schedule-2023.pdf" },
  { id: "opvb1", name: "OPV Booster", age: "16-24 months", ageMonths: 18, category: "mandatory", disease: "Polio", dose: "2 drops", route: "Oral", site: "Oral", notes: "Booster dose", reference: "https://www.who.int/teams/health-product-policy-and-standards/standards-and-specifications/vaccines-quality/polio" },
  { id: "mmr2", name: "MMR-2 (IAP)", age: "15 months", ageMonths: 15, category: "recommended", disease: "Measles, Mumps, Rubella", dose: "0.5 ml", route: "Sub-cutaneous", site: "Right upper arm", notes: "IAP second MMR dose at 15 months", reference: "https://www.iapindia.org/pdf/Ch-005-Recommended-Immunization-Schedule-2023.pdf" },
  { id: "vita2", name: "Vitamin A (2nd-9th doses)", age: "16-18 months, then 6-monthly till 5y", ageMonths: 18, category: "mandatory", disease: "Vitamin A Deficiency", dose: "2 ml (2 lakh IU)", route: "Oral", site: "Oral", notes: "Biannual rounds with ICDS", reference: "https://www.who.int/news-room/fact-sheets/detail/vitamin-a-deficiency" },
  
  // 5-6 YEARS
  { id: "dptb2", name: "DPT Booster-2", age: "5-6 years", ageMonths: 66, category: "mandatory", disease: "Diphtheria, Tetanus, Pertussis", dose: "0.5 ml", route: "Intra-muscular", site: "Upper arm", notes: "School entry booster", reference: "https://www.who.int/teams/health-product-policy-and-standards/standards-and-specifications/vaccines-quality/diphtheria" },
  
  // 10 YEARS
  { id: "td10", name: "Td (Tetanus & Diphtheria)", age: "10 years", ageMonths: 120, category: "mandatory", disease: "Tetanus, Diphtheria", dose: "0.5 ml", route: "Intra-muscular", site: "Upper arm", notes: "Adolescent booster", reference: "https://www.who.int/teams/health-product-policy-and-standards/standards-and-specifications/vaccines-quality/tetanus" },
  
  // 16 YEARS
  { id: "td16", name: "Td", age: "16 years", ageMonths: 192, category: "mandatory", disease: "Tetanus, Diphtheria", dose: "0.5 ml", route: "Intra-muscular", site: "Upper arm", notes: "Late adolescent booster", reference: "https://www.who.int/teams/health-product-policy-and-standards/standards-and-specifications/vaccines-quality/tetanus" },
  
  // IAP ADDITIONAL RECOMMENDATIONS
  { id: "varicella1", name: "Varicella-1 (Chickenpox)", age: "15 months", ageMonths: 15, category: "recommended", disease: "Varicella (Chickenpox)", dose: "0.5 ml", route: "Sub-cutaneous", site: "Upper arm", notes: "Live attenuated. IAP recommends 2-dose schedule. Avoid in immunocompromised.", reference: "https://www.iapindia.org/pdf/Ch-005-Recommended-Immunization-Schedule-2023.pdf" },
  { id: "varicella2", name: "Varicella-2", age: "4-6 years", ageMonths: 60, category: "recommended", disease: "Varicella", dose: "0.5 ml", route: "Sub-cutaneous", site: "Upper arm", notes: "Second dose. Min 3 months after first.", reference: "https://www.iapindia.org/pdf/Ch-005-Recommended-Immunization-Schedule-2023.pdf" },
  { id: "hepa1", name: "Hepatitis A-1", age: "12 months", ageMonths: 12, category: "recommended", disease: "Hepatitis A", dose: "0.5 ml", route: "Intra-muscular", site: "Upper arm OR Thigh", notes: "Inactivated. 2 doses 6 months apart. IAP recommends for all children.", reference: "https://www.who.int/teams/health-product-policy-and-standards/standards-and-specifications/vaccines-quality/hepatitis-a" },
  { id: "hepa2", name: "Hepatitis A-2", age: "18 months", ageMonths: 18, category: "recommended", disease: "Hepatitis A", dose: "0.5 ml", route: "Intra-muscular", site: "Upper arm OR Thigh", notes: "Second dose 6 months after first", reference: "https://www.who.int/teams/health-product-policy-and-standards/standards-and-specifications/vaccines-quality/hepatitis-a" },
  { id: "typhoid", name: "Typhoid Conjugate (TCV)", age: "9-12 months", ageMonths: 10, category: "recommended", disease: "Typhoid Fever", dose: "0.5 ml", route: "Intra-muscular", site: "Upper arm OR Thigh", notes: "Typbar-TCV. Booster every 3 years. IAP recommends for high-risk areas.", reference: "https://www.who.int/teams/health-product-policy-and-standards/standards-and-specifications/vaccines-quality/typhoid" },
  { id: "influenza", name: "Influenza (Annual)", age: "6 months onwards (annual)", ageMonths: 6, category: "recommended", disease: "Seasonal Influenza", dose: "0.25 ml (<3y) OR 0.5 ml (≥3y)", route: "Intra-muscular", site: "Upper arm OR Thigh", notes: "Annual vaccination. IAP recommends for all 6m-5y and high-risk groups. 2 doses 4 weeks apart in first year.", reference: "https://www.who.int/teams/health-product-policy-and-standards/standards-and-specifications/vaccines-quality/influenza" },
  { id: "hpv", name: "HPV (Girls 9-14y)", age: "9-14 years (girls)", ageMonths: 120, category: "recommended", disease: "HPV (Cervical Cancer Prevention)", dose: "0.5 ml", route: "Intra-muscular", site: "Upper arm", notes: "2 doses 6 months apart if <15y. 3 doses if ≥15y or immunocompromised. Gardasil-9 or Cervarix.", reference: "https://www.who.int/teams/health-product-policy-and-standards/standards-and-specifications/vaccines-quality/hpv" },
  { id: "tdap", name: "Tdap (Adolescent)", age: "10-12 years", ageMonths: 132, category: "recommended", disease: "Tetanus, Diphtheria, Pertussis", dose: "0.5 ml", route: "Intra-muscular", site: "Upper arm", notes: "IAP recommends Tdap booster at 10y instead of Td", reference: "https://www.iapindia.org/pdf/Ch-005-Recommended-Immunization-Schedule-2023.pdf" },
  { id: "mmr3", name: "MMR-3 (School Entry)", age: "4-6 years", ageMonths: 60, category: "recommended", disease: "Measles, Mumps, Rubella", dose: "0.5 ml", route: "Sub-cutaneous", site: "Right upper arm", notes: "IAP third dose at school entry (NIS uses MR)", reference: "https://www.iapindia.org/pdf/Ch-005-Recommended-Immunization-Schedule-2023.pdf" },
  { id: "meningococcal", name: "Meningococcal (MCV4)", age: "9 months", ageMonths: 9, category: "situational", disease: "Meningococcal Disease", dose: "0.5 ml", route: "Intra-muscular", site: "Upper arm OR Thigh", notes: "Conjugate vaccine (Menactra/Menveo). High-risk: asplenia, complement deficiency, travelers. Booster 3-5y later.", reference: "https://www.who.int/teams/health-product-policy-and-standards/standards-and-specifications/vaccines-quality/meningococcal" },
  { id: "covid19", name: "COVID-19 (Corbevax/Covaxin)", age: "12+ years", ageMonths: 144, category: "situational", disease: "COVID-19", dose: "0.5 ml", route: "Intra-muscular", site: "Upper arm", notes: "As per current GOI/IAP advisory. Age eligibility and boosters updated periodically.", reference: "https://www.mohfw.gov.in/covid_vaccination/vaccination/index.html" },
];

// Nephrology-specific vaccine considerations
const NEPHRO_CONSIDERATIONS = [
  { condition: "Nephrotic Syndrome on High-Dose Steroids", rule: "Avoid LIVE vaccines if on >2 mg/kg/day or >20 mg/day prednisolone", vaccines: ["OPV", "Rotavirus", "MMR", "Varicella", "JE-live"], action: "Wait 3 months after steroid cessation before live vaccines" },
  { condition: "CKD Stage 3-5 (pre-dialysis)", rule: "Vaccinate EARLY before dialysis — better immune response", vaccines: ["All vaccines"], action: "Complete schedule before starting dialysis if possible" },
  { condition: "Hemodialysis / Peritoneal Dialysis", rule: "Double-dose Hepatitis B (40 mcg instead of 20 mcg)", vaccines: ["Hepatitis B"], action: "Check anti-HBs titers annually. Revaccinate if <10 mIU/mL" },
  { condition: "CKD / Nephrotic Syndrome", rule: "Enhanced Pneumococcal protection: PCV13 + PPSV23", vaccines: ["PCV", "PPSV23"], action: "Give PPSV23 at ≥2 years (8 weeks after last PCV). Revaccinate PPSV23 every 5 years" },
  { condition: "CKD / Nephrotic / Dialysis", rule: "Annual Influenza vaccine", vaccines: ["Influenza"], action: "Recommended for all CKD patients ≥6 months. Reduces hospitalization risk" },
  { condition: "Pre-Transplant", rule: "Complete ALL live vaccines ≥1 month before transplant", vaccines: ["MMR", "Varicella", "Rotavirus", "OPV"], action: "Check varicella serology. Vaccinate if seronegative ≥4 weeks before transplant" },
  { condition: "Post-Transplant", rule: "ONLY inactivated vaccines. NO live vaccines ever", vaccines: ["All inactivated"], action: "Wait 6-12 months post-transplant before non-live vaccines. Coordinate with transplant team" },
  { condition: "Functional Asplenia (Nephrotic)", rule: "Enhanced protection: Pneumococcal, Meningococcal, Hib", vaccines: ["PCV/PPSV23", "Meningococcal ACWY", "Hib"], action: "Higher infection risk. Ensure complete vaccination" },
];

export default function EnhancedVaccinationPathway() {
  const [patientAge, setPatientAge] = useState("");
  const [isNephro, setIsNephro] = useState(false);
  const [nephroCondition, setNephroCondition] = useState("");
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
    const updated = { ...givenVaccines, [id]: !givenVaccines[id] };
    setGivenVaccines(updated);
    saveRecord(updated);
  };

  const calculateDue = () => {
    if (!patientAge) { toast.error("Enter patient age in months"); return; }
    const ageM = parseFloat(patientAge);
    const due = VACCINE_DATABASE.filter(v => {
      const windowStart = v.ageMonths;
      const windowEnd = v.ageMonths + Math.max(12, v.ageMonths * 0.6);
      return ageM >= windowStart && ageM <= windowEnd && !givenVaccines[v.id];
    });
    setDueVaccines(due);
    if (due.length === 0) toast.info("No overdue vaccines");
    else toast.success(`${due.length} vaccines due`);
  };

  const filtered = filter === "all" ? VACCINE_DATABASE : VACCINE_DATABASE.filter(v => v.category === filter || (filter === "mandatory" && v.category.startsWith("mandatory")));

  const catColors = { mandatory: "bg-red-100 text-red-800 border-red-300", mandatory_select: "bg-orange-100 text-orange-800 border-orange-300", recommended: "bg-blue-100 text-blue-800 border-blue-300", situational: "bg-amber-100 text-amber-800 border-amber-300" };
  const catLabels = { mandatory: "NIS Mandatory", mandatory_select: "NIS (Select States)", recommended: "IAP Recommended", situational: "Situational/Endemic" };

  const coverage = {
    mandatory: VACCINE_DATABASE.filter(v => v.category === "mandatory").filter(v => givenVaccines[v.id]).length,
    mandatoryTotal: VACCINE_DATABASE.filter(v => v.category === "mandatory").length,
    recommended: VACCINE_DATABASE.filter(v => v.category === "recommended").filter(v => givenVaccines[v.id]).length,
    recommendedTotal: VACCINE_DATABASE.filter(v => v.category === "recommended").length,
  };

  const pieCoverage = [
    { name: "Given", value: Object.values(givenVaccines).filter(Boolean).length },
    { name: "Remaining", value: VACCINE_DATABASE.length - Object.values(givenVaccines).filter(Boolean).length },
  ];

  const applicableNephroRules = isNephro && nephroCondition ? NEPHRO_CONSIDERATIONS.filter(r => r.condition.includes(nephroCondition)) : [];

  return (
    <div className="space-y-6">
      <Alert className="bg-gradient-to-r from-green-50 to-teal-50 border-green-300 shadow-sm">
        <Syringe className="w-5 h-5 text-green-600" />
        <AlertDescription className="text-green-900">
          <strong>National Immunization Schedule (NIS) 2023 + IAP 2023 Recommendations.</strong> Includes complete administration details: dose, route, site, timing, contraindications. Click any vaccine for full information.
        </AlertDescription>
      </Alert>

      {/* Due Vaccine Calculator */}
      <Card className="bg-white shadow-lg border-2 border-green-200">
        <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 border-b">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-600" />Calculate Due Vaccines
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="col-span-2 md:col-span-1">
              <Label className="text-xs font-semibold">Patient Age (months)</Label>
              <Input type="number" value={patientAge} onChange={e => setPatientAge(e.target.value)} placeholder="e.g. 18" className="mt-1" />
            </div>
            <div className="flex items-end gap-2">
              <Checkbox id="nephro" checked={isNephro} onCheckedChange={setIsNephro} />
              <Label htmlFor="nephro" className="text-xs cursor-pointer">CKD/Nephrotic/Transplant</Label>
            </div>
            <Button onClick={calculateDue} className="bg-green-600 hover:bg-green-700">Calculate</Button>
          </div>
          {isNephro && (
            <div className="grid grid-cols-2 gap-2">
              {["Nephrotic on Steroids", "CKD Stage 3-5", "Dialysis", "Pre-Transplant", "Post-Transplant"].map(c => (
                <Button key={c} size="sm" variant={nephroCondition === c ? "default" : "outline"} className="text-xs" onClick={() => setNephroCondition(c)}>{c}</Button>
              ))}
            </div>
          )}
          {dueVaccines.length > 0 && (
            <div className="space-y-2 mt-3 p-3 bg-amber-50 border border-amber-300 rounded-lg">
              <h4 className="font-bold text-sm text-amber-900 flex items-center gap-2"><AlertTriangle className="w-4 h-4" />Due / Overdue Vaccines ({dueVaccines.length})</h4>
              {dueVaccines.map(v => (
                <div key={v.id} className="flex items-center justify-between p-2 bg-white border border-amber-200 rounded text-sm cursor-pointer hover:bg-amber-50" onClick={() => setSelectedVaccine(v)}>
                  <div>
                    <span className="font-semibold text-amber-900">{v.name}</span>
                    <span className="text-amber-700 ml-2 text-xs">· Due at {v.age}</span>
                  </div>
                  <Badge className={catColors[v.category]}>{catLabels[v.category]}</Badge>
                </div>
              ))}
            </div>
          )}
          {applicableNephroRules.length > 0 && (
            <Alert className="bg-red-50 border-red-300 mt-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-xs text-red-900 space-y-1">
                <p className="font-bold">⚠️ SPECIAL PRECAUTIONS for {nephroCondition}:</p>
                {applicableNephroRules.map((r, i) => (
                  <div key={i} className="bg-red-100 p-2 rounded">
                    <p className="font-semibold">{r.rule}</p>
                    <p className="text-red-700">Affected: {r.vaccines.join(", ")}</p>
                    <p className="text-red-800 mt-0.5"><strong>Action:</strong> {r.action}</p>
                  </div>
                ))}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Full Schedule */}
      <Card className="bg-white shadow-lg border-2">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Syringe className="w-5 h-5 text-blue-600" />Complete Vaccination Schedule (NIS + IAP 2023)
            </CardTitle>
            <div className="flex gap-1 flex-wrap">
              {["all", "mandatory", "recommended", "situational"].map(f => (
                <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)} className="text-xs capitalize h-7">
                  {f}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {filtered.map(v => (
              <div key={v.id} className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${givenVaccines[v.id] ? "bg-green-50 border-green-300 opacity-75" : "bg-white border-slate-200 hover:border-blue-400 hover:shadow-sm cursor-pointer"}`}>
                <Checkbox checked={!!givenVaccines[v.id]} onCheckedChange={() => toggleVaccine(v.id)} className="mt-1 flex-shrink-0" onClick={e => e.stopPropagation()} />
                <div className="flex-1 min-w-0" onClick={() => setSelectedVaccine(v)}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-semibold text-sm ${givenVaccines[v.id] ? "line-through text-slate-400" : "text-slate-900"}`}>{v.name}</span>
                    <Badge className={`text-xs ${catColors[v.category]}`}>{catLabels[v.category]}</Badge>
                    <Badge variant="outline" className="text-xs">{v.age}</Badge>
                    <Badge variant="outline" className="text-xs">{v.route}</Badge>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{v.disease} · <span className="text-blue-600 font-medium">{v.dose}</span> · {v.site}</p>
                  {!givenVaccines[v.id] && <p className="text-xs text-slate-500 mt-0.5 italic">Click for details</p>}
                </div>
                {givenVaccines[v.id] && <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />}
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t flex items-center justify-between text-sm flex-wrap gap-2">
            <div className="flex gap-4 text-xs">
              <span className="text-slate-600">NIS Mandatory: <strong className="text-green-600">{coverage.mandatory}/{coverage.mandatoryTotal}</strong></span>
              <span className="text-slate-600">IAP Recommended: <strong className="text-blue-600">{coverage.recommended}/{coverage.recommendedTotal}</strong></span>
            </div>
            <Button size="sm" variant="outline" onClick={() => { setGivenVaccines({}); localStorage.removeItem(STORAGE_KEY); toast.info("Record cleared"); }}>Clear Record</Button>
          </div>
        </CardContent>
      </Card>

      {/* Coverage Overview */}
      <Card className="bg-white shadow-lg">
        <CardHeader className="bg-gradient-to-r from-teal-50 to-green-50 border-b">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-teal-600" />Vaccination Coverage
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex flex-col items-center">
              <p className="text-xs font-semibold text-slate-600 mb-2">Overall Coverage</p>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieCoverage} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={75} startAngle={90} endAngle={-270} label={({ name, value }) => `${name}: ${value}`}>
                    <Cell fill="#10b981" />
                    <Cell fill="#e5e7eb" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <p className="text-3xl font-bold text-green-600 mt-2">{Math.round((pieCoverage[0].value / VACCINE_DATABASE.length) * 100)}%</p>
              <p className="text-xs text-slate-500">{pieCoverage[0].value} / {VACCINE_DATABASE.length} vaccines</p>
            </div>
            <div className="flex flex-col justify-center space-y-2">
              <div className="flex items-center justify-between p-2 bg-red-50 rounded border border-red-200">
                <span className="text-sm font-medium">NIS Mandatory</span>
                <span className="text-lg font-bold text-red-700">{coverage.mandatory}/{coverage.mandatoryTotal}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-200">
                <span className="text-sm font-medium">IAP Recommended</span>
                <span className="text-lg font-bold text-blue-700">{coverage.recommended}/{coverage.recommendedTotal}</span>
              </div>
              <div className="text-xs text-slate-500 mt-2">
                * NIS = National Immunization Schedule (Govt of India)
                <br />* IAP = Indian Academy of Pediatrics 2023
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nephrology Special Considerations */}
      <Card className="bg-red-50 border-2 border-red-300 shadow-lg">
        <CardHeader className="border-b border-red-300">
          <CardTitle className="text-base text-red-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />Nephrology Special Considerations (IPNA/KDIGO)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-2">
          {NEPHRO_CONSIDERATIONS.map((rule, i) => (
            <div key={i} className="bg-red-100 border border-red-300 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 text-xs">
                  <p className="font-bold text-red-900 mb-1">{rule.condition}</p>
                  <p className="text-red-800 mb-1"><strong>Rule:</strong> {rule.rule}</p>
                  <p className="text-red-700"><strong>Vaccines affected:</strong> {rule.vaccines.join(", ")}</p>
                  <p className="text-red-900 mt-1 bg-red-200 p-1.5 rounded"><strong>Action:</strong> {rule.action}</p>
                </div>
              </div>
            </div>
          ))}
          <Alert className="bg-blue-50 border-blue-300 mt-3">
            <Info className="w-4 h-4 text-blue-600" />
            <AlertDescription className="text-xs text-blue-900">
              <strong>References:</strong> IPNA Guidelines on Immunization in CKD, KDIGO Transplant Guidelines, IAP Immunization Handbook 2023. Always coordinate with nephrologist and transplant team.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Vaccine Detail Dialog */}
      {selectedVaccine && (
        <Dialog open={!!selectedVaccine} onOpenChange={() => setSelectedVaccine(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Syringe className="w-5 h-5 text-blue-600" />
                {selectedVaccine.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <InfoItem label="Disease Protection" value={selectedVaccine.disease} />
                <InfoItem label="Age" value={selectedVaccine.age} />
                <InfoItem label="Dose" value={selectedVaccine.dose} />
                <InfoItem label="Route" value={selectedVaccine.route} />
                <InfoItem label="Site" value={selectedVaccine.site} />
                <InfoItem label="Category" value={catLabels[selectedVaccine.category]} badge={catColors[selectedVaccine.category]} />
              </div>
              <Alert className="bg-blue-50 border-blue-200">
                <Info className="w-4 h-4 text-blue-600" />
                <AlertDescription className="text-xs text-blue-900">
                  <strong>Administration Notes:</strong><br />{selectedVaccine.notes}
                </AlertDescription>
              </Alert>
              {selectedVaccine.reference && (
                <a href={selectedVaccine.reference} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                  <ExternalLink className="w-4 h-4" />View Official Guidelines
                </a>
              )}
              <div className="flex gap-2 pt-2">
                {givenVaccines[selectedVaccine.id] ? (
                  <Button onClick={() => { toggleVaccine(selectedVaccine.id); setSelectedVaccine(null); }} className="flex-1 bg-amber-600">
                    <X className="w-4 h-4 mr-1" />Mark as Not Given
                  </Button>
                ) : (
                  <Button onClick={() => { toggleVaccine(selectedVaccine.id); setSelectedVaccine(null); }} className="flex-1 bg-green-600">
                    <CheckCircle2 className="w-4 h-4 mr-1" />Mark as Given
                  </Button>
                )}
                <Button variant="outline" onClick={() => setSelectedVaccine(null)}>Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function InfoItem({ label, value, badge }) {
  return (
    <div className={`p-2 rounded-lg border ${badge || "bg-slate-50 border-slate-200"}`}>
      <div className="text-xs text-slate-500 mb-0.5">{label}</div>
      <div className="font-semibold text-sm text-slate-900">{value}</div>
    </div>
  );
}