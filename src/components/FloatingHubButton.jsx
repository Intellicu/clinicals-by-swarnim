import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Bot } from "lucide-react";

export default function FloatingHubButton() {
  const location = useLocation();

  // Don't show on the AI Agents Hub itself
  if (location.pathname === "/AIAgentsHub") return null;

  return (
    <Link to="/AIAgentsHub">
      <button
        className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-40 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-xl transition-all hover:scale-105 active:scale-95"
        title="AI Agents Hub"
      >
        <Bot className="w-4 h-4" />
        <span className="hidden sm:inline">AI Agents</span>
      </button>
    </Link>
  );
}