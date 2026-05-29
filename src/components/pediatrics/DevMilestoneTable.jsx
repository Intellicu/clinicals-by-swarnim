import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";

const MILESTONES = [
  {
    age: "1m", ageMonths: 1,
    gm: "Lifts chin briefly prone; tonic neck reflex (fencer posture); Moro reflex present",
    fm: "Fisted hands; tracking 30–45° horizontally; pupils respond to light",
    lang: "Startles to sound; calms to voice; cries differentially (hunger vs pain)",
    soc: "Brief mutual gaze; brief quieting on picking up",
    redFlags: ["No response to loud sound", "No fixing on face by 6 weeks"]
  },
  {
    age: "2m", ageMonths: 2,
    gm: "Holds head at 45° prone; tonic neck reflex fading; no head lag fully",
    fm: "Tracks past midline 180°; follows moving face; hands loosely open",
    lang: "Social smile; cooing; squeals; vowel sounds",
    soc: "Recognises mother; responds to familiar voice with brightening",
    redFlags: ["No social smile by 8 weeks", "No visual tracking by 6 weeks"]
  },
  {
    age: "3m", ageMonths: 3,
    gm: "Head steady in sitting; lifts chest prone (45–90°); minimal head lag",
    fm: "Bats at objects; holds rattle briefly; brings hands to mouth",
    lang: "Laughs aloud; turns to voice; 'oohs' and 'aahs'; coos responsively",
    soc: "Anticipates feeding; excited with preparation; responds to people differently",
    redFlags: ["No head control by 4m (cannot hold head at 45° prone)", "No cooing by 3m"]
  },
  {
    age: "4m", ageMonths: 4,
    gm: "Head fully steady; rolls front to back; supports on forearms prone",
    fm: "Palmar grasp; transfers midline; reaches for and grasps objects bilaterally",
    lang: "Babbles consonant-vowel chains (baba, gaga); squeals; giggles",
    soc: "Recognises familiar vs strangers; anticipatory excitement; social smile broader",
    redFlags: ["No head control by 4m", "No reaching for objects", "No social smile"]
  },
  {
    age: "6m", ageMonths: 6,
    gm: "Sits with support; rolls both ways (front-to-back + back-to-front); bears weight on legs when held",
    fm: "Raking grasp; transfers hand to hand; bangs toys; mouths objects",
    lang: "Monosyllables (da, ba, ma); babbling continuous; turns to name",
    soc: "Stranger anxiety begins; mirrors facial expressions; laughs at funny faces",
    redFlags: ["No sitting with support by 8m", "No transfer by 7m", "No babbling by 6m"]
  },
  {
    age: "9m", ageMonths: 9,
    gm: "Sits unsupported (6m); creeps/crawls (8–10m); pulls to stand (9–10m)",
    fm: "Inferior pincer grasp (finger-thumb); probes with index finger; releases objects",
    lang: "Dada/mama non-specifically; jargon; waves to familiar sound; understands 'no'",
    soc: "Waves bye-bye; plays peek-a-boo; shows objects; protests toy removal",
    redFlags: ["No sitting unsupported by 9m", "No vocalisation by 9m", "No pincer by 12m"]
  },
  {
    age: "12m", ageMonths: 12,
    gm: "Pulls to stand; cruises furniture; walks with 2 hands held; may walk independently",
    fm: "Fine pincer (tip of finger-thumb); points with index finger; marks paper",
    lang: "1–3 meaningful words (mama/dada/bye specific); jargon; follows simple command",
    soc: "Separation anxiety; gives object on request; imitates clapping; uses spoon messy",
    redFlags: ["No words by 16m", "No walking by 18m", "No pointing by 12m (ASD red flag)"]
  },
  {
    age: "15m", ageMonths: 15,
    gm: "Walks alone; creeps upstairs; throws ball without falling",
    fm: "Scribbles spontaneously; places cube in cup; tower of 2; turns pages in chunks",
    lang: "3–6 words; names 1–2 body parts; jargons; gestures to communicate",
    soc: "Points to want things (proto-imperative); shows joint attention; uses spoon messily",
    redFlags: ["No walking by 18m", "No words by 18m", "No pointing to show interest (ASD red flag)"]
  },
  {
    age: "18m", ageMonths: 18,
    gm: "Runs stiffly; walks upstairs with one hand held; seats self in chair",
    fm: "Tower of 3–4 cubes; turns pages singly; scribbles in circles; holds spoon/crayon",
    lang: "10–25 words; names familiar objects; 2-step commands; vocabulary spurt",
    soc: "Parallel play; imitates housework; uses spoon (messy); drinks from cup; undresses",
    redFlags: ["<10 words at 18m", "No 2-word phrases by 24m", "No pointing/showing by 18m (ASD)"]
  },
  {
    age: "24m", ageMonths: 24,
    gm: "Runs well without falling; jumps with both feet; kicks ball; climbs on/off furniture",
    fm: "Tower of 6–7; circular scribble; imitates vertical stroke; holds pencil in fist",
    lang: "50+ words; 2-word phrases (agent-action); refers to self by name; names pictures",
    soc: "Parallel play (not yet cooperative); uses spoon/fork; toilet training begins; dresses partially",
    redFlags: ["<50 words at 24m", "No 2-word phrases by 24m", "Language regression at any age"]
  },
  {
    age: "30m", ageMonths: 30,
    gm: "Walks upstairs alternating feet; jumps from low step; pedals tricycle (some)",
    fm: "Tower of 8; holds crayon between thumb-fingers; copies horizontal line",
    lang: "2–3 word phrases; 200+ words; uses pronouns (I, me, you); asks simple questions",
    soc: "Begins imaginative play (feeds doll); knows first name; brushes teeth with help",
    redFlags: ["<200 words at 30m", "No 3-word sentences by 36m"]
  },
  {
    age: "36m", ageMonths: 36,
    gm: "Alternating feet upstairs and downstairs; pedals tricycle; broad jumps; balances on 1 foot briefly",
    fm: "Tower of 9–10; copies circle; holds crayon in fingers; imitates cross; cuts with scissors",
    lang: "3-word sentences; 500+ words; strangers understand 75%; asks 'what', 'where' questions",
    soc: "Group play; knows full name, age, gender; helps with dressing; toilet trained day",
    redFlags: ["Strangers cannot understand speech at 36m (<75% intelligibility)", "No pretend play by 36m"]
  },
  {
    age: "48m", ageMonths: 48,
    gm: "Hops on one foot 4+ times; skips; catches bounced ball; balances on 1 foot 5 seconds",
    fm: "Copies cross; draws person with 4 parts (head, body, arms, legs); cuts straight line",
    lang: "Asks 'why' and 'how'; tells stories; 4-5 word sentences; 100% intelligible; counts to 4",
    soc: "Cooperative play; follows rules in games; dresses/undresses with fasteners; wipes after toilet",
    redFlags: ["Cannot hop at 5y", "Not drawing recognisable person", "Cannot follow 3-step instruction"]
  },
  {
    age: "60m", ageMonths: 60,
    gm: "Skips; balances on 1 foot 10 seconds; catches small ball; rides bicycle (some)",
    fm: "Copies square/triangle; draws person with 6+ parts; ties shoelaces; writes name",
    lang: "Fluent speech; reads letters/numbers; counts to 10; tells address; uses past tense correctly",
    soc: "Competitive games with rules; stable friendships; understands fairness; independent in ADLs",
    redFlags: ["Cannot be understood by age 5", "Cannot write own name at 6", "No peer friendships"]
  },
];

const DOMAINS = [
  { key: "all", label: "All Domains", color: "bg-slate-700" },
  { key: "gm", label: "Gross Motor", color: "bg-blue-600" },
  { key: "fm", label: "Fine Motor", color: "bg-green-600" },
  { key: "lang", label: "Language", color: "bg-purple-600" },
  { key: "soc", label: "Social", color: "bg-orange-600" },
  { key: "redFlags", label: "🚩 Red Flags", color: "bg-red-600" },
];

const DOMAIN_COLORS = {
  gm: "bg-blue-50 border-blue-200 text-blue-800",
  fm: "bg-green-50 border-green-200 text-green-800",
  lang: "bg-purple-50 border-purple-200 text-purple-800",
  soc: "bg-orange-50 border-orange-200 text-orange-800",
};

export default function DevMilestoneTable() {
  const [domain, setDomain] = useState("all");
  const [filterAge, setFilterAge] = useState("");

  const filtered = MILESTONES.filter(m =>
    !filterAge || m.ageMonths <= parseInt(filterAge)
  );

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-2.5 bg-cyan-50 border-b border-cyan-100 flex items-center justify-between flex-wrap gap-2">
          <p className="text-sm font-bold text-cyan-900">📋 Developmental Milestones — IAP/WHO (Enhanced)</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Show up to:</span>
            <select value={filterAge} onChange={e => setFilterAge(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white focus:outline-none">
              <option value="">All ages</option>
              {[1, 2, 3, 4, 6, 9, 12, 18, 24, 36, 48, 60].map(a => (
                <option key={a} value={a}>{a === 1 ? "1m" : a < 12 ? `${a}m` : `${a/12}yr (${a}m)`}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Domain filter tabs */}
        <div className="flex gap-1 overflow-x-auto px-3 py-2 bg-slate-50 border-b border-slate-100">
          {DOMAINS.map(d => (
            <button key={d.key} onClick={() => setDomain(d.key)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${domain === d.key ? `${d.color} text-white border-transparent` : "bg-white text-slate-600 border-slate-200"}`}>
              {d.label}
            </button>
          ))}
        </div>

        {/* Table view for all domains */}
        {domain === "all" && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="text-left px-3 py-2 font-bold text-slate-700 min-w-[50px]">Age</th>
                  <th className="text-left px-2 py-2 font-bold text-blue-700 min-w-[140px]">Gross Motor</th>
                  <th className="text-left px-2 py-2 font-bold text-green-700 min-w-[140px]">Fine Motor</th>
                  <th className="text-left px-2 py-2 font-bold text-purple-700 min-w-[140px]">Language</th>
                  <th className="text-left px-2 py-2 font-bold text-orange-700 min-w-[140px]">Social-Adaptive</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                    <td className="px-3 py-2 font-bold text-slate-800">{row.age}</td>
                    <td className="px-2 py-2 text-blue-800">{row.gm}</td>
                    <td className="px-2 py-2 text-green-800">{row.fm}</td>
                    <td className="px-2 py-2 text-purple-800">{row.lang}</td>
                    <td className="px-2 py-2 text-orange-800">{row.soc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Single domain focus card view */}
        {domain !== "all" && (
          <div className="p-3 space-y-2">
            {filtered.map((m, i) => (
              <div key={i} className={`rounded-lg p-3 border text-xs ${domain === "redFlags" ? "bg-red-50 border-red-200" : DOMAIN_COLORS[domain] || "bg-slate-50 border-slate-200"}`}>
                <div className="flex items-start gap-2">
                  <span className="font-black text-slate-700 min-w-[28px] shrink-0">{m.age}</span>
                  <div className="flex-1">
                    {domain === "redFlags" ? (
                      <ul className="space-y-0.5">
                        {m.redFlags?.map((rf, j) => (
                          <li key={j} className="flex items-start gap-1 text-red-800">
                            <span className="font-bold text-red-500 shrink-0">⚠</span>{rf}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span>{m[domain]}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}