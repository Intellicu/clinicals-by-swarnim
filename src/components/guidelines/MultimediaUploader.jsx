import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Loader2, CheckCircle, Video, FileText, Image } from 'lucide-react';
import { base44 } from '@/api/client';
import { toast } from 'sonner';

export default function MultimediaUploader({ onUploadComplete }) {
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState(null);

  const handleUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadType(type);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onUploadComplete({ type, url: file_url, name: file.name });
      toast.success(`${type} uploaded!`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      setUploadType(null);
      e.target.value = null;
    }
  };

  const uploadTypes = [
    { key: 'video', label: 'Video Overview', icon: Video, accept: '.mp4,.mov,.webm' },
    { key: 'slides', label: 'Slide Deck', icon: FileText, accept: '.pdf,.pptx' },
    { key: 'infographic', label: 'Infographic', icon: Image, accept: '.png,.jpg,.jpeg,.svg' }
  ];

  return (
    <Card className="border-2 border-purple-200">
      <CardHeader className="bg-purple-50 border-b">
        <CardTitle className="text-base flex items-center gap-2">
          <Upload className="w-4 h-4 text-purple-600" />
          Multimedia Attachments
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-3">
          {uploadTypes.map((type) => {
            const Icon = type.icon;
            return (
              <div key={type.key}>
                <Label className="text-xs font-semibold text-slate-700 mb-2 block">
                  {type.label}
                </Label>
                <label className="cursor-pointer">
                  <div className={`border-2 border-dashed rounded-lg p-4 text-center hover:bg-purple-50 transition-all ${
                    uploading && uploadType === type.key ? 'border-purple-500 bg-purple-50' : 'border-purple-300'
                  }`}>
                    {uploading && uploadType === type.key ? (
                      <Loader2 className="w-6 h-6 text-purple-600 animate-spin mx-auto mb-2" />
                    ) : (
                      <Icon className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    )}
                    <div className="text-xs text-slate-600">
                      {uploading && uploadType === type.key ? 'Uploading...' : 'Click to upload'}
                    </div>
                  </div>
                  <input
                    type="file"
                    accept={type.accept}
                    onChange={(e) => handleUpload(e, type.key)}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}