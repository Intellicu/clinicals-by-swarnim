import React from "react";
import AutomatedGrowthMonitoring from "./AutomatedGrowthMonitoring";

// Redirects to automated version with WHO Z-score engine
export default function GrowthMonitoringPathway(props) {
  return <AutomatedGrowthMonitoring {...props} />;
}