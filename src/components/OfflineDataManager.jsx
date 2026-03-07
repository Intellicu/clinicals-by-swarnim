import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  WifiOff, Wifi, Save, Trash2, Download, Upload,
  Database, CheckCircle2, Clock, RefreshCw, FileText, HardDrive
} from "lucide-react";
import { toast } from "sonner";

// ============================================================
// OfflineStorage — unified localStorage + IndexedDB manager
// ============================================================
const DB_NAME = "clinicals_offline_v1";
const DB_VERSION = 1;
const STORES = ["calculators", "pathways", "documents", "preferences", "ai_cache"];

let _db = null;

async function openDB() {
  if (_db) return _db;
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      STORES.forEach(store => {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: "id", autoIncrement: true });
        }
      });
    };
    req.onsuccess = (e) => { _db = e.target.result; resolve(_db); };
    req.onerror = reject;
  });
}

export async function offlineSave(store, key, data) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, "readwrite");
      const os = tx.objectStore(store);
      const record = { id: key, data, savedAt: new Date().toISOString() };
      const req = os.put(record);
      req.onsuccess = () => resolve(true);
      req.onerror = reject;
    });
  } catch (e) {
    // Fallback to localStorage
    try {
      const ns = `idb_${store}`;
      const existing = JSON.parse(localStorage.getItem(ns) || "{}");
      existing[key] = { data, savedAt: new Date().toISOString() };
      localStorage.setItem(ns, JSON.stringify(existing));
      return true;
    } catch { return false; }
  }
}

export async function offlineLoad(store, key) {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(store, "readonly");
      const os = tx.objectStore(store);
      const req = os.get(key);
      req.onsuccess = (e) => resolve(e.target.result?.data || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    try {
      const ns = `idb_${store}`;
      const existing = JSON.parse(localStorage.getItem(ns) || "{}");
      return existing[key]?.data || null;
    } catch { return null; }
  }
}

export async function offlineLoadAll(store) {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(store, "readonly");
      const os = tx.objectStore(store);
      const req = os.getAll();
      req.onsuccess = (e) => resolve(e.target.result || []);
      req.onerror = () => resolve([]);
    });
  } catch {
    try {
      const ns = `idb_${store}`;
      const existing = JSON.parse(localStorage.getItem(ns) || "{}");
      return Object.entries(existing).map(([k, v]) => ({ id: k, ...v }));
    } catch { return []; }
  }
}

export async function offlineDelete(store, key) {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(store, "readwrite");
      const os = tx.objectStore(store);
      const req = os.delete(key);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  } catch { return false; }
}

// localStorage helpers for preferences
export function savePreference(key, value) {
  try { localStorage.setItem(`pref_${key}`, JSON.stringify(value)); } catch {}
}

export function loadPreference(key, defaultValue = null) {
  try {
    const v = localStorage.getItem(`pref_${key}`);
    return v !== null ? JSON.parse(v) : defaultValue;
  } catch { return defaultValue; }
}

// Save calculator result offline
export async function saveCalcResult(calculatorId, inputs, result) {
  const key = `${calculatorId}_${Date.now()}`;
  await offlineSave("calculators", key, { calculatorId, inputs, result, savedAt: new Date().toISOString() });
}

// Cache AI response offline
export async function cacheAIResponse(promptHash, response) {
  await offlineSave("ai_cache", promptHash, { response, cachedAt: new Date().toISOString() });
}

export async function loadCachedAIResponse(promptHash) {
  return await offlineLoad("ai_cache", promptHash);
}

// ============================================================
// OfflineDataManager UI Component
// ============================================================
export default function OfflineDataManager({ compact = false }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [storageStats, setStorageStats] = useState(null);
  const [recentCalcs, setRecentCalcs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const goOnline = () => { setIsOnline(true); toast.success("Back online"); };
    const goOffline = () => { setIsOnline(false); toast.warning("You are offline — saved data still accessible"); };
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    loadStats();
    return () => { window.removeEventListener("online", goOnline); window.removeEventListener("offline", goOffline); };
  }, []);

  const loadStats = async () => {
    setLoading(true);
    const [calcs, docs, prefs, aiCache] = await Promise.all([
      offlineLoadAll("calculators"),
      offlineLoadAll("documents"),
      offlineLoadAll("preferences"),
      offlineLoadAll("ai_cache"),
    ]);
    
    // localStorage size estimate
    let lsSize = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) lsSize += localStorage[key].length * 2;
    }
    
    setStorageStats({ calcs: calcs.length, docs: docs.length, prefs: prefs.length, aiCache: aiCache.length, lsSize: Math.round(lsSize / 1024) });
    setRecentCalcs(calcs.slice(-5).reverse());
    setLoading(false);
  };

  const clearCache = async () => {
    const db = await openDB();
    const tx = db.transaction("ai_cache", "readwrite");
    tx.objectStore("ai_cache").clear();
    await loadStats();
    toast.success("AI cache cleared");
  };

  const exportAll = async () => {
    const [calcs, docs] = await Promise.all([offlineLoadAll("calculators"), offlineLoadAll("documents")]);
    const exportData = {
      exportDate: new Date().toISOString(),
      calculators: calcs,
      documents: docs,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `clinicals_backup_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup downloaded");
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${isOnline ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
        {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
        {isOnline ? "Online" : "Offline"}
        {!isOnline && storageStats && <span>· {storageStats.calcs} saved</span>}
      </div>
    );
  }

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-base">
            <HardDrive className="w-5 h-5 text-blue-600" />
            Offline Data Manager
          </div>
          <Badge className={isOnline ? "bg-green-100 text-green-800 border border-green-300" : "bg-amber-100 text-amber-800 border border-amber-300"}>
            {isOnline ? <><Wifi className="w-3 h-3 mr-1" />Online</> : <><WifiOff className="w-3 h-3 mr-1" />Offline</>}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {!isOnline && (
          <Alert className="bg-amber-50 border-amber-200">
            <WifiOff className="w-4 h-4 text-amber-600" />
            <AlertDescription className="text-amber-800 text-sm">
              <strong>Offline Mode:</strong> All calculators, pathways, and previously saved data remain fully accessible. New AI queries will use cached responses when available.
            </AlertDescription>
          </Alert>
        )}

        {/* Storage Stats */}
        {storageStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Saved Calculations", value: storageStats.calcs, icon: Database, color: "text-blue-600" },
              { label: "Documents", value: storageStats.docs, icon: FileText, color: "text-purple-600" },
              { label: "AI Cached Responses", value: storageStats.aiCache, icon: Clock, color: "text-indigo-600" },
              { label: "Storage Used", value: `${storageStats.lsSize} KB`, icon: HardDrive, color: "text-green-600" },
            ].map(stat => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="bg-slate-50 rounded-lg p-3 text-center border">
                  <Icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
                  <div className="font-bold text-lg">{stat.value}</div>
                  <div className="text-xs text-slate-500">{stat.label}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={loadStats} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`} />Refresh
          </Button>
          <Button onClick={exportAll} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-1" />Export Backup
          </Button>
          <Button onClick={clearCache} variant="outline" size="sm">
            <Trash2 className="w-4 h-4 mr-1" />Clear AI Cache
          </Button>
        </div>

        {/* Recent Saved Calculations */}
        {recentCalcs.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2 text-slate-700">Recent Saved Calculations</h4>
            <div className="space-y-2">
              {recentCalcs.map((calc, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded border text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    <span className="font-medium">{calc.data?.calculatorId || "Calculation"}</span>
                  </div>
                  <span className="text-slate-400">{calc.data?.savedAt ? new Date(calc.data.savedAt).toLocaleDateString() : ""}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-slate-400">
          Data stored locally in IndexedDB + localStorage. Never leaves your device. No server required for offline features.
        </p>
      </CardContent>
    </Card>
  );
}