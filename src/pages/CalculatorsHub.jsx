import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft, Calculator, FlaskConical, Pill, Activity, MessageSquare,
  Search, Star, Clock, AlertTriangle, Heart, Droplet, Wind, Zap,
  Baby, TestTube, Beaker, Microscope, TrendingUp, BarChart2, Layers,
  ChevronRight, X
} from "lucide-react";
import NephrologyCalculators from "../components/calculators/NephrologyCalculators";
import EmergencyToolsStrip from "@/components/hub/EmergencyToolsStrip";
import RheumatologyCalculators from "../components/calculators/RheumatologyCalculators";
import SteroidTaperEngine from "../components/calculators/SteroidTaperEngine";
import DoseCalculatorEngine from "../components/calculators/DoseCalculatorEngine";
import CounselingEngine from "../components/calculators/CounselingEngine";
import ScoringClassificationHub from "../components/scoring/ScoringClassificationHub";

// ── Calculator registry ───────────────────────────────────────────────────
const CALC_REGISTRY = [
  // Renal Function
  { id: "schwartz", name: "Schwartz GFR", category: "Renal Function", icon: Activity, color: "bg-blue-600", page: "SchwartzGFR", desc: "Bedside GFR from Cr & height", emergency: false, tags: ["gfr", "creatinine", "ckd"] },
  { id: "ckid", name: "CKiD GFR", category: "Renal Function", icon: Activity, color: "bg-blue-700", page: "CKiDGFR", desc: "Accurate GFR estimation", emergency: false, tags: ["gfr", "ckd"] },
  { id: "aki", name: "AKI Staging (pRIFLE/KDIGO)", category: "Renal Function", icon: AlertTriangle, color: "bg-red-600", page: "AKIStager", desc: "Classify AKI severity", emergency: true, tags: ["aki", "kdigo", "prifle"] },
  { id: "ckd", name: "CKD Staging", category: "Renal Function", icon: TrendingUp, color: "bg-blue-500", page: "CKDStager", desc: "KDIGO CKD stage classification", emergency: false, tags: ["ckd", "egfr"] },
  { id: "proteinuria", name: "Proteinuria (UPCR)", category: "Renal Function", icon: TestTube, color: "bg-cyan-600", page: "Proteinuria", desc: "Protein:creatinine ratio", emergency: false, tags: ["proteinuria", "nephrotic"] },
  { id: "stone", name: "Stone Risk Score", category: "Renal Function", icon: Beaker, color: "bg-amber-600", page: "StoneRisk", desc: "Kidney stone risk evaluation", emergency: false, tags: ["stone", "kidney"] },
  { id: "rta", name: "RTA Classifier", category: "Renal Function", icon: FlaskConical, color: "bg-teal-600", page: "RTAClassifier", desc: "Type 1, 2, 4 RTA classification", emergency: false, tags: ["rta", "acidosis"] },

  // Electrolytes & Tubular
  { id: "fena", name: "FENa Calculator", category: "Electrolytes & Tubular", icon: TestTube, color: "bg-indigo-600", page: "FENaCalculator", desc: "Fractional excretion of sodium", emergency: true, tags: ["fena", "sodium", "aki"] },
  { id: "feurea", name: "FEUrea Calculator", category: "Electrolytes & Tubular", icon: Microscope, color: "bg-indigo-500", page: "FEUreaCalculator", desc: "FE urea for AKI", emergency: false, tags: ["feurea", "aki"] },
  { id: "femg", name: "FEMg Calculator", category: "Electrolytes & Tubular", icon: Beaker, color: "bg-violet-600", page: "FEMgCalculator", desc: "Fractional excretion of magnesium", emergency: false, tags: ["femg", "magnesium"] },
  { id: "feua", name: "FEUA Calculator", category: "Electrolytes & Tubular", icon: FlaskConical, color: "bg-violet-500", page: "FEUACalculator", desc: "FE uric acid", emergency: false, tags: ["feua", "urate"] },
  { id: "trp", name: "TRP & TmP/GFR", category: "Electrolytes & Tubular", icon: TestTube, color: "bg-teal-700", page: "TRPCalculator", desc: "Tubular phosphate reabsorption", emergency: false, tags: ["phosphate", "trp", "tubular"] },
  { id: "sodium", name: "Sodium Correction", category: "Electrolytes & Tubular", icon: Droplet, color: "bg-blue-500", page: "SodiumCalculator", desc: "Dysnatremia management", emergency: true, tags: ["sodium", "hyponatremia", "hypernatremia"] },
  { id: "potassium", name: "Potassium Calculator", category: "Electrolytes & Tubular", icon: Zap, color: "bg-amber-600", page: "PotassiumCalculator", desc: "K+ replacement protocol", emergency: true, tags: ["potassium", "hyperkalemia", "hypokalemia"] },
  { id: "ttkg", name: "TTKG", category: "Electrolytes & Tubular", icon: Beaker, color: "bg-orange-600", page: "TTKGCalculator", desc: "Transtubular K gradient", emergency: false, tags: ["ttkg", "potassium"] },

  // Acid-Base
  { id: "abg", name: "ABG Interpreter", category: "Acid-Base & Fluids", icon: Wind, color: "bg-red-500", page: "ABGInterpreter", desc: "Systematic blood gas analysis", emergency: true, tags: ["abg", "acid-base", "ph"] },
  { id: "aniongap", name: "Anion Gap", category: "Acid-Base & Fluids", icon: Calculator, color: "bg-red-600", page: "AnionGap", desc: "Metabolic acidosis analysis", emergency: true, tags: ["anion gap", "acidosis"] },
  { id: "osmolargap", name: "Osmolar Gap", category: "Acid-Base & Fluids", icon: Beaker, color: "bg-rose-600", page: "OsmolarGap", desc: "Toxicology screening", emergency: false, tags: ["osmolar", "toxicology"] },
  { id: "fluid", name: "IV Fluid Calculator", category: "Acid-Base & Fluids", icon: Droplet, color: "bg-cyan-600", page: "FluidCalculator", desc: "Holliday-Segar maintenance", emergency: false, tags: ["fluid", "maintenance", "iv"] },

  // Hypertension
  { id: "bp", name: "BP Percentiles", category: "Hypertension", icon: Heart, color: "bg-red-600", page: "BPPercentiles", desc: "AAP 2017 pediatric BP classification", emergency: true, tags: ["bp", "hypertension", "percentile"] },

  // Growth & Nutrition
  { id: "anthropometry", name: "Anthropometry & Growth", category: "Growth & Nutrition", icon: Baby, color: "bg-green-600", page: "Anthropometry", desc: "Z-scores, BMI, growth assessment", emergency: false, tags: ["growth", "bmi", "nutrition", "anthropometry"] },

  // Dialysis & ICU
  { id: "ktv", name: "Kt/V Calculator", category: "Dialysis & ICU", icon: Calculator, color: "bg-slate-700", page: "KtVCalculator", desc: "Dialysis adequacy", emergency: false, tags: ["ktv", "hemodialysis", "adequacy"] },
  { id: "rrt", name: "RRT Assistant", category: "Dialysis & ICU", icon: Droplet, color: "bg-cyan-700", page: "RRTAssistant", desc: "HD & PD prescription builder", emergency: false, tags: ["rrt", "dialysis", "pd", "hd"] },

  // Rheumatology & Immunology
  { id: "jadas", name: "JADAS-27 Score", category: "Rheumatology & Immunology", icon: Activity, color: "bg-purple-600", page: "CalculatorsHub", desc: "JIA disease activity", emergency: false, tags: ["jadas", "jia", "juvenile arthritis"] },
  { id: "sledai", name: "SLEDAI-2K Score", category: "Rheumatology & Immunology", icon: Activity, color: "bg-purple-700", page: "CalculatorsHub", desc: "Lupus disease activity", emergency: false, tags: ["sledai", "lupus", "sle"] },

  // Drug Dosing
  { id: "steroid", name: "Steroid Taper Engine", category: "Drug Dosing", icon: Pill, color: "bg-orange-600", page: "CalculatorsHub", desc: "Steroid equivalence & taper", emergency: false, tags: ["steroid", "prednisolone", "taper"] },
  { id: "drugdose", name: "Drug Dosing Engine", category: "Drug Dosing", icon: Calculator, color: "bg-teal-600", page: "CalculatorsHub", desc: "Weight + BSA + renal adjusted", emergency: false, tags: ["dose", "drug", "weight"] },
  { id: "prediction", name: "Prediction Tools", category: "Drug Dosing", icon: TrendingUp, color: "bg-emerald-600", page: "PredictionTools", desc: "IgAN, SRNS, CKiD ESRD risk", emergency: false, tags: ["prediction", "risk", "igan", "srns"] },
];

const CATEGORIES = [
  "All",
  "Renal Function",
  "Electrolytes & Tubular",
  "Acid-Base & Fluids",
  "Hypertension",
  "Growth & Nutrition",
  "Dialysis & ICU",
  "Rheumatology & Immunology",
  "Drug Dosing",
];

const SPECIALTY_TABS = [
  { id: "nephrology", label: "Nephrology", icon: FlaskConical, color: "bg-blue-600", badge: "GFR, FENa, BP, BSA" },
  { id: "rheumatology", label: "Rheumatology", icon: Activity, color: "bg-purple-600", badge: "JADAS, SLEDAI, MAS" },
  { id: "steroid", label: "Steroid Taper", icon: Pill, color: "bg-orange-600", badge: "Taper + Equivalence" },
  { id: "dosing", label: "Drug Dosing", icon: Calculator, color: "bg-teal-600", badge: "Weight + BSA + Renal" },
  { id: "counseling", label: "Counseling", icon: MessageSquare, color: "bg-cyan-600", badge: "Multilingual Sheets" },
  { id: "scoring", label: "Scoring", icon: BarChart2, color: "bg-slate-700", badge: "SLEDAI, JADAS, KDIGO" },
];

export default function CalculatorsHub() {
  const navigate = useNavigate();
  const [view, setView] = useState("hub"); // "hub" | "specialty"
  const [activeTab, setActiveTab] = useState("nephrology");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [recentIds, setRecentIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem("calc_recent") || "[]"); } catch { return []; }
  });
  const [favIds, setFavIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem("calc_favs") || "[]"); } catch { return []; }
  });

  const toggleFav = (id) => {
    setFavIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [id, ...prev];
      try { localStorage.setItem("calc_favs", JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const trackRecent = (id) => {
    setRecentIds(prev => {
      const next = [id, ...prev.filter(x => x !== id)].slice(0, 6);
      try { localStorage.setItem("calc_recent", JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const filtered = useMemo(() => {
    let list = CALC_REGISTRY;
    if (category !== "All") list = list.filter(c => c.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.desc.toLowerCase().includes(q) ||
        c.tags.some(t => t.includes(q))
      );
    }
    return list;
  }, [search, category]);

  const emergencyCalcs = CALC_REGISTRY.filter(c => c.emergency);
  const recentCalcs = recentIds.map(id => CALC_REGISTRY.find(c => c.id === id)).filter(Boolean);
  const favCalcs = favIds.map(id => CALC_REGISTRY.find(c => c.id === id)).filter(Boolean);

  const groupedFiltered = CATEGORIES.filter(c => c !== "All").reduce((acc, cat) => {
    const items = filtered.filter(c => c.category === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-5xl mx-auto p-3 md:p-6 pb-20">

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Link to={createPageUrl("Hub")}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" /> Hub
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900">Calculators Engine</h1>
            <p className="text-xs text-slate-500">{CALC_REGISTRY.length} clinical calculators</p>
          </div>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant={view === "hub" ? "default" : "outline"}
              onClick={() => setView("hub")}
              className="text-xs h-8"
            >
              Browse
            </Button>
            <Button
              size="sm"
              variant={view === "specialty" ? "default" : "outline"}
              onClick={() => setView("specialty")}
              className="text-xs h-8"
            >
              Specialty
            </Button>
          </div>
        </div>

        {view === "specialty" ? (
          /* ── Specialty Engines ── */
          <>
            <div className="flex flex-wrap gap-2 mb-4">
              {SPECIALTY_TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                      activeTab === tab.id
                        ? `${tab.color} text-white border-transparent shadow-md`
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    <Badge className={`text-xs ${activeTab === tab.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                      {tab.badge}
                    </Badge>
                  </button>
                );
              })}
            </div>
            <div>
              {activeTab === "nephrology" && <NephrologyCalculators />}
              {activeTab === "rheumatology" && <RheumatologyCalculators />}
              {activeTab === "steroid" && <SteroidTaperEngine />}
              {activeTab === "dosing" && <DoseCalculatorEngine />}
              {activeTab === "counseling" && <CounselingEngine />}
              {activeTab === "scoring" && <ScoringClassificationHub />}
            </div>
          </>
        ) : (
          /* ── Browse Hub ── */
          <>
            {/* Emergency tools strip */}
            <EmergencyToolsStrip
              searchQuery={search}
              onNavigate={(route) => navigate(route)}
              className="rounded-xl mb-4"
            />

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <Input
                className="pl-9 bg-white shadow-sm"
                placeholder="Search calculators (e.g. GFR, FENa, BP, steroid…)"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              )}
            </div>

            {/* Category chips */}
            {!search && (
              <div className="flex gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      category === cat
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {/* Emergency calculators strip */}
            {!search && category === "All" && (
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Emergency Calculators</span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {emergencyCalcs.map(calc => {
                    const Icon = calc.icon;
                    return (
                      <Link
                        key={calc.id}
                        to={createPageUrl(calc.page)}
                        onClick={() => trackRecent(calc.id)}
                        className="flex-shrink-0"
                      >
                        <div className="flex items-center gap-2 bg-red-50 border-2 border-red-200 hover:border-red-400 rounded-xl px-3 py-2 transition-all">
                          <div className={`w-7 h-7 ${calc.color} rounded-lg flex items-center justify-center`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-xs font-semibold text-red-800 whitespace-nowrap">{calc.name}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recent */}
            {!search && category === "All" && recentCalcs.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recently Used</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {recentCalcs.map(calc => <CalcCard key={calc.id} calc={calc} onTrack={trackRecent} onFav={toggleFav} isFav={favIds.includes(calc.id)} />)}
                </div>
              </div>
            )}

            {/* Favorites */}
            {!search && category === "All" && favCalcs.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Favorites</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {favCalcs.map(calc => <CalcCard key={calc.id} calc={calc} onTrack={trackRecent} onFav={toggleFav} isFav={true} />)}
                </div>
              </div>
            )}

            {/* Search results */}
            {search ? (
              <div>
                <p className="text-xs text-slate-500 mb-3">{filtered.length} results for "{search}"</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {filtered.map(calc => <CalcCard key={calc.id} calc={calc} onTrack={trackRecent} onFav={toggleFav} isFav={favIds.includes(calc.id)} />)}
                </div>
              </div>
            ) : (
              /* Grouped by category */
              <div className="space-y-5">
                {Object.entries(groupedFiltered).map(([cat, calcs]) => (
                  <div key={cat}>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{cat}</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                      {calcs.map(calc => <CalcCard key={calc.id} calc={calc} onTrack={trackRecent} onFav={toggleFav} isFav={favIds.includes(calc.id)} />)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function CalcCard({ calc, onTrack, onFav, isFav }) {
  const Icon = calc.icon;
  return (
    <div className="relative group">
      <Link to={createPageUrl(calc.page)} onClick={() => onTrack(calc.id)}>
        <Card className="h-full border-2 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer bg-white">
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              <div className={`w-9 h-9 ${calc.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow`}>
                <Icon className="w-4.5 h-4.5 text-white w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-xs text-slate-900 leading-tight mb-0.5">{calc.name}</p>
                <p className="text-xs text-slate-500 line-clamp-2 leading-tight">{calc.desc}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
      <button
        onClick={e => { e.preventDefault(); onFav(calc.id); }}
        className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded ${isFav ? "opacity-100" : ""}`}
        title={isFav ? "Remove favorite" : "Add to favorites"}
      >
        <Star className={`w-3.5 h-3.5 ${isFav ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
      </button>
    </div>
  );
}
