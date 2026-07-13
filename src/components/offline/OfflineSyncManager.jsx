/**
 * OfflineSyncManager — shows every clinical input captured while offline,
 * lets the clinician sync the queue manually, and removes individual items.
 * The queue also flushes automatically when the connection is restored.
 */
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Trash2, Wifi, WifiOff, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { getQueueItems, removeQueueItem, flushQueue, subscribeQueue } from "@/lib/offline/syncQueue";

export default function OfflineSyncManager() {
  const [items, setItems] = useState(getQueueItems());
  const [online, setOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const unsub = subscribeQueue(() => setItems(getQueueItems()));
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { unsub(); window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    const { synced, failed } = await flushQueue();
    setSyncing(false);
    if (synced) toast.success(`${synced} record${synced === 1 ? "" : "s"} synced to the database`);
    if (failed) toast.error(`${failed} record${failed === 1 ? "" : "s"} could not be synced — will retry`);
    if (!synced && !failed) toast.info("Nothing to sync");
  };

  return (
    <Card className={online ? "border-slate-200" : "border-amber-300"}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          {online ? <Wifi className="w-5 h-5 text-green-600" /> : <WifiOff className="w-5 h-5 text-amber-600" />}
          Offline Sync Manager
          <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${online ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
            {online ? "Online" : "Offline"}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-slate-600">
          Clinical inputs (encounters, vitals, logs, prescriptions…) entered while offline are stored on this
          device and pushed to the database automatically when you reconnect.
        </p>

        {items.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2.5">
            <CheckCircle2 className="w-4 h-4" /> All clinical data is synced — nothing pending.
          </div>
        ) : (
          <>
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {items.map((it) => (
                <div key={it.qid} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {it.entity} <span className="text-xs font-normal text-slate-500">· {it.op === "update" ? "update" : "new record"}</span>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Captured {new Date(it.queued_at).toLocaleString()}{it.attempts ? ` · ${it.attempts} failed attempt${it.attempts === 1 ? "" : "s"}` : ""}
                    </p>
                  </div>
                  <button onClick={() => removeQueueItem(it.qid)} title="Discard this queued record"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <Button onClick={handleSync} disabled={syncing || !online} className="w-full bg-blue-600 hover:bg-blue-700 gap-1.5">
              <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
              {online ? `Sync ${items.length} pending record${items.length === 1 ? "" : "s"} now` : "Waiting for connection…"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}