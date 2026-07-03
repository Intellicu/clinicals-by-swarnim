import React, { createContext, useContext, useState, useEffect } from 'react';

const PatientContext = createContext();

export const usePatient = () => {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('usePatient must be used within PatientProvider');
  }
  return context;
};

const EMPTY_PATIENT = {
  weight: '',
  height: '',
  age: '',
  dateOfBirth: '',
  gender: '',
  serumCreatinine: '',
  serumSodium: '',
  serumPotassium: '',
  serumCalcium: '',
  serumPhosphate: '',
  hemoglobin: '',
  albumin: '',
  urineProtein: '',
  urineCreatinine: '',
  systolicBP: '',
  diastolicBP: ''
};

export const PatientProvider = ({ children }) => {
  const [patientData, setPatientData] = useState(() => {
    // Corrupt localStorage must never take down the whole app — this provider wraps everything
    try {
      const saved = localStorage.getItem('clinicalc_patient_data');
      const parsed = saved ? JSON.parse(saved) : null;
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return { ...EMPTY_PATIENT, ...parsed };
      }
    } catch {
      localStorage.removeItem('clinicalc_patient_data');
    }
    return EMPTY_PATIENT;
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('clinicalc_patient_data', JSON.stringify(patientData));
  }, [patientData]);

  const updatePatientData = (newData) => {
    setPatientData(prev => ({ ...prev, ...newData }));
  };

  const clearPatientData = () => {
    setPatientData({ ...EMPTY_PATIENT });
    localStorage.removeItem('clinicalc_patient_data');
  };

  const value = {
    patientData,
    updatePatientData,
    clearPatientData
  };

  return (
    <PatientContext.Provider value={value}>
      {children}
    </PatientContext.Provider>
  );
};