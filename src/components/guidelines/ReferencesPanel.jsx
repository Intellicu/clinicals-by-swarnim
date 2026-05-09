import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen, ExternalLink, Award, Calendar, Building2,
  CheckCircle, ChevronDown, ChevronUp, Shield, FileText,
  Users, Tag, Hash
} from "lucide-react";

// ── Color helpers ──────────────────────────────────────────────────────────
function gradeColor(grade) {
  if (!grade) return "bg-slate-100 text-slate-600 border-slate-200";
  const g = String(grade).toUpperCase();
  if (g === "A" || g.includes("HIGH") || g.includes("STRONG")) return "bg-green-100 text-green-800 border-green-300";
  if (g === "B" || g.includes("MODERATE")) return "bg-blue-100 text-blue-800 border-blue-300";
  if (g === "C" || g.includes("LOW") || g.includes("WEAK")) return "bg-amber-100 text-amber-800 border-amber-300";
  if (g === "D" || g.includes("EXPERT")) return "bg-slate-100 text-slate-600 border-slate-200";
  return "bg-slate-100 text-slate-600 border-slate-200";
}

function sourceBg(source) {
  if (!source) return "bg-slate-600";
  const s = String(source).toUpperCase();
  if (s.includes("KDIGO")) return "bg-blue-700";
  if (s.includes("IPNA")) return "bg-purple-700";
  if (s.includes("ESPN")) return "bg-indigo-700";
  if (s.includes("ISPD")) return "bg-cyan-700";
  if (s.includes("IAP") || s.includes("AAP")) return "bg-green-700";
  if (s.includes("EULAR") || s.includes("SHARE")) return "bg-rose-700";
  if (s.includes("ISKDC")) return "bg-orange-700";
  if (s.includes("WHO")) return "bg-teal-700";
  if (s.includes("ERKNET") || s.includes("ERKNet")) return "bg-violet-700";
  if (s.includes("NICE")) return "bg-emerald-700";
  if (s.includes("EAU")) return "bg-cyan-800";
  if (s.includes("ACR")) return "bg-red-700";
  return "bg-slate-600";
}

// ── Structured citation card (new format from built-in guidelines) ─────────
function StructuredCitationCard({ citation: r, index }) {
  const [open, setOpen] = useState(false);
  const sourceKey = r.guideline_body || r.authors?.split(" ")[0] || "REF";

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white mb-2.5 shadow-sm">
      <button
        className="w-full flex items-start gap-3 p-3 text-left hover:bg-slate-50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        {/* Index badge */}
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-indigo-600 text-white text-xs font-bold">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-1 mb-1">
            {r.guideline_body && (
              <Badge className={`text-xs text-white border-0 ${sourceBg(r.guideline_body)}`}>{r.guideline_body}</Badge>
            )}
            {r.year && <Badge variant="outline" className="text-xs">{r.year}</Badge>}
            {r.evidence_grade && (
              <Badge className={`text-xs border ${gradeColor(r.evidence_grade)}`}>
                Grade {r.evidence_grade}
              </Badge>
            )}
            {r.type && (
              <Badge className="text-xs bg-slate-100 text-slate-700 border border-slate-200">{r.type}</Badge>
            )}
          </div>
          {/* Citation text */}
          <p className="text-sm font-medium text-slate-800 leading-snug line-clamp-2">{r.citation}</p>
          {/* Journal in secondary line */}
          {r.journal && (
            <p className="text-xs text-slate-500 mt-0.5 truncate italic">{r.journal}{r.volume ? ` ${r.volume}` : ""}{r.pages ? `, pp. ${r.pages}` : ""}</p>
          )}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />}
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-slate-100 pt-3 bg-slate-50/60 space-y-3">
          {/* Authors */}
          {r.authors && (
            <div className="flex items-start gap-2">
              <Users className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-700">{r.authors}</p>
            </div>
          )}

          {/* Key recommendation */}
          {r.key_recommendation && (
            <div className="p-2.5 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-xs font-bold text-green-700 mb-1 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />Key Recommendation
              </p>
              <p className="text-xs text-green-800 leading-relaxed">{r.key_recommendation}</p>
            </div>
          )}

          {/* IDs row */}
          <div className="flex flex-wrap gap-2">
            {r.doi && (
              <a
                href={r.doi.startsWith("http") ? r.doi : `https://doi.org/${r.doi}`}
                target="_blank" rel="noreferrer"
              >
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1 border-blue-300 text-blue-700 hover:bg-blue-50">
                  <ExternalLink className="w-3 h-3" />DOI
                </Button>
              </a>
            )}
            {r.pmid && (
              <a
                href={`https://pubmed.ncbi.nlm.nih.gov/${r.pmid}`}
                target="_blank" rel="noreferrer"
              >
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1 border-green-300 text-green-700 hover:bg-green-50">
                  <Hash className="w-3 h-3" />PubMed {r.pmid}
                </Button>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Legacy citation card (old DB format with .title / .organization) ──────
function LegacyCitationCard({ citation, compact = false }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border border-slate-200 rounded-xl overflow-hidden bg-white ${compact ? "mb-1.5" : "mb-3"}`}>
      <button
        className="w-full flex items-start gap-3 p-3 text-left hover:bg-slate-50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${sourceBg(citation.organization)}`}>
          <BookOpen className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
            <Badge className={`text-xs ${sourceBg(citation.organization)} text-white border-0`}>
              {citation.organization || citation.source || "Source"}
            </Badge>
            {citation.year && <Badge variant="outline" className="text-xs">{citation.year}</Badge>}
            {citation.evidence_grade && (
              <Badge className={`text-xs border ${gradeColor(citation.evidence_grade)}`}>Grade {citation.evidence_grade}</Badge>
            )}
          </div>
          <p className={`font-semibold text-slate-800 leading-snug ${compact ? "text-xs" : "text-sm"}`}>
            {citation.title || citation.name}
          </p>
          {citation.publication && (
            <p className="text-xs text-slate-500 mt-0.5 truncate">{citation.publication}</p>
          )}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />}
      </button>
      {open && (
        <div className="px-4 pb-3 space-y-2 border-t border-slate-100 pt-2 bg-slate-50/50">
          {citation.summary && <p className="text-xs text-slate-700 leading-relaxed">{citation.summary}</p>}
          {citation.key_recommendations?.length > 0 && (
            <ul className="space-y-1">
              {citation.key_recommendations.slice(0, 4).map((rec, i) => (
                <li key={i} className="text-xs text-slate-700 flex items-start gap-1.5">
                  <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{rec}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-wrap gap-2">
            {citation.doi_url && (
              <a href={citation.doi_url} target="_blank" rel="noreferrer">
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1 border-blue-300 text-blue-700 hover:bg-blue-50">
                  <ExternalLink className="w-3 h-3" />DOI / Full Text
                </Button>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Evidence attribution row ───────────────────────────────────────────────
function EvidenceAttributionRow({ guideline }) {
  return (
    <div className="flex flex-wrap gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl">
      <Shield className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-blue-800 mb-1">Evidence Attribution</p>
        <p className="text-xs text-blue-700 leading-relaxed">
          {guideline.source && <><strong>{guideline.source}</strong> {guideline.year && `${guideline.year} `}</>}
          {guideline.evidence_level && `· ${guideline.evidence_level}`}
          {guideline.last_reviewed && ` · Last reviewed: ${guideline.last_reviewed}`}
        </p>
        {(guideline.external_link || guideline.doi_url) && (
          <a href={guideline.external_link || guideline.doi_url} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-1">
            <ExternalLink className="w-3 h-3" />View source guideline
          </a>
        )}
      </div>
    </div>
  );
}

// ── Source metadata grid ───────────────────────────────────────────────────
function SourceMetadata({ guideline }) {
  const fields = [
    { label: "Organization", value: guideline.source, icon: Building2 },
    { label: "Year", value: guideline.year, icon: Calendar },
    { label: "Evidence Level", value: guideline.evidence_level, icon: Award },
    { label: "Category", value: guideline.category, icon: FileText },
    { label: "Last Reviewed", value: guideline.last_reviewed, icon: Calendar },
  ].filter(f => f.value);
  if (fields.length === 0) return null;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
      {fields.map(({ label, value, icon: Icon }) => (
        <div key={label} className="p-2.5 bg-white border border-slate-200 rounded-lg">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Icon className="w-3.5 h-3.5 text-slate-400" />
            <p className="text-xs text-slate-400 font-medium">{label}</p>
          </div>
          <p className="text-sm font-semibold text-slate-800 leading-snug">{String(value)}</p>
        </div>
      ))}
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────
export default function ReferencesPanel({ guideline, citations, compact = false }) {
  // Priority: explicit prop > guideline.references (new structured) > guideline.sections.references (legacy)
  const structuredRefs = guideline?.references; // new format — array with .citation/.doi/.pmid
  const legacyRefs = citations || guideline?.sections?.references;

  const hasStructured = Array.isArray(structuredRefs) && structuredRefs.length > 0;
  const hasLegacy = Array.isArray(legacyRefs) && legacyRefs.length > 0;

  return (
    <div className={`space-y-${compact ? "3" : "4"} w-full`}>
      <SourceMetadata guideline={guideline} />
      <EvidenceAttributionRow guideline={guideline} />

      {/* New structured references (built-in guidelines) */}
      {hasStructured && (
        <div>
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-2 mb-3">
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            Academic Citations & Evidence Base ({structuredRefs.length})
          </p>
          {structuredRefs.map((r, i) => (
            <StructuredCitationCard key={r.id || i} citation={r} index={i} />
          ))}
        </div>
      )}

      {/* Legacy citations (DB guidelines) */}
      {!hasStructured && hasLegacy && (
        <div>
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-2 mb-2">
            <BookOpen className="w-3.5 h-3.5 text-slate-500" />
            Citations & References ({legacyRefs.length})
          </p>
          {legacyRefs.map((c, i) => (
            <LegacyCitationCard key={i} citation={c} compact={compact} />
          ))}
        </div>
      )}

      {/* Fallback when no citations present */}
      {!hasStructured && !hasLegacy && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
          <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-600 mb-1">References from authoritative sources</p>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
            This guideline is sourced from <strong>{guideline.source || "established guidelines"}</strong> ({guideline.year || "recent"}).
            {guideline.external_link && (
              <> <a href={guideline.external_link} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">View the full source document →</a></>
            )}
          </p>
          <div className="mt-3 text-left p-3 bg-white border border-slate-200 rounded-lg">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Primary Citation</p>
            <p className="text-xs text-slate-700 leading-relaxed italic">
              "{guideline.title}." {guideline.source}{guideline.year ? `, ${guideline.year}` : ""}.
              {guideline.evidence_level ? ` Evidence: ${guideline.evidence_level}.` : ""}
              {guideline.external_link ? ` Available at: ${guideline.external_link}` : ""}
            </p>
          </div>
        </div>
      )}

      {/* Last reviewed footer */}
      {guideline.last_reviewed && (
        <div className="flex items-center gap-2 p-2.5 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
          <p className="text-xs text-green-800">
            <strong>Last reviewed:</strong> {guideline.last_reviewed}
            {guideline.source && <> · Source: <strong>{guideline.source}</strong></>}
          </p>
        </div>
      )}
    </div>
  );
}