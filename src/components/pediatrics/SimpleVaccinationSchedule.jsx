import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Syringe, CheckCircle2, Clock, Info, AlertTriangle, Search, X } from "lucide-react";
import { toast } from "sonner";

const STORAGE_KEY = "nis_iap_vaccination_tracker";

const SCHEDULE_BY_AGE = [
  {
    label: "At Birth",
    ageMonths: 0,
    color: "bg-red-600",
    vaccines: [
      { id: "bcg", name: "BCG", dose: "0.1 ml", route: "Intradermal", site: "Left upper arm", cat: "NIS", disease: "Tuberculosis", note: "Within 24h of birth. Scar appears 2–4 weeks. Live attenuated." },
      { id: "opv0", name: "OPV-0 (Birth Dose)", dose: "2 drops", route: "Oral", site: "Oral", cat: "NIS", disease: "Polio", note: "Within 15 days of birth." },
      { id: "hepb0", name: "Hepatitis B", dose: "0.5 ml", route: "IM", site: "Antero-lateral thigh", cat: "NIS", disease: "Hepatitis B", note: "Within 24h. Prevents vertical transmission." },
    ]
  },
  {
    label: "6 Weeks",
    ageMonths: 1.5,
    color: "bg-orange-600",
    vaccines: [
      { id: "penta1", name: "Pentavalent-1", dose: "0.5 ml", route: "IM", site: "Left thigh", cat: "NIS", disease: "DTP + HepB + Hib", note: "DTPw+HepB+Hib combination." },
      { id: "opv1", name: "OPV-1", dose: "2 drops", route: "Oral", site: "Oral", cat: "NIS", disease: "Polio" },
      { id: "rota1", name: "Rotavirus-1", dose: "5 drops", route: "Oral", site: "Oral", cat: "NIS", disease: "Rotavirus", note: "Start before 15 weeks. ROTAVAC/ROTASIL/Rotarix." },
      { id: "fipv1", name: "fIPV-1", dose: "0.1 ml", route: "Intradermal", site: "Right upper arm", cat: "NIS", disease: "Polio (IPV)" },
      { id: "pcv1", name: "PCV-1", dose: "0.5 ml", route: "IM", site: "Right thigh", cat: "IAP", disease: "Pneumococcal", note: "PCV13/PCV15. 3+1 schedule." },
    ]
  },
  {
    label: "10 Weeks",
    ageMonths: 2.5,
    color: "bg-yellow-600",
    vaccines: [
      { id: "penta2", name: "Pentavalent-2", dose: "0.5 ml", route: "IM", site: "Left thigh", cat: "NIS", disease: "DTP + HepB + Hib" },
      { id: "opv2", name: "OPV-2", dose: "2 drops", route: "Oral", site: "Oral", cat: "NIS", disease: "Polio" },
      { id: "rota2", name: "Rotavirus-2", dose: "5 drops", route: "Oral", site: "Oral", cat: "NIS", disease: "Rotavirus" },
    ]
  },
  {
    label: "14 Weeks",
    ageMonths: 3.5,
    color: "bg-green-600",
    vaccines: [
      { id: "penta3", name: "Pentavalent-3", dose: "0.5 ml", route: "IM", site: "Left thigh", cat: "NIS", disease: "DTP + HepB + Hib", note: "Completes primary series." },
      { id: "opv3", name: "OPV-3", dose: "2 drops", route: "Oral", site: "Oral", cat: "NIS", disease: "Polio" },
      { id: "fipv2", name: "fIPV-2", dose: "0.1 ml", route: "Intradermal", site: "Right upper arm", cat: "NIS", disease: "Polio (IPV)" },
      { id: "rota3", name: "Rotavirus-3", dose: "5 drops", route: "Oral", site: "Oral", cat: "NIS", disease: "Rotavirus" },
      { id: "pcv2", name: "PCV-2", dose: "0.5 ml", route: "IM", site: "Right thigh", cat: "IAP", disease: "Pneumococcal" },
    ]
  },
  {
    label: "9 Months",
    ageMonths: 9,
    color: "bg-teal-600",
    vaccines: [
      { id: "mr1", name: "MR-1 / MMR-1", dose: "0.5 ml", route: "Subcutaneous", site: "Right upper arm", cat: "NIS", disease: "Measles, Rubella (+ Mumps if MMR)", note: "IAP recommends MMR over MR. Live — avoid if immunosuppressed." },
      { id: "vita1", name: "Vitamin A (1st dose)", dose: "1 ml (1L IU)", route: "Oral", site: "Oral", cat: "NIS", disease: "Vitamin A Deficiency", note: "Given with MR." },
      { id: "typhoid", name: "Typhoid TCV", dose: "0.5 ml", route: "IM", site: "Upper arm/Thigh", cat: "IAP", disease: "Typhoid", note: "Typbar-TCV. Booster every 3 years." },
      { id: "pcvbooster", name: "PCV Booster", dose: "0.5 ml", route: "IM", site: "Right thigh", cat: "IAP", disease: "Pneumococcal" },
    ]
  },
  {
    label: "12 Months",
    ageMonths: 12,
    color: "bg-blue-600",
    vaccines: [
      { id: "hepa1", name: "Hepatitis A-1", dose: "0.5 ml", route: "IM", site: "Upper arm/Thigh", cat: "IAP", disease: "Hepatitis A", note: "2 doses 6 months apart. IAP recommends for all children." },
    ]
  },
  {
    label: "15 Months",
    ageMonths: 15,
    color: "bg-indigo-600",
    vaccines: [
      { id: "mmr2", name: "MMR-2", dose: "0.5 ml", route: "Subcutaneous", site: "Right upper arm", cat: "IAP", disease: "Measles, Mumps, Rubella", note: "Live — avoid if immunosuppressed." },
      { id: "varicella1", name: "Varicella-1 (Chickenpox)", dose: "0.5 ml", route: "Subcutaneous", site: "Upper arm", cat: "IAP", disease: "Varicella", note: "Live. Avoid in immunocompromised. 2-dose schedule." },
    ]
  },
  {
    label: "16–24 Months",
    ageMonths: 18,
    color: "bg-purple-600",
    vaccines: [
      { id: "mr2", name: "MR-2", dose: "0.5 ml", route: "Subcutaneous", site: "Right upper arm", cat: "NIS", disease: "Measles, Rubella" },
      { id: "dptb1", name: "DPT Booster-1", dose: "0.5 ml", route: "IM", site: "Antero-lateral thigh", cat: "NIS", disease: "Diphtheria, Tetanus, Pertussis", note: "IAP recommends DTPa (acellular) for fewer side effects." },
      { id: "opvb1", name: "OPV Booster", dose: "2 drops", route: "Oral", site: "Oral", cat: "NIS", disease: "Polio" },
      { id: "hepa2", name: "Hepatitis A-2", dose: "0.5 ml", route: "IM", site: "Upper arm/Thigh", cat: "IAP", disease: "Hepatitis A", note: "6 months after first dose." },
      { id: "vita2", name: "Vitamin A (2nd–9th)", dose: "2 ml (2L IU)", route: "Oral", site: "Oral", cat: "NIS", disease: "Vitamin A Deficiency", note: "Every 6 months till 5 years." },
    ]
  },
  {
    label: "2–5 Years",
    ageMonths: 48,
    color: "bg-pink-600",
    vaccines: [
      { id: "influenza", name: "Influenza (Annual)", dose: "0.25ml (<3y) / 0.5ml (>=3y)", route: "IM", site: "Upper arm/Thigh", cat: "IAP", disease: "Seasonal Influenza", note: "Annual. 2 doses 4 weeks apart in first year." },
      { id: "varicella2", name: "Varicella-2", dose: "0.5 ml", route: "Subcutaneous", site: "Upper arm", cat: "IAP", disease: "Varicella", note: "Minimum 3 months after first dose." },
      { id: "mmr3", name: "MMR-3 (School Entry)", dose: "0.5 ml", route: "Subcutaneous", site: "Right upper arm", cat: "IAP", disease: "Measles, Mumps, Rubella" },
    ]
  },
  {
    label: "5–6 Years",
    ageMonths: 66,
    color: "bg-rose-600",
    vaccines: [
      { id: "dptb2", name: "DPT Booster-2", dose: "0.5 ml", route: "IM", site: "Upper arm", cat: "NIS", disease: "Diphtheria, Tetanus, Pertussis", note: "School entry booster." },
    ]
  },
  {
    label: "9–14 Years",
    ageMonths: 120,
    color: "bg-cyan-600",
    vaccines: [
      { id: "hpv", name: "HPV (Girls)", dose: "0.5 ml", route: "IM", site: "Upper arm", cat: "IAP", disease: "HPV / Cervical Cancer", note: "2 doses 6m apart if <15y; 3 doses if >=15y. Gardasil-9/Cervarix." },
      { id: "tdap", name: "Tdap / Td (10y)", dose: "0.5 ml", route: "IM", site: "Upper arm", cat: "IAP", disease: "Tetanus, Diphtheria, Pertussis", note: "IAP recommends Tdap at 10y instead of Td." },
    ]
  },
  {
    label: "10 & 16 Years",
    ageMonths: 132,
    color: "bg-slate-600",
    vaccines: [
      { id: "td10", name: "Td (10 years)", dose: "0.5 ml", route: "IM", site: "Upper arm", cat: "NIS", disease: "Tetanus, Diphtheria" },
      { id: "td16", name: "Td (16 years)", dose: "0.5 ml", route: "IM", site: "Upper arm", cat: "NIS", disease: "Tetanus, Diphtheria" },
    ]
  },
];

const ALL_VACCINES = SCHEDULE_BY_AGE.flatMap(g => g.vaccines);

export default function SimpleVaccinationSchedule() {
  const [given, setGiven] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; }
  });
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");

  const toggle = (id) => {
    const updated = { ...given, [id]: !given[id] };
    setGiven(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    toast.success(updated[id] ? "Marked as given" : "Marked as not given");
  };

  const totalGiven = Object.values(given).filter(Boolean).length;
  const total = ALL_VACCINES.length;
  const pct = Math.round((totalGiven / total) * 100);

  const matchesSearch = (v) => !search || v.name.toLowerCase().includes(search.toLowerCase()) || v.disease.toLowerCase().includes(search.toLowerCase());
  const matchesCat = (v) => filterCat === "all" || v.cat === filterCat;

  return (
    <div className="space-y-4">
      {/* Coverage bar */}
      <div className="bg-white rounded-2xl border-2 border-green-200 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-slate-800 text-sm">Vaccination Coverage</span>
          <span className="text-2xl font-black text-green-600">{pct}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3">
          <div className="bg-gradient-to-r from-green-500 to-teal-500 h-3 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>{totalGiven} given</span>
          <span>{total - totalGiven} remaining</span>
        </div>
        <Button size="sm" variant="outline" className="mt-2 text-xs h-7 text-red-600 border-red-200" onClick={() => { setGiven({}); localStorage.removeItem(STORAGE_KEY); toast.info("Record cleared"); }}>
          <X className="w-3 h-3 mr-1" />Clear All Records
        </Button>
      </div>

      {/* Search + filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search vaccine or disease..." className="pl-9 h-9 text-sm" />
        </div>
        {["all", "NIS", "IAP"].map(f => (
          <Button key={f} size="sm" onClick={() => setFilterCat(f)}
            className={`h-9 px-3 text-xs font-bold ${filterCat === f ? "bg-slate-800 text-white" : "bg-white border border-slate-300 text-slate-600 hover:bg-slate-50"}`}>
            {f === "all" ? "All" : f}
          </Button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-3 text-xs flex-wrap">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-600 inline-block"></span><strong>NIS</strong> = Govt Mandatory</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-600 inline-block"></span><strong>IAP</strong> = Recommended</span>
        <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-600" />Tap to mark given</span>
      </div>

      {/* Schedule groups */}
      {SCHEDULE_BY_AGE.map(group => {
        const visibleVaccines = group.vaccines.filter(v => matchesSearch(v) && matchesCat(v));
        if (visibleVaccines.length === 0) return null;
        const groupGiven = visibleVaccines.filter(v => given[v.id]).length;
        const allDone = groupGiven === visibleVaccines.length;

        return (
          <div key={group.label} className={`rounded-2xl overflow-hidden border-2 shadow-sm ${allDone ? "border-green-300 opacity-80" : "border-slate-200"}`}>
            <div className={`${group.color} px-4 py-2.5 flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-white" />
                <span className="font-bold text-white text-sm">{group.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white/80 text-xs">{groupGiven}/{visibleVaccines.length}</span>
                {allDone && <CheckCircle2 className="w-4 h-4 text-white" />}
              </div>
            </div>
            <div className="bg-white divide-y divide-slate-100">
              {visibleVaccines.map(v => (
                <div key={v.id} onClick={() => setSelected(v)}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors ${given[v.id] ? "bg-green-50" : ""}`}>
                  <button onClick={e => { e.stopPropagation(); toggle(v.id); }}
                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${given[v.id] ? "bg-green-500 border-green-500" : "border-slate-300 bg-white hover:border-green-400"}`}>
                    {given[v.id] && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`font-semibold text-sm ${given[v.id] ? "line-through text-slate-400" : "text-slate-800"}`}>{v.name}</span>
                      <Badge className={`text-[10px] px-1.5 py-0 h-4 ${v.cat === "NIS" ? "bg-red-100 text-red-700 border-red-300" : "bg-blue-100 text-blue-700 border-blue-300"}`}>{v.cat}</Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{v.disease} · <span className="text-blue-600 font-medium">{v.dose}</span> · {v.route}</p>
                  </div>
                  <Info className="w-4 h-4 text-slate-300 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Detail Dialog */}
      {selected && (
        <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
          <DialogContent className="max-w-sm mx-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base">
                <Syringe className="w-5 h-5 text-blue-600" />{selected.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  ["Disease", selected.disease],
                  ["Dose", selected.dose],
                  ["Route", selected.route],
                  ["Site", selected.site],
                  ["Category", selected.cat === "NIS" ? "NIS Mandatory" : "IAP Recommended"],
                ].map(([label, value]) => (
                  <div key={label} className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                    <p className="text-xs text-slate-400">{label}</p>
                    <p className="font-semibold text-slate-800 text-xs mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
              {selected.note && (
                <Alert className="bg-blue-50 border-blue-200 py-2">
                  <Info className="w-4 h-4 text-blue-600" />
                  <AlertDescription className="text-xs text-blue-900 ml-1">{selected.note}</AlertDescription>
                </Alert>
              )}
              <div className="flex gap-2">
                <Button onClick={() => { toggle(selected.id); setSelected(null); }}
                  className={`flex-1 text-sm h-9 ${given[selected.id] ? "bg-amber-600 hover:bg-amber-700" : "bg-green-600 hover:bg-green-700"}`}>
                  {given[selected.id] ? <><X className="w-4 h-4 mr-1" />Unmark</> : <><CheckCircle2 className="w-4 h-4 mr-1" />Mark as Given</>}
                </Button>
                <Button variant="outline" onClick={() => setSelected(null)} className="h-9">Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}