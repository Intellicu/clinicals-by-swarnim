import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Network, MapPin, Info, ChevronDown, ChevronUp, Plus, Pencil, Trash2, Search, Check, X, RefreshCw } from "lucide-react";

// --- Default data (used as fallback if no DB records) ---
const DEFAULT_COE = [
  { name: "AIIMS New Delhi", city: "Delhi", specialty: "Nephrology, Genetics, Metabolic", level: "Tier 1" },
  { name: "AIIMS Patna", city: "Patna", specialty: "Multi-specialty Centre of Excellence", level: "Tier 1" },
  { name: "PGIMER Chandigarh", city: "Chandigarh", specialty: "Paediatric Nephrology, Genetics", level: "Tier 1" },
  { name: "JIPMER Puducherry", city: "Puducherry", specialty: "Paediatric Nephrology", level: "Tier 1" },
  { name: "KEM Hospital Mumbai", city: "Mumbai", specialty: "Nephrology, Genetics", level: "Tier 1" },
  { name: "NIMHANS Bangalore", city: "Bangalore", specialty: "Neurogenetics, Rare Disease", level: "Tier 1" },
  { name: "SGPGIMS Lucknow", city: "Lucknow", specialty: "Nephrology, Paediatrics", level: "Tier 1" },
  { name: "Amrita Institute Kochi", city: "Kochi", specialty: "Paediatric Nephrology, Transplant", level: "Tier 2" },
  { name: "Nizam's Institute Hyderabad", city: "Hyderabad", specialty: "Nephrology, Genetics", level: "Tier 2" },
  { name: "CMC Vellore", city: "Vellore", specialty: "Nephrology, Medical Genetics", level: "Tier 2" },
];

const DEFAULT_DISEASES = [
  "Lysosomal Storage Disorders (Fabry, Gaucher, Pompe, MPS types)",
  "Primary Hyperoxaluria (PH1, PH2, PH3)",
  "Cystinosis",
  "Autosomal Recessive Polycystic Kidney Disease (ARPKD)",
  "Hereditary Nephritis (Alport Syndrome)",
  "Nephronophthisis and Related Ciliopathies",
  "Atypical HUS (complement-mediated)",
  "Congenital Nephrotic Syndrome (Finnish type, genetic NS)",
  "Bartter Syndrome and Related Tubulopathies",
  "Primary Immunodeficiency with Renal Manifestations",
];

const NPRD_BENEFITS = [
  { benefit: "Diagnostic funding", detail: "Up to ₹50 lakh for genetic testing, enzyme assays, specialised investigations at designated CoE" },
  { benefit: "Treatment funding", detail: "ERT (Fabry, Gaucher, Pompe), lumasiran (PH1), eculizumab (aHUS) — subject to CoE approval" },
  { benefit: "Referral mechanism", detail: "State government identifies patient → refers to designated CoE → CoE registers and applies for funding" },
  { benefit: "Screening support", detail: "NBS expansion programme funding at state level" },
];

const HOW_TO_APPLY = [
  "Patient/family approaches treating physician at any hospital",
  "Doctor raises suspicion of NPRD-listed disease and begins diagnostic workup",
  "If confirmed or highly suspected: refer to nearest designated CoE hospital",
  "CoE registers patient in NPRD database (www.rd.mohfw.gov.in)",
  "CoE submits funding request to Ministry of Health & Family Welfare",
  "MHFW approves (typical 4–8 weeks for urgent cases)",
  "Funding disbursed directly to CoE for patient care",
];

// --- Inline editable row ---
function EditableRow({ row, fields, onSave, onDelete, isNew }) {
  const [editing, setEditing] = useState(isNew || false);
  const [draft, setDraft] = useState({ ...row });

  const handleSave = () => { onSave(draft); setEditing(false); };
  const handleCancel = () => { setDraft({ ...row }); setEditing(false); };

  if (!editing) {
    return (
      <tr className="border-b border-slate-100 hover:bg-slate-50 group">
        {fields.map(f => (
          <td key={f.key} className="px-3 py-2 text-xs text-slate-700">{row[f.key]}</td>
        ))}
        <td className="px-3 py-2">
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => setEditing(true)} className="p-1 rounded hover:bg-blue-100 text-blue-600"><Pencil className="w-3 h-3" /></button>
            <button onClick={onDelete} className="p-1 rounded hover:bg-red-100 text-red-600"><Trash2 className="w-3 h-3" /></button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-violet-200 bg-violet-50">
      {fields.map(f => (
        <td key={f.key} className="px-2 py-1">
          {f.options ? (
            <select value={draft[f.key] || ""} onChange={e => setDraft(d => ({ ...d, [f.key]: e.target.value }))}
              className="text-xs border border-slate-300 rounded px-2 py-1 w-full">
              {f.options.map(o => <option key={o}>{o}</option>)}
            </select>
          ) : (
            <Input value={draft[f.key] || ""} onChange={e => setDraft(d => ({ ...d, [f.key]: e.target.value }))}
              className="text-xs h-7 px-2" />
          )}
        </td>
      ))}
      <td className="px-2 py-1">
        <div className="flex gap-1">
          <button onClick={handleSave} className="p-1 rounded bg-green-100 text-green-700 hover:bg-green-200"><Check className="w-3 h-3" /></button>
          <button onClick={handleCancel} className="p-1 rounded bg-slate-100 text-slate-600 hover:bg-slate-200"><X className="w-3 h-3" /></button>
        </div>
      </td>
    </tr>
  );
}

function AccordionBlock({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 text-left">
        <span className="font-semibold text-sm text-slate-800">{title}</span>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {open && <div className="p-4 bg-white">{children}</div>}
    </div>
  );
}

export default function NPRDNetwork({ isAdmin }) {
  const qc = useQueryClient();
  const [coeSearch, setCoeSearch] = useState("");
  const [diseaseSearch, setDiseaseSearch] = useState("");
  const [newCoeRow, setNewCoeRow] = useState(null);
  const [newDisease, setNewDisease] = useState("");
  const [addingDisease, setAddingDisease] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Fetch from DB
  const { data: dbCoe = [] } = useQuery({
    queryKey: ["rdcontent", "coe_hospital"],
    queryFn: () => base44.entities.RareDiseaseContent.filter({ content_type: "coe_hospital", is_active: true }, "sort_order", 100),
  });
  const { data: dbDiseases = [] } = useQuery({
    queryKey: ["rdcontent", "nprd_disease"],
    queryFn: () => base44.entities.RareDiseaseContent.filter({ content_type: "nprd_disease", is_active: true }, "sort_order", 100),
  });

  // Merge defaults + DB
  const coeList = dbCoe.length > 0
    ? dbCoe.map(r => ({ id: r.id, ...r.data }))
    : DEFAULT_COE.map((r, i) => ({ ...r, _default: true, _idx: i }));

  const diseaseList = dbDiseases.length > 0
    ? dbDiseases.map(r => ({ id: r.id, name: r.title }))
    : DEFAULT_DISEASES.map((d, i) => ({ name: d, _default: true, _idx: i }));

  const filteredCoe = coeList.filter(r => !coeSearch || JSON.stringify(r).toLowerCase().includes(coeSearch.toLowerCase()));
  const filteredDiseases = diseaseList.filter(r => !diseaseSearch || r.name.toLowerCase().includes(diseaseSearch.toLowerCase()));

  const COE_FIELDS = [
    { key: "name", label: "Hospital" },
    { key: "city", label: "City" },
    { key: "specialty", label: "Specialties" },
    { key: "level", label: "Level", options: ["Tier 1", "Tier 2", "Tier 3"] },
  ];

  const saveCoe = async (row) => {
    const payload = { content_type: "coe_hospital", section_id: `coe_${row.name?.toLowerCase().replace(/\s+/g, "_")}`, title: row.name, data: row, is_active: true };
    if (row.id) await base44.entities.RareDiseaseContent.update(row.id, payload);
    else await base44.entities.RareDiseaseContent.create(payload);
    qc.invalidateQueries({ queryKey: ["rdcontent", "coe_hospital"] });
    setNewCoeRow(null);
  };

  const deleteCoe = async (row) => {
    if (row.id) await base44.entities.RareDiseaseContent.update(row.id, { is_active: false });
    qc.invalidateQueries({ queryKey: ["rdcontent", "coe_hospital"] });
  };

  const saveDisease = async (name) => {
    await base44.entities.RareDiseaseContent.create({ content_type: "nprd_disease", section_id: `disease_${Date.now()}`, title: name, data: {}, is_active: true });
    qc.invalidateQueries({ queryKey: ["rdcontent", "nprd_disease"] });
    setNewDisease(""); setAddingDisease(false);
  };

  const deleteDisease = async (row) => {
    if (row.id) await base44.entities.RareDiseaseContent.update(row.id, { is_active: false });
    qc.invalidateQueries({ queryKey: ["rdcontent", "nprd_disease"] });
  };

  const autoSync = async () => {
    setSyncing(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: "List the current officially designated Centres of Excellence for rare diseases in India under NPRD 2021 (Ministry of Health). Return as JSON array with fields: name, city, specialty, level (Tier 1/2). Include any hospitals added after 2022 such as AIIMS regional campuses.",
        add_context_from_internet: true,
        response_json_schema: { type: "object", properties: { centres: { type: "array", items: { type: "object", properties: { name: { type: "string" }, city: { type: "string" }, specialty: { type: "string" }, level: { type: "string" } } } }, new_diseases: { type: "array", items: { type: "string" } } } }
      });
      if (res?.centres?.length) {
        for (const c of res.centres) {
          const exists = coeList.find(r => r.name?.toLowerCase() === c.name?.toLowerCase());
          if (!exists) await saveCoe(c);
        }
      }
    } catch (e) { /* silent */ }
    setSyncing(false);
  };

  return (
    <div className="space-y-4">
      <Alert className="bg-blue-50 border-blue-300 border-2">
        <Info className="w-5 h-5 text-blue-600" />
        <AlertDescription className="text-blue-900">
          <strong className="block text-base mb-1">National Policy for Rare Diseases (NPRD) 2021</strong>
          <span className="text-sm">India's national policy provides financial assistance up to ₹50 lakh per patient for diagnosis and treatment of rare diseases at designated Centres of Excellence (CoE).</span>
        </AlertDescription>
      </Alert>

      {/* CoE Hospitals */}
      <Card className="bg-white border border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-50 border-b py-3 px-5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <CardTitle className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-indigo-600" /> Designated Centres of Excellence — India
            </CardTitle>
            <div className="flex items-center gap-2">
              {isAdmin && (
                <>
                  <Button size="sm" variant="outline" onClick={autoSync} disabled={syncing} className="text-xs h-7 border-violet-300 text-violet-700">
                    <RefreshCw className={`w-3 h-3 mr-1 ${syncing ? "animate-spin" : ""}`} />{syncing ? "Syncing…" : "Auto-Sync"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setNewCoeRow({})} className="text-xs h-7 border-green-300 text-green-700">
                    <Plus className="w-3 h-3 mr-1" />Add Centre
                  </Button>
                </>
              )}
              <div className="relative">
                <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input value={coeSearch} onChange={e => setCoeSearch(e.target.value)} placeholder="Search…" className="pl-7 text-xs h-7 w-36" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  {COE_FIELDS.map(f => <th key={f.key} className="text-left px-3 py-2 font-semibold">{f.label}</th>)}
                  {isAdmin && <th className="px-3 py-2 w-16"></th>}
                </tr>
              </thead>
              <tbody>
                {newCoeRow !== null && (
                  <EditableRow row={newCoeRow} fields={COE_FIELDS} isNew onSave={saveCoe} onDelete={() => setNewCoeRow(null)} />
                )}
                {filteredCoe.map((row, i) => (
                  isAdmin ? (
                    <EditableRow key={row.id || i} row={row} fields={COE_FIELDS} onSave={saveCoe} onDelete={() => deleteCoe(row)} />
                  ) : (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                      <td className="px-3 py-2 font-medium text-slate-900">{row.name}</td>
                      <td className="px-3 py-2 text-slate-600">{row.city}</td>
                      <td className="px-3 py-2 text-slate-600">{row.specialty}</td>
                      <td className="px-3 py-2">
                        <Badge className={row.level === "Tier 1" ? "bg-indigo-100 text-indigo-800" : "bg-teal-100 text-teal-800"}>{row.level}</Badge>
                      </td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* NPRD Disease List */}
      <AccordionBlock title={`NPRD Disease List — Renal / Metabolic (${filteredDiseases.length})`}>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input value={diseaseSearch} onChange={e => setDiseaseSearch(e.target.value)} placeholder="Search diseases…" className="pl-7 text-xs h-8" />
            </div>
            {isAdmin && (
              <Button size="sm" variant="outline" onClick={() => setAddingDisease(true)} className="text-xs h-8 border-green-300 text-green-700">
                <Plus className="w-3 h-3 mr-1" />Add
              </Button>
            )}
          </div>
          {addingDisease && (
            <div className="flex gap-2">
              <Input value={newDisease} onChange={e => setNewDisease(e.target.value)} placeholder="Enter disease name…" className="text-xs h-8 flex-1" autoFocus onKeyDown={e => { if (e.key === "Enter") saveDisease(newDisease); }} />
              <button onClick={() => saveDisease(newDisease)} className="px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700"><Check className="w-3 h-3" /></button>
              <button onClick={() => { setAddingDisease(false); setNewDisease(""); }} className="px-3 py-1 bg-slate-200 text-slate-700 text-xs rounded-md"><X className="w-3 h-3" /></button>
            </div>
          )}
          <ul className="space-y-1">
            {filteredDiseases.map((d, i) => (
              <li key={d.id || i} className="flex items-center justify-between bg-blue-50 rounded p-2 group">
                <span className="text-sm text-slate-700 flex items-center gap-2"><span className="text-blue-500 font-bold">{i + 1}.</span>{d.name}</span>
                {isAdmin && d.id && (
                  <button onClick={() => deleteDisease(d)} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 text-red-500 transition-opacity">
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </li>
            ))}
          </ul>
          {filteredDiseases.length === 0 && <p className="text-xs text-slate-400 text-center py-2">No diseases match search</p>}
        </div>
      </AccordionBlock>

      <AccordionBlock title="NPRD Benefits & Financial Support">
        <div className="space-y-2">
          {NPRD_BENEFITS.map((b, i) => (
            <div key={i} className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="font-semibold text-sm text-green-900">{b.benefit}</p>
              <p className="text-xs text-slate-700 mt-0.5">{b.detail}</p>
            </div>
          ))}
        </div>
      </AccordionBlock>

      <AccordionBlock title="How to Apply for NPRD Funding — Step by Step">
        <ol className="space-y-2">
          {HOW_TO_APPLY.map((s, i) => (
            <li key={i} className="flex items-start gap-3 bg-slate-50 rounded-lg p-3">
              <div className="w-7 h-7 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</div>
              <p className="text-sm text-slate-700">{s}</p>
            </li>
          ))}
        </ol>
        <Alert className="mt-3 bg-amber-50 border-amber-200">
          <AlertDescription className="text-xs text-amber-800">
            <strong>Key URL:</strong> www.rd.mohfw.gov.in — NPRD patient registration portal. HELPLINE: 1800-11-4477 (toll-free).
          </AlertDescription>
        </Alert>
      </AccordionBlock>

      <AccordionBlock title="International Rare Disease Networks & Resources">
        <div className="grid md:grid-cols-2 gap-3 text-xs text-slate-700">
          {[
            { name: "ERKNet (European Rare Kidney Network)", url: "https://erknet.org", desc: "Rare kidney disease guidelines, registries, clinician training" },
            { name: "ESPN Tubulopathy Working Group", url: "https://espn.online", desc: "European guidelines for Bartter, dRTA, Dent, Gitelman, NDI" },
            { name: "OHF (Oxalosis & Hyperoxaluria Foundation)", url: "https://ohf.org", desc: "PH1/2/3 management, lumasiran access, family support" },
            { name: "Alport Syndrome Foundation", url: "https://alportsyndrome.org", desc: "Alport diagnosis, family registry, clinical trials" },
            { name: "RADAR India Registry", url: "https://rarediseaseindia.org", desc: "National rare disease patient registry" },
            { name: "ISKDC / IPNA", url: "https://ipna-online.org", desc: "Paediatric nephrotic syndrome registry and guidelines" },
            { name: "Global Genes", url: "https://globalgenes.org", desc: "Patient advocacy, research connections" },
            { name: "NORD (National Organization for Rare Disorders)", url: "https://rarediseases.org", desc: "Rare disease database, patient support organisations" },
          ].map((r, i) => (
            <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className="bg-slate-50 border border-slate-200 rounded-lg p-3 hover:border-indigo-300 hover:bg-indigo-50 transition-colors block">
              <p className="font-semibold text-slate-900">{r.name}</p>
              <p className="text-blue-600 text-xs">{r.url}</p>
              <p className="text-slate-500 mt-1">{r.desc}</p>
            </a>
          ))}
        </div>
      </AccordionBlock>
    </div>
  );
}