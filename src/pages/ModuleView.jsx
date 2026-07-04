import React, { useState, useEffect } from "react";
import { base44 } from "@/api/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  BookOpen,
  Target,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  MessageCircle,
  Award,
  Clock,
  FileText,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

const categoryIcons = {
  Dialysis: "💧",
  AKI: "⚠️",
  CKD: "📊",
  "Glomerular Diseases": "🔬",
  Electrolytes: "⚡",
  Hypertension: "❤️",
  Transplant: "🫀",
  "General Nephrology": "🩺",
  Procedures: "🏥",
  Pathology: "🔬"
};

const difficultyColors = {
  Beginner: "bg-green-100 text-green-800 border-green-300",
  Intermediate: "bg-amber-100 text-amber-800 border-amber-300",
  Advanced: "bg-red-100 text-red-800 border-red-300"
};

export default function ModuleView() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const moduleId = queryParams.get('id');
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("content");
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [studentNotes, setStudentNotes] = useState("");

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: module, isLoading } = useQuery({
    queryKey: ['teachingModule', moduleId],
    queryFn: async () => {
      const modules = await base44.entities.TeachingModule.filter({ id: moduleId });
      return modules[0];
    },
    enabled: !!moduleId
  });

  const { data: progress } = useQuery({
    queryKey: ['studentProgress', user?.email, moduleId],
    queryFn: async () => {
      if (!user?.email || !moduleId) return null;
      const progs = await base44.entities.StudentProgress.filter({
        user_email: user.email,
        module_id: moduleId
      });
      return progs[0] || null;
    },
    enabled: !!user?.email && !!moduleId
  });

  const updateProgressMutation = useMutation({
    mutationFn: async (data) => {
      if (progress?.id) {
        return base44.entities.StudentProgress.update(progress.id, data);
      } else {
        return base44.entities.StudentProgress.create({
          user_email: user.email,
          module_id: moduleId,
          ...data
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentProgress', user?.email, moduleId] });
    },
    onError: (error) => {
      toast.error(`Failed to save progress: ${error.message}`);
    }
  });

  useEffect(() => {
    if (!startTime && module) {
      setStartTime(Date.now());
    }

    if (progress?.notes && studentNotes === "") {
      setStudentNotes(progress.notes);
    }

    return () => {
      if (startTime && module && user && !updateProgressMutation.isPending) {
        const timeSpent = Math.round((Date.now() - startTime) / 60000);
        if (timeSpent > 0) {
          updateProgressMutation.mutate({
            time_spent_minutes: (progress?.time_spent_minutes || 0) + timeSpent,
            last_accessed: new Date().toISOString()
          });
        }
      }
    };
  }, [module, user, startTime]);

  const handleQuizSubmit = () => {
    if (!module?.quizzes || module.quizzes.length === 0) return;

    const currentQuiz = module.quizzes[currentQuizIndex];
    const selectedAnswer = quizAnswers[currentQuizIndex];

    if (selectedAnswer === undefined) {
      toast.error("Please select an answer.");
      return;
    }

    setShowResults(true);

    const score = selectedAnswer === currentQuiz.correct_answer ? 1 : 0;
    const newQuizScore = {
      quiz_index: currentQuizIndex,
      selected_answer: selectedAnswer,
      is_correct: score === 1,
      date: new Date().toISOString()
    };

    const updatedScores = [...(progress?.quiz_scores || [])];
    const existingIndex = updatedScores.findIndex(s => s.quiz_index === currentQuizIndex);
    if (existingIndex >= 0) {
      updatedScores[existingIndex] = newQuizScore;
    } else {
      updatedScores.push(newQuizScore);
    }

    updateProgressMutation.mutate({
      quiz_scores: updatedScores,
      last_accessed: new Date().toISOString()
    });
  };

  const handleNextQuiz = () => {
    if (module?.quizzes && currentQuizIndex < module.quizzes.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1);
      setShowResults(false);
    }
  };

  const handlePreviousQuiz = () => {
    if (currentQuizIndex > 0) {
      setCurrentQuizIndex(currentQuizIndex - 1);
      setShowResults(false);
    }
  };

  const handleMarkComplete = () => {
    updateProgressMutation.mutate({
      completed: true,
      last_accessed: new Date().toISOString()
    });
    toast.success("Module marked as complete!");
  };

  const handleSaveNotes = () => {
    updateProgressMutation.mutate({
      notes: studentNotes,
      last_accessed: new Date().toISOString()
    });
    toast.success("Notes saved!");
  };

  const getQuizScore = () => {
    if (!progress?.quiz_scores || progress.quiz_scores.length === 0) return { correct: 0, total: 0 };
    const correct = progress.quiz_scores.filter(s => s.is_correct).length;
    return { correct, total: progress.quiz_scores.length };
  };

  const getProgress = () => {
    if (!module || !progress) return 0;

    let totalPoints = 0;
    let earnedPoints = 0;

    if (activeTab === "content" && module.content) {
      earnedPoints += 1;
    }
    totalPoints += 1;

    if (module.quizzes?.length > 0) {
      totalPoints += module.quizzes.length;
      earnedPoints += progress.quiz_scores?.filter(q => q.is_correct).length || 0;
    }

    if (progress.completed) {
      earnedPoints += 10;
    }
    totalPoints += 10;

    if (totalPoints === 0) return 0;
    const calculatedProgress = Math.min(100, Math.round((earnedPoints / totalPoints) * 100));
    return calculatedProgress;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 p-6 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 p-6">
        <div className="max-w-4xl mx-auto text-center py-16">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Module Not Found</h1>
          <Link to={createPageUrl("TeachingHub")}>
            <Button><ArrowLeft className="w-4 h-4 mr-2" />Back to Teaching Hub</Button>
          </Link>
        </div>
      </div>
    );
  }

  const quizScore = getQuizScore();
  const currentQuiz = module.quizzes?.[currentQuizIndex];
  const currentQuizSelectedAnswer = quizAnswers[currentQuizIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        <Link to={createPageUrl("TeachingHub")}>
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Teaching Hub
          </Button>
        </Link>

        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">{categoryIcons[module.category] || "📚"}</span>
                <Badge className={`${difficultyColors[module.difficulty_level]} border text-base px-3 py-1`}>
                  {module.difficulty_level}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{module.title}</h1>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {module.estimated_duration || "Self-paced"}
                </div>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
                  {module.category}
                </Badge>
              </div>
            </div>

            {!progress?.completed && (
              <Button onClick={handleMarkComplete} className="bg-green-600 hover:bg-green-700">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Mark Complete
              </Button>
            )}
            {progress?.completed && (
              <Badge className="bg-green-600 text-white px-4 py-2 text-base">
                <Award className="w-4 h-4 mr-2" />
                Completed!
              </Badge>
            )}
          </div>

          {progress && (user?.email || progress?.id) && (
            <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-purple-900">Your Progress</span>
                  <span className="text-sm text-purple-700">{getProgress()}%</span>
                </div>
                <Progress value={getProgress()} className="h-3 mb-2" />
                <div className="flex items-center gap-4 text-xs text-purple-700">
                  <div>Quiz Score: {quizScore.correct}/{quizScore.total}</div>
                  {progress.time_spent_minutes > 0 && <div>Time: {progress.time_spent_minutes} min</div>}
                  {progress.completed && (
                    <Badge className="bg-green-600 text-white">
                      <Award className="w-3 h-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex w-full h-auto overflow-x-auto p-1">
            <TabsTrigger value="content" className="flex-shrink-0">📖 Learn</TabsTrigger>
            <TabsTrigger value="objectives" className="flex-shrink-0">🎯 Objectives</TabsTrigger>
            <TabsTrigger value="quiz" className="flex-shrink-0">📝 Quiz</TabsTrigger>
            <TabsTrigger value="cases" className="flex-shrink-0">🏥 Cases</TabsTrigger>
            <TabsTrigger value="notes" className="flex-shrink-0">✍️ Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="content">
            <Card className="bg-white shadow-lg">
              <CardHeader className="bg-slate-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                  Module Content
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {module.content?.overview && (
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-slate-900 mb-3">Overview</h3>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-line">{module.content.overview}</p>
                  </div>
                )}

                {module.content?.topics?.map((topic, idx) => (
                  <Card key={idx} className="mb-6 border-2 border-purple-100">
                    <CardHeader className="bg-purple-50 border-b">
                      <CardTitle className="text-lg text-purple-900">{topic.heading}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="prose prose-slate max-w-none mb-4">
                        <p className="text-slate-700 leading-relaxed whitespace-pre-line">{topic.content}</p>
                      </div>

                      {topic.key_points?.length > 0 && (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            Key Points
                          </h4>
                          <ul className="space-y-2">
                            {topic.key_points.map((point, pidx) => (
                              <li key={pidx} className="flex items-start gap-2 text-sm text-slate-700">
                                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {module.content?.clinical_pearls?.length > 0 && (
                  <Card className="mb-6 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200">
                    <CardHeader className="bg-amber-100 border-b border-amber-200">
                      <CardTitle className="flex items-center gap-2 text-amber-900">
                        <Lightbulb className="w-5 h-5" />
                        Clinical Pearls
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        {module.content.clinical_pearls.map((pearl, idx) => (
                          <div key={idx} className="flex items-start gap-3 bg-white p-3 rounded-lg border border-amber-200">
                            <div className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                              {idx + 1}
                            </div>
                            <p className="text-sm text-slate-800">{pearl}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {module.content?.common_pitfalls?.length > 0 && (
                  <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200">
                    <CardHeader className="bg-red-100 border-b border-red-200">
                      <CardTitle className="flex items-center gap-2 text-red-900">
                        <AlertTriangle className="w-5 h-5" />
                        Common Pitfalls to Avoid
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        {module.content.common_pitfalls.map((pitfall, idx) => (
                          <Alert key={idx} className="bg-white border-red-200">
                            <AlertDescription className="flex items-start gap-2">
                              <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-slate-800">{pitfall}</span>
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="objectives">
            <Card className="bg-white shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <CardTitle className="flex items-center gap-2 text-indigo-900">
                  <Target className="w-6 h-6 text-indigo-600" />
                  Learning Objectives
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {module.content?.learning_objectives?.length > 0 ? (
                  <div className="space-y-4">
                    {module.content.learning_objectives.map((obj, idx) => (
                      <div key={idx} className="flex items-start gap-4 bg-gradient-to-r from-blue-50 to-white p-4 rounded-lg border-2 border-blue-200">
                        <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-lg">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-slate-800 font-medium">{obj}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-600">No learning objectives specified.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quiz">
            <Card className="bg-white shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-purple-900">
                    <Award className="w-6 h-6 text-purple-600" />
                    Quiz - Test Your Knowledge
                  </CardTitle>
                  {module.quizzes?.length > 0 && (
                    <Badge className="bg-purple-600 text-white">
                      Question {currentQuizIndex + 1} of {module.quizzes.length}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {module.quizzes?.length > 0 && currentQuiz ? (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-purple-50 to-white p-6 rounded-lg border-2 border-purple-200">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-lg font-bold text-slate-900 flex-1">{currentQuiz.question}</h3>
                        <Badge className={
                          currentQuiz.difficulty === "Easy" ? "bg-green-100 text-green-800" :
                          currentQuiz.difficulty === "Medium" ? "bg-amber-100 text-amber-800" :
                          "bg-red-100 text-red-800"
                        }>
                          {currentQuiz.difficulty}
                        </Badge>
                      </div>

                      <RadioGroup
                        value={currentQuizSelectedAnswer?.toString()}
                        onValueChange={(val) => setQuizAnswers({...quizAnswers, [currentQuizIndex]: parseInt(val)})}
                        disabled={showResults}
                      >
                        <div className="space-y-3">
                          {currentQuiz.options.map((option, idx) => {
                            const isCorrect = idx === currentQuiz.correct_answer;
                            const isSelected = idx === currentQuizSelectedAnswer;
                            const wasSubmittedCorrectly = showResults && isCorrect && isSelected;
                            const wasSubmittedIncorrectly = showResults && !isCorrect && isSelected;
                            const wasCorrectAnswerButNotSelected = showResults && isCorrect && !isSelected;

                            return (
                              <div
                                key={idx}
                                className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all ${
                                  wasSubmittedCorrectly ? "bg-green-50 border-green-500" :
                                  wasSubmittedIncorrectly ? "bg-red-50 border-red-500" :
                                  wasCorrectAnswerButNotSelected ? "bg-blue-50 border-blue-400" :
                                  isSelected ? "bg-purple-50 border-purple-400" :
                                  "bg-white border-slate-200 hover:bg-slate-50"
                                }`}
                              >
                                <RadioGroupItem value={idx.toString()} id={`option-${idx}`} disabled={showResults} />
                                <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer font-medium">
                                  {option}
                                </Label>
                                {wasSubmittedCorrectly && (
                                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                                )}
                                {wasSubmittedIncorrectly && (
                                  <XCircle className="w-5 h-5 text-red-600" />
                                )}
                                {wasCorrectAnswerButNotSelected && (
                                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </RadioGroup>

                      {showResults && (
                        <Alert className={`mt-6 ${
                          currentQuizSelectedAnswer === currentQuiz.correct_answer ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"
                        }`}>
                          <AlertDescription>
                            <div className="font-semibold mb-2">
                              {currentQuizSelectedAnswer === currentQuiz.correct_answer ? "✓ Correct!" : "✗ Incorrect"}
                            </div>
                            <div className="text-sm">{currentQuiz.explanation}</div>
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={handlePreviousQuiz}
                        disabled={currentQuizIndex === 0}
                        variant="outline"
                        className="flex-1"
                      >
                        ← Previous
                      </Button>
                      {!showResults ? (
                        <Button onClick={handleQuizSubmit} className="flex-1 bg-purple-600 hover:bg-purple-700">
                          Submit Answer
                        </Button>
                      ) : currentQuizIndex < module.quizzes.length - 1 ? (
                        <Button onClick={handleNextQuiz} className="flex-1 bg-purple-600 hover:bg-purple-700">
                          Next Question →
                        </Button>
                      ) : (
                        <Button onClick={() => setActiveTab("content")} className="flex-1 bg-green-600 hover:bg-green-700">
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Finish Quiz
                        </Button>
                      )}
                    </div>

                    {progress?.quiz_scores?.length > 0 && (
                      <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-blue-900">Your Score</span>
                            <span className="text-2xl font-bold text-blue-700">
                              {Math.round((quizScore.correct / quizScore.total) * 100)}%
                            </span>
                          </div>
                          <p className="text-xs text-blue-700 mt-2">
                            {quizScore.correct} correct out of {quizScore.total} attempted
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Award className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600">No quizzes available for this module yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cases">
            <Card className="bg-white shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 border-b">
                <CardTitle className="flex items-center gap-2 text-green-900">
                  <FileText className="w-6 h-6 text-green-600" />
                  Practice Clinical Cases
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {module.practice_cases?.length > 0 ? (
                  <div className="space-y-6">
                    {module.practice_cases.map((pcase, idx) => (
                      <Card key={idx} className="border-2 border-green-200">
                        <CardHeader className="bg-green-50">
                          <CardTitle className="text-base">Case {idx + 1}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div className="bg-white p-4 rounded-lg border mb-4">
                            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{pcase.case_description}</p>
                          </div>
                          <div className="space-y-3">
                            <h5 className="font-semibold text-slate-900">Questions:</h5>
                            {pcase.questions?.map((q, qidx) => (
                              <div key={qidx} className="bg-blue-50 p-3 rounded border border-blue-200">
                                <p className="text-sm font-medium text-blue-900 mb-2">{qidx + 1}. {q}</p>
                                <p className="text-sm text-slate-700 pl-4">{pcase.answers?.[qidx]}</p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600">No practice cases available yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes">
            <Card className="bg-white shadow-lg">
              <CardHeader className="bg-slate-50 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle>Your Study Notes</CardTitle>
                  <Button onClick={handleSaveNotes} size="sm" className="bg-purple-600 hover:bg-purple-700">
                    Save Notes
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <Textarea
                  value={studentNotes}
                  onChange={(e) => setStudentNotes(e.target.value)}
                  placeholder="Take notes while studying..."
                  className="min-h-[400px] font-mono text-sm"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <MessageCircle className="w-10 h-10 text-indigo-600 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-indigo-900 mb-2">Need Help Understanding?</h3>
                <p className="text-sm text-indigo-800 mb-3">
                  Chat with our AI Teaching Assistant for clarifications, deeper explanations, or additional practice questions on this topic.
                </p>
                <Link to={createPageUrl("AIAssistant")}>
                  <Button className="bg-indigo-600 hover:bg-indigo-700">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Ask the AI Teacher
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}