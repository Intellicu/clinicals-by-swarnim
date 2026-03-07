import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Syringe, CheckCircle2, AlertTriangle, Clock, Save, Info } from "lucide-react";
import { toast } from "sonner";

const STORAGE_KEY = "iap_vaccination_tracker";

// IAP 2023 Immunization Schedule
const IAP_SCHEDULE = [
  { id: "bcg", name: "BCG", age: "Birth", ageMonths: 0, category: "mandatory", disease: "Tuberculosis", doses: 1, route: "ID", notes: "Left deltoid. Scar appears 2-4 weeks." },
  { id: "opv0", name: "OPV-0", age: "Birth", ageMonths: 0, category: "mandatory", disease: "Polio", doses: 1, route: "Oral", notes: "Within 24 hours of birth." },
  { id: "hepb1", name: "Hepatitis B - 1", age: "Birth", ageMonths: 0, category: "mandatory", disease: "Hepatitis B", doses: 1, route: "IM", notes: "Within 24 hours of birth. Right anterolateral thigh." },
  { id: "dtpipvhib1", name: "DTPwIPV+Hib - 1", age: "6 weeks", ageMonths: 1.5, category: "mandatory", disease: "Diphtheria, Tetanus, Pertussis, Polio, Hib", doses: 1, route: "IM", notes: "Pentavalent (DTPw+HepB+Hib) in NIS. DTPa or DTPaIPVHib in private." },
  { id: "pcv1", name: "PCV - 1", age: "6 weeks", ageMonths: 1.5, category: "recommended", disease: "Pneumococcal", doses: 1, route: "IM", notes: "PCV13 or PCV15. IAP recommends 3+1 schedule." },
  { id: "rota1", name: "Rotavirus - 1", age: "6 weeks", ageMonths: 1.5, category: "recommended", disease: "Rotavirus diarrhea", doses: 1, route: "Oral", notes: "Rotavac or Rotarix. Start before 15 weeks." },
  { id: "dtpipvhib2", name: "DTPwIPV+Hib - 2", age: "10 weeks", ageMonths: 2.5, category: "mandatory", disease: "Diphtheria, Tetanus, Pertussis, Polio, Hib", doses: 1, route: "IM", notes: "Second primary dose." },
  { id: "rota2", name: "Rotavirus - 2", age: "10 weeks", ageMonths: 2.5, category: "recommended", disease: "Rotavirus diarrhea", doses: 1, route: "Oral", notes: "Second dose." },
  { id: "dtpipvhib3", name: "DTPwIPV+Hib - 3", age: "14 weeks", ageMonths: 3.5, category: "mandatory", disease: "Diphtheria, Tetanus, Pertussis, Polio, Hib", doses: 1, route: "IM", notes: "Third primary dose." },
  { id: "pcv2", name: "PCV - 2", age: "14 weeks", ageMonths: 3.5, category: "recommended", disease: "Pneumococcal", doses: 1, route: "IM", notes: "Second primary dose." },
  { id: "rota3", name: "Rotavirus - 3", age: "14 weeks", ageMonths: 3.5, category: "recommended", disease: "Rotavirus diarrhea", doses: 1, route: "Oral", notes: "Third dose (if 3-dose schedule)." },
  { id: "ipv", name: "IPV", age: "14 weeks", ageMonths: 3.5, category: "mandatory", disease: "Polio", doses: 1, route: "IM/SC", notes: "At least 1 injectable polio dose." },
  { id: "hepb23", name: "Hepatitis B - 2,3", age: "6 & 14 weeks", ageMonths: 1.5, category: "mandatory", disease: "Hepatitis B", doses: 2, route: "IM", notes: "In DTPw+HepB+Hib pentavalent." },
  { id: "mmr1", name: "MMR - 1", age: "9 months", ageMonths: 9, category: "mandatory", disease: "Measles, Mumps, Rubella", doses: 1, route: "SC", notes: "Can give MR at 9m if MMR not available." },
  { id: "pcvbooster", name: "PCV Booster", age: "9 months", ageMonths: 9, category: "recommended", disease: "Pneumococcal", doses: 1, route: "IM", notes: "Booster dose in 3+1 schedule." },
  { id: "men1", name: "Meningococcal - 1", age: "9 months", ageMonths: 9, category: "situational", disease: "Meningococcal disease", doses: 1, route: "IM", notes: "MCV4 (conjugate). High-risk groups, travelers." },
  { id: "jev1", name: "JE Vaccine - 1", age: "9 months", ageMonths: 9, category: "situational", disease: "Japanese Encephalitis", doses: 1, route: "SC/IM", notes: "Endemic areas only. SA14-14-2 live or Inactivated." },
  { id: "varicella1", name: "Varicella - 1", age: "15 months", ageMonths: 15, category: "recommended", disease: "Chickenpox", doses: 1, route: "SC", notes: "After 12 months of age." },
  { id: "dtpbooster1", name: "DTP Booster 1 + IPV", age: "15-18 months", ageMonths: 16, category: "mandatory", disease: "Diphtheria, Tetanus, Pertussis, Polio", doses: 1, route: "IM", notes: "First booster. DTPaIPV preferred." },
  { id: "hibbooster", name: "Hib Booster", age: "15-18 months", ageMonths: 16, category: "mandatory", disease: "Hib", doses: 1, route: "IM", notes: "Fourth dose as booster." },
  { id: "mmr2", name: "MMR - 2", age: "15 months", ageMonths: 15, category: "mandatory", disease: "Measles, Mumps, Rubella", doses: 1, route: "SC", notes: "Second MMR dose." },
  { id: "hepab", name: "Hepatitis A", age: "12 months", ageMonths: 12, category: "recommended", disease: "Hepatitis A", doses: 2, route: "IM", notes: "2 doses, 6 months apart. Inactivated preferred." },
  { id: "typhoid1", name: "Typhoid Conjugate", age: "9-12 months", ageMonths: 10, category: "recommended", disease: "Typhoid", doses: 1, route: "IM", notes: "TCV (Typbar-TCV). Booster every 3 years." },
  { id: "varicella2", name: "Varicella - 2", age: "4-6 years", ageMonths: 54, category: "recommended", disease: "Chickenpox", doses: 1, route: "SC", notes: "Second dose. Min 3 months after first." },
  { id: "dtpbooster2", name: "DTP Booster 2 + IPV", age: "4-6 years", ageMonths: 54, category: "mandatory", disease: "Diphtheria, Tetanus, Pertussis, Polio", doses: 1, route: "IM", notes: "Second booster (pre-school)." },
  { id: "mmr3", name: "MMR/MR - 3", age: "4-6 years", ageMonths: 54, category: "mandatory", disease: "Measles, Mumps, Rubella", doses: 1, route: "SC", notes: "School entry dose." },
  { id: "hpv", name: "HPV Vaccine", age: "9-14 years (girls)", ageMonths: 120, category: "recommended", disease: "HPV (Cervical Cancer)", doses: 2, route: "IM", notes: "2 doses 6 months apart if <15y. 3 doses if immunocompromised." },
  { id: "tdap", name: "Tdap", age: "10-12 years", ageMonths: 132, category: "recommended", disease: "Tetanus, Diphtheria, Pertussis", doses: 1, route: "IM", notes: "Booster." },
  { id: "men2", name: "Meningococcal Booster", age: "3-5 years after first", ageMonths: 60, category: "situational", disease: "Meningococcal disease", doses: 1, route: "IM", notes: "If first given at 9-24m. High-risk." },
];

const SPECIAL_VACCINES = [
  { name: "COVID-19", note: "As per GOI/IAP advisory. Corbevax, Covaxin for 12+ years." },
  { name: "Influenza", note: "Annual. Recommended for all children 6m-5y and high-risk groups." },
  { name: "Pneumococcal (catch-up)", note: "Unvaccinated >2y: 2 doses PPSV23 3-5y apart." },
  { name: "Hepatitis B (catch-up)", note: "3 doses (0, 1, 6 months) for unvaccinated children/adolescents." },
];

const NEPHROLOGY_SPECIAL = [
  "CKD/Nephrotic Syndrome: Avoid live vaccines if on high-dose steroids (>2 mg/kg/day or >20 mg/day)",
  "CKD: Vaccinate BEFORE dialysis if possible (better immune response)",
  "Hepatitis B: Double dose (40 mcg) for CKD/dialysis patients — check anti-HBs annually",
  "Pneumococcal: PCV + PPSV23 for CKD/nephrotic — revaccinate every 5 years",
  "Influenza: Annual flu vaccine for CKD/nephrotic syndrome",
  "Transplant: All live vaccines must be given ≥1 month before transplant. After transplant — only inactivated vaccines",
  "Varicella: If seronegative, vaccinate ≥4 weeks before transplant",
  "Meningococcal, Hib: Recommended for nephrotic syndrome (functional asplenia)",
];

export default function VaccinationPathway() {
  const [patientAge, setPatientAge] = useState("");
  const [isNephro, setIsNephro] = useState(false);
  const [givenVaccines, setGivenVaccines] = useState({});
  const [dueVaccines, setDueVaccines] = useState([]);
  const [filter, setFilter] = useState("all"); // all | mandatory | recommended | situational

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setGivenVaccines(JSON.parse(saved));
  }, []);

  const saveRecord = (updated) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    toast.success("Vaccination record saved offline");
  };

  const toggleVaccine = (id) => {
    const updated = { ...givenVaccines, [id]: !givenVaccines[id] };
    setGivenVaccines(updated);
    saveRecord(updated);
  };

  const calculateDue = () => {
    if (!patientAge) { toast.error("Enter patient age in months"); return; }
    const ageM = parseFloat(patientAge);
    const due = IAP_SCHEDULE.filter(v => {
      const windowStart = v.ageMonths;
      const windowEnd = v.ageMonths + Math.max(6, v.ageMonths * 0.5); // catch-up window
      return ageM >= windowStart && ageM <= windowEnd && !givenVaccines[v.id];
    });
    setDueVaccines(due);
    if (due.length === 0) toast.info("No overdue vaccines found for this age");
    else toast.success(`${due.length} vaccines due/overdue identified`);
  };

  const filtered = filter === "all" ? IAP_SCHEDULE : IAP_SCHEDULE.filter(v => v.category === filter);
  const categoryColors = { mandatory: "bg-red-100 text-red-800", recommended: "bg-blue-100 text-blue-800", situational: "bg-amber-100 text-amber-800" };

  return (
    <div className="space-y-6">
      <Alert className="bg-green-50 border-green-200">
        <Syringe className="w-5 h-5 text-green-600" />
        <AlertDescription className="text-green-800">
          <strong>IAP 2023 Immunization Schedule.</strong> Mandatory = NIS + IAP core. Recommended = IAP but not NIS. Situational = specific risk groups. Record saved offline automatically.
        </AlertDescription>
      </Alert>

      {/* Due Vaccine Calculator */}
      <Card className="bg-white shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 border-b">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-600" />Due Vaccine Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Label className="text-xs font-semibold">Patient Age (months)</Label>
              <Input type="number" value={patientAge} onChange={e => setPatientAge(e.target.value)} placeholder="e.g. 18" className="mt-1" />
            </div>
            <div className="flex items-center gap-2 pb-1">
              <Checkbox id="nephro" checked={isNephro} onCheckedChange={setIsNephro} />
              <Label htmlFor="nephro" className="text-xs cursor-pointer">CKD/Nephrotic/Transplant</Label>
            </div>
            <Button onClick={calculateDue} className="bg-green-600 hover:bg-green-700">Calculate Due</Button>
          </div>
          {dueVaccines.length > 0 && (
            <div className="space-y-2 mt-3">
              <h4 className="font-semibold text-sm text-slate-800">Due / Overdue Vaccines:</h4>
              {dueVaccines.map(v => (
                <div key={v.id} className="flex items-center justify-between p-2 bg-amber-50 border border-amber-200 rounded text-sm">
                  <div>
                    <span className="font-semibold text-amber-900">{v.name}</span>
                    <span className="text-amber-700 ml-2 text-xs">Due at {v.age}</span>
                  </div>
                  <Badge className={categoryColors[v.category]}>{v.category}</Badge>
                </div>
              ))}
              {isNephro && (
                <Alert className="bg-blue-50 border-blue-200 mt-2">
                  <Info className="w-4 h-4 text-blue-600" />
                  <AlertDescription className="text-xs text-blue-800">
                    See Nephrology Special Considerations below before administering vaccines.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Full Schedule Tracker */}
      <Card className="bg-white shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Syringe className="w-5 h-5 text-blue-600" />IAP 2023 Full Schedule Tracker
            </CardTitle>
            <div className="flex gap-1">
              {["all","mandatory","recommended","situational"].map(f => (
                <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)} className="text-xs capitalize">
                  {f}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 mb-3 text-xs text-slate-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-100 border border-red-300 rounded inline-block" />Mandatory (NIS)</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-100 border border-blue-300 rounded inline-block" />Recommended (IAP)</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-amber-100 border border-amber-300 rounded inline-block" />Situational</span>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filtered.map(v => (
              <div key={v.id} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${givenVaccines[v.id] ? "bg-green-50 border-green-300 opacity-75" : "bg-white border-slate-200 hover:border-blue-300"}`} onClick={() => toggleVaccine(v.id)}>
                <Checkbox checked={!!givenVaccines[v.id]} onCheckedChange={() => toggleVaccine(v.id)} className="mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-semibold text-sm ${givenVaccines[v.id] ? "line-through text-slate-400" : "text-slate-900"}`}>{v.name}</span>
                    <Badge className={`${categoryColors[v.category]} text-xs`}>{v.category}</Badge>
                    <Badge variant="outline" className="text-xs">{v.age}</Badge>
                    <span className="text-xs text-slate-500">{v.route}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{v.disease}</p>
                  {!givenVaccines[v.id] && <p className="text-xs text-blue-700 mt-0.5 italic">{v.notes}</p>}
                </div>
                {givenVaccines[v.id] && <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />}
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t flex items-center justify-between text-sm">
            <span className="text-slate-600">{Object.values(givenVaccines).filter(Boolean).length} / {IAP_SCHEDULE.length} completed</span>
            <Button size="sm" variant="outline" onClick={() => { setGivenVaccines({}); localStorage.removeItem(STORAGE_KEY); toast.info("Record cleared"); }}>
              Clear Record
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Special Vaccines */}
      <Card className="bg-white shadow-lg">
        <CardHeader className="bg-amber-50 border-b border-amber-200">
          <CardTitle className="text-base flex items-center gap-2 text-amber-900">
            <Info className="w-5 h-5" />Special Vaccines (Situational)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-2">
          {SPECIAL_VACCINES.map((v, i) => (
            <div key={i} className="p-2 bg-amber-50 rounded border border-amber-200 text-sm">
              <span className="font-semibold text-amber-900">{v.name}:</span>{" "}
              <span className="text-amber-800">{v.note}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Nephrology Special */}
      <Card className="bg-red-50 border-red-200 shadow-lg">
        <CardHeader className="border-b border-red-200">
          <CardTitle className="text-base text-red-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />Nephrology Special Considerations (IAP/IPNA)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-2">
          {NEPHROLOGY_SPECIAL.map((note, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-red-800 bg-red-100 p-2 rounded">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{note}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}