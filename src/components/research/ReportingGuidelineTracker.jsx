import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, ChevronDown, ChevronRight, ExternalLink, AlertTriangle } from "lucide-react";
import { REPORTING_CHECKLISTS, STUDY_TYPES } from "@/lib/AdaptiveMethodologyEngine";

const GUIDELINE_LINKS = {
  STROBE: "https://www.strobe-statement.org",
  CONSORT: "https://www.consort-statement.org",
  "PRISMA 2020": "https://www.prisma-statement.org",
  STARD: "https://www.stard-statement.org",
  TRIPOD: "https://www.tripod-statement.org",
  COREQ: "https://www.equator-network.org/reporting-guidelines/coreq/",
};

export default function ReportingGuidelineTracker({ studyTypeId, projectChecklist, onChecklistUpdate }) {
  const typeData = STUDY_TYPES[studyTypeId];
  const guidelineName = typeData?.reporting;
  const checklist = REPORTING_CHECKLISTS[guidelineName];

  const [checked, setChecked] = useState(projectChecklist || {});
  const [openSections, setOpenSections] = useState({});

  if (!typeData || !checklist) {
    return (
      <div className="p-4 text-sm text-slate-500 text-center">
        <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
        Select a study type to see the appropriate reporting guideline checklist.
      </div>
    );
  }

  const totalItems = checklist.sections.flatMap(s => s.items).length;
  const checkedCount = Object.values(checked).filter(Boolean).length;
  const compliance = Math.round((checkedCount / totalItems) * 100);

  const toggle = (key) => {
    const updated = { ...checked, [key]: !checked[key] };
    setChecked(updated);
    onChecklistUpdate?.(updated);
  };

  const complianceColor = compliance >= 80 ? "text-green-600" : compliance >= 50 ? "text-amber-600" : "text-red-500";
  const complianceBg = compliance >= 80 ? "bg-green-500" : compliance >= 50 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className={`border-2 ${typeData.border}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge className={typeData.color}>{typeData.shortLabel}</Badge>
                <span className="text-sm font-bold text-slate-800">→</span>
                <Badge className="bg-indigo-100 text-indigo-800 font-bold">{checklist.name}</Badge>
                <Badge variant="outline">{checklist.totalItems} items</Badge>
              </div>
              <p className="text-xs text-slate-500">Mandatory reporting checklist for this study type</p>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${complianceColor}`}>{compliance}%</div>
              <div className="text-xs text-slate-500">compliant ({checkedCount}/{totalItems})</div>
            </div>
          </div>

          <Progress value={compliance} className="h-2 mt-3" style={{
            "--tw-bg-opacity": 1,
          }} />

          {compliance < 80 && (
            <div className="mt-2 p-2 bg-amber-50 rounded-lg">
              <p className="text-xs text-amber-700">
                <AlertTriangle className="w-3 h-3 inline mr-1" />
                {100 - compliance}% of checklist items incomplete. Most journals require ≥80% compliance before peer review.
              </p>
            </div>
          )}

          {GUIDELINE_LINKS[guidelineName] && (
            <a href={GUIDELINE_LINKS[guidelineName]} target="_blank" rel="noreferrer"
              className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-2">
              Official {checklist.name} website <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </CardContent>
      </Card>

      {/* Checklist sections */}
      <div className="space-y-2">
        {checklist.sections.map((section, si) => {
          const sectionChecked = section.items.filter((_, ii) => checked[`${si}-${ii}`]).length;
          const isOpen = openSections[si];

          return (
            <Card key={si} className="border">
              <button
                className="w-full flex items-center justify-between p-3 hover:bg-slate-50 transition-colors"
                onClick={() => setOpenSections(s => ({ ...s, [si]: !s[si] }))}
              >
                <div className="flex items-center gap-2">
                  {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                  <span className="text-sm font-medium text-slate-800">{section.section}</span>
                  {sectionChecked === section.items.length && (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">{sectionChecked}/{section.items.length}</span>
                  <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${sectionChecked === section.items.length ? "bg-green-500" : "bg-indigo-500"}`}
                      style={{ width: `${(sectionChecked / section.items.length) * 100}%` }}
                    />
                  </div>
                </div>
              </button>

              {isOpen && (
                <CardContent className="pt-0 px-3 pb-3">
                  <div className="space-y-2">
                    {section.items.map((item, ii) => {
                      const key = `${si}-${ii}`;
                      const isChecked = !!checked[key];
                      return (
                        <button key={ii} onClick={() => toggle(key)}
                          className={`w-full flex items-start gap-2 p-2 rounded-lg text-left transition-colors hover:bg-slate-50 ${isChecked ? "bg-green-50" : ""}`}>
                          {isChecked
                            ? <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                            : <Circle className="w-4 h-4 text-slate-300 mt-0.5 shrink-0" />
                          }
                          <span className={`text-xs ${isChecked ? "text-green-800 line-through" : "text-slate-700"}`}>{item}</span>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}