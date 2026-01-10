import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Calculator,
  FileText,
  TestTube,
  Activity,
  Heart,
  Brain,
  Pill,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";

const iconOptions = [
  { name: "Calculator", icon: Calculator },
  { name: "FileText", icon: FileText },
  { name: "TestTube", icon: TestTube },
  { name: "Activity", icon: Activity },
  { name: "Heart", icon: Heart },
  { name: "Brain", icon: Brain },
  { name: "Pill", icon: Pill }
];

const categoryOptions = [
  "Calculators",
  "Guidelines",
  "Reference",
  "Drug Dosing",
  "Lab Reference",
  "Prediction Tools"
];

export default function CustomToolBuilder() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: userPreferences } = useQuery({
    queryKey: ['userPreferences'],
    queryFn: async () => {
      const prefs = await base44.entities.UserPreferences.filter({ user_email: user.email });
      return prefs[0] || null;
    },
    enabled: !!user
  });

  const { data: myTools = [] } = useQuery({
    queryKey: ['myCustomTools', userPreferences?.selected_specialty_id],
    queryFn: () => base44.entities.CustomTool.filter({ 
      specialty_id: userPreferences.selected_specialty_id 
    }),
    enabled: !!userPreferences?.selected_specialty_id
  });

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTool, setEditingTool] = useState(null);
  const [toolForm, setToolForm] = useState({
    name: "",
    description: "",
    category: "Calculators",
    icon: "Calculator",
    input_fields: [],
    calculation_logic: "",
    references: [],
    is_public: false
  });

  const [newField, setNewField] = useState({
    name: "",
    label: "",
    type: "number",
    unit: "",
    reference_range: "",
    required: false
  });

  const [newReference, setNewReference] = useState({
    title: "",
    url: ""
  });

  const createToolMutation = useMutation({
    mutationFn: async (toolData) => {
      return await base44.entities.CustomTool.create({
        ...toolData,
        specialty_id: userPreferences.selected_specialty_id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myCustomTools'] });
      setShowCreateDialog(false);
      resetForm();
      toast.success("Custom tool created successfully!");
    }
  });

  const updateToolMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return await base44.entities.CustomTool.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myCustomTools'] });
      setEditingTool(null);
      resetForm();
      toast.success("Tool updated successfully!");
    }
  });

  const deleteToolMutation = useMutation({
    mutationFn: async (id) => {
      return await base44.entities.CustomTool.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myCustomTools'] });
      toast.success("Tool deleted successfully!");
    }
  });

  const resetForm = () => {
    setToolForm({
      name: "",
      description: "",
      category: "Calculators",
      icon: "Calculator",
      input_fields: [],
      calculation_logic: "",
      references: [],
      is_public: false
    });
    setNewField({
      name: "",
      label: "",
      type: "number",
      unit: "",
      reference_range: "",
      required: false
    });
    setNewReference({ title: "", url: "" });
  };

  const handleAddField = () => {
    if (!newField.name || !newField.label) {
      toast.error("Field name and label are required");
      return;
    }
    setToolForm({
      ...toolForm,
      input_fields: [...toolForm.input_fields, newField]
    });
    setNewField({
      name: "",
      label: "",
      type: "number",
      unit: "",
      reference_range: "",
      required: false
    });
  };

  const handleRemoveField = (index) => {
    setToolForm({
      ...toolForm,
      input_fields: toolForm.input_fields.filter((_, i) => i !== index)
    });
  };

  const handleAddReference = () => {
    if (!newReference.title || !newReference.url) {
      toast.error("Reference title and URL are required");
      return;
    }
    setToolForm({
      ...toolForm,
      references: [...toolForm.references, newReference]
    });
    setNewReference({ title: "", url: "" });
  };

  const handleRemoveReference = (index) => {
    setToolForm({
      ...toolForm,
      references: toolForm.references.filter((_, i) => i !== index)
    });
  };

  const handleSaveTool = () => {
    if (!toolForm.name || !toolForm.description) {
      toast.error("Tool name and description are required");
      return;
    }

    if (editingTool) {
      updateToolMutation.mutate({ id: editingTool.id, data: toolForm });
    } else {
      createToolMutation.mutate(toolForm);
    }
  };

  const handleEditTool = (tool) => {
    setEditingTool(tool);
    setToolForm({
      name: tool.name,
      description: tool.description,
      category: tool.category,
      icon: tool.icon,
      input_fields: tool.input_fields || [],
      calculation_logic: tool.calculation_logic || "",
      references: tool.references || [],
      is_public: tool.is_public || false
    });
    setShowCreateDialog(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <Link to={createPageUrl("Hub")}>
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Hub
          </Button>
        </Link>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Custom Tool Builder</h1>
            <p className="text-slate-600">Create your own clinical calculators and tools</p>
          </div>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create New Tool
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingTool ? "Edit Tool" : "Create New Tool"}</DialogTitle>
                <DialogDescription>
                  Build a custom clinical tool with input fields, calculation logic, and references
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <Label>Tool Name *</Label>
                    <Input
                      value={toolForm.name}
                      onChange={(e) => setToolForm({...toolForm, name: e.target.value})}
                      placeholder="e.g., GCS Calculator"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Description *</Label>
                    <Textarea
                      value={toolForm.description}
                      onChange={(e) => setToolForm({...toolForm, description: e.target.value})}
                      placeholder="Brief description of what this tool does..."
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Category</Label>
                      <Select value={toolForm.category} onValueChange={(val) => setToolForm({...toolForm, category: val})}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categoryOptions.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Icon</Label>
                      <Select value={toolForm.icon} onValueChange={(val) => setToolForm({...toolForm, icon: val})}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {iconOptions.map(opt => (
                            <SelectItem key={opt.name} value={opt.name}>{opt.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Input Fields */}
                <div>
                  <Label className="text-base font-semibold">Input Fields</Label>
                  <Card className="mt-2 bg-slate-50">
                    <CardContent className="p-4 space-y-3">
                      {toolForm.input_fields.map((field, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white rounded border">
                          <div>
                            <div className="font-semibold text-sm">{field.label}</div>
                            <div className="text-xs text-slate-600">
                              {field.type} • {field.unit || "No unit"} • {field.reference_range || "No range"}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveField(idx)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}

                      <div className="grid grid-cols-3 gap-2 mt-4">
                        <Input
                          placeholder="Field name"
                          value={newField.name}
                          onChange={(e) => setNewField({...newField, name: e.target.value})}
                        />
                        <Input
                          placeholder="Label"
                          value={newField.label}
                          onChange={(e) => setNewField({...newField, label: e.target.value})}
                        />
                        <Select value={newField.type} onValueChange={(val) => setNewField({...newField, type: val})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="select">Select</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <Input
                          placeholder="Unit"
                          value={newField.unit}
                          onChange={(e) => setNewField({...newField, unit: e.target.value})}
                        />
                        <Input
                          placeholder="Reference range"
                          value={newField.reference_range}
                          onChange={(e) => setNewField({...newField, reference_range: e.target.value})}
                        />
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="required"
                            checked={newField.required}
                            onCheckedChange={(checked) => setNewField({...newField, required: checked})}
                          />
                          <label htmlFor="required" className="text-sm">Required</label>
                        </div>
                      </div>

                      <Button onClick={handleAddField} variant="outline" size="sm" className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Field
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Calculation Logic */}
                <div>
                  <Label>Calculation Logic</Label>
                  <Textarea
                    value={toolForm.calculation_logic}
                    onChange={(e) => setToolForm({...toolForm, calculation_logic: e.target.value})}
                    placeholder="Enter JavaScript formula or AI prompt for calculation..."
                    className="mt-1 font-mono text-sm"
                    rows={6}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Use AI prompt format: "Calculate X using inputs Y and Z. Return result as JSON."
                  </p>
                </div>

                {/* References */}
                <div>
                  <Label className="text-base font-semibold">References</Label>
                  <Card className="mt-2 bg-slate-50">
                    <CardContent className="p-4 space-y-3">
                      {toolForm.references.map((ref, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white rounded border">
                          <div>
                            <div className="font-semibold text-sm">{ref.title}</div>
                            <div className="text-xs text-slate-600 truncate">{ref.url}</div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveReference(idx)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}

                      <div className="grid grid-cols-2 gap-2 mt-4">
                        <Input
                          placeholder="Reference title"
                          value={newReference.title}
                          onChange={(e) => setNewReference({...newReference, title: e.target.value})}
                        />
                        <Input
                          placeholder="URL"
                          value={newReference.url}
                          onChange={(e) => setNewReference({...newReference, url: e.target.value})}
                        />
                      </div>

                      <Button onClick={handleAddReference} variant="outline" size="sm" className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Reference
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Public/Private */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_public"
                    checked={toolForm.is_public}
                    onCheckedChange={(checked) => setToolForm({...toolForm, is_public: checked})}
                  />
                  <label htmlFor="is_public" className="text-sm">
                    Make this tool public (other users in your specialty can use it)
                  </label>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => { setShowCreateDialog(false); resetForm(); }}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveTool} className="bg-blue-600 hover:bg-blue-700">
                    <Save className="w-4 h-4 mr-2" />
                    {editingTool ? "Update Tool" : "Create Tool"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* My Tools */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myTools.map((tool) => {
            const IconComponent = iconOptions.find(opt => opt.name === tool.icon)?.icon || Calculator;
            
            return (
              <Card key={tool.id} className="bg-white border-2 border-slate-200 hover:border-blue-400 transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{tool.name}</CardTitle>
                        <Badge className="mt-1 text-xs">{tool.category}</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 mb-4">{tool.description}</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEditTool(tool)} className="flex-1">
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this tool?")) {
                          deleteToolMutation.mutate(tool.id);
                        }
                      }}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {myTools.length === 0 && (
            <Card className="col-span-full bg-slate-50 border-dashed">
              <CardContent className="p-12 text-center">
                <Sparkles className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">No custom tools yet</h3>
                <p className="text-slate-600 mb-4">Create your first custom clinical tool</p>
                <Button onClick={() => setShowCreateDialog(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Tool
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}