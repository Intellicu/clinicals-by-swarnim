import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Calendar, Activity, Stethoscope, Pill } from "lucide-react";
import AINoteSummarizer from "./AINoteSummarizer";

export default function VisitRecordCard({ visit }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const vitals = visit.physical_examination || {};
  const hasVitals = vitals.weight || vitals.height || vitals.bp_systolic;

  return (
    <Card className="bg-white border-2 hover:border-purple-300 transition-all">
      <CardHeader 
        className="cursor-pointer bg-gradient-to-r from-slate-50 to-purple-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span className="font-semibold text-slate-900">
                {new Date(visit.visit_date).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
              <Badge className="bg-purple-100 text-purple-800 text-xs">
                {visit.visit_type}
              </Badge>
            </div>
            
            <p className="text-sm text-slate-700 font-medium">{visit.chief_complaint || 'No complaint recorded'}</p>
            
            {hasVitals && !isExpanded && (
              <div className="flex gap-3 mt-2 text-xs text-slate-600">
                {vitals.weight && <span>Wt: {vitals.weight}kg</span>}
                {vitals.bp_systolic && <span>BP: {vitals.bp_systolic}/{vitals.bp_diastolic}</span>}
              </div>
            )}
          </div>
          
          <Button variant="ghost" size="sm" className="flex-shrink-0">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="p-6 space-y-4">
          {hasVitals && (
            <div className="bg-blue-50 p-4 rounded border border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-blue-600" />
                <h4 className="font-semibold text-blue-900">Vitals</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                {vitals.weight && <div>Weight: <strong>{vitals.weight} kg</strong></div>}
                {vitals.height && <div>Height: <strong>{vitals.height} cm</strong></div>}
                {vitals.bmi && <div>BMI: <strong>{vitals.bmi}</strong></div>}
                {vitals.bp_systolic && (
                  <div>BP: <strong>{vitals.bp_systolic}/{vitals.bp_diastolic} mmHg</strong></div>
                )}
                {vitals.temperature && <div>Temp: <strong>{vitals.temperature}°C</strong></div>}
                {vitals.heart_rate && <div>HR: <strong>{vitals.heart_rate} bpm</strong></div>}
              </div>
            </div>
          )}

          {visit.history && (
            <div>
              <h4 className="font-semibold text-sm mb-2">History</h4>
              <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded">{visit.history}</p>
            </div>
          )}

          {vitals.general_examination && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Stethoscope className="w-4 h-4 text-slate-600" />
                <h4 className="font-semibold text-sm">Examination</h4>
              </div>
              <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded">{vitals.general_examination}</p>
            </div>
          )}

          {visit.diagnosis && (
            <div className="bg-amber-50 p-4 rounded border border-amber-200">
              <h4 className="font-semibold text-sm text-amber-900 mb-2">Diagnosis</h4>
              <p className="text-sm text-slate-800">{visit.diagnosis}</p>
            </div>
          )}

          {visit.treatment_plan && (
            <div>
              <h4 className="font-semibold text-sm mb-2">Treatment Plan</h4>
              <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded whitespace-pre-wrap">
                {visit.treatment_plan}
              </p>
            </div>
          )}

          {visit.prescriptions && visit.prescriptions.length > 0 && (
            <div className="bg-green-50 p-4 rounded border border-green-200">
              <div className="flex items-center gap-2 mb-3">
                <Pill className="w-4 h-4 text-green-600" />
                <h4 className="font-semibold text-sm text-green-900">Prescriptions</h4>
              </div>
              <div className="space-y-2">
                {visit.prescriptions.map((rx, idx) => (
                  <div key={idx} className="text-sm bg-white p-2 rounded">
                    <strong>{rx.drug_name}</strong> - {rx.dose} {rx.frequency} for {rx.duration}
                  </div>
                ))}
              </div>
            </div>
          )}

          {visit.follow_up_date && (
            <div className="text-sm text-slate-600">
              <strong>Next Follow-up:</strong> {new Date(visit.follow_up_date).toLocaleDateString()}
            </div>
          )}

          {(visit.history || visit.treatment_plan || visit.diagnosis) && (
            <div className="mt-4">
              <AINoteSummarizer
                visitId={visit.id}
                clinicalNotes={`
                  Chief Complaint: ${visit.chief_complaint || 'N/A'}
                  History: ${visit.history || 'N/A'}
                  Diagnosis: ${visit.diagnosis || 'N/A'}
                  Treatment Plan: ${visit.treatment_plan || 'N/A'}
                  Notes: ${visit.clinician_notes || 'N/A'}
                `}
              />
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}