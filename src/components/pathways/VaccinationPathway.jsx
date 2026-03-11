import React from "react";
import EnhancedVaccinationPathway from "./EnhancedVaccinationPathway";

// Redirects to enhanced version with complete NIS 2023 + IAP recommendations
export default function VaccinationPathway(props) {
  return <EnhancedVaccinationPathway {...props} />;
}