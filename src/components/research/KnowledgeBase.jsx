import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, BookOpen, FileText, Plus, Search, Tag } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function KnowledgeBase() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const { data: variableDictionaries = [] } = useQuery({
    queryKey: ['variable-dictionaries'],
    queryFn: () => base44.entities.ResearchProject.list().then(projects => 
      projects.map(p => p.data_fields).flat().filter(Boolean)
    )
  });

  const { data: protocols = [] } = useQuery({
    queryKey: ['research-protocols'],
    queryFn: () => []
  });

  const categories = [
    { id: 'all', name: 'All', count: variableDictionaries.length + protocols.length },
    { id: 'variables', name: 'Variable Dictionaries', count: variableDictionaries.length },
    { id: 'protocols', name: 'Study Protocols', count: protocols.length },
    { id: 'datasets', name: 'De-identified Datasets', count: 0 }
  ];

  return (
    <div className="space-y-6">
      <Card className="shadow-xl">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-600" />
              Research Knowledge Base
            </CardTitle>
            <Button className="bg-indigo-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Resource
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search variables, protocols, datasets..."
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            {categories.map(cat => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? 'default' : 'outline'}
                onClick={() => setActiveCategory(cat.id)}
                className={activeCategory === cat.id ? 'bg-indigo-600' : ''}
              >
                {cat.name} ({cat.count})
              </Button>
            ))}
          </div>

          <Tabs defaultValue="variables">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="variables">Variables</TabsTrigger>
              <TabsTrigger value="protocols">Protocols</TabsTrigger>
              <TabsTrigger value="datasets">Datasets</TabsTrigger>
            </TabsList>

            <TabsContent value="variables">
              <div className="grid md:grid-cols-2 gap-4">
                {variableDictionaries.map((variable, idx) => (
                  <Card key={idx} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-slate-900 mb-2">{variable.field_name}</h4>
                      <p className="text-sm text-slate-600 mb-3">{variable.field_type}</p>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">
                          <Tag className="w-3 h-3 mr-1" />
                          Reusable
                        </Badge>
                        {variable.required && (
                          <Badge variant="outline" className="text-xs bg-amber-50">
                            Required
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {variableDictionaries.length === 0 && (
                  <div className="col-span-2 text-center py-12 text-slate-500">
                    <Database className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p>No variable dictionaries yet. Create research forms to build your knowledge base.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="protocols">
              <div className="text-center py-12 text-slate-500">
                <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p>Study protocols will appear here once projects are completed.</p>
              </div>
            </TabsContent>

            <TabsContent value="datasets">
              <div className="text-center py-12 text-slate-500">
                <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p>De-identified datasets from completed studies will be available here.</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}