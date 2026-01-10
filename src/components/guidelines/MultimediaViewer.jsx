import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Music, 
  Video, 
  FileText, 
  Image, 
  Download, 
  Play,
  Pause,
  Volume2
} from 'lucide-react';

export default function MultimediaViewer({ multimedia }) {
  const [playing, setPlaying] = useState(null);

  if (!multimedia) return null;

  const hasContent = multimedia.video_overview_url || 
                     multimedia.slides_url || 
                     multimedia.infographics?.length > 0;

  if (!hasContent) return null;

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader className="bg-purple-100 border-b">
        <CardTitle className="text-base flex items-center gap-2">
          <Music className="w-4 h-4 text-purple-600" />
          Multimedia Resources
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        {multimedia.video_overview_url && (
          <Card className="bg-white border border-purple-200">
            <CardContent className="p-3">
              <div className="flex items-center gap-3 mb-2">
                <Video className="w-5 h-5 text-purple-600 flex-shrink-0" />
                <div className="font-semibold text-sm">Video Overview</div>
              </div>
              <video 
                controls 
                className="w-full rounded-lg"
                src={multimedia.video_overview_url}
              />
            </CardContent>
          </Card>
        )}

        {multimedia.slides_url && (
          <Card className="bg-white border border-purple-200">
            <CardContent className="p-3 flex items-center gap-3">
              <FileText className="w-5 h-5 text-purple-600 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-semibold text-sm">Slide Deck</div>
              </div>
              <Button size="sm" variant="outline" asChild>
                <a href={multimedia.slides_url} target="_blank" rel="noopener noreferrer">
                  <Download className="w-4 h-4 mr-1" />
                  View
                </a>
              </Button>
            </CardContent>
          </Card>
        )}

        {multimedia.infographics?.length > 0 && (
          <div>
            <div className="font-semibold text-sm text-purple-900 mb-2 flex items-center gap-2">
              <Image className="w-4 h-4" />
              Infographics
            </div>
            <div className="grid grid-cols-2 gap-2">
              {multimedia.infographics.map((infographic, idx) => (
                <a
                  key={idx}
                  href={infographic.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Card className="bg-white border border-purple-200 hover:border-purple-400 transition-all cursor-pointer">
                    <CardContent className="p-2">
                      <img 
                        src={infographic.url} 
                        alt={infographic.caption}
                        className="w-full h-32 object-cover rounded mb-2"
                      />
                      <div className="text-xs text-slate-700">{infographic.caption}</div>
                    </CardContent>
                  </Card>
                </a>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}