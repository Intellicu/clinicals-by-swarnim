import { createContext, useContext, useState } from 'react';

const VisitDataContext = createContext();

export const useVisitData = () => {
  const context = useContext(VisitDataContext);
  if (!context) {
    throw new Error('useVisitData must be used within VisitDataProvider');
  }
  return context;
};

export const VisitDataProvider = ({ children }) => {
  const [sharedData, setSharedData] = useState({
    chiefComplaint: '',
    presentingComplaints: '',
    pastHistory: '',
    familyHistory: '',
    drugHistory: '',
    temperature: '',
    heartRate: '',
    respiratoryRate: '',
    spo2: '',
    bp_systolic: '',
    bp_diastolic: '',
    weight: '',
    height: '',
    bmi: '',
    bsa: '',
    egfr: '',
    ckdStage: '',
    serumCreatinine: '',
    general: '',
    cardiovascular: '',
    respiratory: '',
    abdomen: '',
    nervous: '',
    diagnosis: '',
    plan: '',
    prescriptions: [],
    lab_results: null
  });

  const updateSharedData = (updates) => {
    setSharedData(prev => ({ ...prev, ...updates }));
  };

  const syncFromScribe = (scribeData) => {
    updateSharedData({
      chiefComplaint: scribeData.chiefComplaint || sharedData.chiefComplaint,
      presentingComplaints: scribeData.presentingComplaints || sharedData.presentingComplaints,
      pastHistory: scribeData.pastHistory || sharedData.pastHistory,
      familyHistory: scribeData.familyHistory || sharedData.familyHistory,
      general: scribeData.physical_examination || sharedData.general,
      diagnosis: scribeData.assessment || sharedData.diagnosis,
      plan: scribeData.plan || sharedData.plan
    });
  };

  const syncFromScan = (scanData) => {
    updateSharedData({
      ...scanData
    });
  };

  return (
    <VisitDataContext.Provider value={{ sharedData, updateSharedData, syncFromScribe, syncFromScan }}>
      {children}
    </VisitDataContext.Provider>
  );
};