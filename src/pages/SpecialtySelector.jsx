import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Activity, 
  Brain, 
  Syringe, 
  Heart, 
  Stethoscope,
  Plus,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";

const defaultSpecialties = [
  {
    name: "Pediatric Nephrology",
    icon: "Activity",
    color: "#0066CC",
    description: "Kidney function, dialysis, transplant, electrolytes, and renal disease management"
  },
  {
    name: "Pediatric Neurology",
    icon: "Brain",
    color: "#7C3AED",
    description: "Seizures, developmental disorders, EEG interpretation, and neurological assessments"
  },
  {
    name: "Pediatric Endocrinology",
    icon: "Syringe",
    color: "#DC2626",
    description: "Diabetes, growth disorders, thyroid, and hormonal management"
  },
  {
    name: "Pediatric Cardiology",
    icon: "Heart",
    color: "#DC2626",
    description: "Congenital heart disease, arrhythmias, and cardiac assessments"
  },
  {
    name: "General Pediatrics",
    icon: "Stethoscope",
    color: "#10B981",
    description: "Growth monitoring, immunizations, common pediatric conditions"
  }
];

const iconMap = {
  Activity: Activity,
  Brain: Brain,
  Syringe: Syringe,
  Heart: Heart,
  Stethoscope: Stethoscope
};

export default function SpecialtySelector() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newSpecialty, setNewSpecialty] = useState({
    name: "",
    description: "",
    icon: "Activity",
    color: "#0066CC"
  });
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: specialties = [] } = useQuery({
    queryKey: ['specialties'],
    queryFn: () => base44.entities.Specialty.list(),
    initialData: []
  });

  const { data: userPreferences } = useQuery({
    queryKey: ['userPreferences'],
    queryFn: async () => {
      const prefs = await base44.entities.UserPreferences.filter({ user_email: user.email });
      return prefs[0] || null;
    },
    enabled: !!user
  });

  const createSpecialtyMutation = useMutation({
    mutationFn: async (specialtyData) => {
      return await base44.entities.Specialty.create({
        ...specialtyData,
        created_by_user: user.email,
        is_default: false
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specialties'] });
      setShowCreateDialog(false);
      toast.success("Specialty created successfully!");
      setNewSpecialty({ name: "", description: "", icon: "Activity", color: "#0066CC" });
    }
  });

  const selectSpecialtyMutation = useMutation({
    mutationFn: async (specialtyId) => {
      if (userPreferences) {
        return await base44.entities.UserPreferences.update(userPreferences.id, {
          selected_specialty_id: specialtyId
        });
      } else {
        return await base44.entities.UserPreferences.create({
          user_email: user.email,
          selected_specialty_id: specialtyId,
          ai_assistant_enabled: true
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPreferences'] });
      navigate(createPageUrl("Hub"));
      toast.success("Specialty selected!");
    }
  });

  const handleSelectSpecialty = async (specialty) => {
    // If selecting a default specialty that doesn't exist yet, create it
    if (!specialty.id) {
      const created = await base44.entities.Specialty.create({
        ...specialty,
        is_default: true,
        created_by_user: ""
      });
      selectSpecialtyMutation.mutate(created.id);
    } else {
      selectSpecialtyMutation.mutate(specialty.id);
    }
  };

  const handleCreateCustom = () => {
    if (!newSpecialty.name || !newSpecialty.description) {
      toast.error("Please fill in all fields");
      return;
    }
    createSpecialtyMutation.mutate(newSpecialty);
  };

  // Merge default specialties with user-created ones
  const allSpecialties = [
    ...defaultSpecialties.map(s => ({
      ...s,
      isDefault: true,
      existing: specialties.find(sp => sp.name === s.name)
    })),
    ...specialties.filter(s => !s.is_default && s.created_by_user === user?.email).map(s => ({
      ...s,
      isDefault: false,
      existing: s
    }))
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Welcome to CliniCals</h1>
          <p className="text-lg text-slate-600">
            Choose your specialty to get started with customized clinical tools
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {allSpecialties.map((specialty, idx) => {
            const IconComponent = iconMap[specialty.icon] || Activity;
            const specialtyToUse = specialty.existing || specialty;
            
            return (
              <Card 
                key={idx} 
                className="bg-white hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border-2 border-slate-200 hover:border-blue-400 relative overflow-hidden"
                onClick={() => handleSelectSpecialty(specialtyToUse)}
              >
                <div 
                  className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20"
                  style={{ backgroundColor: specialty.color }}
                ></div>
                <CardHeader className="relative">
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
                      style={{ backgroundColor: specialty.color }}
                    >
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl text-slate-900 mb-2">{specialty.name}</CardTitle>
                      <p className="text-sm text-slate-600">{specialty.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    {specialty.isDefault ? (
                      <Badge className="bg-blue-100 text-blue-800">Default Specialty</Badge>
                    ) : (
                      <Badge className="bg-purple-100 text-purple-800">Custom</Badge>
                    )}
                    {userPreferences?.selected_specialty_id === specialtyToUse.id && (
                      <Badge className="bg-green-500 text-white">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Create Custom Specialty Card */}
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-dashed border-purple-300 hover:border-purple-500 hover:shadow-xl transition-all duration-300 cursor-pointer">
                <CardContent className="p-8 flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
                    <Plus className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Create Custom Specialty</h3>
                  <p className="text-sm text-slate-600">
                    Build your own specialty with custom tools and sections
                  </p>
                </CardContent>
              </Card>
            </DialogTrigger>
            
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Custom Specialty</DialogTitle>
                <DialogDescription>
                  Define a new medical specialty with your own tools and calculators
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Specialty Name *</Label>
                  <Input
                    value={newSpecialty.name}
                    onChange={(e) => setNewSpecialty({...newSpecialty, name: e.target.value})}
                    placeholder="e.g., Pediatric Pulmonology"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Description *</Label>
                  <Textarea
                    value={newSpecialty.description}
                    onChange={(e) => setNewSpecialty({...newSpecialty, description: e.target.value})}
                    placeholder="Brief description of this specialty..."
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Icon</Label>
                    <select
                      value={newSpecialty.icon}
                      onChange={(e) => setNewSpecialty({...newSpecialty, icon: e.target.value})}
                      className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md"
                    >
                      <option value="Activity">Activity</option>
                      <option value="Brain">Brain</option>
                      <option value="Heart">Heart</option>
                      <option value="Syringe">Syringe</option>
                      <option value="Stethoscope">Stethoscope</option>
                    </select>
                  </div>

                  <div>
                    <Label>Color</Label>
                    <input
                      type="color"
                      value={newSpecialty.color}
                      onChange={(e) => setNewSpecialty({...newSpecialty, color: e.target.value})}
                      className="w-full mt-1 h-10 border border-slate-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateCustom}
                    disabled={createSpecialtyMutation.isPending}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {createSpecialtyMutation.isPending ? "Creating..." : "Create Specialty"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-bold text-blue-900 mb-2">What's Next?</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>After selecting your specialty, you'll access specialized clinical calculators and tools</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>You can create custom tools specific to your practice</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>AI Assistant will be context-aware based on your specialty</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Switch between specialties anytime from your profile</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}