import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Syringe, CheckCircle2, AlertTriangle, Clock, Info, Calendar } from "lucide-react";
import { toast } from "sonner";

// IAP 2023 Recommended Schedule
const IAP_SCHEDULE = [
  { age: "Birth", vaccines: ["BCG", "OPV-0", "Hep B-1"], type: "mandatory", notes: "Give within 24 hours of birth" },
  { age: "6 weeks", vaccines: ["DTwP/DTaP-1", "IPV-1", "Hib-1", "Hep B-2", "Rotavirus-1", "PCV-1"], type: "mandatory", notes: "Minimum 6 weeks of age" },
  { age: "10 weeks", vaccines: ["DTwP/DTaP-2", "IPV-2", "Hib-2", "Rotavirus-2", "PCV-2"], type: "mandatory", notes: "" },
  { age: "14 weeks", vaccines: ["DTwP/DTaP-3", "IPV-3", "Hib-3", "Rotavirus-3 (if 3-dose)", "PCV-3"], type: "mandatory", notes: "" },
  { age: "6 months", vaccines: ["OPV-1", "Hep B-3", "Influenza (first dose)"], type: "recommended", notes: "Influenza annually thereafter" },
  { age: "9 months", vaccines: ["OPV-2", "MMR-1 (if measles control)"], type: "mandatory", notes: "Measles in UIP if MMR not available" },
  { age: "12 months", vaccines: ["PCV Booster", "Hepatitis A-1", "Varicella-1"], type: "recommended", notes: "IAP 2023 recommendation" },
  { age: "15 months", vaccines: ["MMR-2", "Varicella-2", "DTwP/DTaP Booster-1", "IPV Booster", "Hib Booster"], type: "mandatory", notes: "" },
  { age: "18 months", vaccines: ["Hepatitis A-2"], type: "recommended", notes: "2nd dose 6 months after 1st" },
  { age: "2 years", vaccines: ["Typhoid (Conjugate)", "Meningococcal (if risk)"], type: "recommended", notes: "Typhoid conjugate preferred over polysaccharide" },
  { age: "4–6 years", vaccines: ["DTwP/DTaP Booster-2", "OPV Booster", "MMR (if missed)"], type: "mandatory", notes: "Pre-school booster" },
  { age: "9–12 years", vaccines: ["HPV (girls: 2 doses 6 months apart)", "Tdap Booster", "HPV (boys: per IAP 2023)"], type: "recommended", notes: "IAP 2023 recommends HPV for both sexes" },
  { age: "10–12 years", vaccines: ["Typhoid Booster", "Hepatitis A (if not given)"], type: "recommended", notes: "Booster if primary series complete" },
];

const SPECIAL_VACCINES = [
  { condition: "CKD / Immunocompromised", vaccines: ["Pneumococcal (PCV + PPSV23)", "Influenza (annual)", "Hepatitis B (check titres post-vaccination)", "Varicella (if not immune, before significant immunosuppression)", "MMR (if not significantly immunosuppressed)"], notes: "Avoid live vaccines in severe immunosuppression" },
  { condition: "Nephrotic Syndrome", vaccines: ["Pneumococcal (PCV13 + PPSV23 at age ≥2y)", "Influenza (annual, whole-year)", "Hepatitis B (check anti-HBs titre)", "Varicella (when in remission, not on high steroids)", "MMR (in remission, prednisolone <2 mg/kg/day)"], notes: "Timing critical — preferably in remission on low-dose steroids" },
  { condition: "Post-Transplant", vaccines: ["Influenza (annual, inactivated only)", "Pneumococcal (PPSV23 after transplant)", "Hepatitis B (booster if anti-HBs <10 IU/L)", "No live vaccines post-transplant"], notes: "No live vaccines after transplant. Vaccinate family members" },
  { condition: "Prematurity (<32 weeks)", vaccines: ["All routine vaccines at chronological age (not corrected)", "RSV prophylaxis (Palivizumab) if <29 weeks or CLD/CHD", "Hepatitis B: if <2 kg, delay to 1 month"], notes: "Do not adjust for corrected age for immunization" },
];

const CATCHUP_PRINCIPLES = [
  "Never restart a vaccine series from scratch — count previous valid doses",
  "Minimum intervals must be observed between doses",
  "Multiple vaccines can be given at the same visit (different sites)",
  "Live vaccines (MMR, Varicella): either same day or 4 weeks apart",
  "Inactivated vaccines: can be given any time relative to other vaccines",
  "DTwP: maximum 5 doses total (3 primary + 2 boosters)",
  "Tdap replaces 1 dose of DT for adolescents in catch-up",
];

// Calculate age in months from date of birth
function calcAgeMonths(dobStr) {
  const dob = new Date(dobStr);
  const now = new Date();
  const months = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());
  return months;
}

function getAgeLabel(months) {
  if (months < 1) return `${Math.round(months * 4)} weeks`;
  if (months < 24) return `${months} months`;
  return `${Math.floor(months / 12)} years ${months % 12} months`;
}

function getDueVaccines(ageMonths) {
  const due = [];
  const upcoming = [];
  
  const scheduleByAge = [
    { ageMin: 0, ageMax: 1, vaccines: IAP_SCHEDULE[0].vaccines, label: "Birth" },
    { ageMin: 1, ageMax: 2, vaccines: IAP_SCHEDULE[1].vaccines, label: "6 weeks" },
    { ageMin: 2, ageMax: 3, vaccines: IAP_SCHEDULE[2].vaccines, label: "10 weeks" },
    { ageMin: 3, ageMax: 4, vaccines: IAP_SCHEDULE[3].vaccines, label: "14 weeks" },
    { ageMin: 5, ageMax: 7, vaccines: IAP_SCHEDULE[4].vaccines, label: "6 months" },
    { ageMin: 8, ageMax: 10, vaccines: IAP_SCHEDULE[5].vaccines, label: "9 months" },
    { ageMin: 11, ageMax: 13, vaccines: IAP_SCHEDULE[6].vaccines, label: "12 months" },
    { ageMin: 14, ageMax: 16, vaccines: IAP_SCHEDULE[7].vaccines, label: "15 months" },
    { ageMin: 17, ageMax: 20, vaccines: IAP_SCHEDULE[8].vaccines, label: "18 months" },
    { ageMin: 23, ageMax: 25, vaccines: IAP_SCHEDULE[9].vaccines, label: "2 years" },
    { ageMin: 47, ageMax: 73, vaccines: IAP_SCHEDULE[10].vaccines, label: "4–6 years" },
    { ageMin: 107, ageMax: 145, vaccines: IAP_SCHEDULE[11].vaccines, label: "9–12 years" },
  ];
  
  for (const slot of scheduleByAge) {
    if (ageMonths >= slot.ageMin && ageMonths <= slot.ageMax) {
      due.push(slot);
    } else if (ageMonths < slot.ageMin && slot.ageMin - ageMonths <= 2) {
      upcoming.push({ ...slot, monthsAway: slot.ageMin - ageMonths });
    }
  }
  return { due, upcoming };
}

export default function VaccinationPathway() {
  const [dob, setDob] = useState("");
  const [ageMonths, setAgeMonths] = useState(null);
  const [activeSpecial, setActiveSpecial] = useState(null);

  const calcAge = () => {
    if (!dob) { toast.error("Enter date of birth"); return; }
    const months = calcAgeMonths(dob);
    if (months < 0 || months > 216) { toast.error("Invalid date of birth"); return; }
    setAgeMonths(months);
  };

  const { due, upcoming } = ageMonths !== null ? getDueVaccines(ageMonths) : { due: [], upcoming: [] };

  return (
    <div className="space-y-6">
      <Alert className="bg-green-50 border-green-200">
        <Syringe className="w-5 h-5 text-green-600" />
        <AlertDescription className="text-green-800">
          <strong>IAP 2023 Immunization Schedule:</strong> Updated recommendations including HPV for boys, typhoid conjugate preference, and expanded special population guidelines.
        </AlertDescription>
      </Alert>

      {/* Age-based Lookup */}
      <Card className="bg-white shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 border-b">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-600" />Vaccination Due Checker
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Label className="text-xs font-semibold">Date of Birth</Label>
              <Input type="date" value={dob} onChange={e => setDob(e.target.value)} className="mt-1" max={new Date().toISOString().split("T")[0]} />
            </div>
            <Button onClick={calcAge} className="bg-green-600 hover:bg-green-700">Check Vaccines</Button>
          </div>

          {ageMonths !== null && (
            <div className="mt-4 space-y-3">
              <div className="bg-slate-50 p-3 rounded border text-sm">
                <strong>Age:</strong> {getAgeLabel(ageMonths)}
              </div>
              {due.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2 text-green-800">
                    <CheckCircle2 className="w-4 h-4" />Due Now ({due[0]?.label}):
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {due.flatMap(d => d.vaccines).map((v, i) => (
                      <Badge key={i} className="bg-green-600 text-white">{v}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {upcoming.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2 text-blue-800">
                    <Clock className="w-4 h-4" />Upcoming ({upcoming[0]?.label}, {upcoming[0]?.monthsAway} months away):
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {upcoming.flatMap(u => u.vaccines).map((v, i) => (
                      <Badge key={i} variant="outline" className="border-blue-400 text-blue-700">{v}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {due.length === 0 && upcoming.length === 0 && (
                <Alert className="bg-blue-50 border-blue-200">
                  <Info className="w-4 h-4 text-blue-600" />
                  <AlertDescription className="text-sm text-blue-800">No specific vaccines due in this window. Refer to full schedule below.</AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Full Schedule */}
      <Card className="bg-white shadow-lg">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-base">IAP 2023 Complete Vaccination Schedule</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            {IAP_SCHEDULE.map((row, i) => (
              <div key={i} className={`p-3 rounded-lg border ${row.type === "mandatory" ? "bg-green-50 border-green-200" : "bg-blue-50 border-blue-200"}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm">{row.age}</span>
                      <Badge className={row.type === "mandatory" ? "bg-green-600 text-white text-xs" : "bg-blue-500 text-white text-xs"}>
                        {row.type === "mandatory" ? "Mandatory" : "Recommended"}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {row.vaccines.map((v, vi) => (
                        <Badge key={vi} variant="outline" className="text-xs">{v}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
                {row.notes && <p className="text-xs text-slate-600 mt-1 italic">{row.notes}</p>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Special Populations */}
      <Card className="bg-white shadow-lg">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />Special Population Vaccines (IAP / ISPN)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {SPECIAL_VACCINES.map((sp, i) => (
            <div key={i} className="border rounded-lg overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 text-left"
                onClick={() => setActiveSpecial(activeSpecial === i ? null : i)}
              >
                <span className="font-semibold text-sm">{sp.condition}</span>
                <Badge variant="outline" className="text-xs">{sp.vaccines.length} vaccines</Badge>
              </button>
              {activeSpecial === i && (
                <div className="p-3 space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    {sp.vaccines.map((v, vi) => (
                      <Badge key={vi} className="bg-amber-600 text-white text-xs">{v}</Badge>
                    ))}
                  </div>
                  <Alert className="bg-amber-50 border-amber-200">
                    <Info className="w-3 h-3 text-amber-600" />
                    <AlertDescription className="text-xs text-amber-800">{sp.notes}</AlertDescription>
                  </Alert>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Catch-up */}
      <Card className="bg-white shadow-lg">
        <CardHeader className="bg-blue-50 border-b">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />Catch-up Immunization Principles
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <ul className="space-y-2">
            {CATCHUP_PRINCIPLES.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">{p}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}