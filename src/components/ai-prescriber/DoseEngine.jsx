// ─── Dose Calculation Engine ─────────────────────────────────────────────────

export function calcBSA(weightKg, heightCm) {
  if (!weightKg || !heightCm) return null;
  return parseFloat(Math.sqrt((heightCm * weightKg) / 3600).toFixed(3));
}

export function calcSchwartzEgfr(creatinineMgdl, heightCm, ageYears) {
  if (!creatinineMgdl || !heightCm) return null;
  const k = ageYears < 2 ? 0.33 : ageYears < 13 ? 0.55 : 0.70;
  return parseFloat(((k * heightCm) / creatinineMgdl).toFixed(1));
}

export function freqFactor(freq = "") {
  const f = (freq || "").toUpperCase();
  if (f.includes("QID") || f.includes("Q6H") || f.includes("4X")) return 4;
  if (f.includes("TID") || f.includes("TDS") || f.includes("Q8H") || f.includes("3X")) return 3;
  if (f.includes("BID") || f.includes("BD") || f.includes("Q12H") || f.includes("TWICE") || f.includes("2X")) return 2;
  return 1;
}

/**
 * Calculate dose from a template drug definition
 * @param {object} templateDrug - drug from PATHWAY_TEMPLATES
 * @param {number} weightKg
 * @param {number|null} bsa
 * @param {number|null} egfr
 * @returns {{ perDose: string, daily: string, note: string, capped: boolean, capValue: string, renalNote: string|null }}
 */
export function calcTemplateDose(templateDrug, weightKg, bsa, egfr) {
  const { name, dose_mgkg, dose_mgm2, max_dose_mg, frequency, bsa_based, tdm, note } = templateDrug;
  const factor = freqFactor(frequency);

  if (tdm) {
    return { perDose: "TDM-guided", daily: "—", note: `Starting dose: see protocol. Monitor levels.`, capped: false, capValue: null, renalNote: null };
  }

  // BSA-based
  if (bsa_based && dose_mgm2 && bsa) {
    const dailyDose = dose_mgm2 * bsa;
    const perDoseRaw = dailyDose / factor;
    const capped = max_dose_mg > 0 && perDoseRaw > max_dose_mg;
    const perDoseFinal = capped ? max_dose_mg : perDoseRaw;
    return {
      perDose: `${perDoseFinal.toFixed(0)} mg`,
      daily: `${capped ? max_dose_mg * factor : dailyDose.toFixed(0)} mg/day`,
      note: `${dose_mgm2} mg/m²/day × BSA ${bsa} m² ${capped ? "→ CAPPED at max" : ""}`,
      capped, capValue: max_dose_mg > 0 ? `${max_dose_mg} mg/dose` : null, renalNote: null
    };
  }

  // Weight-based
  if (dose_mgkg && weightKg) {
    const dailyDose = dose_mgkg * weightKg;
    const perDoseRaw = dailyDose / factor;
    const capped = max_dose_mg > 0 && perDoseRaw > max_dose_mg;
    const perDoseFinal = capped ? max_dose_mg : perDoseRaw;

    let renalNote = null;
    if (egfr && egfr < 30) renalNote = `eGFR ${egfr}: significant renal impairment — consult renal dosing guide`;
    else if (egfr && egfr < 60) renalNote = `eGFR ${egfr}: mild-moderate renal impairment — monitor closely`;

    return {
      perDose: `${perDoseFinal.toFixed(1)} mg`,
      daily: `${capped ? max_dose_mg * factor : dailyDose.toFixed(1)} mg/day`,
      note: `${dose_mgkg} mg/kg/day ÷ ${factor} doses × ${weightKg} kg ${capped ? "→ CAPPED" : ""}${note ? " | " + note : ""}`,
      capped, capValue: max_dose_mg > 0 ? `${max_dose_mg} mg/dose` : null, renalNote
    };
  }

  return { perDose: "See protocol", daily: "—", note: note || "Dose requires clinical assessment", capped: false, capValue: null, renalNote: null };
}

/**
 * Get renal adjustment warning for a drug
 */
export function getRenalAdjustment(egfr, drugName, renalAdjustText) {
  if (!egfr || !renalAdjustText) return null;
  const g = parseFloat(egfr);
  const adj = renalAdjustText.toLowerCase();

  // Known high-risk combos
  const avoidBelow30 = ["nsaid", "metformin", "spironolactone", "nitrofurantoin", "potassium"];
  const adjustBelow60 = ["methotrexate", "gentamicin", "vancomycin", "amphotericin", "acyclovir"];

  const drugLower = (drugName || "").toLowerCase();
  if (avoidBelow30.some(d => drugLower.includes(d)) && g < 30) {
    return { level: "critical", msg: `AVOID in eGFR ${g} — contraindicated in severe renal impairment` };
  }
  if (adjustBelow60.some(d => drugLower.includes(d)) && g < 60) {
    return { level: "warning", msg: `Dose adjustment required for eGFR ${g}` };
  }
  if ((adj.includes("avoid") || adj.includes("contraindicated")) && g < 30) {
    return { level: "critical", msg: `AVOID in eGFR ${g} — ${renalAdjustText}` };
  }
  if (adj.includes("reduce") && g < 60) {
    return { level: "warning", msg: `Dose reduction required (eGFR ${g}) — ${renalAdjustText}` };
  }
  if (adj.includes("caution") && g < 60) {
    return { level: "info", msg: `Use with caution (eGFR ${g}) — ${renalAdjustText}` };
  }
  return null;
}