// Legacy page — superseded by the full DrugsDosing formulary.
// Kept only as a redirect so old links and bookmarks keep working.
import { Navigate } from "react-router-dom";

export default function DrugDosing() {
  return <Navigate to="/DrugsDosing" replace />;
}
