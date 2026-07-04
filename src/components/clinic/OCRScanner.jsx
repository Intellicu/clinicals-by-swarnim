import React, { useState, useRef } from "react";
import { base44 } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, Upload, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function OCRScanner({ onComplete }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const processImage = async (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large (max 10MB)", { id: "ocr-scan" });
      return;
    }

    setIsProcessing(true);
    toast.info("Processing document...", { id: "ocr-scan", duration: Infinity });
    
    try {
      const uploadResult = await base44.integrations.Core.UploadFile({ file });
      if (!uploadResult?.file_url) throw new Error("Upload failed - no file URL returned");
      
      const prompt = `Extract patient information from this medical document. Return structured data for: Patient Name, CR Number, Mobile, Age/DOB, Gender, Guardian, Address, Diagnosis, Medications, Labs. Format as clear key-value pairs.`;

      let ocrText;
      try {
        ocrText = await base44.integrations.Core.InvokeLLM({
          prompt,
          file_urls: [uploadResult.file_url]
        });
      } catch (ocrError) {
        console.warn("OCR failed:", ocrError);
        ocrText = "OCR extraction failed. Please enter data manually.";
      }

      setExtractedData({ 
        file_url: uploadResult.file_url, 
        ocr_text: ocrText, 
        file_type: file.type,
        file_name: file.name 
      });
      toast.success("Document scanned successfully!", { id: "ocr-scan" });
      
    } catch (error) {
      console.error("Processing error:", error);
      const errorMsg = error?.message || "Upload failed - check connection";
      toast.error(errorMsg, { id: "ocr-scan", duration: 5000 });
      setSelectedFile(null);
      setPreview(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File too large. Maximum size is 10MB.");
      return;
    }
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file type. Please use JPEG, PNG, WEBP, or PDF.");
      return;
    }
    
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.onerror = () => {
      toast.error("Failed to read file");
      setSelectedFile(null);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <Button
          onClick={() => cameraInputRef.current?.click()}
          className="h-32 bg-gradient-to-br from-blue-600 to-cyan-600 flex flex-col gap-2"
        >
          <Camera className="w-8 h-8" />
          <span>Take Photo</span>
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => handleFileSelect(e.target.files[0])}
            className="hidden"
          />
        </Button>

        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          className="h-32 border-2 border-purple-300 hover:bg-purple-50 flex flex-col gap-2"
        >
          <Upload className="w-8 h-8" />
          <span>Upload File</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => handleFileSelect(e.target.files[0])}
            className="hidden"
          />
        </Button>
      </div>

      {isProcessing && (
        <Alert className="bg-blue-50 border-blue-200">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <AlertDescription className="text-blue-800">
            Processing document with AI OCR...
          </AlertDescription>
        </Alert>
      )}

      {preview && !extractedData && !isProcessing && (
        <Card>
          <CardContent className="p-4">
            <img src={preview} alt="Preview" className="w-full rounded border mb-4" />
            <div className="space-y-2">
              <Button
                onClick={() => processImage(selectedFile)}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Process with AI
              </Button>
              <Button
                onClick={() => onComplete({ skip_ocr: true })}
                variant="outline"
                className="w-full"
              >
                Skip & Enter Manually
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isProcessing && (
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="font-semibold mb-2">Processing document...</p>
            <Button
              onClick={() => {
                setIsProcessing(false);
                onComplete({ skip_ocr: true });
              }}
              variant="outline"
              size="sm"
            >
              Cancel & Enter Manually
            </Button>
          </CardContent>
        </Card>
      )}

      {extractedData && (
        <Card className="bg-green-50 border-2 border-green-300">
          <CardHeader className="bg-green-100 border-b">
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Extracted Data
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <pre className="whitespace-pre-wrap text-xs bg-white p-4 rounded border max-h-64 overflow-y-auto">
              {extractedData.ocr_text}
            </pre>
            <Button
              onClick={() => onComplete(extractedData)}
              className="w-full mt-4 bg-green-600 hover:bg-green-700"
            >
              Use This Data
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}