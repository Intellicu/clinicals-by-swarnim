import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft, BookOpen, Clock, ChevronDown, ChevronUp,
  Star, AlertTriangle, HelpCircle, CheckCircle, Loader2, AlertCircle
} from "lucide-react";

function QuizCard({ quiz, index }) {
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const correct = Number(quiz.correct_answer);

  return (
    <Card className="border-indigo-200 bg-indigo-50/50">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-2">
          <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-slate-800">Q{index + 1}. {quiz.question}</p>
        </div>
        <div className="space-y-2">
          {quiz.options.map((opt, i) => {
            let cls = "border border-slate-200 bg-white text-slate-700";
            if (revealed) {
              if (i === correct) cls = "border-green-400 bg-green-50 text-green-800 font-semibold";
              else if (i === selected) cls = "border-red-300 bg-red-50 text-red-700 line-through";
            } else if (i === selected) cls = "border-indigo-400 bg-indigo-50 text-indigo-800";
            return (
              <button
                key={i}
                className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-all ${cls}`}
                onClick={() => !revealed && setSelected(i)}
              >
                {String.fromCharCode(65 + i)}. {opt}
              </button>
            );
          })}
        </div>
        {!revealed && selected !== null && (
          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-7"
            onClick={() => setRevealed(true)}>
            Check Answer
          </Button>
        )}
        {revealed && quiz.explanation && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-800">
            <strong>Explanation:</strong> {quiz.explanation}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TopicSection({ topic, index }) {
  const [open, setOpen] = useState(index === 0);
  return (
    <Card className="border-slate-200 overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
        onClick={() => setOpen(v => !v)}
      >
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold shrink-0">
            {index + 1}
          </span>
          <span className="font-semibold text-sm text-slate-800">{topic.heading}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && (
        <CardContent className="p-4 space-y-3">
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{topic.content}</p>
          {topic.key_points?.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Key Points</p>
              {topic.key_points.map((kp, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-700">{kp}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export default function TeachingModuleViewer({ moduleId, onBack }) {
  const { data: modules, isLoading, error } = useQuery({
    queryKey: ["TeachingModule", moduleId],
    queryFn: () => base44.entities.TeachingModule.filter({ id: moduleId }),
    enabled: !!moduleId,
  });

  const mod = modules?.[0];
  const content = mod?.data?.content || mod?.content || {};
  const topics = content.topics || [];
  const pearls = content.clinical_pearls || [];
  const pitfalls = content.common_pitfalls || [];
  const quizzes = mod?.data?.quizzes || mod?.quizzes || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
        <span className="text-slate-600 text-sm">Loading module…</span>
      </div>
    );
  }

  if (error || !mod) {
    return (
      <div className="text-center py-16 space-y-3">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
        <p className="text-slate-600 text-sm">Module not found or failed to load.</p>
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Back + header */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={onBack} className="shrink-0">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <div className="flex flex-wrap gap-2">
          {mod.data?.category && (
            <Badge className="bg-blue-100 text-blue-800 text-xs">{mod.data.category}</Badge>
          )}
          {mod.data?.difficulty_level && (
            <Badge className="bg-purple-100 text-purple-800 text-xs">{mod.data.difficulty_level}</Badge>
          )}
          {mod.data?.estimated_duration && (
            <Badge variant="outline" className="text-xs flex items-center gap-1">
              <Clock className="w-3 h-3" /> {mod.data.estimated_duration}
            </Badge>
          )}
        </div>
      </div>

      {/* Title */}
      <div className="rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 p-5 text-white">
        <div className="flex items-start gap-3">
          <BookOpen className="w-6 h-6 shrink-0 mt-0.5" />
          <h2 className="text-lg font-bold leading-snug">{mod.data?.title || "Untitled"}</h2>
        </div>
      </div>

      {/* Overview */}
      {content.overview && (
        <Card className="border-blue-200 bg-blue-50/40">
          <CardContent className="p-4">
            <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-2">Overview</p>
            <p className="text-sm text-slate-700 leading-relaxed">{content.overview}</p>
          </CardContent>
        </Card>
      )}

      {/* Topics */}
      {topics.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide px-1">Topics ({topics.length})</p>
          {topics.map((t, i) => <TopicSection key={i} topic={t} index={i} />)}
        </div>
      )}

      {/* Clinical Pearls */}
      {pearls.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-4 h-4 text-amber-500" />
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">Clinical Pearls</p>
            </div>
            {pearls.map((p, i) => (
              <div key={i} className="flex items-start gap-2">
                <Star className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-700">{p}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Common Pitfalls */}
      {pitfalls.length > 0 && (
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <p className="text-xs font-bold text-red-700 uppercase tracking-wide">Common Pitfalls</p>
            </div>
            {pitfalls.map((p, i) => (
              <div key={i} className="flex items-start gap-2">
                <AlertTriangle className="w-3 h-3 text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-700">{p}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Quizzes */}
      {quizzes.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide px-1">Quiz ({quizzes.length} questions)</p>
          {quizzes.map((q, i) => <QuizCard key={i} quiz={q} index={i} />)}
        </div>
      )}

      {/* Bottom back */}
      <div className="pt-2 pb-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Pathways
        </Button>
      </div>
    </div>
  );
}