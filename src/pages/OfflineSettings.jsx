import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft, HardDrive } from "lucide-react";
import OfflineDataManager from "../components/OfflineDataManager";
import OfflineDataPack from "../components/offline/OfflineDataPack";

export default function OfflineSettings() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to={createPageUrl("Hub")}>
            <Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />Back</Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <HardDrive className="w-7 h-7 text-blue-600" />Offline Data Manager
            </h1>
            <p className="text-sm text-slate-600">Manage locally saved data, backups, and offline availability</p>
          </div>
        </div>
        <div className="space-y-4">
          <OfflineDataPack />
          <OfflineDataManager />
        </div>
      </div>
    </div>
  );
}