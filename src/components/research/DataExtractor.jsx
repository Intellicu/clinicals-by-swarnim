import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import {
  Database, CheckCircle2, AlertCircle, RefreshCw, Eye, FileText,
  User, Activity, TestTube, Pill, Calendar, Loader2, Info
} from 'lucide-react';

export default function DataExtractor({ patientId, researchForm, onDataExtracted }) {
  const [extractedData, setExtractedData] = useState({});
  const [isExtracting, setIsExtracting] = useState(false);
  const [confirmationRequired, setConfirmationRequired] = useState([]);

  const { data: patient } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => base44.entities.Patient.filter({ id: patientId }).then(res => res[0]),
    enabled: !!patientId
  });

  const { data: visits = [] } = useQuery({
    queryKey: ['visits', patientId],
    queryFn: () => base44.entities.VisitRecord.filter({ patient_id: patientId }),
    enabled: !!patientId
  });

  const extractClinicalData = async () => {
    setIsExtracting(true);
    const extracted = {};
    const needsConfirmation = [];

    try {
      for (const section of researchForm.sections) {
        for (const field of section.fields) {
          if (field.auto_extract && field.clinical_source && field.clinical_field) {
            let value = null;
            let source = null;
            let confidence = 'high';

            switch (field.clinical_source) {
              case 'demographics':
                value = extractDemographics(field.clinical_field);
                source = 'Patient Record';
                break;
              
              case 'diagnosis':
                value = extractDiagnosis(field.clinical_field);
                source = 'Clinical Records';
                break;
              
              case 'vitals':
                value = extractVitals(field.clinical_field);
                source = 'Latest Visit';
                confidence = 'medium';
                break;
              
              case 'labs':
                value = extractLabs(field.clinical_field);
                source = 'Recent Lab Results';
                confidence = 'medium';
                break;
              
              case 'medications':
                value = extractMedications(field.clinical_field);
                source = 'Prescription History';
                break;
              
              case 'visits':
                value = extractVisitData(field.clinical_field);
                source = 'Visit Timeline';
                break;
            }

            extracted[field.id] = {
              fieldLabel: field.label,
              value,
              source,
              confidence,
              autoExtracted: true,
              timestamp: new Date().toISOString()
            };

            if (confidence === 'medium' || confidence === 'low') {
              needsConfirmation.push(field.id);
            }
          }
        }
      }

      setExtractedData(extracted);
      setConfirmationRequired(needsConfirmation);
    } catch (error) {
      console.error('Extraction error:', error);
    } finally {
      setIsExtracting(false);
    }
  };

  const extractDemographics = (fieldName) => {
    if (!patient) return null;

    switch (fieldName) {
      case 'age':
        return patient.age_years;
      case 'gender':
        return patient.gender;
      case 'dob':
        return patient.date_of_birth;
      case 'weight':
        return patient.baseline_vitals?.weight;
      case 'height':
        return patient.baseline_vitals?.height;
      case 'bmi':
        return patient.baseline_vitals?.bmi;
      default:
        return null;
    }
  };

  const extractDiagnosis = (fieldName) => {
    if (!patient) return null;

    switch (fieldName) {
      case 'primary_diagnosis':
        return patient.diagnosis;
      case 'comorbidities':
        return patient.comorbidities?.join(', ');
      default:
        return null;
    }
  };

  const extractVitals = (fieldName) => {
    if (visits.length === 0) return null;

    const latestVisit = visits.sort((a, b) => 
      new Date(b.visit_date) - new Date(a.visit_date)
    )[0];

    const vitals = latestVisit.physical_examination;
    if (!vitals) return null;

    switch (fieldName) {
      case 'bp_systolic':
        return vitals.bp_systolic;
      case 'bp_diastolic':
        return vitals.bp_diastolic;
      case 'heart_rate':
        return vitals.heart_rate;
      case 'temperature':
        return vitals.temperature;
      default:
        return null;
    }
  };

  const extractLabs = (fieldName) => {
    if (visits.length === 0) return null;

    const latestVisit = visits.sort((a, b) => 
      new Date(b.visit_date) - new Date(a.visit_date)
    )[0];

    const labs = latestVisit.lab_results;
    if (!labs) return null;

    return labs[fieldName] || null;
  };

  const extractMedications = (fieldName) => {
    if (!patient) return null;

    switch (fieldName) {
      case 'current_medications':
        return patient.current_medications?.join(', ');
      default:
        return null;
    }
  };

  const extractVisitData = (fieldName) => {
    if (visits.length === 0) return null;

    switch (fieldName) {
      case 'last_visit_date':
        return visits.sort((a, b) => 
          new Date(b.visit_date) - new Date(a.visit_date)
        )[0]?.visit_date;
      case 'visit_count':
        return visits.length;
      default:
        return null;
    }
  };

  const handleConfirm = () => {
    onDataExtracted(extractedData);
  };

  const renderExtractedValue = (fieldId, data) => {
    if (!data) return <span className="text-slate-400 italic">No data found</span>;

    const confidenceColors = {
      high: 'bg-green-100 text-green-800 border-green-300',
      medium: 'bg-amber-100 text-amber-800 border-amber-300',
      low: 'bg-red-100 text-red-800 border-red-300'
    };

    const needsConfirm = confirmationRequired.includes(fieldId);

    return (
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="font-semibold text-slate-900">{data.value || 'N/A'}</div>
          <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
            <FileText className="w-3 h-3" />
            {data.source}
          </div>
        </div>
        <Badge className={`${confidenceColors[data.confidence]} border`}>
          {data.confidence} confidence
        </Badge>
        {needsConfirm && (
          <AlertCircle className="w-5 h-5 text-amber-600" />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" />
              Clinical Data Auto-Extraction
            </CardTitle>
            <Button
              onClick={extractClinicalData}
              disabled={isExtracting || !patient}
              className="bg-blue-600"
            >
              {isExtracting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Extracting...</>
              ) : (
                <><RefreshCw className="w-4 h-4 mr-2" /> Extract Data</>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {!patient && (
            <Alert>
              <User className="w-4 h-4" />
              <AlertDescription>
                No patient selected. Please select a patient to extract clinical data.
              </AlertDescription>
            </Alert>
          )}

          {patient && Object.keys(extractedData).length === 0 && !isExtracting && (
            <Alert>
              <Info className="w-4 h-4" />
              <AlertDescription>
                Click "Extract Data" to automatically populate research form fields from clinical records.
              </AlertDescription>
            </Alert>
          )}

          {Object.keys(extractedData).length > 0 && (
            <div className="space-y-6">
              {confirmationRequired.length > 0 && (
                <Alert className="bg-amber-50 border-amber-300">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    <strong>{confirmationRequired.length} field(s)</strong> require manual confirmation due to medium/low confidence.
                  </AlertDescription>
                </Alert>
              )}

              {researchForm.sections.map(section => {
                const sectionFields = section.fields.filter(f => extractedData[f.id]);
                if (sectionFields.length === 0) return null;

                return (
                  <div key={section.id}>
                    <h3 className="font-semibold text-slate-900 mb-4 pb-2 border-b">{section.name}</h3>
                    <div className="space-y-4">
                      {sectionFields.map(field => (
                        <div key={field.id} className="bg-slate-50 p-4 rounded-lg">
                          <div className="text-sm font-medium text-slate-700 mb-2">{field.label}</div>
                          {renderExtractedValue(field.id, extractedData[field.id])}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              <div className="flex gap-3 pt-4 border-t">
                <Button onClick={handleConfirm} className="bg-green-600 hover:bg-green-700">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Confirm & Use Data
                </Button>
                <Button variant="outline" onClick={extractClinicalData}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Re-Extract
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}