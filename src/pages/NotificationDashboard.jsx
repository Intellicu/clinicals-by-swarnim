import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Bell, Settings, Mail, AlertTriangle, Calendar, CheckCircle, Clock, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import PreferencesForm from "../components/notifications/PreferencesForm";

const typeIcons = {
  "Appointment Reminder": Calendar,
  "Critical Lab Alert": AlertTriangle,
  "New Appointment": Calendar,
  "Severe Diagnosis": AlertTriangle,
  "Follow-up Reminder": Clock,
  "System Alert": Bell,
};

export default function NotificationDashboard() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState("inbox");

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications", user?.email],
    queryFn: () => base44.entities.Notification.filter({ recipient_email: user.email }, "-sent_date", 200),
    enabled: !!user?.email,
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { read_status: true, read_date: new Date().toISOString() }),
    onSuccess: () => qc.invalidateQueries(["notifications"]),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.delete(id),
    onSuccess: () => { qc.invalidateQueries(["notifications"]); toast.success("Notification deleted"); },
  });

  const unread = notifications.filter(n => !n.read_status);
  const read = notifications.filter(n => n.read_status);
  const critical = notifications.filter(n => n.priority === "critical" || n.priority === "high");

  const priorityColors = {
    critical: "bg-red-600 text-white",
    high: "bg-orange-500 text-white",
    medium: "bg-blue-500 text-white",
    low: "bg-slate-400 text-white",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3 flex-wrap">
          <Link to={createPageUrl("Hub")}>
            <Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />Hub</Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-7 h-7 text-blue-600" />Notification Center
            </h1>
            <p className="text-sm text-slate-500">{unread.length} unread · {notifications.length} total</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border shadow-sm">
            <TabsTrigger value="inbox" className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" />Inbox ({unread.length})
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center gap-1">
              <Bell className="w-3.5 h-3.5" />All
            </TabsTrigger>
            <TabsTrigger value="critical" className="flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />Critical ({critical.length})
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1">
              <Settings className="w-3.5 h-3.5" />Settings
            </TabsTrigger>
          </TabsList>

          {/* Inbox - Unread */}
          <TabsContent value="inbox" className="mt-4 space-y-3">
            {unread.length === 0 ? (
              <Card className="bg-white shadow-sm">
                <CardContent className="py-16 text-center text-slate-400">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">All caught up!</p>
                  <p className="text-sm">No unread notifications</p>
                </CardContent>
              </Card>
            ) : (
              unread.map(n => <NotificationCard key={n.id} notification={n} onMarkRead={() => markReadMutation.mutate(n.id)} onDelete={() => deleteMutation.mutate(n.id)} />)
            )}
          </TabsContent>

          {/* All Notifications */}
          <TabsContent value="all" className="mt-4 space-y-3">
            {notifications.length === 0 ? (
              <Card className="bg-white shadow-sm">
                <CardContent className="py-16 text-center text-slate-400">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No notifications yet</p>
                </CardContent>
              </Card>
            ) : (
              notifications.map(n => <NotificationCard key={n.id} notification={n} onMarkRead={() => markReadMutation.mutate(n.id)} onDelete={() => deleteMutation.mutate(n.id)} muted={n.read_status} />)
            )}
          </TabsContent>

          {/* Critical Alerts */}
          <TabsContent value="critical" className="mt-4 space-y-3">
            {critical.length === 0 ? (
              <Card className="bg-white shadow-sm">
                <CardContent className="py-16 text-center text-slate-400">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-30 text-green-400" />
                  <p className="font-medium">No critical alerts</p>
                </CardContent>
              </Card>
            ) : (
              critical.map(n => <NotificationCard key={n.id} notification={n} onMarkRead={() => markReadMutation.mutate(n.id)} onDelete={() => deleteMutation.mutate(n.id)} />)
            )}
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings" className="mt-4">
            <PreferencesForm onSaved={() => toast.success("Notification settings updated")} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function NotificationCard({ notification: n, onMarkRead, onDelete, muted }) {
  const Icon = typeIcons[n.notification_type] || Bell;
  const priorityColor = n.priority === "critical" ? "bg-red-600 text-white" : n.priority === "high" ? "bg-orange-500 text-white" : "bg-blue-500 text-white";

  return (
    <Card className={`bg-white shadow-sm hover:shadow-md transition-shadow border ${muted ? "opacity-60" : "border-l-4 border-l-blue-500"}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${muted ? "bg-slate-100" : "bg-blue-100"}`}>
            <Icon className={`w-4 h-4 ${muted ? "text-slate-400" : "text-blue-600"}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-semibold text-sm text-slate-900">{n.subject}</span>
              <Badge className={`text-xs ${priorityColor}`}>{n.priority}</Badge>
              <Badge variant="outline" className="text-xs">{n.notification_type}</Badge>
              {!n.read_status && <Badge className="bg-blue-600 text-white text-xs">New</Badge>}
            </div>
            <p className="text-xs text-slate-600 whitespace-pre-wrap">{n.body.substring(0, 200)}{n.body.length > 200 ? "..." : ""}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
              {n.sent_date && <span>{format(new Date(n.sent_date), "dd MMM yyyy hh:mm a")}</span>}
              <span>via {n.delivery_method}</span>
              {n.delivery_status && <Badge variant="outline" className="text-xs">{n.delivery_status}</Badge>}
            </div>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            {!n.read_status && (
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={onMarkRead} title="Mark as read">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </Button>
            )}
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:bg-red-50" onClick={onDelete} title="Delete">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}