import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Upload, 
  Loader2, 
  BookOpen,
  GitBranch,
  Plus,
  Trash2,
  Edit
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function UserContentManager() {
  const [activeTab, setActiveTab] = useState('guidelines');
  const queryClient = useQueryClient();

  // Guidelines State
  const [showGuidelineDialog, setShowGuidelineDialog] = useState(false);
  const [isExtractingGuideline, setIsExtractingGuideline] = useState(false);
  const [guidelineForm, setGuidelineForm] = useState({
    title: '',
    category: '',
    source: '',
    year: new Date().getFullYear(),
    scope_and_population: '',
    summary: '',
    key_recommendations: [],
    practice_pearls: []
  });

  // Monitoring Template State
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    category: '',
    description: '',
    frequency: '',
    fields: []
  });

  // Scenario Builder State
  const [showScenarioDialog, setShowScenarioDialog] = useState(false);
  const [scenarioForm, setScenarioForm] = useState({
    title: '',
    category: '',
    priority: 'secondary',
    description: '',
    steps: []
  });

  const fileInputRef = useRef(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: userGuidelines = [] } = useQuery({
    queryKey: ['user-guidelines'],
    queryFn: async () => {
      const all = await base44.entities.Guideline.list('-created_date');
      return all.filter(g => g.created_by === user?.email);
    },
    enabled: !!user
  });

  const { data: userTemplates = [] } = useQuery({
    queryKey: ['user-templates'],
    queryFn: async () => {
      const all = await base44.entities.MonitoringTemplate.list('-created_date');
      return all.filter(t => t.created_by === user?.email);
    },
    enabled: !!user
  });

  const createGuidelineMutation = useMutation({
    mutationFn: (data) => base44.entities.Guideline.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-guidelines'] });
      setShowGuidelineDialog(false);
      toast.success('Guideline created!');
    }
  });

  const createTemplateMutation = useMutation({
    mutationFn: (data) => base44.entities.MonitoringTemplate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-templates'] });
      setShowTemplateDialog(false);
      toast.success('Template created!');
    }
  });

  const handleGuidelineFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsExtractingGuideline(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      const prompt = `Extract clinical guideline information from this PDF.

Return structured data:
- Title
- Source organization
- Year
- Target population and scope
- 8-12 key recommendations (sequential steps)
- 4-6 practice pearls (bedside tips)
- Summary (2-3 sentences)

Format clearly for clinical use.`;

      const extracted = await base44.integrations.Core.InvokeLLM({
        prompt,
        file_urls: [file_url],
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            source: { type: 'string' },
            year: { type: 'number' },
            scope_and_population: { type: 'string' },
            summary: { type: 'string' },
            key_recommendations: { type: 'array', items: { type: 'string' } },
            practice_pearls: { type: 'array', items: { type: 'string' } },
            category: { type: 'string' }
          }
        }
      });

      setGuidelineForm({
        ...guidelineForm,
        ...extracted,
        pdf_url: file_url
      });
      toast.success('Guideline extracted!');
    } catch (error) {
      toast.error('Failed to extract guideline');
    } finally {
      setIsExtractingGuideline(false);
    }
  };

  const handleCreateGuideline = () => {
    if (!guidelineForm.title || !guidelineForm.category) {
      toast.error('Title and category required');
      return;
    }

    createGuidelineMutation.mutate({
      ...guidelineForm,
      created_by: user?.email,
      is_editable: true,
      status: 'Active'
    });
  };

  const handleCreateTemplate = () => {
    if (!templateForm.name || !templateForm.category) {
      toast.error('Name and category required');
      return;
    }

    createTemplateMutation.mutate({
      ...templateForm,
      created_by: user?.email
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <Link to={createPageUrl('Hub')}>
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Content Manager</h1>
          <p className="text-slate-600">Upload your own guidelines, create monitoring templates, and build scenarios</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="guidelines">My Guidelines</TabsTrigger>
            <TabsTrigger value="templates">My Templates</TabsTrigger>
            <TabsTrigger value="scenarios">Scenario Builder</TabsTrigger>
          </TabsList>

          <TabsContent value="guidelines" className="space-y-4 mt-6">
            <div className="flex justify-end">
              <Dialog open={showGuidelineDialog} onOpenChange={setShowGuidelineDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Upload Guideline
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Upload Clinical Guideline</DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center">
                      <BookOpen className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                      <p className="text-sm text-slate-600 mb-4">Upload PDF for AI extraction</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        onChange={handleGuidelineFileUpload}
                        className="hidden"
                      />
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isExtractingGuideline}
                        variant="outline"
                      >
                        {isExtractingGuideline ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Extracting...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Select PDF
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Title *</Label>
                        <Input
                          value={guidelineForm.title}
                          onChange={(e) => setGuidelineForm({...guidelineForm, title: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Category *</Label>
                        <Select value={guidelineForm.category} onValueChange={(val) => setGuidelineForm({...guidelineForm, category: val})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AKI">AKI</SelectItem>
                            <SelectItem value="CKD">CKD</SelectItem>
                            <SelectItem value="Nephrotic Syndrome">Nephrotic Syndrome</SelectItem>
                            <SelectItem value="Hypertension">Hypertension</SelectItem>
                            <SelectItem value="Electrolytes">Electrolytes</SelectItem>
                            <SelectItem value="General">General</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Summary</Label>
                      <Textarea
                        value={guidelineForm.summary}
                        onChange={(e) => setGuidelineForm({...guidelineForm, summary: e.target.value})}
                        className="h-24"
                      />
                    </div>

                    <Button
                      onClick={handleCreateGuideline}
                      disabled={createGuidelineMutation.isPending}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {createGuidelineMutation.isPending ? 'Creating...' : 'Create Guideline'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {userGuidelines.map((guideline) => (
                <Card key={guideline.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-lg">{guideline.title}</h4>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline">{guideline.category}</Badge>
                          <Badge variant="outline">{guideline.year}</Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {userGuidelines.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>No guidelines uploaded yet</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4 mt-6">
            <div className="flex justify-end">
              <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Template
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create Monitoring Template</DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <Label>Template Name *</Label>
                      <Input
                        value={templateForm.name}
                        onChange={(e) => setTemplateForm({...templateForm, name: e.target.value})}
                        placeholder="e.g., Post-Transplant Monitoring"
                      />
                    </div>

                    <div>
                      <Label>Category *</Label>
                      <Input
                        value={templateForm.category}
                        onChange={(e) => setTemplateForm({...templateForm, category: e.target.value})}
                        placeholder="e.g., Transplant"
                      />
                    </div>

                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={templateForm.description}
                        onChange={(e) => setTemplateForm({...templateForm, description: e.target.value})}
                        className="h-20"
                      />
                    </div>

                    <Button
                      onClick={handleCreateTemplate}
                      disabled={createTemplateMutation.isPending}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      Create Template
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {userTemplates.map((template) => (
                <Card key={template.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-lg">{template.name}</h4>
                        <Badge variant="outline" className="mt-2">{template.category}</Badge>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="scenarios" className="space-y-4 mt-6">
            <Alert className="bg-purple-50 border-purple-200">
              <GitBranch className="w-4 h-4 text-purple-600" />
              <AlertDescription className="text-purple-800">
                Build custom clinical pathways with steps, branching logic, and integrated calculators
              </AlertDescription>
            </Alert>

            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Build New Scenario
            </Button>

            <div className="text-center py-12 text-slate-500">
              <GitBranch className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>Scenario builder coming soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}