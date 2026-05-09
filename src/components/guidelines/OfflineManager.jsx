import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  WifiOff, Download, CheckCircle, Trash2, HardDrive,
  RefreshCw, Loader2, BookOpen, Zap, Cloud
} from "lucide-react";
import { toast } from "sonner";
import { BUILTIN_GUIDELINES, EMERGENCY_PROTOCOLS } from "@/lib/guidelines/index";

const STORAGE_KEY = "clinicals_offline_guidelines";
const CACHE_META_KEY = "clinicals_offline_meta";

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

function getCacheSize() {
  try {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith("clinicals_")) {
        total += (localStorage.getItem(key) || "").length * 2;
      }
    }
    return total;
  } catch { return 0; }
}

export default function OfflineManager({ dbGuidelines = [] }) {
  const [cached, setCached] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
  });
  const [meta, setMeta] = useState(() => {
    try { return JSON.parse(localStorage.getItem(CACHE_META_KEY) || "{}"); } catch { return {}; }
  });
  const [downloading, setDownloading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => { window.removeEventListener("online", handleOnline); window.removeEventListener("offline", handleOffline); };
  }, []);

  const persistCache = (ids, newMeta) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
      localStorage.setItem(CACHE_META_KEY, JSON.stringify(newMeta));
    } catch { toast.error("Storage full — clear some cached data"); }
  };

  const downloadAll = async () => {
    setDownloading(true);
    toast.loading("Caching all guidelines for offline use…", { id: "dl" });
    const allIds = [
      ...BUILTIN_GUIDELINES.map(g => g.id),
      ...dbGuidelines.map(g => g.id)
    ];
    // Also cache drug & emergency data
    try {
      localStorage.setItem("clinicals_emergency_cache", JSON.stringify(EMERGENCY_PROTOCOLS));
      const newMeta = {
        ...meta,
        ...Object.fromEntries(allIds.map(id => [id, { downloadedAt: new Date().toISOString() }])),
        emergency: { downloadedAt: new Date().toISOString() }
      };
      setCached(allIds);
      setMeta(newMeta);
      persistCache(allIds, newMeta);
      toast.success(`${allIds.length} guidelines cached for offline use`, { id: "dl" });
    } catch { toast.error("Cache failed", { id: "dl" }); }
    finally { setDownloading(false); }
  };

  const downloadSingle = (id) => {
    const newIds = [...new Set([...cached, id])];
    const newMeta = { ...meta, [id]: { downloadedAt: new Date().toISOString() } };
    setCached(newIds);
    setMeta(newMeta);
    persistCache(newIds, newMeta);
    toast.success("Cached for offline");
  };

  const removeSingle = (id) => {
    const newIds = cached.filter(cid => cid !== id);
    const newMeta = { ...meta };
    delete newMeta[id];
    setCached(newIds);
    setMeta(newMeta);
    persistCache(newIds, newMeta);
    toast.success("Removed from offline cache");
  };

  const clearAll = () => {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) { keys.push(localStorage.key(i)); }
    keys.filter(k => k.startsWith("clinicals_offline") || k === STORAGE_KEY || k === CACHE_META_KEY).forEach(k => localStorage.removeItem(k));
    setCached([]);
    setMeta({});
    toast.success("Offline cache cleared");
  };

  const cacheSize = getCacheSize();
  const allItems = [...BUILTIN_GUIDELINES, ...dbGuidelines];
  const cachedItems = allItems.filter(g => cached.includes(g.id));
  const uncachedItems = allItems.filter(g => !cached.includes(g.id));
  const emergencyCached = !!localStorage.getItem("clinicals_emergency_cache");

  return (
    <div className="space-y-4">
      {/* Status bar */}
      <div className={`flex items-center gap-3 p-3 rounded-xl border-2 ${isOnline ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-300"}`}>
        {isOnline
          ? <Cloud className="w-5 h-5 text-green-600 flex-shrink-0" />
          : <WifiOff className="w-5 h-5 text-amber-600 flex-shrink-0" />}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-bold ${isOnline ? "text-green-800" : "text-amber-800"}`}>
            {isOnline ? "Online" : "Offline Mode"}
          </p>
          <p className={`text-xs ${isOnline ? "text-green-600" : "text-amber-700"}`}>
            {cached.length} guidelines cached · {formatBytes(cacheSize)} used
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge className={`text-xs ${emergencyCached ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"}`}>
            <Zap className="w-3 h-3 mr-0.5" />Emergency: {emergencyCached ? "✓" : "✗"}
          </Badge>
        </div>
      </div>

      {/* Download all */}
      <div className="flex gap-2">
        <Button onClick={downloadAll} disabled={downloading || !isOnline}
          className="flex-1 h-9 text-xs bg-blue-600 hover:bg-blue-700">
          {downloading
            ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Caching…</>
            : <><Download className="w-3.5 h-3.5 mr-1.5" />Download All ({allItems.length} guidelines)</>}
        </Button>
        {cached.length > 0 && (
          <Button onClick={clearAll} variant="outline" size="sm" className="h-9 text-xs border-red-300 text-red-600 hover:bg-red-50 px-3">
            <Trash2 className="w-3.5 h-3.5 mr-1" />Clear
          </Button>
        )}
      </div>

      {/* Storage info */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <HardDrive className="w-4 h-4 text-slate-500" />
          <p className="text-xs font-bold text-slate-700">Storage Usage</p>
        </div>
        <div className="space-y-1">
          {[
            { label: "Guidelines", count: cached.length, icon: BookOpen },
            { label: "Emergency Protocols", count: emergencyCached ? EMERGENCY_PROTOCOLS.length : 0, icon: Zap },
          ].map(({ label, count, icon: Icon }) => (
            <div key={label} className="flex items-center gap-2 text-xs text-slate-600">
              <Icon className="w-3 h-3" />
              <span>{label}:</span>
              <span className="font-semibold text-slate-800">{count}</span>
              {count > 0 && <CheckCircle className="w-3 h-3 text-green-500" />}
            </div>
          ))}
          <div className="mt-1.5 pt-1.5 border-t border-slate-200">
            <p className="text-xs text-slate-500">Total cache: <strong className="text-slate-800">{formatBytes(cacheSize)}</strong></p>
          </div>
        </div>
      </div>

      {/* Cached items */}
      {cachedItems.length > 0 && (
        <div>
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Cached Guidelines ({cachedItems.length})</p>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {cachedItems.map(g => (
              <div key={g.id} className="flex items-center gap-2 p-2 bg-green-50 border border-green-100 rounded-lg">
                <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                <p className="flex-1 text-xs text-slate-800 truncate font-medium">{g.title}</p>
                <button onClick={() => removeSingle(g.id)} className="text-slate-300 hover:text-red-400 flex-shrink-0">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uncached — download individually */}
      {uncachedItems.length > 0 && isOnline && (
        <div>
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Not Yet Cached ({uncachedItems.length})</p>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {uncachedItems.slice(0, 20).map(g => (
              <div key={g.id} className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-lg">
                <BookOpen className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                <p className="flex-1 text-xs text-slate-600 truncate">{g.title}</p>
                <button onClick={() => downloadSingle(g.id)}
                  className="text-xs text-blue-600 hover:underline flex items-center gap-0.5 flex-shrink-0">
                  <Download className="w-3 h-3" />Save
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-slate-400 text-center leading-relaxed">
        Offline mode uses localStorage. Requires prior online visit to cache. Content available without internet when cached.
      </p>
    </div>
  );
}