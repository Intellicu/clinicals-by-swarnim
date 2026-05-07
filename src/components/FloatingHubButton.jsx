import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home } from "lucide-react";

export default function FloatingHubButton() {
  const location = useLocation();
  const hubUrl = createPageUrl("Hub");

  // Don't show on Hub itself
  if (location.pathname === "/" || location.pathname === hubUrl || location.pathname === "/Hub") return null;

  return (
    <Link to={hubUrl}>
      <button
        className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-40 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-xl transition-all hover:scale-105 active:scale-95"
        title="Back to Hub"
      >
        <Home className="w-4 h-4" />
        <span className="hidden sm:inline">Hub</span>
      </button>
    </Link>
  );
}