import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Phone, Hash, Calendar } from "lucide-react";
import { useQueryClient } from '@tanstack/react-query';
import PullToRefresh from '../PullToRefresh';

export default function PatientList({ patients, selectedPatient, onSelect }) {
  const queryClient = useQueryClient();
  
  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['patients'] });
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {patients.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <User className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p className="text-sm">No patients found</p>
          </div>
        ) : (
          patients.map((patient) => (
            <Card
              key={patient.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedPatient?.id === patient.id 
                  ? 'bg-purple-50 border-2 border-purple-400' 
                  : 'bg-white border hover:border-purple-300'
              }`}
              onClick={() => onSelect(patient)}
            >
              <CardContent className="p-3">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-slate-900">{patient.patient_name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Hash className="w-3 h-3 text-slate-500" />
                      <span className="text-xs text-slate-600">{patient.cr_number}</span>
                    </div>
                  </div>
                  <Badge className={`${
                    patient.status === 'Active' ? 'bg-green-100 text-green-800' :
                    patient.status === 'Follow-up' ? 'bg-blue-100 text-blue-800' :
                    patient.status === 'Discharged' ? 'bg-slate-100 text-slate-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {patient.status}
                  </Badge>
                </div>
                
                <div className="space-y-1 text-xs text-slate-600">
                  {patient.mobile_number && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3" />
                      {patient.mobile_number}
                    </div>
                  )}
                  {patient.age_years && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      {patient.age_years} years {patient.gender && `• ${patient.gender}`}
                    </div>
                  )}
                  {patient.diagnosis && (
                    <div className="text-slate-700 font-medium mt-1">
                      {patient.diagnosis}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </PullToRefresh>
  );
}