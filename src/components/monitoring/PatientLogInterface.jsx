import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Camera, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function PatientLogInterface({ patientId, monitoringPlan }) {
  const [logData, setLogData] = useState({
    log_date: new Date().toISOString().split('T')[0],
    remarks: ''
  });
  const [photoFile, setPhotoFile] = useState(null);

  const queryClient = useQueryClient();

  const createLogMutation = useMutation({
    mutationFn: async (data) => {
      let photoUrl = null;
      if (photoFile) {
        const uploadResult = await base44.integrations.Core.UploadFile({ file: photoFile });
        photoUrl = uploadResult.file_url;
      }
      return base44.entities.PatientDailyLog.create({
        ...data,
        photo_url: photoUrl,
        source: photoUrl ? 'Photo' : 'Manual',
        completion_status: 'Complete'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-logs'] });
      toast.success('Log entry saved!');
      setLogData({ log_date: new Date().toISOString().split('T')[0], remarks: '' });
      setPhotoFile(null);
    }
  });

  const handleSubmit = (moduleType) => {
    createLogMutation.mutate({
      patient_id: patientId,
      log_date: logData.log_date,
      module_type: moduleType,
      ...logData
    });
  };

  const modules = monitoringPlan?.modules?.filter(m => m.enabled) || [];

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-slate-900">Daily Health Log</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={logData.log_date}
                onChange={(e) => setLogData({...logData, log_date: e.target.value})}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Photo (Optional)</Label>
              <div className="mt-1">
                <label className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg cursor-pointer hover:bg-slate-50">
                  <Camera className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">{photoFile ? photoFile.name : 'Take Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => setPhotoFile(e.target.files[0])}
                  />
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {modules.map(module => (
        <Card key={module.module_type} className="border-2 hover:border-blue-300 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{module.module_type.replace('_', ' ')}</CardTitle>
              <Badge variant="outline" className="text-xs">
                {module.frequency}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {module.module_type === 'Urine_Protein' && (
              <div>
                <Label>Protein Result</Label>
                <Select 
                  value={logData.protein_result}
                  onValueChange={(val) => setLogData({...logData, protein_result: val})}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select result" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Negative">Negative</SelectItem>
                    <SelectItem value="Trace">Trace</SelectItem>
                    <SelectItem value="1+">1+</SelectItem>
                    <SelectItem value="2+">2+</SelectItem>
                    <SelectItem value="3+">3+</SelectItem>
                    <SelectItem value="4+">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {module.module_type === 'Weight' && (
              <div>
                <Label>Weight (kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={logData.weight_kg}
                  onChange={(e) => setLogData({...logData, weight_kg: parseFloat(e.target.value)})}
                  className="mt-1"
                />
              </div>
            )}

            {module.module_type === 'Blood_Pressure' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Systolic</Label>
                  <Input
                    type="number"
                    value={logData.bp_systolic}
                    onChange={(e) => setLogData({...logData, bp_systolic: parseInt(e.target.value)})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Diastolic</Label>
                  <Input
                    type="number"
                    value={logData.bp_diastolic}
                    onChange={(e) => setLogData({...logData, bp_diastolic: parseInt(e.target.value)})}
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            {module.module_type === 'Medications' && (
              <div>
                <Label>Prednisolone Dose (mg)</Label>
                <Input
                  type="number"
                  value={logData.prednisolone_dose}
                  onChange={(e) => setLogData({...logData, prednisolone_dose: parseFloat(e.target.value)})}
                  className="mt-1"
                />
              </div>
            )}

            <div>
              <Label>Notes</Label>
              <Textarea
                value={logData.remarks}
                onChange={(e) => setLogData({...logData, remarks: e.target.value})}
                placeholder="Any observations or symptoms..."
                className="mt-1"
                rows={2}
              />
            </div>

            <Button
              onClick={() => handleSubmit(module.module_type)}
              disabled={createLogMutation.isPending}
              className="w-full bg-blue-600"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Save {module.module_type.replace('_', ' ')}
            </Button>
          </CardContent>
        </Card>
      ))}

      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <p className="font-semibold mb-1">Important</p>
            <p>Home logs do not replace emergency care. Contact your doctor immediately if you have severe symptoms.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}