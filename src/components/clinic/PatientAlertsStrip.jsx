import React, { useMemo, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import SeverityBadge from '@/components/SeverityBadge';
import { SEVERITY_LEVELS, classifySeverity } from '@/lib/severitySystem';

const PatientAlertsStrip = React.forwardRef(
  ({ vitals = {}, labs = {}, medications = [], diseaseActivity = {}, onTabChange, maxVisible = 5 }, ref) => {
    const [dismissedAlerts, setDismissedAlerts] = useState(new Set());

    const alerts = useMemo(() => {
      const computedAlerts = [];

      if (vitals.bp_systolic) {
        const bpSeverity = classifySeverity('bp_systolic', vitals.bp_systolic);
        if (bpSeverity !== SEVERITY_LEVELS.INFO) {
          computedAlerts.push({ id: 'alert-bp', type: 'vitals', severity: bpSeverity, text: `BP ${vitals.bp_systolic}/${vitals.bp_diastolic || '?'} mmHg`, tabId: 'vitals' });
        }
      }

      if (vitals.heart_rate) {
        let hrSeverity = SEVERITY_LEVELS.INFO;
        if (vitals.heart_rate >= 150 || vitals.heart_rate <= 40) hrSeverity = SEVERITY_LEVELS.EMERGENCY;
        else if (vitals.heart_rate >= 120 || vitals.heart_rate <= 60) hrSeverity = SEVERITY_LEVELS.URGENT;
        if (hrSeverity !== SEVERITY_LEVELS.INFO) {
          computedAlerts.push({ id: 'alert-hr', type: 'vitals', severity: hrSeverity, text: `HR ${vitals.heart_rate} bpm`, tabId: 'vitals' });
        }
      }

      if (labs.creatinine) {
        const crSeverity = classifySeverity('creatinine', labs.creatinine);
        if (crSeverity !== SEVERITY_LEVELS.INFO) {
          computedAlerts.push({ id: 'alert-cr', type: 'labs', severity: crSeverity, text: `Creatinine ${labs.creatinine.toFixed(2)} mg/dL`, tabId: 'labs' });
        }
      }

      if (labs.egfr) {
        const egfrSeverity = classifySeverity('egfr', labs.egfr);
        if (egfrSeverity !== SEVERITY_LEVELS.INFO) {
          computedAlerts.push({ id: 'alert-egfr', type: 'labs', severity: egfrSeverity, text: `eGFR ${labs.egfr.toFixed(1)} mL/min/1.73m²`, tabId: 'labs' });
        }
      }

      if (labs.potassium) {
        let kSeverity = SEVERITY_LEVELS.INFO;
        if (labs.potassium >= 6.5 || labs.potassium <= 2.5) kSeverity = SEVERITY_LEVELS.EMERGENCY;
        else if (labs.potassium >= 5.5 || labs.potassium <= 3.0) kSeverity = SEVERITY_LEVELS.URGENT;
        if (kSeverity !== SEVERITY_LEVELS.INFO) {
          computedAlerts.push({ id: 'alert-k', type: 'labs', severity: kSeverity, text: `K⁺ ${labs.potassium.toFixed(1)} mEq/L`, tabId: 'labs' });
        }
      }

      if (labs.proteinuria !== undefined) {
        let proteinSeverity = SEVERITY_LEVELS.INFO;
        if (labs.proteinuria >= 3.0) proteinSeverity = SEVERITY_LEVELS.EMERGENCY;
        else if (labs.proteinuria >= 1.0) proteinSeverity = SEVERITY_LEVELS.URGENT;
        else if (labs.proteinuria >= 0.3) proteinSeverity = SEVERITY_LEVELS.WARNING;
        if (proteinSeverity !== SEVERITY_LEVELS.INFO) {
          computedAlerts.push({ id: 'alert-protein', type: 'labs', severity: proteinSeverity, text: `Proteinuria ${labs.proteinuria.toFixed(2)} g/24hr`, tabId: 'labs' });
        }
      }

      const severityOrder = { [SEVERITY_LEVELS.EMERGENCY]: 0, [SEVERITY_LEVELS.URGENT]: 1, [SEVERITY_LEVELS.WARNING]: 2, [SEVERITY_LEVELS.INFO]: 3 };
      computedAlerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
      return computedAlerts.filter((alert) => !dismissedAlerts.has(alert.id)).slice(0, maxVisible);
    }, [vitals, labs, medications, diseaseActivity, dismissedAlerts, maxVisible]);

    if (alerts.length === 0) return null;

    return (
      <div ref={ref} className="w-full bg-white border-b border-slate-200 shadow-sm">
        <div className="px-4 py-3 max-w-7xl mx-auto">
          <p className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Today's Active Alerts</p>
          <div className="flex flex-col gap-2 md:flex-row md:gap-3 md:flex-wrap">
            {alerts.map((alert) => (
              <button key={alert.id} onClick={() => onTabChange?.(alert.tabId)}
                className="flex-shrink-0 text-left hover:shadow-md transition-shadow duration-200">
                <SeverityBadge severity={alert.severity} text={alert.text} size="sm" dismissible={true}
                  onDismiss={() => setDismissedAlerts((prev) => new Set(prev).add(alert.id))}
                  icon={<ChevronRight className="w-4 h-4" />} />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }
);

PatientAlertsStrip.displayName = 'PatientAlertsStrip';
export default PatientAlertsStrip;
