/**
 * OfflineDataPack — downloads the app's clinical reference data (formulary,
 * dose rules, guidelines, search index) to this device for fully offline use,
 * exports it as a file for transfer to another computer, and restores from a
 * previously saved pack file.
 */
import React, { useState, useRef } from "react";
import { db } from "@/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DownloadCloud, Upload, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { OFFLINE_ENTITIES, primeSnapshot, exportSnapshots, importSnapshots } from "@/lib/offline/entitySnapshot";

const META_KEY = "offline_pack_meta";

export default function OfflineDataPack() {
  const [busy, setBusy] = useState(false);
  const [meta, setMeta] = useState(() => {
    try { return JSON.parse(localStorage.getItem(META_KEY) || "null"); } catch { return null; }
  });
  const fileRef = useRef(null);

  const downloadPack = async () => {
    setBusy(true);
    try {
      const counts = {};
      for (const name of OFFLINE_ENTITIES) {
        const rows = await db[name].list("-updated_date", 2000);
        if (Array.isArray(rows)) {
          primeSnapshot(name, rows);
          counts[name] = rows.length;
        }
      }
      const pack = { version: 1, exported_at: new Date().toISOString(), counts, snapshots: exportSnapshots() };
      const blob = new Blob([JSON.stringify(pack)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `clinicals_offline_pack_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
      const m = { at: pack.exported_at, counts };
      localStorage.setItem(META_KEY, JSON.stringify(m));
      setMeta(m);
      toast.success("Offline data pack saved on this device and downloaded to your drive");
    } catch (e) {
      console.error(e);
      toast.error("Could not download the data pack — check your connection");
    }
    setBusy(false);
  };

  const importPack = async (file) => {
    if (!file) return;
    setBusy(true);
    try {
      const pack = JSON.parse(await file.text());
      const n = importSnapshots(pack.snapshots || {});
      const m = { at: pack.exported_at || new Date().toISOString(), counts: pack.counts || {}, imported: true };
      localStorage.setItem(META_KEY, JSON.stringify(m));
      setMeta(m);
      toast.success(`Restored ${n} offline data sets from file`);
    } catch {
      toast.error("Invalid pack file");
    }
    setBusy(false);
  };

  const totalRecords = meta ? Object.values(meta.counts || {}).reduce((a, b) => a + b, 0) : 0;

  return (
    <Card className="border-blue-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <DownloadCloud className="w-5 h-5 text-blue-600" />
          Offline Data Pack
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-slate-600">
          Download the full clinical reference database (drug formulary, dose rules, guidelines, search index)
          to this device — the app stays fully functional in locations without network. The pack is also saved
          as a file on your drive so you can move it to another computer.
        </p>
        {meta && (
          <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>
              {meta.imported ? "Restored from file" : "Downloaded"} {new Date(meta.at).toLocaleString()}
              {totalRecords ? ` · ${totalRecords.toLocaleString()} records available offline` : ""}
            </span>
          </div>
        )}
        <div className="flex gap-2 flex-wrap">
          <Button onClick={downloadPack} disabled={busy} className="bg-blue-600 hover:bg-blue-700 gap-1.5">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <DownloadCloud className="w-4 h-4" />}
            Download all data for offline use
          </Button>
          <Button variant="outline" disabled={busy} onClick={() => fileRef.current?.click()} className="gap-1.5">
            <Upload className="w-4 h-4" /> Restore from pack file
          </Button>
          <input ref={fileRef} type="file" accept=".json" className="hidden"
            onChange={(e) => { importPack(e.target.files?.[0]); e.target.value = ""; }} />
        </div>
        <p className="text-xs text-slate-400">
          Data you enter while offline is queued automatically and synced to the cloud when the network is restored.
        </p>
      </CardContent>
    </Card>
  );
}