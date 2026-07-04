import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Database, BookOpen, FileText, Users, TrendingUp, Sparkles,
  Search, Plus, Download, Share2, Star, Copy, Brain
} from 'lucide-react';
import { toast } from 'sonner';

export default function KnowledgeBase() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [newItem, setNewItem] = useState({
    title: '',
    type: 'Variable_Dictionary',
    category: '',
    tags: [],
    content: {},
    is_public: false
  });

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: knowledgeItems = [], isLoading } = useQuery({
    queryKey: ['knowledge-base'],
    queryFn: () => base44.entities.ResearchKnowledgeBase.list('-usage_count')
  });

  const createItemMutation = useMutation({
    mutationFn: (data) => base44.entities.ResearchKnowledgeBase.create({
      ...data,
      created_by: user?.email,
      usage_count: 0
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-base'] });
      toast.success('Knowledge base item created!');
      setShowCreateDialog(false);
      setNewItem({ title: '', type: 'Variable_Dictionary', category: '', tags: [], content: {}, is_public: false });
    }
  });

  const generateAIInsights = async (item) => {
    toast.loading('Generating AI insights...');
    
    const insights = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this research knowledge base item and provide:
1. Feasibility score (0-100)
2. Similar studies in pediatric nephrology
3. Suggested improvements
4. Research gaps this could address

Item details:
Type: ${item.type}
Title: ${item.title}
Category: ${item.category}
Content: ${JSON.stringify(item.content)}`,
      response_json_schema: {
        type: "object",
        properties: {
          feasibility_score: { type: "number" },
          similar_studies: { type: "array", items: { type: "string" } },
          suggested_improvements: { type: "array", items: { type: "string" } },
          research_gaps: { type: "array", items: { type: "string" } }
        }
      }
    });

    await base44.entities.ResearchKnowledgeBase.update(item.id, {
      ai_insights: insights
    });

    queryClient.invalidateQueries({ queryKey: ['knowledge-base'] });
    toast.success('AI insights generated!');
  };

  const filteredItems = knowledgeItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || item.type === selectedType;
    return matchesSearch && matchesType;
  });

  const itemTypeIcons = {
    'Variable_Dictionary': Database,
    'Study_Protocol': BookOpen,
    'Dataset': FileText,
    'Recruitment_Template': Users,
    'Analysis_Template': TrendingUp
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-8 h-8 text-indigo-600" />
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Research Knowledge Base</h2>
              <p className="text-slate-600">Reusable research assets & AI-powered insights</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search knowledge base..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Variable_Dictionary">Variable Dictionary</SelectItem>
                <SelectItem value="Study_Protocol">Study Protocol</SelectItem>
                <SelectItem value="Dataset">Dataset</SelectItem>
                <SelectItem value="Recruitment_Template">Recruitment</SelectItem>
                <SelectItem value="Analysis_Template">Analysis</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setShowCreateDialog(true)} className="bg-indigo-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-indigo-600 mb-2">{knowledgeItems.length}</div>
            <div className="text-sm text-slate-600">Total Assets</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {knowledgeItems.filter(i => i.is_public).length}
            </div>
            <div className="text-sm text-slate-600">Public Assets</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {knowledgeItems.reduce((sum, i) => sum + (i.usage_count || 0), 0)}
            </div>
            <div className="text-sm text-slate-600">Total Reuses</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map(item => {
          const IconComponent = itemTypeIcons[item.type] || Database;
          return (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base mb-1 line-clamp-2">{item.title}</CardTitle>
                      <div className="flex gap-1 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {item.type.replace('_', ' ')}
                        </Badge>
                        {item.category && (
                          <Badge variant="outline" className="text-xs">{item.category}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  {item.is_public && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-3">
                  {item.ai_insights && (
                    <div className="bg-purple-50 p-2 rounded-lg text-xs">
                      <div className="flex items-center gap-1 text-purple-700 font-semibold mb-1">
                        <Brain className="w-3 h-3" />
                        AI Insights
                      </div>
                      <div className="text-slate-600">
                        Feasibility: {item.ai_insights.feasibility_score}%
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Used {item.usage_count || 0} times</span>
                    <span>{new Date(item.created_date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setSelectedItem(item)}
                  >
                    <FileText className="w-3 h-3 mr-1" />
                    View
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => generateAIInsights(item)}
                  >
                    <Sparkles className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Database className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">No items found</h3>
            <p className="text-sm text-slate-500 mb-4">Start building your research knowledge base</p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Item
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add to Knowledge Base</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input
                value={newItem.title}
                onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                placeholder="e.g., Nephrotic Syndrome Standard Variables"
              />
            </div>
            <div>
              <Label>Type *</Label>
              <Select value={newItem.type} onValueChange={(val) => setNewItem({...newItem, type: val})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Variable_Dictionary">Variable Dictionary</SelectItem>
                  <SelectItem value="Study_Protocol">Study Protocol</SelectItem>
                  <SelectItem value="Dataset">Dataset</SelectItem>
                  <SelectItem value="Recruitment_Template">Recruitment Template</SelectItem>
                  <SelectItem value="Analysis_Template">Analysis Template</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Category</Label>
              <Input
                value={newItem.category}
                onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                placeholder="e.g., Nephrotic Syndrome"
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => createItemMutation.mutate(newItem)}
                disabled={!newItem.title || createItemMutation.isPending}
                className="bg-indigo-600"
              >
                Create Item
              </Button>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedItem?.title}</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Badge>{selectedItem.type.replace('_', ' ')}</Badge>
                {selectedItem.category && <Badge variant="outline">{selectedItem.category}</Badge>}
                {selectedItem.is_public && <Badge className="bg-green-100 text-green-800">Public</Badge>}
              </div>
              
              {selectedItem.ai_insights && (
                <Card className="bg-purple-50 border-purple-200">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-600" />
                      AI-Generated Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="font-semibold text-sm mb-1">Feasibility Score</div>
                      <div className="text-2xl font-bold text-purple-600">
                        {selectedItem.ai_insights.feasibility_score}%
                      </div>
                    </div>
                    {selectedItem.ai_insights.suggested_improvements?.length > 0 && (
                      <div>
                        <div className="font-semibold text-sm mb-1">Suggested Improvements</div>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          {selectedItem.ai_insights.suggested_improvements.map((imp, idx) => (
                            <li key={idx}>{imp}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {selectedItem.ai_insights.research_gaps?.length > 0 && (
                      <div>
                        <div className="font-semibold text-sm mb-1">Research Gaps Identified</div>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          {selectedItem.ai_insights.research_gaps.map((gap, idx) => (
                            <li key={idx}>{gap}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <div>
                <div className="text-sm text-slate-600 mb-2">
                  Created by: {selectedItem.created_by} • Used {selectedItem.usage_count || 0} times
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}