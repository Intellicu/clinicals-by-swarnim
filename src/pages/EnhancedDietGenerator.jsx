// Legacy page — the linked, maintained diet tool is DietGenerator.
// Kept only as a redirect so old links and bookmarks keep working.
import { Navigate } from "react-router-dom";

export default function EnhancedDietGenerator() {
  return <Navigate to="/DietGenerator" replace />;
}
