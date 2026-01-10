import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function MonitoringTemplateUploader() {
  const [showDialog, setShowDialog] = useState(false);
  const [template, setTemplate] = useState({
    name: "",
    category: "",
    description: "",
    frequency: "",
    fields: []
  });
  const [newField, setNewField] = useState({ label: "", type: "text", unit: "" });

  const queryClient = useQueryClient();

  const createTemplateMutation = useMutation({
    mutationFn: (data) => base44.entities.MonitoringTemplate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitoring-templates'] });
      setShowDialog(false);
      setTemplate({ name: "", category: "", description: "", frequency: "", fields: [] });
      toast.success("Template created!");
    }
  });

  const addField = () => {
    if (!newField.label) return;
    setTemplate(prev => ({
      ...prev,
      fields: [...prev.fields, { ...newField, required: false }]
    }));
    setNewField({ label: "", type: "text", unit: "" });
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-purple-300 text-purple-700">
          <Upload className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Monitoring Template</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Template Name *</Label>
              <Input
                value={template.name}
                onChange={(e) => setTemplate({...template, name: e.target.value})}
                placeholder="e.g., CKD Monthly Monitoring"
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={template.category} onValueChange={(val) => setTemplate({...template, category: val})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CKD">CKD</SelectItem>
                  <SelectItem value="Dialysis">Dialysis</SelectItem>
                  <SelectItem value="Post-Transplant">Post-Transplant</SelectItem>
                  <SelectItem value="Nephrotic Syndrome">Nephrotic Syndrome</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={template.description}
              onChange={(e) => setTemplate({...template, description: e.target.value})}
              rows={2}
            />
          </div>
          <div>
            <Label>Monitoring Frequency</Label>
            <Input
              value={template.frequency}
              onChange={(e) => setTemplate({...template, frequency: e.target.value})}
              placeholder="e.g., Monthly, Every 3 months"
            />
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3">Add Fields</h4>
            <div className="grid md:grid-cols-3 gap-2 mb-2">
              <Input
                value={newField.label}
                onChange={(e) => setNewField({...newField, label: e.target.value})}
                placeholder="Field name"
              />
              <Select value={newField.type} onValueChange={(val) => setNewField({...newField, type: val})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="checkbox">Checkbox</SelectItem>
                </SelectContent>
              </Select>
              <Input
                value={newField.unit}
                onChange={(e) => setNewField({...newField, unit: e.target.value})}
                placeholder="Unit (optional)"
              />
            </div>
            <Button size="sm" onClick={addField} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Field
            </Button>
          </div>

          {template.fields.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Template Fields:</h4>
              <div className="space-y-1">
                {template.fields.map((field, idx) => (
                  <div key={idx} className="text-sm p-2 bg-slate-50 rounded border">
                    {field.label} ({field.type}) {field.unit && `- ${field.unit}`}
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={() => createTemplateMutation.mutate(template)}
            disabled={!template.name || template.fields.length === 0 || createTemplateMutation.isPending}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {createTemplateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Template"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}