// ResearchOS is now embedded inside ResearchHub.
// This file redirects to preserve any existing links.
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ResearchOS() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(createPageUrl("ResearchHub"), { replace: true });
  }, []);
  return null;
}