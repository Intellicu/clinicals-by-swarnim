import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, Star, Play, Eye, Calendar, TrendingUp,
  ExternalLink, Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

export default function CompactGuidelineTile({ guideline, onOpen, onStar, isStarred }) {
  const getCategoryColor = (category) => {
    const colors = {
      'AKI': 'bg-red-100 text-red-800',
      'CKD': 'bg-orange-100 text-orange-800',
      'Nephrotic Syndrome': 'bg-blue-100 text-blue-800',
      'Hypertension': 'bg-pink-100 text-pink-800',
      'Dialysis': 'bg-cyan-100 text-cyan-800',
      'Transplant': 'bg-green-100 text-green-800',
      'default': 'bg-slate-100 text-slate-800'
    };
    return colors[category] || colors.default;
  };

  const hasMultimedia = guideline.multimedia?.audio_overview_url || 
                        guideline.multimedia?.video_overview_url ||
                        (guideline.multimedia?.infographics?.length > 0);

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Card 
          className="h-[120px] p-3 hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-400 flex flex-col"
          onClick={onOpen}
        >
          <div className="flex items-start gap-2 mb-2">
            <BookOpen className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-slate-900 line-clamp-1">
                {guideline.title}
              </h3>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStar?.();
              }}
              className="flex-shrink-0"
            >
              <Star 
                className={cn(
                  "w-4 h-4",
                  isStarred ? "fill-yellow-500 text-yellow-500" : "text-slate-400"
                )}
              />
            </button>
          </div>

          <div className="flex flex-wrap gap-1 mb-2">
            <Badge className={cn("text-xs px-1.5 py-0", getCategoryColor(guideline.category))}>
              {guideline.category}
            </Badge>
            <Badge variant="outline" className="text-xs px-1.5 py-0">
              {guideline.source}
            </Badge>
            {hasMultimedia && (
              <Badge className="bg-purple-100 text-purple-800 text-xs px-1.5 py-0">
                <Play className="w-3 h-3" />
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 mt-auto">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {guideline.year}
            </span>
            {guideline.usage_count > 0 && (
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {guideline.usage_count}
              </span>
            )}
          </div>
        </Card>
      </HoverCardTrigger>
      <HoverCardContent className="w-96" side="top">
        <div className="space-y-3">
          <div>
            <h4 className="font-bold text-slate-900 mb-1">{guideline.title}</h4>
            <p className="text-sm text-slate-600 line-clamp-2">
              {guideline.scope_and_population || guideline.summary}
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={onOpen} className="flex-1">
              <Eye className="w-3 h-3 mr-1" />
              Open
            </Button>
            {guideline.pdf_url && (
              <Button size="sm" variant="outline" asChild>
                <a href={guideline.pdf_url} target="_blank" rel="noopener noreferrer">
                  <Download className="w-3 h-3" />
                </a>
              </Button>
            )}
            {guideline.external_link && (
              <Button size="sm" variant="outline" asChild>
                <a href={guideline.external_link} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-3 h-3" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}