import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Calendar, ExternalLink, Download, Star, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function GuidelineListView({ guidelines, onOpen, onStar, starredIds = [] }) {
  const getCategoryColor = (category) => {
    const colors = {
      'AKI': 'bg-red-100 text-red-800',
      'CKD': 'bg-orange-100 text-orange-800',
      'Nephrotic Syndrome': 'bg-blue-100 text-blue-800',
      'Hypertension': 'bg-pink-100 text-pink-800',
      'default': 'bg-slate-100 text-slate-800'
    };
    return colors[category] || colors.default;
  };

  return (
    <div className="space-y-2">
      {guidelines.map((guideline) => (
        <Card 
          key={guideline.id}
          className="p-4 hover:shadow-md transition-all cursor-pointer border-2 hover:border-blue-400"
          onClick={() => onOpen(guideline)}
        >
          <div className="flex items-center gap-4">
            <BookOpen className="w-5 h-5 text-blue-600 flex-shrink-0" />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-slate-900 truncate">{guideline.title}</h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStar?.(guideline.id);
                  }}
                >
                  <Star 
                    className={cn(
                      "w-4 h-4 flex-shrink-0",
                      starredIds.includes(guideline.id) ? "fill-yellow-500 text-yellow-500" : "text-slate-400"
                    )}
                  />
                </button>
              </div>
              <p className="text-sm text-slate-600 line-clamp-1">
                {guideline.scope_and_population || guideline.summary}
              </p>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="flex flex-wrap gap-1">
                <Badge className={cn("text-xs", getCategoryColor(guideline.category))}>
                  {guideline.category}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {guideline.source}
                </Badge>
                {(guideline.multimedia?.audio_overview_url || guideline.multimedia?.video_overview_url) && (
                  <Badge className="bg-purple-100 text-purple-800 text-xs">
                    <Play className="w-3 h-3" />
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Calendar className="w-3 h-3" />
                {guideline.year}
              </div>

              {guideline.pdf_url && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(guideline.pdf_url, '_blank');
                  }}
                >
                  <Download className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}