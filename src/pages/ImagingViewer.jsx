import React, { useState, useEffect } from 'react';
import DICOMImageViewer from '@/components/imaging/DICOMImageViewer';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { Search, User } from "lucide-react";
import { toast } from "sonner";

export default function ImagingViewer() {
  const [patientId, setPatientId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);

  const urlParams = new URLSearchParams(window.location.search);
  const preloadedId = urlParams.get('patient_id');
  const preloadedName = urlParams.get('patient_name');

  React.useEffect(() => {
    if (preloadedId) { setPatientId(preloadedId); setPatientName(preloadedName || ''); }
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const pts = await base44.entities.Patient.list('-created_date', 20);
      const filtered = pts.filter(p =>
        (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.uhid || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
      setResults(filtered);
    } catch {
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Badge className="bg-blue-600 text-white text-xs">DICOM</Badge>
          Medical Image Viewer
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">Upload, view, and annotate renal ultrasounds, biopsy slides, and other imaging</p>
      </div>

      {!patientId ? (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-4">
          <p className="text-sm font-semibold text-slate-700 mb-3">Search Patient</p>
          <div className="flex gap-2">
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Patient name or UHID..."
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={searching} className="bg-blue-600 hover:bg-blue-700">
              <Search className="w-4 h-4 mr-1" /> Search
            </Button>
          </div>

          {results.length > 0 && (
            <div className="mt-3 space-y-2">
              {results.map(p => (
                <button
                  key={p.id}
                  className="w-full text-left flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  onClick={() => { setPatientId(p.id); setPatientName(p.name); }}
                >
                  <User className="w-8 h-8 p-1.5 bg-slate-100 rounded-full text-slate-600" />
                  <div>
                    <p className="font-semibold text-sm text-slate-800">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.uhid && `UHID: ${p.uhid}`} {p.age && `· Age: ${p.age}y`}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="mt-4 border-t pt-4">
            <p className="text-xs text-slate-500 mb-2">Or open viewer without patient context:</p>
            <Button variant="outline" size="sm" onClick={() => setPatientId('anonymous')}>
              Open Anonymous Viewer
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-800">{patientName || 'Patient'}</Badge>
            <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => { setPatientId(''); setPatientName(''); setResults([]); }}>
              Change Patient
            </Button>
          </div>
          <DICOMImageViewer patientId={patientId === 'anonymous' ? null : patientId} patientName={patientName} />
        </div>
      )}
    </div>
  );
}