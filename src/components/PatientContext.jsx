import React, { createContext, useContext, useState, useEffect } from 'react';

const PatientContext = createContext();

export const usePatient = () => {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('usePatient must be used within PatientProvider');
  }
  return context;
};

export const PatientProvider = ({ children }) => {
  const [patientData, setPatientData] = useState(() => {
    // Load from localStorage on init
    const saved = localStorage.getItem('clinicalc_patient_data');
    return saved ? JSON.parse(saved) : {
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
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('clinicalc_patient_data', JSON.stringify(patientData));
  }, [patientData]);

  const updatePatientData = (newData) => {
    setPatientData(prev => ({ ...prev, ...newData }));
  };

  const clearPatientData = () => {
    setPatientData({
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
    });
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