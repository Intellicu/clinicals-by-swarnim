import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Settings2, Send } from "lucide-react";
import ReminderDashboard from "@/components/notifications/ReminderDashboard";
import PreferencesForm from "@/components/notifications/PreferencesForm";

export default function NotificationCenter() {
  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });

  const { data: prefsData = [] } = useQuery({
    queryKey: ["notification-prefs", user?.email],
    queryFn: () => base44.entities.NotificationPreference.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const preferences = prefsData[0] || null;

  return (
    <div className="max-w-3xl mx-auto p-4 pb-24">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Bell className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Notification Center</h1>
            <p className="text-sm text-slate-500">Appointment reminders & clinician alerts</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="reminders">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="reminders" className="flex-1 gap-2">
            <Send className="w-4 h-4" />
            Reminders
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex-1 gap-2">
            <Settings2 className="w-4 h-4" />
            Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reminders">
          <ReminderDashboard preferences={preferences} />
        </TabsContent>

        <TabsContent value="preferences">
          <PreferencesForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}