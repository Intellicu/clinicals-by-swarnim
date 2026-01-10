import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Upload, Download, Eye, Trash2, Loader2, Search, Edit } from "lucide-react";
import { toast } from "sonner";

export default function DocumentManager({ patientId }) {
  const [uploadDialog, setUploadDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [filterType, setFilterType] = useState("All");
  const [filterTag, setFilterTag] = useState("");
  const [viewDoc, setViewDoc] = useState(null);
  const [editingOCR, setEditingOCR] = useState(null);
  const [ocrText, setOcrText] = useState("");
  const [newDoc, setNewDoc] = useState({
    document_type: "Lab Report",
    file: null,
    document_date: new Date().toISOString().split('T')[0],
    notes: "",
    tags: []
  });

  const queryClient = useQueryClient();

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['patient-documents', patientId],
    queryFn: () => base44.entities.PatientDocument.filter({ patient_id: patientId }, '-created_date'),
    enabled: !!patientId
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const uploadMutation = useMutation({
    mutationFn: async (docData) => {
      if (!docData.file) throw new Error("No file selected");
      if (docData.file.size > 10 * 1024 * 1024) throw new Error("File too large (max 10MB)");

      toast.info("Uploading document...", { id: "doc-upload", duration: Infinity });
      
      const uploadResult = await base44.integrations.Core.UploadFile({ file: docData.file });
      if (!uploadResult?.file_url) throw new Error("Upload failed - no file URL returned");
      
      let ocrText = null;
      if (docData.file.type.includes('image') || docData.file.type === 'application/pdf') {
        try {
          toast.info("Extracting text...", { id: "doc-upload", duration: Infinity });
          ocrText = await base44.integrations.Core.InvokeLLM({
            prompt: "Extract all text from this medical document. Return raw text content.",
            file_urls: [uploadResult.file_url]
          });
        } catch (error) {
          console.warn("OCR extraction failed:", error);
        }
      }

      return await base44.entities.PatientDocument.create({
        patient_id: patientId,
        document_type: docData.document_type,
        file_url: uploadResult.file_url,
        file_name: docData.file.name,
        file_type: docData.file.type,
        ocr_extracted_text: ocrText,
        document_date: docData.document_date,
        notes: docData.notes,
        tags: docData.tags || [],
        uploaded_by: user?.email || "unknown"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-documents', patientId] });
      setUploadDialog(false);
      setNewDoc({ document_type: "Lab Report", file: null, document_date: new Date().toISOString().split('T')[0], notes: "", tags: [] });
      toast.success("Document uploaded!", { id: "doc-upload" });
    },
    onError: (error) => {
      console.error("Upload error:", error);
      const msg = error?.message || "Upload failed - check connection";
      toast.error(msg, { id: "doc-upload", duration: 5000 });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (docId) => base44.entities.PatientDocument.delete(docId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-documents', patientId] });
      toast.success("Document deleted");
    }
  });

  const allTags = [...new Set(documents.flatMap(d => d.tags || []))];

  const updateOCRMutation = useMutation({
    mutationFn: ({ id, text }) => base44.entities.PatientDocument.update(id, { 
      ocr_extracted_text: text,
      ocr_edited: true
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-documents', patientId] });
      setEditingOCR(null);
      toast.success("OCR text updated!");
    }
  });

  const filteredDocs = documents
    .filter(doc => {
      const matchesSearch = 
        doc.file_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.document_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.notes?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === "All" || doc.document_type === filterType;
      const matchesTag = !filterTag || (doc.tags && doc.tags.includes(filterTag));
      return matchesSearch && matchesType && matchesTag;
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.document_date || b.created_date) - new Date(a.document_date || a.created_date);
      } else if (sortBy === "type") {
        return (a.document_type || "").localeCompare(b.document_type || "");
      } else if (sortBy === "name") {
        return (a.file_name || "").localeCompare(b.file_name || "");
      }
      return 0;
    });

  const docTypeColors = {
    "Lab Report": "bg-blue-100 text-blue-800",
    "Prescription": "bg-green-100 text-green-800",
    "Imaging": "bg-purple-100 text-purple-800",
    "Referral Letter": "bg-amber-100 text-amber-800",
    "Insurance Card": "bg-indigo-100 text-indigo-800",
    "Consent Form": "bg-slate-100 text-slate-800",
    "Discharge Summary": "bg-pink-100 text-pink-800",
    "Other": "bg-gray-100 text-gray-800"
  };

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Patient Documents ({documents.length})
          </CardTitle>
          <Dialog open={uploadDialog} onOpenChange={setUploadDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Upload className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload New Document</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Document Type *</Label>
                  <Select value={newDoc.document_type} onValueChange={(val) => setNewDoc({...newDoc, document_type: val})}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Lab Report">Lab Report</SelectItem>
                      <SelectItem value="Prescription">Prescription</SelectItem>
                      <SelectItem value="Imaging">Imaging</SelectItem>
                      <SelectItem value="Referral Letter">Referral Letter</SelectItem>
                      <SelectItem value="Insurance Card">Insurance Card</SelectItem>
                      <SelectItem value="Consent Form">Consent Form</SelectItem>
                      <SelectItem value="Discharge Summary">Discharge Summary</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>File *</Label>
                  <Input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setNewDoc({...newDoc, file: e.target.files[0]})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Document Date</Label>
                  <Input
                    type="date"
                    value={newDoc.document_date}
                    onChange={(e) => setNewDoc({...newDoc, document_date: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea
                    value={newDoc.notes}
                    onChange={(e) => setNewDoc({...newDoc, notes: e.target.value})}
                    className="mt-1"
                    rows={3}
                  />
                </div>
                <Button
                  onClick={() => {
                    if (!newDoc.file) {
                      toast.error("Please select a file");
                      return;
                    }
                    uploadMutation.mutate(newDoc);
                  }}
                  disabled={!newDoc.file || uploadMutation.isPending}
                  className="w-full"
                >
                  {uploadMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                  Upload
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid md:grid-cols-4 gap-3 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents..."
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Types</SelectItem>
              <SelectItem value="Lab Report">Lab Reports</SelectItem>
              <SelectItem value="Prescription">Prescriptions</SelectItem>
              <SelectItem value="Imaging">Imaging</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterTag} onValueChange={setFilterTag}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>All Tags</SelectItem>
              {allTags.map(tag => (
                <SelectItem key={tag} value={tag}>{tag}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date (Newest)</SelectItem>
              <SelectItem value="type">Type</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No documents found
          </div>
        ) : (
          <div className="space-y-2">
            {filteredDocs.map((doc) => (
              <div key={doc.id} className="border rounded-lg p-3 hover:bg-slate-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge className={docTypeColors[doc.document_type]}>
                        {doc.document_type}
                      </Badge>
                      {doc.tags?.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                      <span className="text-sm font-semibold">{doc.file_name}</span>
                    </div>
                    {doc.document_date && (
                      <p className="text-xs text-slate-500">Date: {doc.document_date}</p>
                    )}
                    {doc.notes && (
                      <p className="text-xs text-slate-600 mt-1">{doc.notes}</p>
                    )}
                    {doc.ocr_extracted_text && (
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        Text extracted
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setViewDoc(doc)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {doc.ocr_extracted_text && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingOCR(doc.id);
                          setOcrText(doc.ocr_extracted_text);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(doc.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Quick View Modal */}
      <Dialog open={!!viewDoc} onOpenChange={() => setViewDoc(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewDoc?.file_name}</DialogTitle>
          </DialogHeader>
          {viewDoc && (
            <div className="space-y-4">
              {viewDoc.file_type?.includes('image') ? (
                <img src={viewDoc.file_url} alt={viewDoc.file_name} className="w-full rounded" />
              ) : (
                <iframe src={viewDoc.file_url} className="w-full h-96 border rounded" title="Document" />
              )}
              {viewDoc.ocr_extracted_text && (
                <div>
                  <h4 className="font-semibold mb-2">Extracted Text:</h4>
                  <pre className="bg-slate-50 p-3 rounded text-xs whitespace-pre-wrap">
                    {viewDoc.ocr_extracted_text}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit OCR Modal */}
      <Dialog open={!!editingOCR} onOpenChange={() => setEditingOCR(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit OCR Text</DialogTitle>
          </DialogHeader>
          <Textarea
            value={ocrText}
            onChange={(e) => setOcrText(e.target.value)}
            className="h-64"
          />
          <Button onClick={() => updateOCRMutation.mutate({ id: editingOCR, text: ocrText })}>
            Save Changes
          </Button>
        </DialogContent>
      </Dialog>
    </Card>
  );
}