import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowLeft, FileText, Calendar, Phone, User, Download, Eye } from "lucide-react";

export default function PatientHistory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("created_date");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [diagnosisFilter, setDiagnosisFilter] = useState("");

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ['all-patients'],
    queryFn: () => base44.entities.Patient.list(`-${sortBy}`),
    initialData: []
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['all-documents'],
    queryFn: () => base44.entities.PatientDocument.list('-created_date'),
    initialData: []
  });

  const { data: visits = [] } = useQuery({
    queryKey: ['all-visits'],
    queryFn: () => base44.entities.VisitRecord.list('-visit_date'),
    initialData: []
  });

  // Get unique diagnoses for filter
  const uniqueDiagnoses = [...new Set(patients.map(p => p.diagnosis).filter(Boolean))];

  const filteredPatients = patients.filter(p => {
    const matchesSearch = 
      p.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.cr_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.date_of_birth?.includes(searchQuery) ||
      p.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.mobile_number?.includes(searchQuery);
    
    const createdDate = new Date(p.created_date);
    const matchesDateRange = 
      (!dateFrom || createdDate >= new Date(dateFrom)) &&
      (!dateTo || createdDate <= new Date(dateTo));
    
    const matchesDiagnosis = !diagnosisFilter || p.diagnosis === diagnosisFilter;
    
    return matchesSearch && matchesDateRange && matchesDiagnosis;
  }).sort((a, b) => {
    if (sortBy === "created_date") {
      return new Date(b.created_date) - new Date(a.created_date);
    } else if (sortBy === "patient_name") {
      return (a.patient_name || "").localeCompare(b.patient_name || "");
    } else if (sortBy === "cr_number") {
      return (a.cr_number || "").localeCompare(b.cr_number || "");
    } else if (sortBy === "last_visit") {
      const lastVisitA = visits.filter(v => v.patient_id === a.id)[0];
      const lastVisitB = visits.filter(v => v.patient_id === b.id)[0];
      if (!lastVisitA) return 1;
      if (!lastVisitB) return -1;
      return new Date(lastVisitB.visit_date) - new Date(lastVisitA.visit_date);
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <Link to={createPageUrl("ClinicManagement")}>
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Clinic
          </Button>
        </Link>

        <Card className="bg-white shadow-lg mb-6">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-600" />
              Patient History & Search
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <div className="md:col-span-2">
                <Input
                  placeholder="Search by name, CR#, mobile, DOB, diagnosis..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_date">Latest First</SelectItem>
                    <SelectItem value="last_visit">Last Visit Date</SelectItem>
                    <SelectItem value="patient_name">Name A-Z</SelectItem>
                    <SelectItem value="cr_number">CR Number</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={diagnosisFilter} onValueChange={setDiagnosisFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by diagnosis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>All Diagnoses</SelectItem>
                    {uniqueDiagnoses.map(dx => (
                      <SelectItem key={dx} value={dx}>{dx}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-xs text-slate-600 mb-1 block">Date From</label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-slate-600 mb-1 block">Date To</label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-slate-600">
              <span>Found: <strong>{filteredPatients.length}</strong> patients</span>
              <span>Total Documents: <strong>{documents.length}</strong></span>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {filteredPatients.map((patient) => {
            const patientDocs = documents.filter(d => d.patient_id === patient.id);
            const patientVisits = visits.filter(v => v.patient_id === patient.id);
            const lastVisit = patientVisits[0];
            return (
              <Card key={patient.id} className="bg-white hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-slate-900">{patient.patient_name}</h3>
                        <Badge variant="outline">CR# {patient.cr_number}</Badge>
                        {patient.age_years && <Badge variant="outline">{patient.age_years}y</Badge>}
                        <Badge className={patient.status === 'Active' ? 'bg-green-600' : 'bg-slate-500'}>
                          {patient.status}
                        </Badge>
                      </div>
                      <div className="grid md:grid-cols-3 gap-2 text-sm text-slate-600">
                        {patient.mobile_number && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {patient.mobile_number}
                          </div>
                        )}
                        {patient.diagnosis && (
                          <div className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {patient.diagnosis}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Added: {new Date(patient.created_date).toLocaleDateString()}
                        </div>
                        {lastVisit && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-green-600" />
                            Last Visit: {new Date(lastVisit.visit_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      {patientVisits.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {patientVisits.length} visit(s)
                        </Badge>
                      )}
                      {patientDocs.length > 0 && (
                        <div className="mt-2 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span className="text-xs text-blue-700 font-semibold">
                            {patientDocs.length} document(s) attached
                          </span>
                          {patientDocs.slice(0, 3).map((doc) => (
                            <button
                              key={doc.id}
                              onClick={() => window.open(doc.file_url, '_blank')}
                              className="text-xs bg-blue-50 px-2 py-1 rounded border border-blue-200 hover:bg-blue-100"
                            >
                              <Eye className="w-3 h-3 inline mr-1" />
                              {doc.document_type}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <Link to={createPageUrl("ClinicManagement")}>
                      <Button size="sm">View Details</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}