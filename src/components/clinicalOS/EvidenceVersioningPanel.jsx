import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { History, AlertTriangle, CheckCircle, Clock, ChevronDown, ChevronUp } from "lucide-react";

const VERSION_TIMELINE = [
  {
    org: "ISPN",
    area: "Nephrotic Syndrome",
    versions: [
      {
        version: "2023",
        year: 2023,
        status: "CURRENT",
        key_changes: [
          "Rituximab upgraded to first-line for frequently relapsing/steroid-dependent NS",
          "Voclosporin added as option for SRNS",
          "Genetic testing recommended in all SRNS before immunosuppression",
          "Mycophenolate recommended for SDNS as steroid-sparing",
        ],
        affected_pathways: ["FRNS management", "SRNS workup", "Genetic testing protocol"],
        doi: "https://doi.org/10.1038/s41581-023-00706-x"
      },
      {
        version: "2012",
        year: 2012,
        status: "SUPERSEDED",
        key_changes: [
          "Cyclophosphamide as first-line for SDNS/FRNS",
          "Tacrolimus for SRNS after prednisolone failure",
          "Levamisole included as steroid-sparing option",
        ],
        affected_pathways: ["FRNS management", "SRNS workup"],
        doi: null
      }
    ]
  },
  {
    org: "KDIGO",
    area: "AKI",
    versions: [
      {
        version: "2024 Update",
        year: 2024,
        status: "CURRENT",
        key_changes: [
          "Biomarkers (NGAL, KIM-1) incorporated into AKI staging adjunct",
          "Urine output criteria refined for pediatric AKI",
          "Furosemide stress test endorsed for AKI subtyping",
          "CRRT dose recommendation updated to 20–25 mL/kg/hr (was 25–35)",
        ],
        affected_pathways: ["AKI staging", "RRT initiation", "Biomarker monitoring"],
        doi: "https://doi.org/10.1016/j.kint.2023.11.006"
      },
      {
        version: "2012",
        year: 2012,
        status: "PARTIALLY SUPERSEDED",
        key_changes: [
          "Original KDIGO AKI 3-stage classification",
          "Creatinine + urine output criteria introduced",
          "Recommended CRRT dose 25–35 mL/kg/hr",
        ],
        affected_pathways: ["AKI staging"],
        doi: "https://doi.org/10.1038/kisup.2012.1"
      }
    ]
  },
  {
    org: "AAP",
    area: "Hypertension",
    versions: [
      {
        version: "2017",
        year: 2017,
        status: "CURRENT",
        key_changes: [
          "Eliminated 'prehypertension' — now 'Elevated BP'",
          "Stage 2 HTN threshold lowered (≥95th +12 mmHg)",
          "Simplified BP tables (2017 normative data)",
          "ACE-I / ARB as first-line for CKD with proteinuria confirmed",
          "ABPM recommended for white-coat and masked HTN",
        ],
        affected_pathways: ["BP classification", "HTN management", "CKD BP targets"],
        doi: "https://doi.org/10.1542/peds.2017-1904"
      },
      {
        version: "2004 (Fourth Report)",
        year: 2004,
        status: "SUPERSEDED",
        key_changes: [
          "Original pediatric BP classification: Normal, Prehypertension, Stage 1, Stage 2",
          "Different normative tables (older dataset)",
        ],
        affected_pathways: ["BP classification"],
        doi: null
      }
    ]
  },
  {
    org: "ISPD",
    area: "Peritoneal Dialysis",
    versions: [
      {
        version: "2022",
        year: 2022,
        status: "CURRENT",
        key_changes: [
          "Empirical IP antibiotics updated (Cefazolin + Ceftazidime first-line)",
          "Catheter survival protocols revised",
          "Fungal peritonitis: immediate catheter removal + antifungal (amphotericin)",
          "APD (automated PD) recommended over CAPD where available",
        ],
        affected_pathways: ["PD peritonitis protocol", "Catheter care", "PD prescription"],
        doi: "https://doi.org/10.1177/08968608221093073"
      },
      {
        version: "2016",
        year: 2016,
        status: "SUPERSEDED",
        key_changes: [
          "Vancomycin as initial empirical cover for Gram-positives",
          "Different catheter management protocols",
        ],
        affected_pathways: ["PD peritonitis protocol"],
        doi: null
      }
    ]
  },
  {
    org: "IPNA",
    area: "CKD",
    versions: [
      {
        version: "2021",
        year: 2021,
        status: "CURRENT",
        key_changes: [
          "CKiD Schwartz equation endorsed as reference GFR equation for children",
          "Anemia target Hb 10–12 g/dL (ESA therapy)",
          "CKD-MBD: active vitamin D for secondary hyperparathyroidism",
          "BP target <50th %ile reinforced (per ESCAPE trial)",
          "Acidosis correction target HCO₃⁻ ≥22 mmol/L",
        ],
        affected_pathways: ["CKD staging", "Anemia management", "CKD-MBD", "BP targets"],
        doi: "https://doi.org/10.1007/s00467-021-05185-3"
      }
    ]
  }
];

const STATUS_CONFIG = {
  "CURRENT": { color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle, iconColor: "text-green-600" },
  "SUPERSEDED": { color: "bg-red-100 text-red-800 border-red-200", icon: History, iconColor: "text-red-500" },
  "PARTIALLY SUPERSEDED": { color: "bg-amber-100 text-amber-800 border-amber-200", icon: AlertTriangle, iconColor: "text-amber-500" },
};

const PENDING_UPDATES = [
  { org: "KDIGO", area: "CKD", expected: "2024–2025", note: "CKD-MBD update including calcimimetics for pediatric patients" },
  { org: "ISPN", area: "Nephrotic Syndrome", expected: "2025", note: "Anticipated update on sparsentan and endothelin antagonists in FSGS/SRNS" },
  { org: "ISPD", area: "Hemodialysis", expected: "2024", note: "Updated Kt/V targets and access surveillance in pediatric HD" },
];

function VersionCard({ version }) {
  const [open, setOpen] = useState(version.status === "CURRENT");
  const cfg = STATUS_CONFIG[version.status] || STATUS_CONFIG["CURRENT"];
  const Icon = cfg.icon;

  return (
    <div className={`border rounded-xl overflow-hidden mb-2 ${version.status === "CURRENT" ? "border-green-200" : "border-slate-200"}`}>
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-2 p-2.5 text-left ${version.status === "CURRENT" ? "bg-green-50" : "bg-slate-50"}`}
      >
        <Icon className={`w-4 h-4 flex-shrink-0 ${cfg.iconColor}`} />
        <span className="font-bold text-sm text-slate-900 flex-1">{version.version}</span>
        <Badge className={`text-xs border ${cfg.color}`}>{version.status}</Badge>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className="p-3 space-y-2 bg-white">
          <div>
            <p className="text-xs font-bold text-slate-600 mb-1">Key Changes</p>
            <ul className="space-y-1">
              {version.key_changes.map((c, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-slate-700">
                  <CheckCircle className="w-3 h-3 text-blue-500 flex-shrink-0 mt-0.5" />{c}
                </li>
              ))}
            </ul>
          </div>
          {version.affected_pathways?.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-600 mb-1">Affected Pathways</p>
              <div className="flex flex-wrap gap-1">
                {version.affected_pathways.map((p, i) => (
                  <span key={i} className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded">{p}</span>
                ))}
              </div>
            </div>
          )}
          {version.doi && (
            <a href={version.doi} target="_blank" rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline block">→ Guideline source (DOI)</a>
          )}
        </div>
      )}
    </div>
  );
}

export default function EvidenceVersioningPanel() {
  const [activeOrg, setActiveOrg] = useState("ISPN");

  const orgs = [...new Set(VERSION_TIMELINE.map(v => v.org))];
  const activeTimeline = VERSION_TIMELINE.filter(v => v.org === activeOrg);

  return (
    <div className="space-y-4">
      {/* Org selector */}
      <div className="flex gap-1.5 flex-wrap">
        {orgs.map(org => (
          <button key={org} onClick={() => setActiveOrg(org)}
            className={`px-2.5 py-1 text-xs rounded-full font-semibold border transition-colors ${activeOrg === org ? "bg-orange-600 text-white border-orange-600" : "bg-white text-slate-600 border-slate-200 hover:border-orange-300"}`}>
            {org}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {activeTimeline.map(entry => (
        <div key={entry.area}>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">{entry.area}</p>
          {entry.versions.map(v => <VersionCard key={v.version} version={v} />)}
        </div>
      ))}

      {/* Pending updates */}
      <div className="border border-amber-200 rounded-xl overflow-hidden">
        <div className="bg-amber-50 px-3 py-2 border-b border-amber-200 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-600" />
          <p className="text-xs font-bold text-amber-800">Anticipated Guideline Updates</p>
        </div>
        <div className="divide-y divide-amber-100">
          {PENDING_UPDATES.map((p, i) => (
            <div key={i} className="p-2.5 bg-white">
              <div className="flex items-center gap-2 mb-0.5">
                <Badge className="text-xs bg-amber-100 text-amber-800 border-amber-200 border">{p.org} · {p.area}</Badge>
                <span className="text-xs text-slate-400">Expected {p.expected}</span>
              </div>
              <p className="text-xs text-slate-600">{p.note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}