/**
 * DICOMImageViewer
 * Upload, view, and annotate renal ultrasounds / biopsy slides.
 * Annotations are saved to the PatientDocument entity.
 * Supports: image upload, pan/zoom, click-to-annotate, save annotations to patient record.
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Upload, ZoomIn, ZoomOut, RotateCcw, Pencil, 
  Save, Trash2, Eye, ChevronLeft, ChevronRight, 
  Loader2, Image as ImageIcon, Maximize2, X, Plus
} from "lucide-react";
import { base44 } from "@/api/client";
import { toast } from "sonner";

const ANNOTATION_COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'];
const MODALITY_OPTIONS = ['Renal Ultrasound', 'Biopsy Slide', 'DMSA Scan', 'MCU', 'CT Abdomen', 'MRI Kidney', 'X-Ray', 'Other'];

export default function DICOMImageViewer({ patientId, patientName, readOnly = false }) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const containerRef = useRef(null);

  const [images, setImages] = useState([]); // { url, filename, modality, date, annotations: [], aiReport }
  const [currentIdx, setCurrentIdx] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [annotateMode, setAnnotateMode] = useState(false);
  const [annotations, setAnnotations] = useState([]);
  const [pendingAnnotation, setPendingAnnotation] = useState(null);
  const [annotationColor, setAnnotationColor] = useState(ANNOTATION_COLORS[0]);
  const [annotationNote, setAnnotationNote] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadForm, setUploadForm] = useState({ modality: '', date: '', notes: '' });
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [showAnnotationPopup, setShowAnnotationPopup] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const currentImage = images[currentIdx];

  useEffect(() => {
    if (patientId) loadImages();
  }, [patientId]);

  useEffect(() => {
    if (currentImage) {
      setAnnotations(currentImage.annotations || []);
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setImgLoaded(false);
    }
  }, [currentIdx, currentImage]);

  useEffect(() => {
    drawCanvas();
  }, [annotations, zoom, pan, imgLoaded, annotateMode]);

  const loadImages = async () => {
    if (!patientId) return;
    setLoading(true);
    try {
      const docs = await base44.entities.PatientDocument.filter({ patient_id: patientId, document_type: 'imaging' });
      const imgs = docs.map(d => ({
        id: d.id,
        url: d.file_url,
        filename: d.title || 'Image',
        modality: d.modality || 'Unknown',
        date: d.document_date || d.created_date,
        annotations: d.annotations || [],
        aiReport: d.ai_report || '',
        notes: d.notes || '',
      }));
      setImages(imgs);
      if (imgs.length > 0) setCurrentIdx(0);
    } catch {
      // No documents yet — fine
    } finally {
      setLoading(false);
    }
  };

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !imgLoaded) return;
    const ctx = canvas.getContext('2d');
    const cw = canvas.width;
    const ch = canvas.height;
    ctx.clearRect(0, 0, cw, ch);
    // Draw image with zoom/pan
    const iw = img.naturalWidth * zoom;
    const ih = img.naturalHeight * zoom;
    const sx = (cw - iw) / 2 + pan.x;
    const sy = (ch - ih) / 2 + pan.y;
    ctx.drawImage(img, sx, sy, iw, ih);
    // Draw annotations
    annotations.forEach((ann, idx) => {
      const ax = sx + ann.relX * iw;
      const ay = sy + ann.relY * ih;
      ctx.strokeStyle = ann.color || '#EF4444';
      ctx.fillStyle = ann.color || '#EF4444';
      ctx.lineWidth = 2;
      // Circle marker
      ctx.beginPath();
      ctx.arc(ax, ay, 14, 0, 2 * Math.PI);
      ctx.globalAlpha = 0.25;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.stroke();
      // Number label
      ctx.fillStyle = ann.color || '#EF4444';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(idx + 1, ax, ay);
    });
  }, [annotations, zoom, pan, imgLoaded]);

  const handleCanvasClick = (e) => {
    if (!annotateMode || !imgLoaded) return;
    const canvas = canvasRef.current;
    const img = imgRef.current;
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth * zoom;
    const ih = img.naturalHeight * zoom;
    const sx = (cw - iw) / 2 + pan.x;
    const sy = (ch - ih) / 2 + pan.y;
    // Convert to relative coords within image
    const relX = (cx - sx) / iw;
    const relY = (cy - sy) / ih;
    if (relX < 0 || relX > 1 || relY < 0 || relY > 1) return;
    setPendingAnnotation({ relX, relY, color: annotationColor });
    setAnnotationNote('');
    setShowAnnotationPopup(true);
  };

  const confirmAnnotation = () => {
    if (!pendingAnnotation) return;
    const ann = { ...pendingAnnotation, note: annotationNote, timestamp: new Date().toISOString() };
    setAnnotations(prev => [...prev, ann]);
    setPendingAnnotation(null);
    setShowAnnotationPopup(false);
    setAnnotationNote('');
  };

  const deleteAnnotation = (idx) => {
    setAnnotations(prev => prev.filter((_, i) => i !== idx));
  };

  const handleMouseDown = (e) => {
    if (annotateMode) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isPanning || annotateMode) return;
    setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
  };

  const handleMouseUp = () => setIsPanning(false);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPendingFile(file);
    setShowUploadDialog(true);
    e.target.value = '';
  };

  const handleUpload = async () => {
    if (!pendingFile) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: pendingFile });
      // Save to PatientDocument entity
      const doc = await base44.entities.PatientDocument.create({
        patient_id: patientId,
        title: uploadForm.modality || pendingFile.name,
        file_url,
        document_type: 'imaging',
        modality: uploadForm.modality,
        document_date: uploadForm.date || new Date().toISOString().split('T')[0],
        notes: uploadForm.notes,
        annotations: [],
      });
      const newImg = {
        id: doc.id,
        url: file_url,
        filename: uploadForm.modality || pendingFile.name,
        modality: uploadForm.modality,
        date: uploadForm.date,
        annotations: [],
        notes: uploadForm.notes,
      };
      setImages(prev => [...prev, newImg]);
      setCurrentIdx(images.length);
      setShowUploadDialog(false);
      setPendingFile(null);
      setUploadForm({ modality: '', date: '', notes: '' });
      toast.success('Image uploaded successfully');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveAnnotations = async () => {
    if (!currentImage?.id) return;
    setSaving(true);
    try {
      await base44.entities.PatientDocument.update(currentImage.id, { annotations });
      setImages(prev => prev.map((img, i) => i === currentIdx ? { ...img, annotations } : img));
      toast.success('Annotations saved to patient record');
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!currentImage?.id || !window.confirm('Delete this image?')) return;
    try {
      await base44.entities.PatientDocument.delete(currentImage.id);
      const newImgs = images.filter((_, i) => i !== currentIdx);
      setImages(newImgs);
      setCurrentIdx(Math.max(0, currentIdx - 1));
      toast.success('Image deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-700">
      {/* Toolbar */}
      <div className="bg-slate-800 px-3 py-2 flex items-center gap-2 flex-wrap">
        <span className="text-white text-sm font-bold flex items-center gap-1.5">
          <ImageIcon className="w-4 h-4 text-blue-400" />
          Image Viewer
          {patientName && <span className="text-slate-400 font-normal">— {patientName}</span>}
        </span>

        <div className="ml-auto flex items-center gap-1.5 flex-wrap">
          {/* Upload */}
          {!readOnly && (
            <>
              <input type="file" accept="image/*,.dcm" id="dicom-upload" className="hidden" onChange={handleFileSelect} />
              <label htmlFor="dicom-upload">
                <Button size="sm" variant="outline" className="h-7 text-xs bg-slate-700 border-slate-600 text-white hover:bg-slate-600 cursor-pointer" asChild>
                  <span><Upload className="w-3 h-3 mr-1" />Upload</span>
                </Button>
              </label>
            </>
          )}

          {/* Zoom */}
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-slate-300 hover:text-white hover:bg-slate-700"
            onClick={() => setZoom(z => Math.min(z + 0.25, 4))}>
            <ZoomIn className="w-3.5 h-3.5" />
          </Button>
          <span className="text-slate-400 text-xs min-w-10 text-center">{Math.round(zoom * 100)}%</span>
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-slate-300 hover:text-white hover:bg-slate-700"
            onClick={() => setZoom(z => Math.max(z - 0.25, 0.25))}>
            <ZoomOut className="w-3.5 h-3.5" />
          </Button>
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-slate-300 hover:text-white hover:bg-slate-700"
            onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}>
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>

          {/* Annotate */}
          {!readOnly && (
            <Button
              size="sm"
              variant={annotateMode ? 'default' : 'outline'}
              className={`h-7 text-xs ${annotateMode ? 'bg-amber-500 text-white border-amber-500' : 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600'}`}
              onClick={() => setAnnotateMode(!annotateMode)}
            >
              <Pencil className="w-3 h-3 mr-1" />
              {annotateMode ? 'Annotating' : 'Annotate'}
            </Button>
          )}

          {/* Color picker for annotation */}
          {annotateMode && (
            <div className="flex gap-1">
              {ANNOTATION_COLORS.map(c => (
                <button
                  key={c}
                  className={`w-5 h-5 rounded-full border-2 transition-all ${annotationColor === c ? 'border-white scale-110' : 'border-slate-600'}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setAnnotationColor(c)}
                />
              ))}
            </div>
          )}

          {/* Save annotations */}
          {!readOnly && annotations.length > 0 && (
            <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700" onClick={handleSaveAnnotations} disabled={saving}>
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3 mr-1" />}
              Save
            </Button>
          )}

          {!readOnly && currentImage && (
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-slate-700" onClick={handleDeleteImage}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex" style={{ height: '480px' }}>
        {/* Image thumbnails sidebar */}
        {images.length > 0 && (
          <div className="w-20 bg-slate-800 flex flex-col gap-1 p-1 overflow-y-auto flex-shrink-0">
            {images.map((img, i) => (
              <button
                key={i}
                className={`w-full aspect-square rounded overflow-hidden border-2 transition-all ${i === currentIdx ? 'border-blue-400' : 'border-transparent hover:border-slate-500'}`}
                onClick={() => setCurrentIdx(i)}
              >
                <img src={img.url} alt={img.filename} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Main viewport */}
        <div className="flex-1 relative bg-slate-950" ref={containerRef}>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
            </div>
          )}

          {!loading && images.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-3">
              <ImageIcon className="w-16 h-16 opacity-30" />
              <p className="text-sm">No images uploaded</p>
              {!readOnly && (
                <label htmlFor="dicom-upload" className="cursor-pointer">
                  <Button size="sm" variant="outline" className="border-slate-600 text-slate-400 hover:text-white hover:bg-slate-700">
                    <Upload className="w-4 h-4 mr-1.5" /> Upload Image
                  </Button>
                </label>
              )}
            </div>
          )}

          {currentImage && (
            <>
              {/* Hidden img for canvas drawing */}
              <img
                ref={imgRef}
                src={currentImage.url}
                alt="Medical"
                className="hidden"
                crossOrigin="anonymous"
                onLoad={() => setImgLoaded(true)}
              />
              <canvas
                ref={canvasRef}
                width={containerRef.current?.offsetWidth || 600}
                height={480}
                className={`absolute inset-0 w-full h-full ${annotateMode ? 'cursor-crosshair' : isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
                onClick={handleCanvasClick}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />

              {/* Nav arrows */}
              {images.length > 1 && (
                <>
                  <button
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/80"
                    onClick={() => setCurrentIdx(i => Math.max(0, i - 1))}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/80"
                    onClick={() => setCurrentIdx(i => Math.min(images.length - 1, i + 1))}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Image info overlay */}
              <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                {currentImage.modality || 'Unknown'} · {currentImage.date ? new Date(currentImage.date).toLocaleDateString() : ''}
                {images.length > 1 && ` · ${currentIdx + 1}/${images.length}`}
              </div>

              {/* Annotate mode hint */}
              {annotateMode && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-amber-500/90 text-white text-xs px-3 py-1 rounded-full">
                  Click anywhere on image to add annotation
                </div>
              )}
            </>
          )}
        </div>

        {/* Annotations panel */}
        {(annotations.length > 0 || currentImage?.aiReport) && (
          <div className="w-56 bg-slate-800 border-l border-slate-700 flex flex-col overflow-hidden">
            <div className="px-3 py-2 border-b border-slate-700">
              <p className="text-xs font-semibold text-slate-300">Annotations ({annotations.length})</p>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {annotations.map((ann, i) => (
                <div key={i} className="bg-slate-700 rounded p-2 text-xs">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: ann.color }}>
                      {i + 1}
                    </span>
                    <span className="text-slate-400 text-xs">{new Date(ann.timestamp).toLocaleTimeString()}</span>
                    {!readOnly && (
                      <button className="ml-auto text-red-400 hover:text-red-300" onClick={() => deleteAnnotation(i)}>
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <p className="text-slate-200">{ann.note || <span className="italic text-slate-500">No note</span>}</p>
                </div>
              ))}

              {currentImage?.aiReport && (
                <div className="bg-blue-900/40 rounded p-2 border border-blue-700 text-xs">
                  <p className="font-semibold text-blue-300 mb-1">AI Report</p>
                  <p className="text-slate-300 whitespace-pre-wrap text-xs leading-relaxed">{currentImage.aiReport}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Upload dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-600" /> Upload Medical Image
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Modality</label>
              <Select value={uploadForm.modality} onValueChange={v => setUploadForm(f => ({ ...f, modality: v }))}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Select modality..." /></SelectTrigger>
                <SelectContent>
                  {MODALITY_OPTIONS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Date</label>
              <Input type="date" value={uploadForm.date} onChange={e => setUploadForm(f => ({ ...f, date: e.target.value }))} className="h-9" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Clinical Notes</label>
              <Textarea
                value={uploadForm.notes}
                onChange={e => setUploadForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Clinical indication, findings, etc."
                className="min-h-20 text-sm"
              />
            </div>
            <div className="flex gap-2 justify-end pt-1">
              <Button variant="outline" size="sm" onClick={() => { setShowUploadDialog(false); setPendingFile(null); }}>Cancel</Button>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={handleUpload} disabled={uploading}>
                {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Upload className="w-4 h-4 mr-1" />}
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Annotation note popup */}
      <Dialog open={showAnnotationPopup} onOpenChange={setShowAnnotationPopup}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-4 h-4" style={{ color: annotationColor }} />
              Add Annotation Note
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Textarea
              value={annotationNote}
              onChange={e => setAnnotationNote(e.target.value)}
              placeholder="Describe the finding at this location (e.g. Increased echogenicity, cortical thinning)..."
              className="min-h-24 text-sm"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowAnnotationPopup(false)}>Cancel</Button>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={confirmAnnotation}>
                <Plus className="w-4 h-4 mr-1" /> Add Annotation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}