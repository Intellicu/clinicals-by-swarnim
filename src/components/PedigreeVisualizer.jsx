import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Users, AlertTriangle, Info, Edit2, Check, X } from "lucide-react";

const INHERITANCE_MODES = ["Autosomal Dominant (AD)", "Autosomal Recessive (AR)", "X-Linked Recessive (XLR)", "X-Linked Dominant (XLD)", "Mitochondrial"];

const EMPTY_MEMBER = { id: null, gen: 1, pos: 0, gender: "M", status: "unaffected", name: "", variants: "" };

const RISK_CALC = {
  "Autosomal Dominant (AD)": {
    carrier_parent: "50% risk to each child",
    both_carriers: "75% risk per child (50% affected, 25% homozygous)",
    affected_parent: "50% risk to each child",
    desc: "One pathogenic variant sufficient to cause disease. AD conditions often show vertical transmission.",
  },
  "Autosomal Recessive (AR)": {
    carrier_parent: "25% risk if both parents are carriers (carrier × carrier)",
    one_affected: "100% carriers if other parent unaffected; 50% risk if other parent is carrier",
    desc: "Two pathogenic variants (biallelic) required. Parents typically unaffected carriers.",
  },
  "X-Linked Recessive (XLR)": {
    carrier_mother: "50% affected sons, 50% carrier daughters",
    affected_father: "All daughters obligate carriers; no son-to-son transmission",
    desc: "Males hemizygous (one X) → affected with one variant. Females usually carriers (protected by normal X).",
  },
  "X-Linked Dominant (XLD)": {
    affected_parent: "50% risk to all children from affected parent",
    desc: "Heterozygous females affected; hemizygous males often more severely affected or lethal.",
  },
  "Mitochondrial": {
    affected_mother: "All children of an affected mother are at risk; father CANNOT pass to children",
    desc: "Maternal inheritance only. Variable expressivity due to heteroplasmy.",
  },
};

function MemberSymbol({ member, size = 40, selected, onClick }) {
  const isAffected = member.status === "affected";
  const isCarrier = member.status === "carrier";
  const isProband = member.isProband;
  const fill = isAffected ? "#7c3aed" : isCarrier ? "url(#carrierGrad)" : "white";
  const stroke = selected ? "#f59e0b" : isProband ? "#dc2626" : "#475569";
  const sw = selected || isProband ? 3 : 2;

  return (
    <svg width={size} height={size} viewBox="0 0 40 40" onClick={onClick} style={{ cursor: "pointer" }}>
      <defs>
        <linearGradient id="carrierGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="50%" stopColor="white" />
          <stop offset="50%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      {member.gender === "M" ? (
        <rect x="4" y="4" width="32" height="32" rx="3" fill={fill} stroke={stroke} strokeWidth={sw} />
      ) : (
        <circle cx="20" cy="20" r="16" fill={fill} stroke={stroke} strokeWidth={sw} />
      )}
      {isProband && <text x="20" y="37" textAnchor="middle" fontSize="8" fill="#dc2626" fontWeight="bold">P</text>}
      {member.isDeceased && <line x1="4" y1="36" x2="36" y2="4" stroke="#475569" strokeWidth="1.5" />}
    </svg>
  );
}

function ConnectorLines({ members }) {
  // Simple SVG lines connecting gens
  const lines = [];
  const byGen = {};
  members.forEach(m => { if (!byGen[m.gen]) byGen[m.gen] = []; byGen[m.gen].push(m); });

  // Couple lines (same gen, adjacent pos difference of 1)
  Object.entries(byGen).forEach(([gen, genMembers]) => {
    const sorted = [...genMembers].sort((a, b) => a.pos - b.pos);
    for (let i = 0; i < sorted.length - 1; i++) {
      const a = sorted[i], b = sorted[i + 1];
      if (b.pos - a.pos === 1 && ((a.gender === "M" && b.gender === "F") || (a.gender === "F" && b.gender === "M"))) {
        const ax = 80 + a.pos * 100 + 20, ay = (a.gen - 1) * 130 + 60;
        const bx = 80 + b.pos * 100 + 20, by = (b.gen - 1) * 130 + 60;
        lines.push(<line key={`couple-${a.id}-${b.id}`} x1={ax} y1={ay} x2={bx} y2={by} stroke="#94a3b8" strokeWidth="2" />);
      }
    }
  });

  return <>{lines}</>;
}

export default function PedigreeVisualizer({ reportVariants = "" }) {
  const defaultMembers = [
    { id: 1, gen: 1, pos: 0, gender: "M", status: "unaffected", name: "Grandfather (P)", variants: "", isProband: false },
    { id: 2, gen: 1, pos: 1, gender: "F", status: "unaffected", name: "Grandmother (P)", variants: "", isProband: false },
    { id: 3, gen: 1, pos: 2, gender: "M", status: "unaffected", name: "Grandfather (M)", variants: "", isProband: false },
    { id: 4, gen: 1, pos: 3, gender: "F", status: "unaffected", name: "Grandmother (M)", variants: "", isProband: false },
    { id: 5, gen: 2, pos: 0, gender: "M", status: "carrier", name: "Father", variants: "", isProband: false },
    { id: 6, gen: 2, pos: 1, gender: "F", status: "carrier", name: "Mother", variants: "", isProband: false },
    { id: 7, gen: 3, pos: 0, gender: "M", status: "affected", name: "Proband", variants: reportVariants, isProband: true },
  ];

  const [members, setMembers] = useState(defaultMembers);
  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState("Autosomal Recessive (AR)");
  const [editForm, setEditForm] = useState(null);
  const [showRisk, setShowRisk] = useState(false);
  const nextId = useCallback(() => Math.max(0, ...members.map(m => m.id)) + 1, [members]);

  const selectedMember = members.find(m => m.id === selected);

  const addMember = (gen) => {
    const genMembers = members.filter(m => m.gen === gen);
    const maxPos = genMembers.length ? Math.max(...genMembers.map(m => m.pos)) + 1 : 0;
    const nm = { ...EMPTY_MEMBER, id: nextId(), gen, pos: maxPos, name: `Gen ${gen} Member ${maxPos + 1}` };
    setMembers(prev => [...prev, nm]);
    setSelected(nm.id);
    setEditForm({ ...nm });
  };

  const deleteMember = (id) => {
    setMembers(prev => prev.filter(m => m.id !== id));
    if (selected === id) { setSelected(null); setEditForm(null); }
  };

  const saveEdit = () => {
    setMembers(prev => prev.map(m => m.id === editForm.id ? { ...editForm } : m));
    setEditForm(null);
  };

  const startEdit = (m) => {
    setSelected(m.id);
    setEditForm({ ...m });
  };

  const byGen = {};
  members.forEach(m => { if (!byGen[m.gen]) byGen[m.gen] = []; byGen[m.gen].push(m); });
  const maxGen = Math.max(...members.map(m => m.gen), 3);
  const maxPos = Math.max(...members.map(m => m.pos), 3);
  const svgW = Math.max(600, (maxPos + 2) * 100 + 100);
  const svgH = maxGen * 130 + 60;

  const riskInfo = RISK_CALC[mode] || {};

  // Calculate affected/carrier counts for risk summary
  const affectedMembers = members.filter(m => m.status === "affected");
  const carrierMembers = members.filter(m => m.status === "carrier");

  return (
    <div className="space-y-4">
      <Alert className="bg-violet-50 border-violet-200">
        <Users className="w-4 h-4 text-violet-600" />
        <AlertDescription className="text-xs text-violet-900">
          <strong>Interactive Pedigree Visualizer</strong> — Plot multi-generational family trees, map genetic variants to relatives, and auto-calculate inheritance risk. 
          <span className="ml-1">Squares = Male · Circles = Female · Purple filled = Affected · Half-purple = Carrier · P = Proband</span>
        </AlertDescription>
      </Alert>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Controls Panel */}
        <div className="space-y-3">
          {/* Inheritance Mode */}
          <Card>
            <CardHeader className="pb-2 bg-violet-50 border-b">
              <CardTitle className="text-sm text-violet-900">Inheritance Mode</CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              <Select value={mode} onValueChange={setMode}>
                <SelectTrigger className="text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INHERITANCE_MODES.map(m => <SelectItem key={m} value={m} className="text-xs">{m}</SelectItem>)}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-600 leading-relaxed">{riskInfo.desc}</p>
              <Button size="sm" variant="outline" className="w-full text-xs h-7" onClick={() => setShowRisk(!showRisk)}>
                {showRisk ? "Hide" : "Show"} Risk Assessment
              </Button>
            </CardContent>
          </Card>

          {/* Add Members */}
          <Card>
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-sm">Add Family Members</CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              {[1, 2, 3, 4].map(gen => (
                <Button key={gen} size="sm" variant="outline" className="w-full text-xs h-7 justify-start"
                  onClick={() => addMember(gen)}>
                  <Plus className="w-3 h-3 mr-1" />
                  Generation {gen} {gen === 1 ? "(Grandparents)" : gen === 2 ? "(Parents)" : gen === 3 ? "(Patient/Siblings)" : "(Children)"}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Edit Selected */}
          {editForm && (
            <Card className="border-amber-300 bg-amber-50">
              <CardHeader className="pb-2 border-b border-amber-200">
                <CardTitle className="text-sm text-amber-900 flex items-center gap-2">
                  <Edit2 className="w-3 h-3" />Edit Member
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-2">
                <div>
                  <Label className="text-xs">Name</Label>
                  <Input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} className="h-7 text-xs mt-0.5" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Gender</Label>
                    <Select value={editForm.gender} onValueChange={v => setEditForm(p => ({ ...p, gender: v }))}>
                      <SelectTrigger className="h-7 text-xs mt-0.5"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="M">Male (□)</SelectItem><SelectItem value="F">Female (○)</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Status</Label>
                    <Select value={editForm.status} onValueChange={v => setEditForm(p => ({ ...p, status: v }))}>
                      <SelectTrigger className="h-7 text-xs mt-0.5"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unaffected">Unaffected</SelectItem>
                        <SelectItem value="affected">Affected</SelectItem>
                        <SelectItem value="carrier">Carrier</SelectItem>
                        <SelectItem value="deceased">Deceased</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Genetic Variants (optional)</Label>
                  <Input value={editForm.variants} onChange={e => setEditForm(p => ({ ...p, variants: e.target.value }))}
                    placeholder="e.g. NPHS2 p.Arg229Gln het" className="h-7 text-xs mt-0.5" />
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs flex items-center gap-1 cursor-pointer">
                    <input type="checkbox" checked={!!editForm.isProband} onChange={e => setEditForm(p => ({ ...p, isProband: e.target.checked }))} className="rounded" />
                    Mark as Proband
                  </Label>
                  <Label className="text-xs flex items-center gap-1 cursor-pointer">
                    <input type="checkbox" checked={!!editForm.isDeceased} onChange={e => setEditForm(p => ({ ...p, isDeceased: e.target.checked }))} className="rounded" />
                    Deceased
                  </Label>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 h-7 text-xs bg-amber-600 hover:bg-amber-700" onClick={saveEdit}>
                    <Check className="w-3 h-3 mr-1" />Save
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs text-red-600" onClick={() => deleteMember(editForm.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setEditForm(null); setSelected(null); }}>
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Summary */}
          <Card>
            <CardHeader className="pb-2 bg-slate-50 border-b">
              <CardTitle className="text-sm">Family Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-purple-50 rounded p-2 border border-purple-200">
                  <div className="font-bold text-purple-800 text-lg">{affectedMembers.length}</div>
                  <div className="text-purple-600">Affected</div>
                </div>
                <div className="bg-indigo-50 rounded p-2 border border-indigo-200">
                  <div className="font-bold text-indigo-800 text-lg">{carrierMembers.length}</div>
                  <div className="text-indigo-600">Carriers</div>
                </div>
              </div>
              {members.filter(m => m.variants).map(m => (
                <div key={m.id} className="text-xs bg-slate-50 border rounded p-1.5">
                  <span className="font-semibold text-slate-700">{m.name}: </span>
                  <span className="text-slate-600">{m.variants}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Pedigree Canvas */}
        <div className="lg:col-span-2 space-y-3">
          <Card>
            <CardHeader className="pb-2 bg-violet-50 border-b">
              <CardTitle className="text-sm text-violet-900">Family Pedigree</CardTitle>
              <p className="text-xs text-slate-500">Click any symbol to select & edit. Proband marked with red border.</p>
            </CardHeader>
            <CardContent className="p-3 overflow-x-auto">
              <svg width={svgW} height={svgH} style={{ minWidth: "100%", background: "white", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
                {/* Generation labels */}
                {[1, 2, 3, 4].filter(g => byGen[g]).map(g => (
                  <text key={g} x="8" y={(g - 1) * 130 + 65} fontSize="10" fill="#94a3b8" fontWeight="bold">
                    Gen {["I", "II", "III", "IV"][g - 1]}
                  </text>
                ))}
                {/* Couple connector lines */}
                {members.map((m, i) => {
                  const genMems = [...(byGen[m.gen] || [])].sort((a, b) => a.pos - b.pos);
                  const idx = genMems.findIndex(gm => gm.id === m.id);
                  if (idx < genMems.length - 1) {
                    const next = genMems[idx + 1];
                    const x1 = 80 + m.pos * 100 + 40;
                    const y1 = (m.gen - 1) * 130 + 40;
                    const x2 = 80 + next.pos * 100;
                    const y2 = (next.gen - 1) * 130 + 40;
                    if (((m.gender === "M" && next.gender === "F") || (m.gender === "F" && next.gender === "M")) && next.pos - m.pos === 1) {
                      return <line key={`h-${m.id}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#94a3b8" strokeWidth="2" />;
                    }
                  }
                  return null;
                })}
                {/* Members */}
                {members.map(m => {
                  const x = 80 + m.pos * 100;
                  const y = (m.gen - 1) * 130 + 20;
                  const isSelected = selected === m.id;
                  const isAffected = m.status === "affected";
                  const isCarrier = m.status === "carrier";
                  const fill = isAffected ? "#7c3aed" : isCarrier ? "#e9d5ff" : "white";
                  const stroke = isSelected ? "#f59e0b" : m.isProband ? "#dc2626" : "#475569";
                  const sw = isSelected || m.isProband ? 3 : 2;

                  return (
                    <g key={m.id} onClick={() => { setSelected(m.id); setEditForm({ ...m }); }} style={{ cursor: "pointer" }}>
                      {m.gender === "M" ? (
                        <rect x={x} y={y} width="40" height="40" rx="3" fill={fill} stroke={stroke} strokeWidth={sw} />
                      ) : (
                        <circle cx={x + 20} cy={y + 20} r="20" fill={fill} stroke={stroke} strokeWidth={sw} />
                      )}
                      {isCarrier && m.gender === "M" && (
                        <polygon points={`${x + 20},${y + 5} ${x + 35},${y + 35} ${x + 5},${y + 35}`} fill="#7c3aed" opacity="0.5" />
                      )}
                      {m.isDeceased && <line x1={x - 3} y1={y + 43} x2={x + 43} y2={y - 3} stroke="#475569" strokeWidth="1.5" />}
                      {m.isProband && <text x={x + 20} y={y + 56} textAnchor="middle" fontSize="9" fill="#dc2626" fontWeight="bold">▲ Proband</text>}
                      <text x={x + 20} y={y + 65} textAnchor="middle" fontSize="9" fill="#475569">
                        {m.name.length > 12 ? m.name.slice(0, 11) + "…" : m.name}
                      </text>
                      {m.variants && <text x={x + 20} y={y + 76} textAnchor="middle" fontSize="7" fill="#7c3aed">🧬</text>}
                    </g>
                  );
                })}
              </svg>
              {/* Legend */}
              <div className="flex flex-wrap gap-3 mt-3 text-xs text-slate-600">
                {[
                  { color: "#7c3aed", label: "Affected", shape: "square" },
                  { color: "#e9d5ff", label: "Carrier", shape: "square" },
                  { color: "white", label: "Unaffected", shape: "square" },
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-1">
                    <div className={`w-4 h-4 rounded-sm border-2 border-slate-500`} style={{ background: l.color }} />
                    {l.label}
                  </div>
                ))}
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded-full border-2 border-slate-500 bg-white" />Female
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 border-2 border-red-600 bg-white" />Proband
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Assessment */}
          {showRisk && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader className="pb-2 border-b border-orange-200">
                <CardTitle className="text-sm text-orange-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Inheritance Risk Assessment — {mode}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                <p className="text-xs text-orange-900 font-medium">{riskInfo.desc}</p>
                <div className="space-y-2">
                  {Object.entries(riskInfo).filter(([k]) => k !== "desc").map(([scenario, risk]) => (
                    <div key={scenario} className="bg-white rounded-lg p-2.5 border border-orange-200">
                      <div className="text-xs font-semibold text-slate-700 capitalize">{scenario.replace(/_/g, " ")}</div>
                      <div className="text-xs text-orange-800 mt-0.5">{risk}</div>
                    </div>
                  ))}
                </div>

                {/* Auto-assessed risk based on current pedigree */}
                {affectedMembers.length > 0 && (
                  <div className="bg-white rounded-lg p-3 border-2 border-orange-300 mt-2">
                    <div className="text-xs font-bold text-slate-800 mb-1">📊 Auto-Assessed from Pedigree</div>
                    {mode === "Autosomal Recessive (AR)" && carrierMembers.filter(m => m.gen === 2).length >= 2 && (
                      <p className="text-xs text-orange-900">Both parents appear to be carriers → <strong>25% risk per child</strong>. Unaffected siblings have a 2/3 chance of being carriers. Recommend parental carrier testing and genetic counselling.</p>
                    )}
                    {mode === "Autosomal Dominant (AD)" && affectedMembers.filter(m => m.gen <= 2).length > 0 && (
                      <p className="text-xs text-orange-900">Vertical transmission pattern detected → <strong>50% risk per child</strong> of affected parent. Consider predictive testing for at-risk relatives.</p>
                    )}
                    {mode === "X-Linked Recessive (XLR)" && affectedMembers.filter(m => m.gender === "M").length > 0 && (
                      <p className="text-xs text-orange-900">Affected males with likely carrier female → <strong>50% of sons affected, 50% of daughters carriers</strong>. No male-to-male transmission. Test maternal family.</p>
                    )}
                    {mode !== "Autosomal Recessive (AR)" && mode !== "Autosomal Dominant (AD)" && mode !== "X-Linked Recessive (XLR)" && (
                      <p className="text-xs text-slate-600">Add more family members and mark their status to generate specific risk assessment for {mode}.</p>
                    )}
                  </div>
                )}

                <p className="text-xs text-orange-700 font-medium mt-2">⚠️ Risk estimates are for educational purposes only. Formal genetic counselling required for clinical decisions.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}