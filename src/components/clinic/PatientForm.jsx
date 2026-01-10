import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function PatientForm({ initialData, onSuccess }) {
  const [formData, setFormData] = useState({
    cr_number: initialData?.cr_number || "",
    patient_name: initialData?.patient_name || "",
    mobile_number: initialData?.mobile_number || "",
    date_of_birth: initialData?.date_of_birth || "",
    gender: initialData?.gender || "",
    guardian_name: initialData?.guardian_name || "",
    address: initialData?.address || "",
    diagnosis: initialData?.diagnosis || "",
    notes: initialData?.notes || "",
    scanned_file_url: initialData?.file_url || "",
    scanned_file_name: initialData?.file_name || ""
  });
  
  const [errors, setErrors] = useState({});
  const [showAutocomplete, setShowAutocomplete] = useState({ diagnosis: false });

  const { data: recentPatients = [] } = useQuery({
    queryKey: ['recent-patients'],
    queryFn: () => base44.entities.Patient.list('-created_date', 10),
    initialData: []
  });

  const commonDiagnoses = [
    "Nephrotic Syndrome", "AKI", "CKD", "UTI", "Hypertension",
    "IgA Nephropathy", "FSGS", "Lupus Nephritis", "PSGN", "HSP Nephritis"
  ];

  const diagnosisSuggestions = [...new Set([
    ...commonDiagnoses,
    ...recentPatients.map(p => p.diagnosis).filter(Boolean)
  ])];

  const createPatientMutation = useMutation({
    mutationFn: (data) => base44.entities.Patient.create(data),
    onSuccess: () => {
      toast.success("Patient created!");
      onSuccess?.();
    },
    onError: () => toast.error("Failed to create patient")
  });

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.patient_name) newErrors.patient_name = "Required";
    if (!formData.cr_number) newErrors.cr_number = "Required";
    if (formData.mobile_number && !/^\+?[\d\s-]{10,}$/.test(formData.mobile_number)) {
      newErrors.mobile_number = "Invalid format";
    }
    if (formData.date_of_birth && new Date(formData.date_of_birth) > new Date()) {
      newErrors.date_of_birth = "Cannot be in future";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix validation errors");
      return;
    }

    const age = formData.date_of_birth 
      ? new Date().getFullYear() - new Date(formData.date_of_birth).getFullYear()
      : null;

    const showGuardian = age && age < 18;

    createPatientMutation.mutate({
      ...formData,
      age_years: age,
      status: "Active",
      guardian_name: showGuardian ? formData.guardian_name : undefined
    });
  };

  const age = formData.date_of_birth 
    ? new Date().getFullYear() - new Date(formData.date_of_birth).getFullYear()
    : null;
  const isMinor = age && age < 18;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {initialData?.file_url && (
        <Alert className="bg-blue-50 border-blue-200">
          <AlertCircle className="w-4 h-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            Data extracted from scanned document: {initialData.file_name}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>CR Number *</Label>
          <Input
            value={formData.cr_number}
            onChange={(e) => {
              setFormData({...formData, cr_number: e.target.value});
              setErrors({...errors, cr_number: undefined});
            }}
            placeholder="CR001234"
            className={errors.cr_number ? 'border-red-500' : ''}
          />
          {errors.cr_number && <p className="text-xs text-red-600 mt-1">{errors.cr_number}</p>}
        </div>

        <div>
          <Label>Patient Name *</Label>
          <Input
            value={formData.patient_name}
            onChange={(e) => {
              setFormData({...formData, patient_name: e.target.value});
              setErrors({...errors, patient_name: undefined});
            }}
            placeholder="Full name"
            className={errors.patient_name ? 'border-red-500' : ''}
          />
          {errors.patient_name && <p className="text-xs text-red-600 mt-1">{errors.patient_name}</p>}
        </div>

        <div>
          <Label>Date of Birth</Label>
          <Input
            type="date"
            value={formData.date_of_birth}
            onChange={(e) => {
              setFormData({...formData, date_of_birth: e.target.value});
              setErrors({...errors, date_of_birth: undefined});
            }}
            max={new Date().toISOString().split('T')[0]}
            className={errors.date_of_birth ? 'border-red-500' : ''}
          />
          {errors.date_of_birth && <p className="text-xs text-red-600 mt-1">{errors.date_of_birth}</p>}
          {age && <p className="text-xs text-slate-600 mt-1">Age: {age} years</p>}
        </div>

        <div>
          <Label>Gender</Label>
          <Select value={formData.gender} onValueChange={(val) => setFormData({...formData, gender: val})}>
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Mobile Number</Label>
          <Input
            value={formData.mobile_number}
            onChange={(e) => {
              setFormData({...formData, mobile_number: e.target.value});
              setErrors({...errors, mobile_number: undefined});
            }}
            placeholder="+91 98765 43210"
            className={errors.mobile_number ? 'border-red-500' : ''}
          />
          {errors.mobile_number && <p className="text-xs text-red-600 mt-1">{errors.mobile_number}</p>}
        </div>

        {isMinor && (
          <div>
            <Label>Guardian Name {isMinor && '*'}</Label>
            <Input
              value={formData.guardian_name}
              onChange={(e) => setFormData({...formData, guardian_name: e.target.value})}
              placeholder="Parent/guardian"
              required={isMinor}
            />
            {isMinor && <p className="text-xs text-amber-600 mt-1">Required for patients under 18</p>}
          </div>
        )}

        <div className="md:col-span-2">
          <Label>Address</Label>
          <Textarea
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            placeholder="Residential address"
            className="h-20"
          />
        </div>

        <div className="md:col-span-2 relative">
          <Label>Primary Diagnosis</Label>
          <Input
            value={formData.diagnosis}
            onChange={(e) => {
              setFormData({...formData, diagnosis: e.target.value});
              setShowAutocomplete({...showAutocomplete, diagnosis: e.target.value.length > 0});
            }}
            onFocus={() => setShowAutocomplete({...showAutocomplete, diagnosis: true})}
            onBlur={() => setTimeout(() => setShowAutocomplete({...showAutocomplete, diagnosis: false}), 200)}
            placeholder="e.g., Nephrotic Syndrome, AKI"
          />
          {showAutocomplete.diagnosis && formData.diagnosis && (
            <div className="absolute z-10 w-full bg-white border rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
              {diagnosisSuggestions
                .filter(d => d.toLowerCase().includes(formData.diagnosis.toLowerCase()))
                .slice(0, 5)
                .map((suggestion, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setFormData({...formData, diagnosis: suggestion});
                      setShowAutocomplete({...showAutocomplete, diagnosis: false});
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-blue-50 text-sm"
                  >
                    {suggestion}
                  </button>
                ))}
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <Label>Clinical Notes</Label>
          <Textarea
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            placeholder="Additional notes..."
            className="h-24"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={createPatientMutation.isPending}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
      >
        {createPatientMutation.isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Creating...
          </>
        ) : (
          "Create Patient Record"
        )}
      </Button>
    </form>
  );
}