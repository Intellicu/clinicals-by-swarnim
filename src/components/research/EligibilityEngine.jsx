import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Users, Search, CheckCircle2, XCircle, AlertTriangle, 
  Plus, Trash2, UserCheck, Loader2, ChevronRight
} from "lucide-react";
import { toast } from "sonner";

const NEPHROLOGY_TEMPLATES = [
  {
    name: "CKD Stage 3-5 + Anemia",
    criteria: {
      inclusion: ["Age 1-18 years", "CKD Stage 3-5 (eGFR < 60 mL/min/1.73m²)", "Hemoglobin < 11 g/dL"],
      exclusion: ["Active malignancy", "Acute on chronic kidney disease", "Erythropoietin use in last 3 months"]
    }
  },
  {
    name: "SRNS on Tacrolimus",
    criteria: {
      inclusion: ["Age 1-18 years", "Steroid-resistant nephrotic syndrome confirmed", "On tacrolimus therapy"],
      exclusion: ["Secondary nephrotic syndrome", "Renal biopsy showing FSGS > 50% sclerosis", "eGFR < 30"]
    }
  },
  {
    name: "AKI requiring Dialysis",
    criteria: {
      inclusion: ["Age 0-18 years", "AKI Stage 3 (KDIGO)", "Requiring RRT (HD/PD/CRRT)"],
      exclusion: ["Pre-existing CKD Stage 4-5", "Terminal illness", "No informed consent"]
    }
  },
  {
    name: "Hypertension in CKD",
    criteria: {
      inclusion: ["Age 1-18 years", "CKD any stage", "BP > 95th percentile for age/sex/height on 3 readings"],
      exclusion: ["White coat hypertension confirmed", "Secondary hypertension non-renal cause"]
    }
  }
];

function matchPatient(patient, criteria) {
  let score = 0;
  let total = criteria.inclusion.length;
  let matched = [];
  let missing = [];
  let exclusionFlags = [];

  // Check age
  const age = patient.age_years || patient.age || 0;
  if (criteria.inclusion.some(c => c.toLowerCase().includes("age"))) {
    if (age >= 1 && age <= 18) { score++; matched.push("Age in range"); }
    else { missing.push("Age out of criteria range"); }
  }

  // Check diagnosis keywords
  const diag = (patient.diagnosis || "").toLowerCase();
  if (criteria.inclusion.some(c => c.toLowerCase().includes("ckd")) && diag.includes("ckd")) {
    score++; matched.push("CKD diagnosis present");
  }
  if (criteria.inclusion.some(c => c.toLowerCase().includes("nephrotic")) && diag.includes("nephrotic")) {
    score++; matched.push("Nephrotic syndrome diagnosis");
  }
  if (criteria.inclusion.some(c => c.toLowerCase().includes("aki")) && diag.includes("aki")) {
    score++; matched.push("AKI diagnosis present");
  }
  if (criteria.inclusion.some(c => c.toLowerCase().includes("hypertension")) && (diag.includes("htn") || diag.includes("hypertension"))) {
    score++; matched.push("Hypertension noted");
  }

  // Check exclusions
  if (criteria.exclusion.some(c => c.toLowerCase().includes("malignancy")) && diag.includes("malignancy")) {
    exclusionFlags.push("Active malignancy noted in diagnosis");
  }

  const confidence = Math.min(100, Math.round((score / total) * 100));
  return { confidence, matched, missing, exclusionFlags };
}

export default function EligibilityEngine({ project, onEnroll }) {
  const [criteria, setCriteria] = useState({
    inclusion: project?.eligibility?.inclusion?.filter(Boolean) || [""],
    exclusion: project?.eligibility?.exclusion?.filter(Boolean) || [""]
  });
  const [matchResults, setMatchResults] = useState([]);
  const [matching, setMatching] = useState(false);
  const [enrollConfirm, setEnrollConfirm] = useState(null);

  const { data: patients = [] } = useQuery({
    queryKey: ["all-patients-eligibility"],
    queryFn: () => base44.entities.Patient.list("-created_date", 100)
  });

  const runMatching = () => {
    setMatching(true);
    setTimeout(() => {
      const results = patients
        .map(p => ({
          patient: p,
          ...matchPatient(p, criteria)
        }))
        .filter(r => r.confidence >= 20)
        .sort((a, b) => b.confidence - a.confidence);
      setMatchResults(results);
      setMatching(false);
      toast.success(`Found ${results.length} potentially eligible patients`);
    }, 800);
  };

  const confirmEnroll = async (patientId) => {
    if (!project?.id) { toast.error("No project selected"); return; }
    const current = project.included_patients || [];
    if (current.includes(patientId)) { toast.info("Already enrolled"); return; }
    await base44.entities.ResearchProject.update(project.id, {
      included_patients: [...current, patientId],
      total_enrolled: (project.total_enrolled || 0) + 1
    });
    toast.success("Patient enrolled after verification!");
    setEnrollConfirm(null);
    if (onEnroll) onEnroll();
  };

  const loadTemplate = (tpl) => {
    setCriteria({ inclusion: [...tpl.criteria.inclusion], exclusion: [...tpl.criteria.exclusion] });
  };

  return (
    <div className="space-y-4">
      {/* Templates */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-indigo-700">Pediatric Nephrology Eligibility Templates</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {NEPHROLOGY_TEMPLATES.map(t => (
            <Button key={t.name} variant="outline" size="sm" className="text-xs border-indigo-200 hover:bg-indigo-50"
              onClick={() => loadTemplate(t)}>
              {t.name}
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Criteria Builder */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-green-700 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Inclusion Criteria
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {criteria.inclusion.map((c, i) => (
              <div key={i} className="flex gap-2">
                <Input value={c} onChange={e => {
                  const arr = [...criteria.inclusion]; arr[i] = e.target.value; setCriteria(prev => ({ ...prev, inclusion: arr }));
                }} placeholder={`Inclusion ${i + 1}`} className="text-sm" />
                <Button size="icon" variant="ghost" onClick={() => setCriteria(prev => ({ ...prev, inclusion: prev.inclusion.filter((_, j) => j !== i) }))}>
                  <Trash2 className="w-3 h-3 text-red-400" />
                </Button>
              </div>
            ))}
            <Button size="sm" variant="outline" className="gap-1 w-full" onClick={() => setCriteria(prev => ({ ...prev, inclusion: [...prev.inclusion, ""] }))}>
              <Plus className="w-3 h-3" />Add Criterion
            </Button>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-red-700 flex items-center gap-1">
              <XCircle className="w-4 h-4" /> Exclusion Criteria
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {criteria.exclusion.map((c, i) => (
              <div key={i} className="flex gap-2">
                <Input value={c} onChange={e => {
                  const arr = [...criteria.exclusion]; arr[i] = e.target.value; setCriteria(prev => ({ ...prev, exclusion: arr }));
                }} placeholder={`Exclusion ${i + 1}`} className="text-sm" />
                <Button size="icon" variant="ghost" onClick={() => setCriteria(prev => ({ ...prev, exclusion: prev.exclusion.filter((_, j) => j !== i) }))}>
                  <Trash2 className="w-3 h-3 text-red-400" />
                </Button>
              </div>
            ))}
            <Button size="sm" variant="outline" className="gap-1 w-full" onClick={() => setCriteria(prev => ({ ...prev, exclusion: [...prev.exclusion, ""] }))}>
              <Plus className="w-3 h-3" />Add Criterion
            </Button>
          </CardContent>
        </Card>
      </div>

      <Button onClick={runMatching} disabled={matching || patients.length === 0} className="bg-indigo-600 hover:bg-indigo-700 w-full gap-2">
        {matching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        {matching ? "Scanning Patient Database..." : `Search ${patients.length} Patients for Eligible Matches`}
      </Button>

      {/* Results */}
      {matchResults.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-700">Match Results ({matchResults.length} found)</h3>
            <Badge className="bg-indigo-100 text-indigo-700">{matchResults.filter(r => r.confidence >= 70).length} high confidence</Badge>
          </div>
          {matchResults.map(({ patient, confidence, matched, missing, exclusionFlags }) => (
            <Card key={patient.id} className={`border-2 ${confidence >= 70 ? "border-green-300" : confidence >= 40 ? "border-yellow-300" : "border-slate-200"}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="font-semibold text-slate-900">{patient.patient_name || patient.name}</span>
                      <Badge variant="outline" className="text-xs">{patient.age_years || patient.age}y</Badge>
                      <Badge variant="outline" className="text-xs">{patient.gender}</Badge>
                      {patient.cr_number && <Badge variant="outline" className="text-xs">CR: {patient.cr_number}</Badge>}
                      {exclusionFlags.length > 0 && <Badge className="bg-red-100 text-red-700 text-xs">⚠ Exclusion Flag</Badge>}
                    </div>
                    <p className="text-xs text-slate-500 mb-2">{patient.diagnosis}</p>

                    <div className="flex items-center gap-2 mb-2">
                      <Progress value={confidence} className="flex-1 h-2" />
                      <span className={`text-xs font-bold w-10 ${confidence >= 70 ? "text-green-600" : confidence >= 40 ? "text-yellow-600" : "text-slate-400"}`}>{confidence}%</span>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      {matched.map((m, i) => <Badge key={i} className="bg-green-100 text-green-700 text-xs">{m}</Badge>)}
                      {missing.map((m, i) => <Badge key={i} className="bg-orange-100 text-orange-700 text-xs">Missing: {m}</Badge>)}
                      {exclusionFlags.map((f, i) => <Badge key={i} className="bg-red-100 text-red-700 text-xs">⚠ {f}</Badge>)}
                    </div>
                  </div>

                  <div className="shrink-0">
                    {exclusionFlags.length === 0 ? (
                      enrollConfirm === patient.id ? (
                        <div className="text-right space-y-1">
                          <p className="text-xs text-slate-500 mb-1">Confirm enrollment?</p>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 gap-1 text-xs" onClick={() => confirmEnroll(patient.id)}>
                            <UserCheck className="w-3 h-3" />Enroll
                          </Button>
                          <Button size="sm" variant="ghost" className="text-xs" onClick={() => setEnrollConfirm(null)}>Cancel</Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => setEnrollConfirm(patient.id)}>
                          <ChevronRight className="w-3 h-3" />Enroll
                        </Button>
                      )
                    ) : (
                      <Badge className="bg-red-100 text-red-700 text-xs">Excluded</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {patients.length === 0 && (
        <Alert>
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription className="text-sm">No patients in the database yet. Add patients via Clinic Mode to enable eligibility matching.</AlertDescription>
        </Alert>
      )}
    </div>
  );
}