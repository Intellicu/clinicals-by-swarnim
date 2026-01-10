import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Send, 
  Bot, 
  User, 
  Globe, 
  BookOpen, 
  Sparkles,
  Loader2,
  Upload,
  FileText,
  ArrowLeft
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner"; // Added import for toast

export default function AIAssistant() {
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState([]);
  const [searchOnline, setSearchOnline] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const messagesEndRef = useRef(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: guidelines = [] } = useQuery({
    queryKey: ['guidelines'],
    queryFn: () => base44.entities.Guideline.list(),
    initialData: [],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ prompt, useOnline, fileUrls }) => {
      let context = "";
      
      if (!useOnline && guidelines.length > 0) {
        context = "You are a clinical assistant with access to the following guidelines:\n\n";
        guidelines.forEach(g => {
          context += `${g.title} (${g.source} ${g.year}):\n${g.summary}\n\n`;
        });
        context += "\nAnswer the following clinical question based on these guidelines:\n\n";
      }

      const fullPrompt = context + prompt + "\n\nIMPORTANT: DO NOT use asterisks or markdown bold formatting (no **). Use plain text with clear structure.";

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: fullPrompt,
        add_context_from_internet: useOnline,
        file_urls: fileUrls.length > 0 ? fileUrls : undefined
      });

      const cleanedResponse = response.replace(/\*\*/g, '');
      const responseWithDisclaimer = cleanedResponse + "\n\n---\nAI Disclaimer: This response is AI-generated for educational purposes based on clinical guidelines. Always exercise independent clinical judgment and verify all recommendations with current evidence-based sources.";
      return responseWithDisclaimer;
    },
    onSuccess: (response) => {
      setConversation(prev => [...prev, {
        role: "assistant",
        content: response,
        editable: user?.role === 'admin',
        isEditing: false
      }]);
      scrollToBottom();
    },
    onError: (error) => {
      console.error("AI request failed:", error);
      toast.error("Failed to get AI response - check connection", { duration: 5000 });
    }
  });

  const handleEditMessage = (index, newContent) => {
    setConversation(prev => prev.map((msg, i) => 
      i === index ? { ...msg, content: newContent, isEditing: false } : msg
    ));
    toast.success('Message updated');
  };

  const handleSend = () => {
    if (!message.trim()) return;

    setConversation(prev => [...prev, {
      role: "user",
      content: message
    }]);

    const fileUrls = uploadedFiles.map(f => f.url);

    sendMessageMutation.mutate({
      prompt: message,
      useOnline: searchOnline,
      fileUrls
    });

    setMessage("");
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large (max 10MB)");
      return;
    }

    toast.info("Uploading file...", { id: "file-upload" });
    try {
      const uploadResult = await base44.integrations.Core.UploadFile({ file });
      if (!uploadResult?.file_url) {
        throw new Error("Upload failed - no file URL returned");
      }
      setUploadedFiles(prev => [...prev, { name: file.name, url: uploadResult.file_url }]);
      toast.success("File uploaded!", { id: "file-upload" });
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed - check connection", { id: "file-upload", duration: 5000 });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-5xl mx-auto">
        <Link to={createPageUrl("Hub")}>
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>

        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-purple-600" />
            AI Clinical Assistant
          </h1>
          <p className="text-slate-600">Ask questions about guidelines, get evidence-based answers</p>
        </div>

        <Tabs defaultValue="chat" className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="space-y-4">
            <Card className="bg-white shadow-lg" style={{ height: "60vh" }}>
              <CardContent className="p-6 h-full flex flex-col">
                <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                  {conversation.length === 0 && (
                    <div className="text-center py-12">
                      <Bot className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500">Ask me anything about pediatric nephrology guidelines...</p>
                      <div className="mt-6 grid grid-cols-1 gap-2 max-w-md mx-auto">
                        <Button
                          variant="outline"
                          className="text-left justify-start"
                          onClick={() => setMessage("What are the KDIGO criteria for AKI staging?")}
                        >
                          What are the KDIGO criteria for AKI staging?
                        </Button>
                        <Button
                          variant="outline"
                          className="text-left justify-start"
                          onClick={() => setMessage("How do I manage hypertension in a child?")}
                        >
                          How do I manage hypertension in a child?
                        </Button>
                        <Button
                          variant="outline"
                          className="text-left justify-start"
                          onClick={() => setMessage("What is the treatment for nephrotic syndrome?")}
                        >
                          What is the treatment for nephrotic syndrome?
                        </Button>
                      </div>
                    </div>
                  )}

                  {conversation.map((msg, idx) => (
                    <div key={idx} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      {msg.role === "assistant" && (
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                          <Bot className="w-5 h-5 text-purple-600" />
                        </div>
                      )}
                      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        msg.role === "user" 
                          ? "bg-blue-600 text-white" 
                          : "bg-slate-100 text-slate-900"
                      }`}>
                        {msg.role === "assistant" ? (
                          msg.isEditing ? (
                            <div className="space-y-2">
                              <Textarea
                                value={msg.content}
                                onChange={(e) => setConversation(prev => prev.map((m, i) => i === idx ? {...m, content: e.target.value} : m))}
                                className="min-h-[200px] text-sm"
                              />
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => handleEditMessage(idx, msg.content)} className="bg-green-600">
                                  Save
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => setConversation(prev => prev.map((m, i) => i === idx ? {...m, isEditing: false} : m))}>
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <ReactMarkdown className="text-sm prose prose-sm max-w-none">
                                {msg.content}
                              </ReactMarkdown>
                              {msg.editable && (
                                <div className="mt-2 pt-2 border-t border-slate-300">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setConversation(prev => prev.map((m, i) => i === idx ? {...m, isEditing: true} : m))}
                                    className="h-6 px-2 text-xs"
                                  >
                                    Edit Response
                                  </Button>
                                </div>
                              )}
                            </>
                          )
                        ) : (
                          <p className="text-sm">{msg.content}</p>
                        )}
                      </div>
                      {msg.role === "user" && (
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                      )}
                    </div>
                  ))}

                  {sendMessageMutation.isPending && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="bg-slate-100 rounded-2xl px-4 py-3">
                        <Loader2 className="w-5 h-5 animate-spin text-slate-600" />
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                <div className="space-y-3">
                  {uploadedFiles.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {uploadedFiles.map((file, idx) => (
                        <Badge key={idx} variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                          <FileText className="w-3 h-3 mr-1" />
                          {file.name}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder="Ask about clinical guidelines, treatments, or diagnostic criteria..."
                      className="flex-1 min-h-[60px]"
                    />
                    <Button
                      onClick={handleSend}
                      disabled={!message.trim() || sendMessageMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700 px-6"
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="bg-white shadow-lg">
              <CardHeader className="bg-slate-50 border-b">
                <CardTitle className="text-lg">AI Assistant Settings</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-blue-600" />
                    <div>
                      <Label className="font-semibold">Search Online Medical Databases</Label>
                      <p className="text-xs text-slate-500">Enable AI to search PubMed, UpToDate, medical journals</p>
                    </div>
                  </div>
                  <Switch checked={searchOnline} onCheckedChange={setSearchOnline} />
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center gap-3 mb-3">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                    <Label className="font-semibold">Loaded Guidelines</Label>
                  </div>
                  <div className="space-y-2">
                    {guidelines.map((guideline) => (
                      <div key={guideline.id} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <div>
                          <div className="font-medium text-sm text-slate-900">{guideline.title}</div>
                          <div className="text-xs text-slate-600">{guideline.source} {guideline.year}</div>
                        </div>
                        <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                          {guideline.category}
                        </Badge>
                      </div>
                    ))}
                    {guidelines.length === 0 && (
                      <p className="text-sm text-slate-500">No guidelines loaded yet. Add them from the Guidelines page.</p>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Upload className="w-5 h-5 text-green-600" />
                    <Label className="font-semibold">Upload Reference Files</Label>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.txt,.doc,.docx"
                    onChange={handleFileUpload}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="text-xs text-slate-500 mt-2">Upload PDF guidelines for AI to reference during conversation</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}