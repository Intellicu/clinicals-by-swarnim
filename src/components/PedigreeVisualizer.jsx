import React, { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Trash2, Info, RefreshCw, Download } from "lucide-react";
import { toast } from "sonner";

const INHERITANCE_PATTERNS = ["AD", "AR", "XL", "XLD", "MT"];
const VARIANT_COLORS = ["#7c3aed", "#dc2626", "#0891b2", "#16a34a", "#d97706", "#db2777"];

const RISK_CALC = {
  AR: (member, members) => {
    const parents = members.filter(m => member.parentIds?.includes(m.id));
    const carrierParents = parents.filter(m => m.status === "carrier" || m.status === "affected");
    const affectedParents = parents.filter(m => m.status === "affected");
    if (affectedParents.length === 2) return { risk: 100, label: "100% — both parents affected (AR)" };
    if (carrierParents.length === 2) return { risk: 25, label: "25% affected, 50% carrier (AR carrier × carrier)" };
    if (carrierParents.length === 1) return { risk: 0, label: "0% affected, 50% carrier risk (AR single carrier parent)" };
    return null;
  },
  AD: (member, members) => {
    const parents = members.filter(m => member.parentIds?.includes(m.id));
    const affectedParents = parents.filter(m => m.status === "affected");
    if (affectedParents.length >= 1) return { risk: 50, label: "50% — one affected parent (AD)" };
    return null;
  },
  XL: (member, members) => {
    const parents = members.filter(m => member.parentIds?.includes(m.id));
    const carrierMother = parents.find(m => m.gender === "female" && (m.status === "carrier" || m.status === "affected"));
    const affectedFather = parents.find(m => m.gender === "male" && m.status === "affected");
    if (member.gender === "male" && carrierMother) return { risk: 50, label: "50% for males — carrier mother (X-linked)" };
    if (member.gender === "female" && carrierMother) return { risk: 0, label: "Carrier risk 50%, rarely affected (X-linked)" };
    if (member.gender === "female" && affectedFather) return { risk: 0, label: "Obligate carrier (X-linked, affected father)" };
    return null;
  },
};

const SHAPE_SIZE = 28;
const H_GAP = 90;
const V_GAP = 100;

function MemberShape({ member, selected, onClick, onDrag, variantColors }) {
  const cx = member.x + SHAPE_SIZE;
  const cy = member.y + SHAPE_SIZE;
  const r = SHAPE_SIZE;
  const fill = member.status === "affected" ? "#7c3aed" :
    member.status === "carrier" ? "url(#halfFill)" :
    member.status === "deceased" ? "#94a3b8" : "#f8fafc";
  const stroke = member.status === "proband" ? "#dc2626" : "#475569";
  const strokeW = member.status === "proband" ? 3 : 1.5;

  const variantDots = (member.variants || []).slice(0, 4).map((v, i) => ({
    color: variantColors[v] || "#888",
    x: cx - r + 8 + i * 14,
    y: cy + r - 4,
  }));

  return (
    <g onClick={() => onClick(member.id)} style={{ cursor: "pointer" }}
      onMouseDown={e => onDrag(e, member.id)}>
      {member.gender === "male" ? (
        <rect x={member.x} y={member.y} width={r * 2} height={r * 2}
          fill={fill} stroke={stroke} strokeWidth={strokeW} rx={3} />
      ) : member.gender === "female" ? (
        <circle cx={cx} cy={cy} r={r} fill={fill} stroke={stroke} strokeWidth={strokeW} />
      ) : (
        <polygon points={`${cx},${member.y} ${member.x + r * 2},${cy} ${cx},${member.y + r * 2} ${member.x},${cy}`}
          fill={fill} stroke={stroke} strokeWidth={strokeW} />
      )}
      {member.status === "carrier" && member.gender === "female" && (
        <circle cx={cx} cy={cy} r={r * 0.5} fill="#7c3aed" opacity={0.7} />
      )}
      {member.status === "carrier" && member.gender === "male" && (
        <rect x={cx - r * 0.5} y={cy - r * 0.5} width={r} height={r}
          fill="#7c3aed" opacity={0.7} rx={2} />
      )}
      {member.status === "deceased" && (
        <line x1={member.x - 8} y1={member.y + r * 2 + 8} x2={member.x + r * 2 + 8} y2={member.y - 8}
          stroke="#475569" strokeWidth={1.5} />
      )}
      {member.status === "proband" && (
        <text x={member.x - 8} y={member.y + r * 2 + 12} fontSize={14} fill="#dc2626">↗</text>
      )}
      {selected && (
        <rect x={member.x - 4} y={member.y - 4} width={r * 2 + 8} height={r * 2 + 8}
          fill="none" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 2" rx={4} />
      )}
      {variantDots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={5} fill={d.color} stroke="white" strokeWidth={1} />
      ))}
      <text x={cx} y={member.y + r * 2 + 14} textAnchor="middle" fontSize={10} fill="#475569" fontWeight="500">
        {member.label || (member.gender === "male" ? "M" : member.gender === "female" ? "F" : "?")}
      </text>
      {member.age && (
        <text x={cx} y={member.y + r * 2 + 25} textAnchor="middle" fontSize={9} fill="#94a3b8">
          {member.age}y
        </text>
      )}
    </g>
  );
}

function RelationshipLines({ members }) {
  const lines = [];
  members.forEach(m => {
    if (m.parentIds?.length === 2) {
      const p1 = members.find(p => p.id === m.parentIds[0]);
      const p2 = members.find(p => p.id === m.parentIds[1]);
      if (p1 && p2) {
        const midX = (p1.x + p2.x + SHAPE_SIZE * 2) / 2;
        const parentY = p1.y + SHAPE_SIZE;
        const childTopX = m.x + SHAPE_SIZE;
        const childTopY = m.y;
        lines.push(<line key={`couple-${m.id}`} x1={p1.x + SHAPE_SIZE * 2} y1={parentY} x2={p2.x} y2={parentY} stroke="#94a3b8" strokeWidth={1.5} />);
        lines.push(<line key={`drop-${m.id}`} x1={midX} y1={parentY} x2={midX} y2={childTopY - 10} stroke="#94a3b8" strokeWidth={1.5} />);
        lines.push(<line key={`child-${m.id}`} x1={midX} y1={childTopY - 10} x2={childTopX} y2={childTopY - 10} stroke="#94a3b8" strokeWidth={1.5} />);
        lines.push(<line key={`conn-${m.id}`} x1={childTopX} y1={childTopY - 10} x2={childTopX} y2={childTopY} stroke="#94a3b8" strokeWidth={1.5} />);
      }
    }
  });
  return <>{lines}</>;
}

let nextId = 1;

export default function PedigreeVisualizer({ reportFindings = "" }) {
  const [members, setMembers] = useState([
    { id: 1, label: "Father", gender: "male", generation: 1, x: 80, y: 60, status: "unaffected", variants: [], parentIds: [] },
    { id: 2, label: "Mother", gender: "female", generation: 1, x: 220, y: 60, status: "unaffected", variants: [], parentIds: [] },
    { id: 3, label: "Proband", gender: "male", generation: 2, x: 150, y: 200, status: "proband", variants: [], parentIds: [1, 2] },
  ]);
  nextId = Math.max(...members.map(m => m.id)) + 1;

  const [selected, setSelected] = useState(null);
  const [inheritance, setInheritance] = useState("AR");
  const [variantList, setVariantList] = useState([{ id: 0, label: "Variant 1", color: VARIANT_COLORS[0] }]);
  const [dragInfo, setDragInfo] = useState(null);
  const svgRef = useRef(null);

  const selectedMember = members.find(m => m.id === selected);
  const variantColors = Object.fromEntries(variantList.map(v => [v.id, v.color]));

  const handleDragStart = useCallback((e, id) => {
    e.preventDefault();
    const svgRect = svgRef.current.getBoundingClientRect();
    const member = members.find(m => m.id === id);
    setDragInfo({ id, startX: e.clientX - member.x - svgRect.left, startY: e.clientY - member.y - svgRect.top });
  }, [members]);

  const handleMouseMove = useCallback((e) => {
    if (!dragInfo) return;
    const svgRect = svgRef.current.getBoundingClientRect();
    const x = Math.max(0, e.clientX - svgRect.left - dragInfo.startX);
    const y = Math.max(0, e.clientY - svgRect.top - dragInfo.startY);
    setMembers(prev => prev.map(m => m.id === dragInfo.id ? { ...m, x, y } : m));
  }, [dragInfo]);

  const handleMouseUp = useCallback(() => setDragInfo(null), []);

  const addMember = (gender) => {
    const newId = nextId++;
    setMembers(prev => [...prev, {
      id: newId, label: gender === "male" ? "Male" : gender === "female" ? "Female" : "Unknown",
      gender, generation: 1, x: 60 + Math.random() * 200, y: 60 + Math.random() * 100,
      status: "unaffected", variants: [], parentIds: [],
    }]);
    setSelected(newId);
  };

  const updateMember = (field, value) => {
    setMembers(prev => prev.map(m => m.id === selected ? { ...m, [field]: value } : m));
  };

  const toggleVariant = (variantId) => {
    setMembers(prev => prev.map(m => {
      if (m.id !== selected) return m;
      const has = m.variants.includes(variantId);
      return { ...m, variants: has ? m.variants.filter(v => v !== variantId) : [...m.variants, variantId] };
    }));
  };

  const setParent = (parentId) => {
    if (!selected || parentId === selected) return;
    setMembers(prev => prev.map(m => {
      if (m.id !== selected) return m;
      const current = m.parentIds || [];
      if (current.includes(parentId)) return { ...m, parentIds: current.filter(p => p !== parentId) };
      if (current.length >= 2) { toast.error("Max 2 parents"); return m; }
      return { ...m, parentIds: [...current, parentId] };
    }));
  };

  const deleteMember = () => {
    if (!selected) return;
    setMembers(prev => prev.filter(m => m.id !== selected).map(m => ({
      ...m, parentIds: (m.parentIds || []).filter(p => p !== selected)
    })));
    setSelected(null);
  };

  const addVariant = () => {
    const newId = variantList.length;
    setVariantList(prev => [...prev, { id: newId, label: `Variant ${newId + 1}`, color: VARIANT_COLORS[newId % VARIANT_COLORS.length] }]);
  };

  const getRiskAssessment = () => {
    const fn = RISK_CALC[inheritance];
    if (!fn || !selected) return null;
    return fn(selectedMember, members);
  };

  const risk = getRiskAssessment();

  const svgWidth = Math.max(500, ...members.map(m => m.x + SHAPE_SIZE * 2 + 40));
  const svgHeight = Math.max(350, ...members.map(m => m.y + SHAPE_SIZE * 2 + 60));

  return (
    <div className="space-y-4">
      <Alert className="bg-violet-50 border-violet-200">
        <Info className="w-4 h-4 text-violet-600" />
        <AlertDescription className="text-xs text-violet-900">
          <strong>Interactive Pedigree Builder</strong> — Add family members, drag to position, mark affected/carrier status, assign variants, and set parent-child links. Risk assessment updates automatically based on inheritance pattern.
        </AlertDescription>
      </Alert>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Canvas */}
        <div className="lg:col-span-2 space-y-2">
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-2 border-b bg-violet-50">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-sm font-bold text-violet-900">Family Pedigree Canvas</CardTitle>
                <div className="flex gap-1 flex-wrap">
                  <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => addMember("male")}>
                    <Plus className="w-3 h-3 mr-1" />Male ▪
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => addMember("female")}>
                    <Plus className="w-3 h-3 mr-1" />Female ●
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => addMember("unknown")}>
                    <Plus className="w-3 h-3 mr-1" />Unknown ◆
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-2 overflow-auto bg-slate-50 rounded-b-xl">
              <svg
                ref={svgRef}
                width={svgWidth} height={svgHeight}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{ minWidth: 480 }}
              >
                <defs>
                  <linearGradient id="halfFill" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="50%" stopColor="#f8fafc" />
                    <stop offset="50%" stopColor="#7c3aed" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <RelationshipLines members={members} />
                {members.map(m => (
                  <MemberShape key={m.id} member={m} selected={selected === m.id}
                    onClick={setSelected} onDrag={handleDragStart} variantColors={variantColors} />
                ))}
              </svg>
            </CardContent>
          </Card>

          {/* Legend */}
          <Card className="bg-white shadow-sm">
            <CardContent className="p-3">
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                <span className="flex items-center gap-1"><span className="inline-block w-4 h-4 border-2 border-slate-500 rounded-sm bg-slate-50"></span> Unaffected Male</span>
                <span className="flex items-center gap-1"><span className="inline-block w-4 h-4 border-2 border-slate-500 rounded-full bg-slate-50"></span> Unaffected Female</span>
                <span className="flex items-center gap-1"><span className="inline-block w-4 h-4 border-2 border-slate-500 rounded-sm bg-violet-600"></span> Affected</span>
                <span className="flex items-center gap-1"><span className="inline-block w-4 h-4 border-2 border-red-500 rounded-full bg-slate-50"></span> Proband</span>
                <span className="flex items-center gap-1"><span className="inline-block w-4 h-4 border-2 border-slate-500 rounded-full bg-violet-300 opacity-70"></span> Carrier</span>
                <span className="text-slate-400 text-xs">Drag members to reposition • Click to select</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel */}
        <div className="space-y-3">
          {/* Inheritance Pattern */}
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-1 border-b bg-slate-50">
              <CardTitle className="text-xs font-bold text-slate-700">Inheritance Pattern</CardTitle>
            </CardHeader>
            <CardContent className="p-3 flex flex-wrap gap-1">
              {INHERITANCE_PATTERNS.map(p => (
                <Button key={p} size="sm" variant={inheritance === p ? "default" : "outline"}
                  className={`text-xs h-7 ${inheritance === p ? "bg-violet-600" : ""}`}
                  onClick={() => setInheritance(p)}>{p}</Button>
              ))}
            </CardContent>
          </Card>

          {/* Variants */}
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-1 border-b bg-slate-50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-bold text-slate-700">Variants Tracked</CardTitle>
                <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={addVariant}>
                  <Plus className="w-3 h-3 mr-1" />Add
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-3 space-y-1">
              {variantList.map(v => (
                <div key={v.id} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: v.color }}></span>
                  <input
                    value={v.label}
                    onChange={e => setVariantList(prev => prev.map(vv => vv.id === v.id ? { ...vv, label: e.target.value } : vv))}
                    className="text-xs flex-1 border rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-violet-300"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Selected Member Editor */}
          {selectedMember ? (
            <Card className="bg-white shadow-sm border-2 border-violet-200">
              <CardHeader className="pb-1 border-b bg-violet-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-bold text-violet-900">Edit: {selectedMember.label}</CardTitle>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-500" onClick={deleteMember}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-3 space-y-2 text-xs">
                <div>
                  <label className="text-slate-600 font-medium">Name/Label</label>
                  <input value={selectedMember.label} onChange={e => updateMember("label", e.target.value)}
                    className="w-full mt-0.5 border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-violet-300" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-600 font-medium">Gender</label>
                    <select value={selectedMember.gender} onChange={e => updateMember("gender", e.target.value)}
                      className="w-full mt-0.5 border rounded px-2 py-1 text-xs">
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="unknown">Unknown</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-600 font-medium">Age (yrs)</label>
                    <input type="number" value={selectedMember.age || ""} onChange={e => updateMember("age", e.target.value)}
                      className="w-full mt-0.5 border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-violet-300"
                      placeholder="optional" />
                  </div>
                </div>
                <div>
                  <label className="text-slate-600 font-medium">Status</label>
                  <select value={selectedMember.status} onChange={e => updateMember("status", e.target.value)}
                    className="w-full mt-0.5 border rounded px-2 py-1 text-xs">
                    {["unaffected", "affected", "carrier", "proband", "deceased"].map(s => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-600 font-medium mb-1 block">Variants Carried</label>
                  <div className="flex flex-wrap gap-1">
                    {variantList.map(v => (
                      <button key={v.id} onClick={() => toggleVariant(v.id)}
                        className={`px-2 py-0.5 rounded-full text-xs border transition-all ${selectedMember.variants?.includes(v.id) ? "text-white" : "bg-white text-slate-600"}`}
                        style={selectedMember.variants?.includes(v.id) ? { background: v.color, borderColor: v.color } : { borderColor: v.color }}>
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-slate-600 font-medium mb-1 block">Parents (click to link)</label>
                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                    {members.filter(m => m.id !== selected).map(m => (
                      <button key={m.id} onClick={() => setParent(m.id)}
                        className={`px-2 py-0.5 rounded text-xs border transition-all ${selectedMember.parentIds?.includes(m.id) ? "bg-violet-100 border-violet-400 text-violet-800 font-semibold" : "bg-white border-slate-200 text-slate-600"}`}>
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Risk Assessment */}
                {risk && (
                  <div className="bg-amber-50 border border-amber-200 rounded p-2">
                    <p className="font-semibold text-amber-900 text-xs">⚠️ Inheritance Risk ({inheritance})</p>
                    <p className="text-amber-800 text-xs mt-0.5">{risk.label}</p>
                    {risk.risk > 0 && (
                      <div className="mt-1 h-2 bg-amber-200 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${risk.risk}%` }} />
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-slate-50 border-dashed border-2 border-slate-200">
              <CardContent className="p-4 text-center text-xs text-slate-500">
                Click a family member on the canvas to edit their details, assign variants, and link parents.
              </CardContent>
            </Card>
          )}

          {/* Family Risk Summary */}
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-1 border-b bg-slate-50">
              <CardTitle className="text-xs font-bold text-slate-700">Family Risk Summary ({inheritance})</CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-1">
              {members.map(m => {
                const fn = RISK_CALC[inheritance];
                const r = fn ? fn(m, members) : null;
                return r ? (
                  <div key={m.id} className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-medium text-slate-700">{m.label}</span>
                    <Badge className="bg-amber-100 text-amber-800 text-xs">{r.risk}%</Badge>
                  </div>
                ) : null;
              })}
              {!members.some(m => { const fn = RISK_CALC[inheritance]; return fn && fn(m, members); }) && (
                <p className="text-xs text-slate-400">Link parents to members to calculate inheritance risks.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}