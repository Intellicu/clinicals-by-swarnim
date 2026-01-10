import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus, Trash2, GripVertical, Settings, Save, Eye, Database,
  FileText, Calendar, Hash, CheckSquare, Upload, MapPin, Calculator
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const FIELD_TYPES = [
  { value: 'text', label: 'Text', icon: FileText },
  { value: 'number', label: 'Number', icon: Hash },
  { value: 'date', label: 'Date', icon: Calendar },
  { value: 'select', label: 'Single Select', icon: CheckSquare },
  { value: 'multiselect', label: 'Multi Select', icon: CheckSquare },
  { value: 'boolean', label: 'Yes/No', icon: CheckSquare },
  { value: 'calculated', label: 'Calculated', icon: Calculator },
  { value: 'file', label: 'File Upload', icon: Upload },
  { value: 'location', label: 'Location', icon: MapPin }
];

const CLINICAL_DATA_SOURCES = [
  { value: 'demographics', label: 'Demographics', fields: ['age', 'gender', 'dob', 'weight', 'height', 'bmi'] },
  { value: 'diagnosis', label: 'Diagnosis', fields: ['primary_diagnosis', 'comorbidities', 'diagnosis_date'] },
  { value: 'vitals', label: 'Vitals', fields: ['bp_systolic', 'bp_diastolic', 'heart_rate', 'temperature', 'bp_percentile'] },
  { value: 'labs', label: 'Laboratory', fields: ['creatinine', 'egfr', 'sodium', 'potassium', 'albumin', 'hemoglobin'] },
  { value: 'medications', label: 'Medications', fields: ['current_medications', 'steroid_exposure', 'immunosuppressants'] },
  { value: 'visits', label: 'Visit History', fields: ['last_visit_date', 'visit_count', 'follow_up_compliance'] }
];

export default function FormBuilder({ onSave, existingForm = null }) {
  const [formMetadata, setFormMetadata] = useState({
    title: existingForm?.title || '',
    study_id: existingForm?.study_id || '',
    pi_name: existingForm?.pi_name || '',
    ethics_approval: existingForm?.ethics_approval || '',
    consent_required: existingForm?.consent_required || true,
    disease_tags: existingForm?.disease_tags || [],
    study_type: existingForm?.study_type || 'observational'
  });

  const [sections, setSections] = useState(existingForm?.sections || [{
    id: '1',
    name: 'Baseline',
    fields: []
  }]);

  const [activeTab, setActiveTab] = useState('metadata');
  const [editingField, setEditingField] = useState(null);

  const addSection = () => {
    setSections([...sections, {
      id: Date.now().toString(),
      name: `Section ${sections.length + 1}`,
      fields: []
    }]);
  };

  const addField = (sectionId) => {
    const newField = {
      id: Date.now().toString(),
      label: 'New Field',
      type: 'text',
      required: false,
      auto_extract: false,
      clinical_source: null,
      clinical_field: null,
      validation: {},
      options: []
    };

    setSections(sections.map(section =>
      section.id === sectionId
        ? { ...section, fields: [...section.fields, newField] }
        : section
    ));
  };

  const updateField = (sectionId, fieldId, updates) => {
    setSections(sections.map(section =>
      section.id === sectionId
        ? {
            ...section,
            fields: section.fields.map(field =>
              field.id === fieldId ? { ...field, ...updates } : field
            )
          }
        : section
    ));
  };

  const deleteField = (sectionId, fieldId) => {
    setSections(sections.map(section =>
      section.id === sectionId
        ? { ...section, fields: section.fields.filter(f => f.id !== fieldId) }
        : section
    ));
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const sectionId = result.source.droppableId;
    const section = sections.find(s => s.id === sectionId);
    const newFields = Array.from(section.fields);
    const [removed] = newFields.splice(result.source.index, 1);
    newFields.splice(result.destination.index, 0, removed);

    setSections(sections.map(s =>
      s.id === sectionId ? { ...s, fields: newFields } : s
    ));
  };

  const handleSave = () => {
    const formData = {
      ...formMetadata,
      sections,
      created_date: new Date().toISOString()
    };
    onSave(formData);
  };

  const renderFieldEditor = (section, field) => (
    <Card key={field.id} className="mb-3 border-l-4 border-l-blue-500">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <GripVertical className="w-5 h-5 text-slate-400 mt-2 cursor-move" />
          <div className="flex-1 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Field Label</Label>
                <Input
                  value={field.label}
                  onChange={(e) => updateField(section.id, field.id, { label: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Field Type</Label>
                <Select
                  value={field.type}
                  onValueChange={(val) => updateField(section.id, field.id, { type: val })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FIELD_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs font-semibold flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-600" />
                  Auto-Extract from Clinical Data
                </Label>
                <Switch
                  checked={field.auto_extract}
                  onCheckedChange={(checked) => updateField(section.id, field.id, { auto_extract: checked })}
                />
              </div>

              {field.auto_extract && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Select
                    value={field.clinical_source}
                    onValueChange={(val) => updateField(section.id, field.id, { clinical_source: val, clinical_field: null })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Data Source" />
                    </SelectTrigger>
                    <SelectContent>
                      {CLINICAL_DATA_SOURCES.map(source => (
                        <SelectItem key={source.value} value={source.value}>
                          {source.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {field.clinical_source && (
                    <Select
                      value={field.clinical_field}
                      onValueChange={(val) => updateField(section.id, field.id, { clinical_field: val })}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Field" />
                      </SelectTrigger>
                      <SelectContent>
                        {CLINICAL_DATA_SOURCES.find(s => s.value === field.clinical_source)?.fields.map(f => (
                          <SelectItem key={f} value={f}>
                            {f.replace(/_/g, ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Switch
                  checked={field.required}
                  onCheckedChange={(checked) => updateField(section.id, field.id, { required: checked })}
                />
                <Label className="text-xs">Required</Label>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => deleteField(section.id, field.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="metadata">Study Metadata</TabsTrigger>
          <TabsTrigger value="fields">Form Fields</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="metadata" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Study Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Study Title</Label>
                <Input
                  value={formMetadata.title}
                  onChange={(e) => setFormMetadata({...formMetadata, title: e.target.value})}
                  placeholder="e.g., Pediatric Nephrotic Syndrome Registry"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Study ID</Label>
                  <Input
                    value={formMetadata.study_id}
                    onChange={(e) => setFormMetadata({...formMetadata, study_id: e.target.value})}
                    placeholder="AUTO-001"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Study Type</Label>
                  <Select
                    value={formMetadata.study_type}
                    onValueChange={(val) => setFormMetadata({...formMetadata, study_type: val})}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="observational">Observational</SelectItem>
                      <SelectItem value="rct">RCT</SelectItem>
                      <SelectItem value="registry">Registry</SelectItem>
                      <SelectItem value="audit">Audit</SelectItem>
                      <SelectItem value="qi">QI Project</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Principal Investigator</Label>
                <Input
                  value={formMetadata.pi_name}
                  onChange={(e) => setFormMetadata({...formMetadata, pi_name: e.target.value})}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Ethics Approval Reference</Label>
                <Input
                  value={formMetadata.ethics_approval}
                  onChange={(e) => setFormMetadata({...formMetadata, ethics_approval: e.target.value})}
                  placeholder="IEC/2024/123"
                  className="mt-1"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <Label>Consent Required</Label>
                <Switch
                  checked={formMetadata.consent_required}
                  onCheckedChange={(checked) => setFormMetadata({...formMetadata, consent_required: checked})}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fields">
          <div className="space-y-4">
            {sections.map((section, sectionIdx) => (
              <Card key={section.id}>
                <CardHeader className="bg-slate-50 border-b">
                  <div className="flex items-center justify-between">
                    <Input
                      value={section.name}
                      onChange={(e) => setSections(sections.map((s, idx) =>
                        idx === sectionIdx ? {...s, name: e.target.value} : s
                      ))}
                      className="font-semibold w-64"
                    />
                    <Button
                      size="sm"
                      onClick={() => addField(section.id)}
                      className="bg-blue-600"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Field
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId={section.id}>
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef}>
                          {section.fields.map((field, idx) => (
                            <Draggable key={field.id} draggableId={field.id} index={idx}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  {renderFieldEditor(section, field)}
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>

                  {section.fields.length === 0 && (
                    <div className="text-center py-8 text-slate-500 text-sm">
                      No fields yet. Click "Add Field" to get started.
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            <Button onClick={addSection} variant="outline" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Section
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                Form Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-6 pb-6 border-b">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">{formMetadata.title || 'Untitled Study'}</h2>
                <div className="flex gap-3 flex-wrap">
                  <Badge variant="outline">{formMetadata.study_type}</Badge>
                  <Badge variant="outline">Study ID: {formMetadata.study_id || 'Not set'}</Badge>
                  {formMetadata.consent_required && <Badge className="bg-amber-100 text-amber-800">Consent Required</Badge>}
                </div>
              </div>

              {sections.map(section => (
                <div key={section.id} className="mb-8">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b">{section.name}</h3>
                  <div className="space-y-4">
                    {section.fields.map(field => (
                      <div key={field.id} className="flex items-start gap-3">
                        <div className="flex-1">
                          <Label className="flex items-center gap-2">
                            {field.label}
                            {field.required && <span className="text-red-500">*</span>}
                            {field.auto_extract && (
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                <Database className="w-3 h-3 mr-1" />
                                Auto-fill
                              </Badge>
                            )}
                          </Label>
                          <Input disabled className="mt-1" placeholder={`${field.type} field`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex gap-3 justify-end pt-4 border-t">
        <Button variant="outline" onClick={() => setActiveTab('preview')}>
          <Eye className="w-4 h-4 mr-2" />
          Preview
        </Button>
        <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
          <Save className="w-4 h-4 mr-2" />
          Save Form
        </Button>
      </div>
    </div>
  );
}