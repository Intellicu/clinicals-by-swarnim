import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, AlertTriangle, Info, CheckCircle, Shield } from "lucide-react";

export default function DialysisCatheterInfectionPathway() {
  const [catheterType, setCatheterType] = useState("");
  const [hasFever, setHasFever] = useState(false);
  const [hasExitSiteInfection, setHasExitSiteInfection] = useState(false);
  const [hasTunnelInfection, setHasTunnelInfection] = useState(false);
  const [hasHemodynamicInstability, setHasHemodynamicInstability] = useState(false);
  const [protocol, setProtocol] = useState(null);

  const generateProtocol = () => {
    let treatment;

    if (catheterType === "HD" || catheterType === "CRRT") {
      if (hasFever && !hasExitSiteInfection && !hasTunnelInfection) {
        treatment = {
          diagnosis: "Central Line-Associated Bloodstream Infection (CLABSI)",
          severity: hasHemodynamicInstability ? "Septic Shock" : "Bacteremia",
          immediate: [
            "Draw blood cultures × 2 (one from catheter, one peripheral if possible)",
            "Start empiric IV antibiotics STAT (within 1 hour)",
            "Obtain CBC, CRP, PCT",
            "Hemodynamic support if shock"
          ],
          antibiotics: [
            {
              title: "Empiric Antibiotic Coverage",
              regimen: [
                "Vancomycin 15 mg/kg IV q12h (if TDM available, target trough 15-20 mcg/mL)",
                "PLUS Ceftazidime 50 mg/kg IV q8h OR Meropenem 20 mg/kg IV q8h",
                "Covers: MRSA, Pseudomonas, Gram-negatives",
                "Dose adjustment for residual renal function",
                "Vancomycin can be given in HD catheter during session (post-HD dosing)"
              ]
            },
            {
              title: "Antibiotic Lock Therapy (If Catheter Salvage Attempted)",
              regimen: [
                "Vancomycin 5 mg/mL in heparin 1000 U/mL",
                "Instill into each catheter lumen (fill volume ~2 mL per lumen)",
                "Dwell between HD sessions (48-72 hours)",
                "Duration: 2 weeks along with systemic antibiotics"
              ]
            }
          ],
          catheterManagement: [
            {
              title: "Indications for IMMEDIATE Catheter Removal",
              criteria: [
                "Septic shock / Hemodynamic instability",
                "Tunnel infection (erythema, induration along subcutaneous tract)",
                "Fungemia (any yeast in blood cultures)",
                "Staph aureus bacteremia (high relapse rate with salvage)",
                "Persistent fever/bacteremia despite 72h appropriate antibiotics",
                "Metastatic infection (endocarditis, osteomyelitis, abscess)"
              ]
            },
            {
              title: "Catheter Salvage Possible If",
              criteria: [
                "Coagulase-negative Staph (most common - usually salvageable)",
                "Hemodynamically stable",
                "No tunnel infection",
                "Quick clinical response to antibiotics + lock therapy"
              ]
            }
          ],
          durationOfTreatment: [
            "Uncomplicated (CoNS, salvaged catheter): 2 weeks IV antibiotics + lock",
            "Staph aureus (if catheter removed): 4 weeks IV antibiotics",
            "Gram-negative (catheter removed): 2-3 weeks IV antibiotics",
            "Candida/fungal: Remove catheter + 2-4 weeks antifungal (fluconazole or echinocandin)"
          ],
          monitoring: "Blood cultures daily until negative. Repeat at end of treatment. Monitor for metastatic infection (echo if Staph aureus)."
        };
      } else if (hasExitSiteInfection && !hasTunnelInfection) {
        treatment = {
          diagnosis: "HD Catheter Exit-Site Infection",
          severity: "Localized Infection",
          treatment: [
            {
              title: "Local Care + Oral Antibiotics",
              regimen: [
                "Culture exit site drainage (swab)",
                "Cleanse with chlorhexidine or betadine daily",
                "Topical mupirocin ointment BID to exit site",
                "Oral antibiotics:",
                "→ Cephalexin 50 mg/kg/day divided TID × 2 weeks",
                "→ If MRSA suspected: Clindamycin 10-13 mg/kg/dose TID OR TMP-SMX",
                "→ If Pseudomonas: Ciprofloxacin 15-20 mg/kg/day divided BID"
              ]
            }
          ],
          escalation: "If worsening or developing tunnel infection → IV antibiotics + consider catheter removal"
        };
      } else if (hasTunnelInfection) {
        treatment = {
          diagnosis: "HD Catheter Tunnel Infection",
          severity: "Severe - Catheter Removal Required",
          management: [
            "Blood cultures",
            "Start IV antibiotics (vancomycin + ceftazidime as above)",
            "REMOVE catheter urgently",
            "Complete 2-3 weeks IV antibiotics after catheter removal",
            "Place temporary HD catheter in different site if ongoing HD needed",
            "Can place new tunneled catheter after infection cleared (usually 2-4 weeks)"
          ]
        };
      }
    } else if (catheterType === "PD") {
      if (hasFever || hasExitSiteInfection) {
        treatment = {
          diagnosis: hasExitSiteInfection && !hasFever ? "PD Catheter Exit-Site Infection" : "Possible Peritonitis",
          immediate: [
            "Send PD effluent: Cell count, Gram stain, culture (if cloudy or symptomatic)",
            "Blood cultures if fever",
            "Assess exit site and tunnel carefully"
          ],
          peritonitis: {
            title: "If Peritonitis (Cloudy Effluent, Abdominal Pain, Fever)",
            treatment: [
              "Start IP antibiotics immediately AFTER obtaining effluent sample",
              "Cefazolin (Gram-positive): 20 mg/kg IP load, then 15 mg/kg in each exchange",
              "Ceftazidime (Gram-negative): 20 mg/kg IP load, then 15 mg/kg in each exchange",
              "Add heparin 500 U/L to each bag",
              "Dwell at least 6 hours for antibiotic absorption",
              "Continue PD (do NOT stop unless severe symptoms)"
            ],
            modification: "Tailor antibiotics based on culture results at 48-72h. If Staph aureus → add rifampin PO. If fungal → remove catheter + systemic antifungal.",
            duration: "2-3 weeks IP antibiotics. Repeat cell count day 3 - should show improvement."
          },
          exitSite: {
            title: "If Isolated Exit-Site Infection",
            treatment: [
              "Culture exit site",
              "Topical mupirocin BID",
              "Oral antibiotics × 2 weeks (Cephalexin or Ciprofloxacin)",
              "Daily exit site care with antibacterial soap",
              "If tunnel infection (erythema, induration >2cm from exit) → catheter removal required"
            ]
          },
          catheterRemoval: [
            "Indications for PD catheter removal:",
            "• Refractory peritonitis (no improvement by day 5)",
            "• Relapsing peritonitis (same organism <4 weeks)",
            "• Fungal peritonitis",
            "• Tunnel infection",
            "• Mycobacterial peritonitis"
          ]
        };
      }
    }

    setProtocol(treatment);
  };

  return (
    <div className="space-y-6">
      <Alert className="bg-red-50 border-red-200 border-2">
        <Shield className="w-5 h-5 text-red-600" />
        <AlertDescription className="text-red-900">
          <strong>Dialysis Catheter-Related Infections:</strong> Major cause of morbidity and hospitalization. HD catheter CLABSI requires urgent evaluation for catheter removal vs salvage. PD peritonitis managed with intraperitoneal antibiotics while continuing PD.
        </AlertDescription>
      </Alert>

      {!protocol ? (
        <Card>
          <CardHeader className="bg-blue-50 border-b">
            <CardTitle>Infection Assessment</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <Label>Catheter Type *</Label>
              <Select value={catheterType} onValueChange={setCatheterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select catheter type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HD">Hemodialysis Catheter (Tunneled or Temporary)</SelectItem>
                  <SelectItem value="PD">Peritoneal Dialysis Catheter (Tenckhoff)</SelectItem>
                  <SelectItem value="CRRT">CRRT Catheter</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card className="bg-red-50 border-red-200">
              <CardHeader>
                <CardTitle className="text-base">Clinical Presentation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox checked={hasFever} onCheckedChange={setHasFever} id="fever" />
                  <Label htmlFor="fever" className="cursor-pointer">Fever / Chills</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox checked={hasExitSiteInfection} onCheckedChange={setHasExitSiteInfection} id="exit" />
                  <Label htmlFor="exit" className="cursor-pointer">Exit-site erythema / Discharge</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox checked={hasTunnelInfection} onCheckedChange={setHasTunnelInfection} id="tunnel" />
                  <Label htmlFor="tunnel" className="cursor-pointer">Tunnel infection (erythema, induration along tract)</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox checked={hasHemodynamicInstability} onCheckedChange={setHasHemodynamicInstability} id="shock" />
                  <Label htmlFor="shock" className="cursor-pointer">Septic shock / Hemodynamic instability</Label>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={generateProtocol}
              disabled={!catheterType}
              className="w-full bg-red-600 hover:bg-red-700 py-6 text-lg"
            >
              <Activity className="w-5 h-5 mr-2" />
              Generate Management Protocol
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="border-2 border-red-400 bg-red-50">
            <CardHeader>
              <CardTitle className="text-2xl">{protocol.diagnosis}</CardTitle>
              {protocol.severity && (
                <Badge className="bg-red-600 text-white mt-2 text-base px-3 py-1">
                  {protocol.severity}
                </Badge>
              )}
            </CardHeader>
          </Card>

          {protocol.immediate && (
            <Card className="border-2 border-red-400 shadow-xl">
              <CardHeader className="bg-red-100 border-b-2">
                <CardTitle className="text-lg text-red-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Immediate Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-2">
                {protocol.immediate.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-white p-3 rounded border-2">
                    <span className="w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">
                      {idx + 1}
                    </span>
                    <p className="text-sm text-slate-900 font-medium">{item}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {protocol.antibiotics && protocol.antibiotics.map((section, idx) => (
            <Card key={idx} className="border-2 border-purple-300">
              <CardHeader className="bg-purple-100 border-b">
                <CardTitle className="text-base text-purple-900">{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                {section.regimen.map((step, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-800">{step}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

          {protocol.catheterManagement && protocol.catheterManagement.map((section, idx) => (
            <Card key={idx} className="border-2 border-amber-300">
              <CardHeader className="bg-amber-100 border-b">
                <CardTitle className="text-base text-amber-900">{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ul className="space-y-1">
                  {section.criteria.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-amber-600 font-bold">•</span>
                      <span className="text-amber-900">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}

          {protocol.peritonitis && (
            <Card className="border-2 border-blue-400 shadow-xl">
              <CardHeader className="bg-blue-100 border-b-2">
                <CardTitle className="text-lg text-blue-900">{protocol.peritonitis.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  {protocol.peritonitis.treatment.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2 bg-white p-3 rounded border-2 border-blue-200">
                      <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">
                        {idx + 1}
                      </span>
                      <p className="text-sm text-slate-900">{step}</p>
                    </div>
                  ))}
                </div>
                
                <div className="bg-amber-50 p-3 rounded border border-amber-200">
                  <p className="text-sm text-amber-900"><strong>Culture-directed therapy:</strong> {protocol.peritonitis.modification}</p>
                </div>

                <div className="bg-green-50 p-3 rounded border border-green-200">
                  <p className="text-sm text-green-900"><strong>Duration:</strong> {protocol.peritonitis.duration}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {protocol.exitSite && (
            <Card className="border-2 border-green-300">
              <CardHeader className="bg-green-100 border-b">
                <CardTitle className="text-base text-green-900">{protocol.exitSite.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                {protocol.exitSite.treatment.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-green-900">{step}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {protocol.treatment && protocol.treatment.map((section, idx) => (
            <Card key={idx} className="border-2 border-green-300">
              <CardHeader className="bg-green-100 border-b">
                <CardTitle className="text-base text-green-900">{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                {section.regimen.map((step, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-green-900">{step}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

          {protocol.catheterRemoval && (
            <Alert className="bg-red-50 border-red-300 border-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <AlertDescription className="text-red-900">
                <strong>{protocol.catheterRemoval[0]}</strong>
                <ul className="mt-2 space-y-1">
                  {protocol.catheterRemoval.slice(1).map((item, idx) => (
                    <li key={idx} className="text-sm">{item}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {protocol.durationOfTreatment && (
            <Card className="bg-purple-50 border-purple-200">
              <CardHeader>
                <CardTitle className="text-base">Duration of Antibiotic Treatment</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {protocol.durationOfTreatment.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-purple-600">•</span>
                      <span className="text-purple-900">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {protocol.monitoring && (
            <Card className="bg-cyan-50 border-cyan-200">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-cyan-900">{protocol.monitoring}</p>
              </CardContent>
            </Card>
          )}

          {protocol.escalation && (
            <Alert className="bg-amber-50 border-amber-200">
              <Info className="w-4 h-4 text-amber-600" />
              <AlertDescription className="text-amber-900">
                <strong>Escalation:</strong> {protocol.escalation}
              </AlertDescription>
            </Alert>
          )}

          <Button onClick={() => setProtocol(null)} variant="outline" className="w-full">
            Re-assess
          </Button>
        </div>
      )}

      <Card className="bg-slate-50">
        <CardHeader>
          <CardTitle className="text-lg">Prevention of Catheter Infections</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span><strong>HD Catheters:</strong> Strict aseptic technique during access. Chlorhexidine dressing changes. Antibiotic lock prophylaxis in high-risk patients. Mupirocin nasal ointment if MRSA carrier.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span><strong>PD Catheters:</strong> Daily exit-site care with antibacterial soap or chlorhexidine. Keep exit site dry. Topical mupirocin or gentamicin prophylaxis. Avoid trauma to catheter.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span><strong>Early warning signs:</strong> Exit-site redness, discharge, pain, fever, cloudy PD effluent. Report immediately.</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}