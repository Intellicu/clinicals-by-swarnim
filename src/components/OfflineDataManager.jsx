import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { WifiOff, Wifi, Save, Trash2, Download, Upload, HardDrive, CheckCircle2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

// ─── localStorage helper ───────────────────────────────────────────────
export const OfflineStorage = {
  save(key, data) {
    try {
      localStorage.setItem(`clinicals_${key}`, JSON.stringify({ data, ts: Date.now() }));
      return true;
    } catch { return false; }
  },
  load(key, fallback = null) {
    try {
      const raw = localStorage.getItem(`clinicals_${key}`);
      if (!raw) return fallback;
      return JSON.parse(raw).data;
    } catch { return fallback; }
  },
  remove(key) {
    localStorage.removeItem(`clinicals_${key}`);
  },
  getTimestamp(key) {
    try {
      const raw = localStorage.getItem(`clinicals_${key}`);
      if (!raw) return null;
      return new Date(JSON.parse(raw).ts).toLocaleString();
    } catch { return null; }
  },
  getAllKeys() {
    return Object.keys(localStorage).filter(k => k.startsWith("clinicals_")).map(k => k.replace("clinicals_", ""));
  },
  getTotalSizeKB() {
    let total = 0;
    for (const k of Object.keys(localStorage)) {
      if (k.startsWith("clinicals_")) total += (localStorage.getItem(k) || "").length;
    }
    return (total / 1024).toFixed(1);
  },
  exportAll() {
    const out = {};
    for (const k of Object.keys(localStorage)) {
      if (k.startsWith("clinicals_")) out[k] = localStorage.getItem(k);
    }
    return JSON.stringify(out, null, 2);
  },
  importAll(json) {
    try {
      const data = JSON.parse(json);
      let count = 0;
      for (const [k, v] of Object.entries(data)) {
        if (k.startsWith("clinicals_")) { localStorage.setItem(k, v); count++; }
      }
      return count;
    } catch { return -1; }
  },
  clearAll() {
    const keys = Object.keys(localStorage).filter(k => k.startsWith("clinicals_"));
    keys.forEach(k => localStorage.removeItem(k));
    return keys.length;
  }
};

// ─── React hook ────────────────────────────────────────────────────────
export function useOfflineStorage(key, defaultValue = null) {
  const [value, setValue] = useState(() => OfflineStorage.load(key, defaultValue));

  const save = (newValue) => {
    setValue(newValue);
    OfflineStorage.save(key, newValue);
  };
  const clear = () => {
    setValue(defaultValue);
    OfflineStorage.remove(key);
  };

  return [value, save, clear];
}

// ─── Online status hook ────────────────────────────────────────────────
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);
  return isOnline;
}

// ─── UI Component ─────────────────────────────────────────────────────
const DATA_CATEGORIES = [
  { key: "diet_generator_cache", label: "Diet Plans", icon: "🥗" },
  { key: "iap_vaccination_tracker", label: "Vaccination Records", icon: "💉" },
  { key: "calculator_history", label: "Calculator History", icon: "🧮" },
  { key: "ai_conversation_cache", label: "AI Conversations", icon: "🤖" },
  { key: "pathway_bookmarks", label: "Pathway Bookmarks", icon: "📌" },
  { key: "user_preferences", label: "User Preferences", icon: "⚙️" },
  { key: "patient_quick_entries", label: "Quick Patient Entries", icon: "👤" },
  { key: "research_backup", label: "Research Project Backup", icon: "🔬" },
];

export default function OfflineDataManager({ compact = false }) {
  const isOnline = useOnlineStatus();
  const [keys, setKeys] = useState([]);
  const [sizeKB, setSizeKB] = useState("0");
  const [lastSync, setLastSync] = useState(null);

  const refresh = () => {
    setKeys(OfflineStorage.getAllKeys());
    setSizeKB(OfflineStorage.getTotalSizeKB());
    setLastSync(new Date().toLocaleTimeString());
  };

  useEffect(() => { refresh(); }, []);

  const exportData = () => {
    const json = OfflineStorage.exportAll();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clinicals_backup_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup downloaded");
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const count = OfflineStorage.importAll(ev.target.result);
      if (count >= 0) { toast.success(`Imported ${count} data records`); refresh(); }
      else toast.error("Invalid backup file");
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  const clearAll = () => {
    const n = OfflineStorage.clearAll();
    toast.success(`Cleared ${n} cached items`);
    refresh();
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-full border ${isOnline ? "bg-green-50 border-green-200 text-green-800" : "bg-amber-50 border-amber-200 text-amber-800"}`}>
        {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
        <span className="font-medium">{isOnline ? "Online" : "Offline"}</span>
        <span className="text-xs opacity-70">· {sizeKB} KB saved</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Banner */}
      <Alert className={isOnline ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-300"}>
        {isOnline ? <Wifi className="w-5 h-5 text-green-600" /> : <WifiOff className="w-5 h-5 text-amber-600" />}
        <AlertDescription className={isOnline ? "text-green-800" : "text-amber-800"}>
          <strong>{isOnline ? "Online Mode" : "Offline Mode"}</strong> — {isOnline ? "All features available. Data auto-saved locally." : "Running offline. All calculators & pathways available. AI features require internet."}
          {lastSync && <span className="text-xs ml-2 opacity-70">Refreshed {lastSync}</span>}
        </AlertDescription>
      </Alert>

      {/* Storage Summary */}
      <Card className="bg-white shadow-lg">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b py-3">
          <CardTitle className="text-base flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-blue-600" />Local Storage Summary
            <Button size="sm" variant="ghost" onClick={refresh} className="ml-auto">
              <RefreshCw className="w-3 h-3 mr-1" />Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Used: {sizeKB} KB</span><span>~5 MB limit</span>
              </div>
              <Progress value={Math.min((parseFloat(sizeKB) / 5000) * 100, 100)} className="h-2" />
            </div>
            <Badge className="bg-blue-100 text-blue-800">{keys.length} items</Badge>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {DATA_CATEGORIES.map(cat => {
              const exists = keys.includes(cat.key) || keys.some(k => k.includes(cat.key.split("_")[0]));
              const ts = OfflineStorage.getTimestamp(cat.key);
              return (
                <div key={cat.key} className={`flex items-center gap-2 p-2 rounded border text-sm ${exists ? "bg-green-50 border-green-200" : "bg-slate-50 border-slate-200 opacity-60"}`}>
                  <span>{cat.icon}</span>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-xs text-slate-800">{cat.label}</span>
                    {ts && <div className="text-xs text-slate-400 truncate">{ts}</div>}
                  </div>
                  {exists ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0" /> : <span className="w-3.5 h-3.5 text-slate-300 flex-shrink-0">○</span>}
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4 pt-3 border-t">
            <Button size="sm" onClick={exportData} className="flex-1 bg-blue-600 hover:bg-blue-700">
              <Download className="w-3.5 h-3.5 mr-1" />Export Backup
            </Button>
            <label className="flex-1">
              <Button size="sm" variant="outline" className="w-full" asChild>
                <span><Upload className="w-3.5 h-3.5 mr-1" />Import Backup</span>
              </Button>
              <input type="file" accept=".json" className="hidden" onChange={importData} />
            </label>
            <Button size="sm" variant="destructive" onClick={clearAll}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Offline Feature Status */}
      <Card className="bg-white shadow-lg">
        <CardHeader className="border-b py-3">
          <CardTitle className="text-base">Offline Feature Availability</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-2">
            {[
              { name: "Clinical Calculators (GFR, BP, Fluid, Dose, etc.)", offline: true },
              { name: "Clinical Pathways (55+ scenarios)", offline: true },
              { name: "Diet Generator (Nephrotic, CKD, IAP)", offline: true },
              { name: "Vaccination Tracker (IAP 2023)", offline: true },
              { name: "Growth Monitoring Calculator", offline: true },
              { name: "Drug Database (local reference)", offline: true },
              { name: "Saved Plans & Calculator History", offline: true },
              { name: "Patient Quick Entry (local draft)", offline: true },
              { name: "AI Diagnostic Assistant", offline: false },
              { name: "AI Clinical Notes & Suggestions", offline: false },
              { name: "Lab Report AI Analyzer", offline: false },
              { name: "Online Guidelines Sync", offline: false },
            ].map((feat, i) => (
              <div key={i} className="flex items-center justify-between text-sm py-1 border-b last:border-0">
                <span className="text-slate-700">{feat.name}</span>
                <Badge className={feat.offline ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"}>
                  {feat.offline ? "✓ Offline" : "Needs Internet"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}