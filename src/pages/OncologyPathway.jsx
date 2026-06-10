import { useState, useCallback, useRef } from "react";

const CLASS_COLORS = {
  anthracycline:  { bg: "#c0392b", light: "#fde8e8", text: "#7b1515" },
  platinum:       { bg: "#16a085", light: "#e0f5f1", text: "#0d5c4a" },
  alkylating:     { bg: "#e67e22", light: "#fdf0e0", text: "#7d4000" },
  vinca:          { bg: "#8e44ad", light: "#f5e6ff", text: "#4a1a6b" },
  antimetabolite: { bg: "#27ae60", light: "#e8f8ee", text: "#145232" },
  immunotherapy:  { bg: "#2980b9", light: "#e3f0fa", text: "#124f78" },
  steroid:        { bg: "#f1c40f", light: "#fefce8", text: "#7d6400" },
  topoisomerase:  { bg: "#d35400", light: "#fde9e0", text: "#6e2500" },
  supportive:     { bg: "#7f8c8d", light: "#f0f0f0", text: "#3d4344" },
  antibiotic:     { bg: "#c0392b", light: "#fde8e8", text: "#7b1515" },
  rt:             { bg: "#34495e", light: "#eaecee", text: "#1c2833" },
  other:          { bg: "#7f8c8d", light: "#f0f0f0", text: "#3d4344" },
};

const TUMOR_GROUPS = [
  { id: "leukaemia",    label: "Leukaemia",           icon: "🔴", protocols: ["ALL"] },
  { id: "lymphoma",     label: "Lymphoma",            icon: "🟣", protocols: ["ALCL","BNHL"] },
  { id: "neuroblastoma",label: "Neuroblastoma",       icon: "🟡", protocols: ["HR_NBL","LR_NBL"] },
  { id: "renal",        label: "Renal Tumours",       icon: "🔵", protocols: ["WILMS"] },
  { id: "sarcoma",      label: "Soft Tissue Sarcoma", icon: "🟠", protocols: ["RMS"] },
  { id: "bone",         label: "Bone Tumours",        icon: "⬜", protocols: ["OSTEO","EWING"] },
  { id: "cns",          label: "CNS Tumours",         icon: "🟢", protocols: ["MEDULLO","CNS_GCT"] },
  { id: "liver",        label: "Liver Tumours",       icon: "🟤", protocols: ["HEPATO"] },
  { id: "histiocytosis",label: "Histiocytosis",       icon: "🔶", protocols: ["LCH"] },
];

const STRATIFICATION_QUESTIONS = {
  ALL: [
    { id:"age", label:"Age at diagnosis", type:"number", unit:"years", hint:"1–18 years eligible" },
    { id:"wbc", label:"WBC at presentation", type:"number", unit:"× 10⁹/L", hint:"Key risk factor: <50 = lower risk" },
    { id:"lineage", label:"Lineage", type:"select", options:["BCP-ALL","T-ALL"] },
    { id:"kmt2a", label:"KMT2A (MLL) rearrangement?", type:"select", options:["No","Yes","Unknown"] },
    { id:"tcf3hlf", label:"TCF3::HLF t(17;19)?", type:"select", options:["No","Yes","Unknown"] },
    { id:"pred_response", label:"Day 8 prednisolone response", type:"select", options:["Good responder","Poor responder","Not yet assessed"] },
    { id:"day35_marrow", label:"Day 35 bone marrow response", type:"select", options:["M1 (<5% blasts)","M2 (5–25% blasts)","M3 (>25% blasts)","Not yet assessed"] },
    { id:"mrd", label:"End-induction MRD", type:"select", options:["<0.01% (negative)","≥0.01% (positive)","Not yet assessed"] },
  ],
  ALCL: [
    { id:"stage", label:"Ann Arbor Stage", type:"select", options:["I","II","III","IV"] },
    { id:"alk", label:"ALK status", type:"select", options:["ALK-positive","ALK-negative","Unknown"] },
    { id:"cd30", label:"CD30 expression", type:"select", options:["Positive","Negative","Unknown"] },
    { id:"bv_available", label:"Brentuximab vedotin available at your centre?", type:"select", options:["Yes","No"] },
  ],
  BNHL: [
    { id:"histology", label:"Histology", type:"select", options:["Burkitt lymphoma","DLBCL","B-NHL NOS"] },
    { id:"resection", label:"Surgical resection status", type:"select", options:["Completely resected stage I","Abdominal stage II (resected)","Not resected / stage III–IV"] },
    { id:"ldh", label:"LDH level", type:"select", options:["Normal / ≤2× ULN","2–4× ULN",">4× ULN"] },
    { id:"cns", label:"CNS / CSF involvement?", type:"select", options:["No","CSF positive","CNS mass"] },
    { id:"stage", label:"Murphy/St Jude Stage", type:"select", options:["I","II","III","IV"] },
  ],
  HR_NBL: [
    { id:"inss", label:"INSS Stage", type:"select", options:["1","2","3","4","4s"] },
    { id:"mycn", label:"MYCN amplification", type:"select", options:["Non-amplified","Amplified"] },
    { id:"age_months", label:"Age at diagnosis", type:"number", unit:"months" },
    { id:"induction_choice", label:"Induction regimen preference", type:"select", options:["Rapid COJEC (standard)","Modified N7"] },
  ],
  LR_NBL: [
    { id:"inrg_stage", label:"INRG Stage", type:"select", options:["L1","L2","M (infant ≤18m)","Ms"] },
    { id:"mycn", label:"MYCN status", type:"select", options:["Non-amplified","Amplified → escalate to HR"] },
    { id:"age_months", label:"Age at diagnosis", type:"number", unit:"months" },
    { id:"histology_grade", label:"Histology grade", type:"select", options:["Differentiated (favourable)","Undifferentiated / poorly differentiated"] },
    { id:"chromosomal", label:"Chromosomal aberrations", type:"select", options:["NCA (numerical only)","SCA (segmental)","Unknown"] },
    { id:"lts", label:"Life-threatening symptoms?", type:"select", options:["No","Yes"] },
  ],
  WILMS: [
    { id:"disease_status", label:"Disease status", type:"select", options:["Primary (preoperative)","Relapsed"] },
    { id:"stage", label:"SIOP Stage (post-preop chemo)", type:"select", options:["I","II","III","IV (metastatic)","Bilateral (V)"] },
    { id:"histology", label:"Histology / risk category", type:"select", options:["Low risk (cystic/completely necrotic)","Intermediate (epithelial/stromal/mixed/regressive)","High risk (blastemal type)","Diffuse anaplasia"] },
    { id:"relapse_group", label:"Relapse group (if relapsed)", type:"select", options:["N/A — primary","Group AA (low/standard relapse risk)","Group BB (high relapse risk)","Group CC (very high relapse risk)"] },
    { id:"weight_kg", label:"Weight", type:"number", unit:"kg", hint:"Dose reduction if <12 kg" },
  ],
  RMS: [
    { id:"histology", label:"Histology / molecular subtype", type:"select", options:["Embryonal / spindle cell / botryoid (favourable)","Alveolar (PAX::FOXO1 fusion-positive)","Alveolar (fusion-negative)","Undifferentiated / NOS"] },
    { id:"irs_group", label:"IRS post-surgical group", type:"select", options:["Group I (completely resected)","Group II (microscopic residue)","Group III (macroscopic residue)"] },
    { id:"site", label:"Primary site", type:"select", options:["Orbit (favourable)","Head & neck non-parameningeal (favourable)","GU non-bladder/prostate (favourable)","Parameningeal","Extremity","Bladder/prostate","Other unfavourable"] },
    { id:"nodes", label:"Regional lymph node involvement (N)", type:"select", options:["N0","N1"] },
    { id:"size_cm", label:"Tumour size", type:"number", unit:"cm", hint:"≤5 cm is favourable" },
    { id:"age", label:"Age at diagnosis", type:"number", unit:"years", hint:"<10 years is favourable" },
    { id:"mets", label:"Distant metastases?", type:"select", options:["No (localised)","Yes (stage IV)"] },
  ],
  OSTEO: [
    { id:"site", label:"Primary site", type:"select", options:["Extremity / limb","Axial skeleton (non-craniofacial)"] },
    { id:"mets", label:"Metastatic disease at diagnosis?", type:"select", options:["No (localised)","Yes (pulmonary only)","Yes (extra-pulmonary)"] },
    { id:"resectable", label:"Deemed resectable?", type:"select", options:["Yes","No / borderline"] },
  ],
  EWING: [
    { id:"site", label:"Primary site", type:"select", options:["Bone","Soft tissue (extraskeletal)"] },
    { id:"mets", label:"Metastatic disease?", type:"select", options:["No (localised)","Pulmonary only","Extrapulmonary metastases"] },
    { id:"size_cm", label:"Tumour size", type:"number", unit:"cm" },
    { id:"interval", label:"Preferred cycle interval", type:"select", options:["q2 weeks (interval-compressed, preferred)","q3 weeks"] },
  ],
  MEDULLO: [
    { id:"residual", label:"Post-operative residual tumour", type:"select", options:["None / ≤1.5 cm²","≥1.5 cm² (high-risk residual)"] },
    { id:"mstage", label:"Metastatic stage", type:"select", options:["M0 (no metastasis)","M1 (CSF positive)","M2–M3 (CNS mets)","M4 (extraneural)"] },
    { id:"molecular", label:"Molecular subgroup", type:"select", options:["WNT-activated","SHH-activated (TP53 wild-type)","SHH-activated (TP53 mutant)","Non-WNT/Non-SHH (Group 3/4)","Not yet tested"] },
    { id:"age", label:"Age at diagnosis", type:"number", unit:"years", hint:"WNT de-escalation applies to age <16 years" },
  ],
  CNS_GCT: [
    { id:"subtype", label:"GCT subtype", type:"select", options:["Germinoma (marker-negative)","NGGCT (marker-positive)","Teratoma (mature)","Mixed GCT"] },
    { id:"afp", label:"AFP level (ng/mL)", type:"number", unit:"ng/mL", hint:">1000 = high-risk NGGCT" },
    { id:"hcg", label:"β-HCG level", type:"select", options:["Normal / mildly elevated","Markedly elevated"] },
    { id:"dissemination", label:"Metastatic / disseminated?", type:"select", options:["No (localised)","Yes (MRI / CSF positive)"] },
    { id:"age", label:"Age at diagnosis", type:"number", unit:"years", hint:"Age <6y = high-risk NGGCT regardless of AFP" },
  ],
  HEPATO: [
    { id:"pretext", label:"PRETEXT stage", type:"select", options:["I (1 sector)","II (≤2 contiguous sectors)","III (≤3 sectors)","IV (all 4 sectors)"] },
    { id:"afp", label:"AFP level (ng/mL)", type:"number", unit:"ng/mL", hint:"<100 ng/mL = high-risk regardless of stage" },
    { id:"annotations", label:"PRETEXT annotation factors (VPEFR)", type:"select", options:["None","One factor","Two or more factors"] },
    { id:"mets", label:"Metastatic disease?", type:"select", options:["No","Yes (pulmonary)","Yes (extrapulmonary)"] },
  ],
  LCH: [
    { id:"extent", label:"Extent of disease", type:"select", options:["Single system (SS-LCH)","Multisystem (MS-LCH)"] },
    { id:"ss_site", label:"SS-LCH site (if SS)", type:"select", options:["N/A — multisystem","Unifocal bone","Multifocal bone","CNS-risk lesion","Other single site"] },
    { id:"risk_organ", label:"Risk organ involvement (liver, spleen, bone marrow)?", type:"select", options:["No","Yes"] },
    { id:"cns_lch", label:"CNS-LCH / neurodegenerative LCH?", type:"select", options:["No","Yes"] },
  ],
};

function computeRiskAndRegimen(protocolId, answers) {
  switch (protocolId) {
    case "ALL": {
      const { age, wbc, lineage, kmt2a, tcf3hlf, pred_response, day35_marrow, mrd } = answers;
      if (lineage === "T-ALL") return { risk: "T-ALL", regimen: "ICiCLe ALL-14 T-ALL arm", arm: "T-ALL", protocol: "ICiCLe ALL-14", color: "#c0392b" };
      const isHR = kmt2a === "Yes" || tcf3hlf === "Yes" || pred_response === "Poor responder" || day35_marrow === "M3 (>25% blasts)" || mrd === "≥0.01% (positive)";
      if (isHR) return { risk: "High Risk BCP-ALL", regimen: "ICiCLe ALL-14 HR arm — intensified consolidation, DI with mitoxantrone", arm: "HR", protocol: "ICiCLe ALL-14", color: "#c0392b" };
      const isSR = Number(age) < 10 && Number(wbc) < 50;
      if (isSR) return { risk: "Standard Risk BCP-ALL", regimen: "ICiCLe ALL-14 SR arm — R1 randomisation (prednisolone schedule)", arm: "SR", protocol: "ICiCLe ALL-14", color: "#27ae60" };
      return { risk: "Intermediate Risk BCP-ALL", regimen: "ICiCLe ALL-14 IR arm", arm: "IR", protocol: "ICiCLe ALL-14", color: "#e67e22" };
    }
    case "ALCL": {
      const { stage, alk, bv_available } = answers;
      const advanced = ["III","IV"].includes(stage);
      const bv = bv_available === "Yes";
      if (advanced && alk === "ALK-positive" && bv) return { risk: "Advanced ALK+ ALCL", regimen: "APO + Brentuximab vedotin × 6 (ANHL12P1 — emerging standard)", arm: "APO+BV", protocol: "ANHL0131/ANHL12P1", color: "#2980b9" };
      if (advanced) return { risk: "Advanced ALCL", regimen: "APO backbone (doxorubicin + prednisone + vincristine + MTX + 6-MP)", arm: "APO", protocol: "ANHL0131", color: "#8e44ad" };
      return { risk: "Early Stage ALCL", regimen: "APO backbone — consult institutional protocol for stage I/II", arm: "APO-early", protocol: "ANHL0131", color: "#27ae60" };
    }
    case "BNHL": {
      const { resection, ldh, cns, stage } = answers;
      const fullyResected = resection.includes("Completely resected");
      if (fullyResected) return { risk: "Group A (Low Risk)", regimen: "COP only — reduced chemotherapy", arm: "GroupA", protocol: "FAB-LMB96", color: "#27ae60" };
      const highLDH = ldh.includes("2×");
      const cnsTx = cns !== "No";
      if (cnsTx || (stage === "IV") || (stage === "III" && highLDH)) {
        if (cnsTx && cns === "CSF positive") return { risk: "Group C3 (High Risk, CSF+)", regimen: "R-COPADM (higher MTX dose) → R-CYVE × 2 + Rituximab × 6", arm: "GroupC3", protocol: "FAB-LMB96+R", color: "#c0392b" };
        return { risk: "Group C1 (High Risk)", regimen: "R-COPADM × 2 → R-CYVE × 2 + Rituximab × 6", arm: "GroupC1", protocol: "FAB-LMB96+R", color: "#c0392b" };
      }
      if (highLDH) return { risk: "Group B + High LDH", regimen: "COP → R-COPADM × 2 → R-CYM × 2 + Rituximab × 6 (high-risk B)", arm: "GroupB+R", protocol: "FAB-LMB96+R", color: "#e67e22" };
      return { risk: "Group B (Intermediate Risk)", regimen: "COP → COPADM × 2 → CYM × 2", arm: "GroupB", protocol: "FAB-LMB96", color: "#f1c40f" };
    }
    case "HR_NBL": {
      const { induction_choice } = answers;
      const regimen = induction_choice === "Modified N7" ? "Modified N7 × 5 → TVD rescue if poor response → BuMel + PBSCR → RT → Dinutuximab β + Isotretinoin" : "Rapid COJEC (courses A/B/C q10d, 10 weeks) → TVD rescue if poor response → BuMel + PBSCR → RT → Dinutuximab β + Isotretinoin (NO IL-2)";
      return { risk: "High-Risk Neuroblastoma", regimen, arm: induction_choice === "Modified N7" ? "N7" : "COJEC", protocol: "HR-NBL-1/SIOPEN", color: "#c0392b" };
    }
    case "LR_NBL": {
      const { inrg_stage, mycn, age_months, lts, chromosomal } = answers;
      if (mycn === "Amplified → escalate to HR") return { risk: "ESCALATE TO HIGH-RISK PROTOCOL", regimen: "MYCN-amplified — refer to HR-NBL-1/SIOPEN immediately", arm: "ESCALATE", protocol: "HR-NBL-1/SIOPEN", color: "#c0392b" };
      const age = Number(age_months);
      if ((inrg_stage === "L1" || (inrg_stage === "Ms" && age <= 18) || (inrg_stage === "L2" && age <= 18 && chromosomal === "NCA (numerical only)")) && lts === "No") {
        return { risk: "Low Risk — Surgery / Observation", regimen: "Surgery or active observation only — NO chemotherapy required", arm: "LowRisk-Obs", protocol: "CCLG/SIOPEN LINES", color: "#27ae60" };
      }
      return { risk: "Intermediate Risk", regimen: "VP/Carbo (carboplatin + etoposide) ± CADO (cyclophosphamide + doxorubicin + vincristine) — up to 6 cycles", arm: "IntermediateRisk", protocol: "CCLG/SIOPEN LINES", color: "#e67e22" };
    }
    case "WILMS": {
      const { disease_status, relapse_group, stage, histology } = answers;
      if (disease_status === "Relapsed") {
        if (relapse_group.includes("Group AA")) return { risk: "Relapsed — Group AA", regimen: "CyD alternating Carbo/E × 8 courses (21-day cycles)", arm: "Relapse-AA", protocol: "SIOP-RTSG UMBRELLA", color: "#e67e22" };
        if (relapse_group.includes("Group BB")) return { risk: "Relapsed — Group BB", regimen: "ICE/CyCE × 4 → HD-Melphalan + autologous SCR", arm: "Relapse-BB", protocol: "SIOP-RTSG UMBRELLA", color: "#c0392b" };
        if (relapse_group.includes("Group CC")) return { risk: "Relapsed — Group CC", regimen: "Refer to ITCC novel-agent trials — standard salvage not established", arm: "Relapse-CC", protocol: "SIOP-RTSG UMBRELLA", color: "#7f8c8d" };
      }
      const highRisk = histology.includes("blastemal") || histology.includes("Diffuse anaplasia");
      return { risk: highRisk ? `Stage ${stage} — High Risk Histology` : `Stage ${stage} — ${histology.split("(")[0].trim()}`, regimen: "ActD + Vincristine preoperative (4 weeks) → Surgery → Risk/stage-stratified postoperative chemotherapy", arm: highRisk ? "Primary-HR" : "Primary-SR", protocol: "SIOP-RTSG UMBRELLA", color: highRisk ? "#c0392b" : "#27ae60" };
    }
    case "RMS": {
      const { histology, irs_group, site, nodes, size_cm, age, mets } = answers;
      if (mets === "Yes (stage IV)") return { risk: "Stage IV (Distant Metastases)", regimen: "VAIA III induction + surgery/RT — discuss with national coordinator", arm: "VeryHighRisk", protocol: "EpSSG/CWS 2025", color: "#c0392b" };
      const alveolar = histology.includes("Alveolar");
      const nodePos = nodes === "N1";
      const bigTumour = Number(size_cm) > 5;
      const olderAge = Number(age) >= 10;
      const unfavSite = !site.includes("(favourable)");
      const score = [alveolar, nodePos, bigTumour, olderAge, unfavSite, irs_group.includes("III")].filter(Boolean).length;
      if (alveolar && nodePos) return { risk: "Very High Risk — Subgroup H (Alveolar + N1)", regimen: "VAIA III: IVAd alternating IVA × 6 courses, then IVA × 3; surgery + RT + vinorelbine/cyclophosphamide maintenance", arm: "VHR-H", protocol: "EpSSG/CWS 2025", color: "#c0392b" };
      if (score >= 3 || alveolar) return { risk: "High Risk — Subgroup F/G", regimen: "IVA × 9 cycles; surgery + RT + vinorelbine/cyclophosphamide maintenance (RMS2005 2023)", arm: "HR-FG", protocol: "EpSSG/CWS 2025", color: "#e67e22" };
      if (score <= 1 && irs_group.includes("I") && !alveolar) return { risk: "Low Risk — Subgroup A/B", regimen: "VA × 4 cycles (vincristine + actinomycin-D) + surgery", arm: "LR-A", protocol: "EpSSG/CWS 2025", color: "#27ae60" };
      return { risk: "Standard Risk — Subgroup C/D/E", regimen: "IVA × 5–9 cycles (ifosfamide + vincristine + actinomycin-D) + surgery ± RT", arm: "SR-CDE", protocol: "EpSSG/CWS 2025", color: "#e67e22" };
    }
    case "OSTEO": {
      const { mets, resectable } = answers;
      if (!resectable || resectable === "No / borderline") return { risk: "Borderline / Unresectable", regimen: "Neoadjuvant MAP — discuss resectability after 2 cycles", arm: "MAP-borderline", protocol: "EURAMOS-1", color: "#e67e22" };
      if (mets === "Yes (extra-pulmonary)") return { risk: "Metastatic (Extra-pulmonary)", regimen: "MAP backbone — poor prognosis, consider clinical trial", arm: "MAP-extrapulm-mets", protocol: "EURAMOS-1", color: "#c0392b" };
      return { risk: mets === "No (localised)" ? "Localised" : "Metastatic (Pulmonary)", regimen: "Preoperative MAP × 2 → Surgery (week 10) → Postoperative MAP × 4 (good response <10% viable) or MAPIE × 4 (poor response ≥10% viable)", arm: "MAP-MAPIE", protocol: "EURAMOS-1", color: "#27ae60" };
    }
    case "EWING": {
      const { mets, interval } = answers;
      const compressed = interval.includes("q2");
      if (mets === "Yes (extrapulmonary metastases)") return { risk: "Stage IV — Extrapulmonary Metastases", regimen: `VDC/IE alternating ${compressed ? "q2 weeks" : "q3 weeks"} → local control → BuMel consolidation (consider)`, arm: "VDC-IE-mets", protocol: "Euro-EWING 2012", color: "#c0392b" };
      return { risk: mets === "No (localised)" ? "Localised" : "Pulmonary Metastases", regimen: `Alternating VDC/IE × 14 cycles ${compressed ? "q2 weeks (interval-compressed)" : "q3 weeks"} → local control (surgery ± RT between cycle 3 IE and 4 VDC) → IE/VC consolidation`, arm: "VDC-IE", protocol: "Euro-EWING 2012", color: "#27ae60" };
    }
    case "MEDULLO": {
      const { residual, mstage, molecular, age } = answers;
      if (molecular === "WNT-activated" && mstage === "M0 (no metastasis)" && residual.includes("≤1.5") && Number(age) < 16) {
        return { risk: "WNT-Favourable (Low Risk)", regimen: "REDUCED CSI 18 Gy + boost 54 Gy (NO VCR during RT) → 6 maintenance cycles (cisplatin/CCNU/VCR × 3 alternating cyclophosphamide/VCR × 3)", arm: "WNT-LR", protocol: "PNET5/ESCP", color: "#27ae60" };
      }
      const highRisk = mstage !== "M0 (no metastasis)" || residual.includes("≥1.5") || molecular === "SHH-activated (TP53 mutant)";
      if (highRisk) return { risk: molecular === "SHH-activated (TP53 mutant)" ? "SHH-TP53 Mutant (High Risk)" : "High Risk (M+ or Large Residual)", regimen: "Intensified RT (>23.4 Gy CSI) ± HD chemotherapy ± stem cell rescue — per PNET5 SHH-TP53 or HR stratum", arm: "HR-MEDULLO", protocol: "PNET5/ESCP", color: "#c0392b" };
      return { risk: "Standard Risk", regimen: "CSI 23.4 Gy + tumour-bed boost 54 Gy + weekly VCR during RT → 8 maintenance cycles (cisplatin/CCNU/VCR × 4 alternating cyclophosphamide/VCR × 4)", arm: "SR-MEDULLO", protocol: "PNET5/ESCP", color: "#e67e22" };
    }
    case "CNS_GCT": {
      const { subtype, afp, age, dissemination } = answers;
      if (subtype === "Teratoma (mature)") return { risk: "Mature Teratoma", regimen: "Surgical resection — primary treatment. Monitor AFP/HCG closely.", arm: "Teratoma", protocol: "ESCP/SIOP CNS GCT II", color: "#27ae60" };
      const afpNum = Number(afp);
      const isHighRisk = afpNum > 1000 || Number(age) < 6;
      if (subtype.includes("NGGCT") && isHighRisk) return { risk: "High-Risk NGGCT (AFP >1000 or age <6y)", regimen: "PEI induction × 2 → HD-PEI + SCT → RT (if ≥6y): non-met TU 54 Gy / met CSI 30 Gy + TU 24 Gy", arm: "HR-NGGCT", protocol: "ESCP/SIOP CNS GCT II", color: "#c0392b" };
      if (subtype.includes("NGGCT")) return { risk: "Standard-Risk NGGCT", regimen: "PEI induction × 2 → response assessment → RT", arm: "SR-NGGCT", protocol: "ESCP/SIOP CNS GCT II", color: "#e67e22" };
      const metastatic = dissemination === "Yes (MRI / CSF positive)";
      return { risk: metastatic ? "Metastatic Germinoma" : "Localised Germinoma", regimen: metastatic ? "CarboPEI × 2 → CSI 24 Gy + boost 16 Gy to primary/mets" : "CarboPEI × 2 → WVI 24 Gy ALONE if CR (SIOP CNS GCT II 2022) / + 16 Gy boost if non-CR", arm: metastatic ? "Germ-Met" : "Germ-Local", protocol: "ESCP/SIOP CNS GCT II", color: "#2980b9" };
    }
    case "HEPATO": {
      const { pretext, afp, annotations, mets } = answers;
      const afpNum = Number(afp);
      if (afpNum < 100) return { risk: "High Risk — AFP <100 ng/mL", regimen: "Intensified PLADO or SIOPEL-3HR — AFP <100 independently poor prognosis", arm: "HR-LowAFP", protocol: "SIOPEL/PHITT", color: "#c0392b" };
      if (mets !== "No") return { risk: "Metastatic (CHIC Group D)", regimen: "SIOPEL-3HR: cisplatin D1 alternating with carboplatin + doxorubicin D15–16 × 5 cycles → surgery/transplant", arm: "HR-D", protocol: "SIOPEL/PHITT", color: "#c0392b" };
      const ptxt = pretext.split(" ")[0];
      if ((ptxt === "III" || ptxt === "IV") && annotations !== "None") return { risk: "Intermediate Risk (CHIC Group C)", regimen: "PLADO × 4 preoperative + 2 postoperative (cisplatin 80 mg/m² + doxorubicin 60 mg/m²/course q21d)", arm: "IntR-C", protocol: "SIOPEL/PHITT", color: "#e67e22" };
      if (ptxt === "I" || ptxt === "II") return { risk: "Very Low / Low Risk (CHIC Group A/B)", regimen: "Cisplatin monotherapy (SIOPEL-6) or surgery alone (CHIC A) — PLADO for suboptimal response", arm: "LowR-AB", protocol: "SIOPEL/PHITT", color: "#27ae60" };
      return { risk: "Intermediate Risk (CHIC Group C)", regimen: "PLADO × 4 preoperative + 2 postoperative cycles", arm: "IntR-C", protocol: "SIOPEL/PHITT", color: "#e67e22" };
    }
    case "LCH": {
      const { extent, ss_site, risk_organ, cns_lch } = answers;
      if (cns_lch === "Yes") return { risk: "CNS-LCH (Neurodegenerative)", regimen: "LCH-IV Stratum V — IVIG + cytarabine-based regimen; specialist MDT referral", arm: "CNS-LCH", protocol: "LCH-IV", color: "#c0392b" };
      if (extent === "Single system (SS-LCH)") {
        if (ss_site.includes("Unifocal bone")) return { risk: "SS-LCH — Unifocal Bone", regimen: "Local treatment: curettage, intralesional steroid, or indomethacin 1–3 mg/kg/day — NO systemic chemotherapy required", arm: "SS-Bone", protocol: "LCH-IV", color: "#27ae60" };
        if (ss_site.includes("Multifocal bone") || ss_site.includes("CNS-risk")) return { risk: "SS-LCH — Multifocal Bone / CNS-Risk", regimen: "Treat as MS-LCH: vinblastine + prednisolone Initial I → continuation to month 12", arm: "SS-MFB", protocol: "LCH-IV", color: "#e67e22" };
      }
      if (risk_organ === "Yes") return { risk: "MS-LCH — Risk Organ Involvement", regimen: "Vinblastine + prednisolone Initial I (6w) ±Initial II (6w) → continuation 12 months + 6-MP daily; 12-month duration mandatory", arm: "MS-RO", protocol: "LCH-IV", color: "#c0392b" };
      return { risk: "MS-LCH — Low Risk (No Risk Organ)", regimen: "Vinblastine + prednisolone Initial I (6w) ±Initial II (6w) → continuation to month 12", arm: "MS-LR", protocol: "LCH-IV", color: "#e67e22" };
    }
    default: return { risk: "Undetermined", regimen: "Please review all criteria", arm: "Unknown", protocol: "N/A", color: "#7f8c8d" };
  }
}

function buildTimeline(protocolId, arm, answers) {
  const bsa = answers._bsa ? Number(answers._bsa) : 1.0;

  const timelines = {
    "ALL-SR": { totalWeeks:130, phases:[{n:"Induction",s:0,e:5,c:"#e3f2fd"},{n:"Consolidation",s:5,e:13,c:"#e8f5e9"},{n:"Interim Maint.",s:13,e:21,c:"#fff8e1"},{n:"Delayed Intensif.",s:21,e:30,c:"#fce4ec"},{n:"Maintenance ×96w",s:30,e:130,c:"#f3e5f5"}],
      drugs:[
        {n:"Prednisolone",c:"steroid",bars:[{s:0,e:5}],dose:`${(60*bsa).toFixed(0)} mg/day (60 mg/m²) — pulsed or continuous per R1`,route:"PO"},
        {n:"Vincristine",c:"vinca",bars:[{s:0,e:5},{s:21,e:25}],dose:`${(1.5*bsa).toFixed(1)} mg (1.5 mg/m², max 2 mg)`,route:"IV"},
        {n:"L-Asparaginase",c:"other",bars:[{s:1,e:5}],dose:"Per protocol schedule (IM/IV)",route:"IM"},
        {n:"IT Methotrexate",c:"antimetabolite",bars:[{s:0,e:1},{s:5,e:7},{s:21,e:22}],dose:"Age-banded dose (IT)",route:"IT"},
        {n:"6-MP (oral)",c:"antimetabolite",bars:[{s:5,e:13},{s:30,e:130}],dose:"50–75 mg/m²/day",route:"PO"},
        {n:"Methotrexate (oral maint.)",c:"antimetabolite",bars:[{s:13,e:21},{s:30,e:130}],dose:"20 mg/m²/week",route:"PO"},
        {n:"Mitoxantrone (R2B)",c:"anthracycline",bars:[{s:21,e:22}],dose:`${(10*bsa).toFixed(0)} mg (10 mg/m²) × 1 dose Day 1 DI — R2 trial arm`,route:"IV"},
        {n:"Dexamethasone",c:"steroid",bars:[{s:21,e:23}],dose:"10 mg/m²/day × 7d DI phase",route:"PO"},
      ],
      monitoring:[{w:1,l:"Day 8 prednisolone response",t:"labs"},{w:5,l:"Day 35 marrow (M1/M2/M3)",t:"bma"},{w:21,l:"MRD end-induction",t:"labs"}],
    },
    "BNHL-GroupA": { totalWeeks:6, phases:[{n:"COP only",s:0,e:6,c:"#e8f5e9"}],
      drugs:[{n:"Vincristine",c:"vinca",bars:[{s:0,e:1}],dose:"1.0 mg/m² (max 2 mg) IV bolus",route:"IV"},{n:"Cyclophosphamide",c:"alkylating",bars:[{s:0,e:1}],dose:"300 mg/m² over 15 min",route:"IV"},{n:"Prednisolone",c:"steroid",bars:[{s:0,e:1}],dose:"60 mg/m²/day BD days 1–7",route:"PO"}],
      monitoring:[{w:1,l:"Day 7 COP response",t:"imaging"}],
    },
    "BNHL-GroupB": { totalWeeks:20, phases:[{n:"COP",s:0,e:1,c:"#e3f2fd"},{n:"COPADM ×2",s:1,e:7,c:"#fce4ec"},{n:"CYM ×2",s:7,e:16,c:"#e8f5e9"},{n:"CYM maint.",s:16,e:20,c:"#fff8e1"}],
      drugs:[
        {n:"Vincristine",c:"vinca",bars:[{s:0,e:7}],dose:"1.0–1.5 mg/m² (max 2 mg)",route:"IV"},
        {n:"Cyclophosphamide",c:"alkylating",bars:[{s:0,e:7}],dose:"300–500 mg/m² per course",route:"IV"},
        {n:"Prednisolone",c:"steroid",bars:[{s:0,e:7}],dose:"60 mg/m²/day",route:"PO"},
        {n:"Doxorubicin",c:"anthracycline",bars:[{s:1,e:7}],dose:`${(60*bsa).toFixed(0)} mg (60 mg/m²/course COPADM)`,route:"IV"},
        {n:"HD-Methotrexate",c:"antimetabolite",bars:[{s:1,e:7},{s:7,e:16}],dose:"3 g/m² over 3h",route:"IV"},
        {n:"Folinic acid rescue",c:"supportive",bars:[{s:1,e:16}],dose:"15 mg/m² q6h from 24h until MTX <0.15 µmol/L",route:"PO/IV"},
        {n:"Cytarabine",c:"antimetabolite",bars:[{s:7,e:16}],dose:"100 mg/m² over 24h days 2–6 (CYM)",route:"IV"},
      ],
      monitoring:[{w:1,l:"Day 7 response — non-response → escalate C1+rituximab",t:"imaging"},{w:7,l:"MTX level monitoring q24h",t:"labs"}],
    },
    "BNHL-GroupB+R": { totalWeeks:20, phases:[{n:"COP",s:0,e:1,c:"#e3f2fd"},{n:"R-COPADM ×2",s:1,e:7,c:"#fce4ec"},{n:"R-CYM ×2",s:7,e:16,c:"#e8f5e9"},{n:"Maint.",s:16,e:20,c:"#fff8e1"}],
      drugs:[
        {n:"Rituximab ×6",c:"immunotherapy",bars:[{s:1,e:2},{s:4,e:5},{s:7,e:8},{s:11,e:12},{s:15,e:16},{s:19,e:20}],dose:`${(375*bsa).toFixed(0)} mg (375 mg/m²) Day 1 each rituximab course`,route:"IV"},
        {n:"Vincristine",c:"vinca",bars:[{s:0,e:7}],dose:"1.0–1.5 mg/m² (max 2 mg)",route:"IV"},
        {n:"Cyclophosphamide",c:"alkylating",bars:[{s:0,e:7}],dose:"300–500 mg/m²",route:"IV"},
        {n:"Prednisolone",c:"steroid",bars:[{s:0,e:7}],dose:"60 mg/m²/day",route:"PO"},
        {n:"Doxorubicin",c:"anthracycline",bars:[{s:1,e:7}],dose:`${(60*bsa).toFixed(0)} mg (60 mg/m²/course)`,route:"IV"},
        {n:"HD-Methotrexate",c:"antimetabolite",bars:[{s:1,e:16}],dose:"3 g/m² over 3h (higher dose C3)",route:"IV"},
        {n:"Cytarabine",c:"antimetabolite",bars:[{s:7,e:16}],dose:"100 mg/m² over 24h days 2–6",route:"IV"},
        {n:"Folinic acid rescue",c:"supportive",bars:[{s:1,e:16}],dose:"15 mg/m² q6h until MTX <0.15 µmol/L",route:"PO/IV"},
      ],
      monitoring:[{w:1,l:"Day 7 response",t:"imaging"},{w:7,l:"MTX level q24h",t:"labs"},{w:15,l:"End-treatment assessment",t:"imaging"}],
    },
    "Wilms-Primary-SR": { totalWeeks:22, phases:[{n:"Preop chemo",s:0,e:4,c:"#e3f2fd"},{n:"Surgery",s:4,e:5,c:"#ffebee"},{n:"Postop (stage-based)",s:5,e:22,c:"#e8f5e9"}],
      drugs:[
        {n:"Vincristine",c:"vinca",bars:[{s:0,e:4},{s:5,e:18}],dose:"1.5 mg/m²/dose (max 2 mg) weekly preop; per protocol postop",route:"IV"},
        {n:"Actinomycin-D",c:"antibiotic",bars:[{s:0,e:4},{s:5,e:18}],dose:"1.5 mg/m² per course (OMIT during RT)",route:"IV"},
        {n:"Doxorubicin (if stage III/HR)",c:"anthracycline",bars:[{s:5,e:18}],dose:`${(50*bsa).toFixed(0)} mg (50 mg/m²) if indicated by stage/histology`,route:"IV"},
      ],
      monitoring:[{w:0,l:"GFR baseline (Schwartz formula)",t:"labs"},{w:4,l:"Surgery — histological risk assignment",t:"surgery"},{w:5,l:"GFR before doxorubicin/carboplatin",t:"labs"}],
    },
    "Wilms-Relapse-AA": { totalWeeks:22, phases:[{n:"CyD ×4 / Carbo/E ×4 (alternating q21d)",s:0,e:22,c:"#fff3e0"}],
      drugs:[
        {n:"Doxorubicin (CyD w1,7,13,19)",c:"anthracycline",bars:[{s:0,e:1},{s:6,e:7},{s:12,e:13},{s:18,e:19}],dose:`${(50*bsa).toFixed(0)} mg (50 mg/m²) over 3h Day 1`,route:"IV"},
        {n:"Cyclophosphamide (CyD)",c:"alkylating",bars:[{s:0,e:1},{s:6,e:7},{s:12,e:13},{s:18,e:19}],dose:`${(1000*bsa).toFixed(0)} mg (500 mg/m² q12h days 1–2 = 2 g/m²/course) + Mesna`,route:"IV"},
        {n:"Etoposide (Carbo/E w4,10,16,22)",c:"topoisomerase",bars:[{s:3,e:4},{s:9,e:10},{s:15,e:16},{s:21,e:22}],dose:`${(150*bsa).toFixed(0)} mg/day (150 mg/m²/day) days 1–3 over 2h`,route:"IV"},
        {n:"Carboplatin (Carbo/E)",c:"platinum",bars:[{s:3,e:4},{s:9,e:10},{s:15,e:16},{s:21,e:22}],dose:`GFR-banded: ~${(200*bsa).toFixed(0)} mg (200 mg/m²) days 1–3 over 2h (HOLD if GFR <30)`,route:"IV"},
      ],
      monitoring:[{w:0,l:"ANC ≥1.0 × 10⁹/L and plt >75 × 10⁹/L before each course",t:"labs"},{w:3,l:"GFR before carboplatin (hold if <30)",t:"labs"}],
    },
    "HR_NBL-COJEC": { totalWeeks:55, phases:[{n:"COJEC (10w)",s:0,e:10,c:"#e3f2fd"},{n:"TVD if needed",s:10,e:14,c:"#ffebee"},{n:"Surgery + BuMel + PBSCR",s:14,e:22,c:"#ffebee"},{n:"Radiotherapy",s:22,e:25,c:"#fff3e0"},{n:"Dinutuximab β + Isotretinoin",s:25,e:48,c:"#e3f2fd"}],
      drugs:[
        {n:"Carboplatin (Course A)",c:"platinum",bars:[{s:0,e:1},{s:4,e:5}],dose:`${(750*bsa).toFixed(0)} mg (750 mg/m²/course) — q10d regardless of counts`,route:"IV"},
        {n:"Etoposide (A+C)",c:"topoisomerase",bars:[{s:0,e:1},{s:2,e:3},{s:4,e:5},{s:6,e:7}],dose:`${(350*bsa).toFixed(0)} mg (350 mg/m²/course, 2 divided doses)`,route:"IV"},
        {n:"Cisplatin (Course B)",c:"platinum",bars:[{s:1,e:2},{s:3,e:4},{s:5,e:6},{s:7,e:8}],dose:`${(80*bsa).toFixed(0)} mg (80 mg/m²) continuous infusion — d10,30,50,70`,route:"IV"},
        {n:"Cyclophosphamide (C)",c:"alkylating",bars:[{s:2,e:3},{s:6,e:7}],dose:`${(2100*bsa).toFixed(0)} mg (2.1 g/m²/course) — d20,60; Mesna`,route:"IV"},
        {n:"Vincristine (A+B+C)",c:"vinca",bars:[{s:0,e:8}],dose:"1.5 mg/m² (max 2 mg) each course",route:"IV"},
        {n:"BuMel (myeloablative)",c:"alkylating",bars:[{s:14,e:17}],dose:"Myeloablative conditioning — seizure prophylaxis; VOD monitoring",route:"IV"},
        {n:"Dinutuximab β (NO IL-2)",c:"immunotherapy",bars:[{s:25,e:26},{s:30,e:31},{s:35,e:36},{s:40,e:41},{s:45,e:46}],dose:"20 mg/m²/day × 8h infusion × 5 courses (IL-2 REMOVED 2018)",route:"IV"},
        {n:"Isotretinoin",c:"other",bars:[{s:25,e:48}],dose:"80 mg/m²/day × 2w per course, 6 courses",route:"PO"},
      ],
      monitoring:[{w:0,l:"G-CSF prophylaxis Day 3 every course",t:"supportive"},{w:10,l:"Metastatic response assessment",t:"imaging"},{w:14,l:"Primary site surgery",t:"surgery"},{w:22,l:"MIBG pre-radiotherapy",t:"imaging"},{w:1,l:"Brock ototoxicity — audiometry each course",t:"audiology"}],
    },
    "LR_NBL-IntermediateRisk": { totalWeeks:18, phases:[{n:"VP/Carbo × 3",s:0,e:9,c:"#e3f2fd"},{n:"CADO × 3",s:9,e:18,c:"#fce4ec"}],
      drugs:[
        {n:"Carboplatin (VP/Carbo)",c:"platinum",bars:[{s:0,e:1},{s:3,e:4},{s:6,e:7}],dose:`${(200*bsa).toFixed(0)} mg (200 mg/m²) over 1h days 1–3 q21d`,route:"IV"},
        {n:"Etoposide (VP/Carbo)",c:"topoisomerase",bars:[{s:0,e:1},{s:3,e:4},{s:6,e:7}],dose:`${(150*bsa).toFixed(0)} mg (150 mg/m²) over 2h days 1–3 q21d`,route:"IV"},
        {n:"Cyclophosphamide (CADO)",c:"alkylating",bars:[{s:9,e:10},{s:12,e:13},{s:15,e:16}],dose:`${(300*bsa).toFixed(0)} mg (300 mg/m²) over 1h days 1–5 q21d`,route:"IV"},
        {n:"Doxorubicin (CADO)",c:"anthracycline",bars:[{s:9,e:10},{s:12,e:13},{s:15,e:16}],dose:`${(30*bsa).toFixed(0)} mg (30 mg/m²) over 1–6h days 4–5 q21d`,route:"IV"},
        {n:"Vincristine (CADO)",c:"vinca",bars:[{s:9,e:10},{s:12,e:13},{s:15,e:16}],dose:"1.5 mg/m² (max 2 mg) bolus days 1 and 5",route:"IV"},
      ],
      monitoring:[{w:0,l:"GFR before carboplatin courses",t:"labs"},{w:9,l:"Response assessment — surgery decision",t:"imaging"}],
    },
    "RMS-LR-A": { totalWeeks:22, phases:[{n:"VA × 4 + Surgery",s:0,e:22,c:"#e8f5e9"}],
      drugs:[
        {n:"Vincristine",c:"vinca",bars:[{s:0,e:9}],dose:"1.5 mg/m² (max 2 mg) weekly induction, q3w maintenance",route:"IV"},
        {n:"Actinomycin-D",c:"antibiotic",bars:[{s:0,e:9}],dose:"1.5 mg/m² per course (OMIT during RT if RT given)",route:"IV"},
      ],
      monitoring:[{w:9,l:"Surgery / response assessment",t:"surgery"}],
    },
    "RMS-SR-CDE": { totalWeeks:30, phases:[{n:"IVA induction",s:0,e:18,c:"#e3f2fd"},{n:"Surgery window",s:9,e:12,c:"#ffebee"},{n:"IVA/VA continuation ± RT",s:18,e:30,c:"#e8f5e9"}],
      drugs:[
        {n:"Vincristine",c:"vinca",bars:[{s:0,e:18}],dose:"1.5 mg/m² (max 2 mg) per cycle",route:"IV"},
        {n:"Actinomycin-D",c:"antibiotic",bars:[{s:0,e:18}],dose:"1.5 mg/m² per course — OMIT during RT",route:"IV"},
        {n:"Ifosfamide",c:"alkylating",bars:[{s:0,e:18}],dose:`${(3000*bsa).toFixed(0)} mg (3 g/m²/day) days 1–2; Mesna mandatory; cumulative cap 36 g/m²`,route:"IV"},
      ],
      monitoring:[{w:9,l:"Response assessment — surgery window",t:"imaging"},{w:18,l:"End-induction response",t:"imaging"}],
    },
    "RMS-HR-FG": { totalWeeks:42, phases:[{n:"IVA × 9",s:0,e:27,c:"#fff3e0"},{n:"Surgery + RT",s:9,e:15,c:"#ffebee"},{n:"Maintenance (VnrblCy)",s:27,e:42,c:"#e8f5e9"}],
      drugs:[
        {n:"Vincristine",c:"vinca",bars:[{s:0,e:27}],dose:"1.5 mg/m² (max 2 mg) per cycle",route:"IV"},
        {n:"Actinomycin-D",c:"antibiotic",bars:[{s:0,e:27}],dose:"1.5 mg/m² per course — OMIT during RT",route:"IV"},
        {n:"Ifosfamide",c:"alkylating",bars:[{s:0,e:27}],dose:`${(3000*bsa).toFixed(0)} mg (3 g/m²/day); Mesna; cumulative cap 36 g/m²`,route:"IV"},
        {n:"Doxorubicin",c:"anthracycline",bars:[{s:0,e:9}],dose:`${(30*bsa).toFixed(0)} mg (doxorubicin confirmed beneficial high-risk RMS, EpSSG 2018)`,route:"IV"},
        {n:"Vinorelbine (maintenance)",c:"vinca",bars:[{s:27,e:42}],dose:"25 mg/m²/week (RMS2005 2023 maintenance)",route:"IV"},
        {n:"Cyclophosphamide (maint.)",c:"alkylating",bars:[{s:27,e:42}],dose:"Low-dose oral cyclophosphamide maintenance",route:"PO"},
      ],
      monitoring:[{w:9,l:"Surgery / local control window",t:"surgery"},{w:27,l:"End-induction restaging",t:"imaging"}],
    },
    "OSTEO-MAP-MAPIE": { totalWeeks:38, phases:[{n:"Preop MAP ×2",s:0,e:10,c:"#e3f2fd"},{n:"Surgery",s:10,e:11,c:"#ffebee"},{n:"MAP ×4 (good resp.)",s:11,e:35,c:"#e8f5e9"},{n:"MAPIE ×4 (poor resp.)",s:11,e:35,c:"#ffebee"}],
      drugs:[
        {n:"Doxorubicin",c:"anthracycline",bars:[{s:0,e:2},{s:5,e:7},{s:11,e:13},{s:16,e:18},{s:21,e:23},{s:26,e:28}],dose:`${(37.5*bsa).toFixed(1)} mg/day (37.5 mg/m²) days 1–2; OMIT after cumulative 375 mg/m²`,route:"IV"},
        {n:"Cisplatin (cycles 1–4 only)",c:"platinum",bars:[{s:0,e:2},{s:5,e:7},{s:11,e:13},{s:16,e:18}],dose:`${(60*bsa).toFixed(0)} mg (60 mg/m²) over 2h days 1–2 (NO cisplatin cycles 5–6)`,route:"IV"},
        {n:"HD-Methotrexate",c:"antimetabolite",bars:[{s:2,e:3},{s:3,e:4},{s:7,e:8},{s:8,e:9},{s:13,e:14},{s:14,e:15},{s:18,e:19},{s:19,e:20}],dose:`${(12000*bsa).toFixed(0)} mg (12 g/m², max 20 g) over 4h; urine alkalinisation required`,route:"IV"},
        {n:"Folinic acid rescue",c:"supportive",bars:[{s:2,e:10},{s:13,e:22}],dose:"15 mg/m² q6h from 24h until MTX <0.1 µmol/L",route:"PO/IV"},
        {n:"Ifosfamide (MAPIE poor resp.)",c:"alkylating",bars:[{s:11,e:13},{s:16,e:18},{s:21,e:23},{s:26,e:28}],dose:`${(2800*bsa).toFixed(0)} mg (2.8 g/m²/day) × 5 days = 14 g/m²/course; Mesna; poor-responder arm`,route:"IV"},
        {n:"Etoposide (MAPIE)",c:"topoisomerase",bars:[{s:11,e:13},{s:16,e:18},{s:21,e:23},{s:26,e:28}],dose:`${(100*bsa).toFixed(0)} mg (100 mg/m²/day) over 1h days 1–5; poor-responder arm`,route:"IV"},
      ],
      monitoring:[{w:0,l:"Echo baseline",t:"echo"},{w:10,l:"SURGERY — histological response: <10% viable = good, ≥10% = poor → MAPIE",t:"surgery"},{w:11,l:"Assign MAP vs MAPIE — GFR + echo",t:"labs"}],
    },
    "EWING-VDC-IE": { totalWeeks:34, phases:[{n:"Induction VDC/IE ×14",s:0,e:28,c:"#e3f2fd"},{n:"Local control",s:12,e:16,c:"#ffebee"},{n:"Consolidation IE/VC",s:28,e:34,c:"#e8f5e9"}],
      drugs:[
        {n:"Vincristine (VDC) FIXED 2mg",c:"vinca",bars:[{s:0,e:2},{s:4,e:6},{s:8,e:10},{s:12,e:14},{s:16,e:18},{s:20,e:22},{s:24,e:26}],dose:"2 mg FIXED DOSE (not per-m²); IV ONLY",route:"IV"},
        {n:"Doxorubicin (VDC)",c:"anthracycline",bars:[{s:0,e:2},{s:4,e:6},{s:8,e:10},{s:12,e:14},{s:16,e:18},{s:20,e:22},{s:24,e:26}],dose:`${(75*bsa).toFixed(0)} mg (75 mg/m²) Day 1; OMIT after 375 mg/m² cumulative`,route:"IV"},
        {n:"Cyclophosphamide (VDC)",c:"alkylating",bars:[{s:0,e:2},{s:4,e:6},{s:8,e:10},{s:12,e:14},{s:16,e:18},{s:20,e:22},{s:24,e:26}],dose:`${(1200*bsa).toFixed(0)} mg (1200 mg/m²) Day 1; Mesna`,route:"IV"},
        {n:"Ifosfamide (IE)",c:"alkylating",bars:[{s:2,e:4},{s:6,e:8},{s:10,e:12},{s:18,e:20},{s:22,e:24},{s:26,e:28}],dose:`${(1800*bsa).toFixed(0)} mg/day (1800 mg/m²) days 1–5; Mesna; cap 36 g/m²`,route:"IV"},
        {n:"Etoposide (IE)",c:"topoisomerase",bars:[{s:2,e:4},{s:6,e:8},{s:10,e:12},{s:18,e:20},{s:22,e:24},{s:26,e:28}],dose:`${(100*bsa).toFixed(0)} mg/day (100 mg/m²) days 1–5`,route:"IV"},
        {n:"Pegfilgrastim",c:"supportive",bars:[{s:0,e:28}],dose:"6 mg SC 24–72h after each cycle",route:"SC"},
      ],
      monitoring:[{w:0,l:"Echo baseline; EWSR1 genetic confirmation",t:"echo"},{w:12,l:"Local control — surgery between 3rd IE and 4th VDC",t:"surgery"},{w:28,l:"End-induction restaging; BuMel decision",t:"imaging"}],
    },
    "MEDULLO-WNT-LR": { totalWeeks:50, phases:[{n:"Surgery",s:0,e:1,c:"#ffebee"},{n:"REDUCED CSI 18 Gy (no VCR)",s:6,e:12,c:"#fff3e0"},{n:"Maintenance ×6 cycles",s:18,e:50,c:"#e8f5e9"}],
      drugs:[
        {n:"CSI 18 Gy (REDUCED — WNT LR)",c:"rt",bars:[{s:6,e:12}],dose:"REDUCED 18 Gy CSI + 54 Gy boost — WNT-favourable <16y ONLY (NO VCR during RT)",route:"RT"},
        {n:"Cisplatin (maint. × 3)",c:"platinum",bars:[{s:18,e:22},{s:24,e:28},{s:30,e:34}],dose:`${(70*bsa).toFixed(0)} mg (70 mg/m²) over 6h Day 1; hyperhydration`,route:"IV"},
        {n:"Lomustine/CCNU (× 3)",c:"alkylating",bars:[{s:18,e:22},{s:24,e:28},{s:30,e:34}],dose:`${(75*bsa).toFixed(0)} mg (75 mg/m²) PO Day 1 — delayed nadir 4–6 weeks`,route:"PO"},
        {n:"Vincristine (maint.)",c:"vinca",bars:[{s:18,e:50}],dose:"1.5 mg/m² (max 2 mg) days 1, 8, 15 each cycle",route:"IV"},
        {n:"Cyclophosphamide (alt. × 3)",c:"alkylating",bars:[{s:20,e:22},{s:26,e:28},{s:32,e:34}],dose:"Per alternating cycle",route:"IV"},
      ],
      monitoring:[{w:0,l:"MRI staging, CSF cytology, β-catenin/WNT/SHH/TP53 subgroup",t:"imaging"},{w:6,l:"Audiogram (hearing <16dB at 1–3kHz AND <40dB at 4–8kHz required)",t:"audiology"},{w:18,l:"Recovery gate before each cycle: ANC/plt/GFR/LFT/audiogram",t:"labs"}],
    },
    "MEDULLO-SR-MEDULLO": { totalWeeks:55, phases:[{n:"Surgery",s:0,e:1,c:"#ffebee"},{n:"CSI 23.4 Gy + VCR",s:6,e:12,c:"#fff3e0"},{n:"Maintenance ×8 cycles",s:18,e:55,c:"#e8f5e9"}],
      drugs:[
        {n:"CSI 23.4 Gy (standard risk)",c:"rt",bars:[{s:6,e:12}],dose:"CSI 23.4 Gy + tumour-bed boost 54 Gy; 1.8 Gy/fraction",route:"RT"},
        {n:"Vincristine (during RT)",c:"vinca",bars:[{s:6,e:12}],dose:"1.5 mg/m² (max 2 mg) weekly during RT (max 8 doses)",route:"IV"},
        {n:"Cisplatin (maint. × 4)",c:"platinum",bars:[{s:18,e:22},{s:24,e:28},{s:30,e:34},{s:36,e:40}],dose:`${(70*bsa).toFixed(0)} mg (70 mg/m²) over 6h Day 1; hyperhydration; Ca/Mg/K`,route:"IV"},
        {n:"Lomustine/CCNU (× 4)",c:"alkylating",bars:[{s:18,e:22},{s:24,e:28},{s:30,e:34},{s:36,e:40}],dose:`${(75*bsa).toFixed(0)} mg (75 mg/m²) PO Day 1`,route:"PO"},
        {n:"Vincristine (maint.)",c:"vinca",bars:[{s:18,e:55}],dose:"1.5 mg/m² (max 2 mg) days 1, 8, 15",route:"IV"},
        {n:"Cyclophosphamide (alt. × 4)",c:"alkylating",bars:[{s:20,e:22},{s:26,e:28},{s:32,e:34},{s:38,e:40}],dose:"Per alternating maintenance cycle",route:"IV"},
      ],
      monitoring:[{w:0,l:"MRI, CSF, molecular subgroup",t:"imaging"},{w:6,l:"Audiogram before RT",t:"audiology"},{w:18,l:"Recovery gate before each cycle: ANC/plt/GFR/LFT/audiogram",t:"labs"}],
    },
    "CNS_GCT-Germ-Local": { totalWeeks:22, phases:[{n:"CarboPEI × 2",s:0,e:8,c:"#e3f2fd"},{n:"Response assessment",s:8,e:9,c:"#fff3e0"},{n:"WVI 24 Gy (±boost if non-CR)",s:9,e:14,c:"#fff3e0"}],
      drugs:[
        {n:"Carboplatin (CarboPEI)",c:"platinum",bars:[{s:0,e:3},{s:4,e:7}],dose:"AUC-based per CarboPEI course (alternating with ifosfamide/etoposide)",route:"IV"},
        {n:"Etoposide",c:"topoisomerase",bars:[{s:0,e:7}],dose:`${(150*bsa).toFixed(0)} mg/day per CarboPEI course days 1–3`,route:"IV"},
        {n:"Ifosfamide",c:"alkylating",bars:[{s:0,e:7}],dose:"Per CarboPEI course; Mesna mandatory",route:"IV"},
        {n:"WVI 24 Gy (CR=no boost)",c:"rt",bars:[{s:9,e:14}],dose:"UPDATED SIOP CNS GCT II 2022: CR after CarboPEI → 24 Gy WVI ALONE (no boost). Non-CR → 24 Gy + 16 Gy boost. 4-yr EFS 97% in CR.",route:"RT"},
      ],
      monitoring:[{w:0,l:"AFP, β-HCG, endocrine, ophthalmological evaluation",t:"labs"},{w:8,l:"Response assessment: CR → WVI alone; non-CR → WVI + boost",t:"imaging"},{w:3,l:"GFR, FBC, biochemistry before each course",t:"labs"}],
    },
    "CNS_GCT-HR-NGGCT": { totalWeeks:28, phases:[{n:"PEI × 2",s:0,e:8,c:"#ffebee"},{n:"HD-PEI + SCT",s:8,e:16,c:"#ffebee"},{n:"RT (if ≥6y)",s:16,e:22,c:"#fff3e0"}],
      drugs:[
        {n:"Cisplatin (PEI)",c:"platinum",bars:[{s:0,e:3},{s:4,e:7}],dose:"PEI cisplatin dose per course; audiometry + GFR monitoring",route:"IV"},
        {n:"Etoposide (PEI)",c:"topoisomerase",bars:[{s:0,e:7}],dose:`${(150*bsa).toFixed(0)} mg/day (150 mg/m²/day) days 1–3`,route:"IV"},
        {n:"Ifosfamide (PEI)",c:"alkylating",bars:[{s:0,e:7}],dose:"Per PEI course; Mesna; cap 36 g/m²",route:"IV"},
        {n:"HD-PEI + SCT",c:"alkylating",bars:[{s:8,e:16}],dose:"High-dose PEI myeloablative + autologous stem cell rescue",route:"IV"},
        {n:"RT (non-met TU 54 Gy / met CSI 30+24 Gy)",c:"rt",bars:[{s:16,e:22}],dose:"Non-metastatic: TU 54 Gy. Metastatic (≥6y): CSI 30 Gy + TU boost 24 Gy",route:"RT"},
      ],
      monitoring:[{w:0,l:"AFP/HCG, endocrine, ophthalmological, fertility discussion",t:"labs"},{w:3,l:"SIOP-Boston ototoxicity + GFR before each course",t:"audiology"},{w:8,l:"Response-adapted treatment assignment",t:"imaging"}],
    },
    "HEPATO-IntR-C": { totalWeeks:20, phases:[{n:"PLADO × 4 preop",s:0,e:12,c:"#e3f2fd"},{n:"Surgery",s:12,e:13,c:"#ffebee"},{n:"PLADO × 2 postop",s:13,e:20,c:"#e8f5e9"}],
      drugs:[
        {n:"Cisplatin (PLADO)",c:"platinum",bars:[{s:0,e:2},{s:3,e:5},{s:6,e:8},{s:9,e:11},{s:13,e:15},{s:17,e:19}],dose:`${(80*bsa).toFixed(0)} mg (80 mg/m²) over 24h Day 1 q21d; Boston ototoxicity scale mandatory`,route:"IV"},
        {n:"Doxorubicin (PLADO)",c:"anthracycline",bars:[{s:0,e:2},{s:3,e:5},{s:6,e:8},{s:9,e:11},{s:13,e:15},{s:17,e:19}],dose:`${(30*bsa).toFixed(0)} mg/day (30 mg/m²/day) days 1–2 = ${(60*bsa).toFixed(0)} mg/course (60 mg/m²); cumulative anthracycline tracking`,route:"IV"},
      ],
      monitoring:[{w:0,l:"AFP (should fall >1 log per cycle), PRETEXT, CHIC risk",t:"labs"},{w:3,l:"AFP trajectory q3 weeks",t:"labs"},{w:12,l:"POSTTEXT re-staging; surgery",t:"surgery"}],
    },
    "LCH-MS-RO": { totalWeeks:52, phases:[{n:"Initial I (6w)",s:0,e:6,c:"#e3f2fd"},{n:"Assess",s:6,e:7,c:"#fff3e0"},{n:"Initial II (if needed)",s:7,e:13,c:"#fce4ec"},{n:"Continuation to month 12",s:13,e:52,c:"#e8f5e9"}],
      drugs:[
        {n:"Prednisolone (Initial I)",c:"steroid",bars:[{s:0,e:6}],dose:"40 mg/m²/day BD days 1–28 then taper",route:"PO"},
        {n:"Vinblastine (Initial I)",c:"vinca",bars:[{s:0,e:6}],dose:"6 mg/m²/week IV × 6 weeks",route:"IV"},
        {n:"Prednisolone (Initial II)",c:"steroid",bars:[{s:7,e:13}],dose:"40 mg/m²/day 3 days/week weeks 7–12",route:"PO"},
        {n:"Vinblastine (Initial II)",c:"vinca",bars:[{s:7,e:13}],dose:"6 mg/m²/week IV weeks 7–12",route:"IV"},
        {n:"Vinblastine (continuation)",c:"vinca",bars:[{s:13,e:52}],dose:"6 mg/m² IV Day 1 q3 weeks to month 12",route:"IV"},
        {n:"Prednisolone (continuation)",c:"steroid",bars:[{s:13,e:52}],dose:"40 mg/m²/day days 1–5 q3 weeks",route:"PO"},
        {n:"6-MP (risk organ, LCH-IV)",c:"antimetabolite",bars:[{s:13,e:52}],dose:"50 mg/m²/day oral daily (risk-organ MS-LCH per LCH-IV)",route:"PO"},
      ],
      monitoring:[{w:0,l:"Risk organ assessment: liver/spleen/BM",t:"imaging"},{w:6,l:"Week 6 response: NAD → continue; partial/stable → Initial II",t:"imaging"},{w:13,l:"Week 12: non-response → off-study → 2nd-line (AraC + cladribine)",t:"imaging"}],
    },
  };

  const key = `${protocolId}-${arm}`;
  return timelines[key] || null;
}

const ARM_TO_TIMELINE_KEY = {
  "ALL-SR": "ALL-SR", "ALL-IR": "ALL-SR", "ALL-HR": "ALL-SR", "ALL-T-ALL": "ALL-SR",
  "BNHL-GroupA": "BNHL-GroupA", "BNHL-GroupB": "BNHL-GroupB",
  "BNHL-GroupB+R": "BNHL-GroupB+R", "BNHL-GroupC1": "BNHL-GroupB+R", "BNHL-GroupC3": "BNHL-GroupB+R",
  "HR_NBL-COJEC": "HR_NBL-COJEC", "HR_NBL-N7": "HR_NBL-COJEC",
  "LR_NBL-IntermediateRisk": "LR_NBL-IntermediateRisk",
  "WILMS-Primary-SR": "Wilms-Primary-SR", "WILMS-Primary-HR": "Wilms-Primary-SR",
  "WILMS-Relapse-AA": "Wilms-Relapse-AA",
  "RMS-LR-A": "RMS-LR-A", "RMS-SR-CDE": "RMS-SR-CDE", "RMS-HR-FG": "RMS-HR-FG", "RMS-VHR-H": "RMS-HR-FG",
  "OSTEO-MAP-MAPIE": "OSTEO-MAP-MAPIE", "OSTEO-MAP-borderline": "OSTEO-MAP-MAPIE",
  "EWING-VDC-IE": "EWING-VDC-IE", "EWING-VDC-IE-mets": "EWING-VDC-IE",
  "MEDULLO-WNT-LR": "MEDULLO-WNT-LR", "MEDULLO-SR-MEDULLO": "MEDULLO-SR-MEDULLO", "MEDULLO-HR-MEDULLO": "MEDULLO-SR-MEDULLO",
  "CNS_GCT-Germ-Local": "CNS_GCT-Germ-Local", "CNS_GCT-Germ-Met": "CNS_GCT-Germ-Local",
  "CNS_GCT-HR-NGGCT": "CNS_GCT-HR-NGGCT", "CNS_GCT-SR-NGGCT": "CNS_GCT-HR-NGGCT",
  "HEPATO-LowR-AB": "HEPATO-IntR-C", "HEPATO-IntR-C": "HEPATO-IntR-C", "HEPATO-HR-D": "HEPATO-IntR-C", "HEPATO-HR-LowAFP": "HEPATO-IntR-C",
  "LCH-MS-RO": "LCH-MS-RO", "LCH-MS-LR": "LCH-MS-RO", "LCH-SS-MFB": "LCH-MS-RO",
};

function getTimelineKey(protocolId, arm) {
  return ARM_TO_TIMELINE_KEY[`${protocolId}-${arm}`] || null;
}

const MONITOR_ICONS = { labs:"🧪", bma:"🔬", imaging:"📷", surgery:"🔪", audiology:"👂", echo:"❤️", supportive:"💊", path:"🔬", genetics:"🧬" };

export default function OncologyPathway({ embedded = false }) {
  const [step, setStep] = useState(0);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedProtocol, setSelectedProtocol] = useState(null);
  const [answers, setAnswers] = useState({});
  const [patientInfo, setPatientInfo] = useState({ name:"", dob:"", mrn:"", weight:"", height:"", bsa:"" });
  const [result, setResult] = useState(null);
  const [timeline, setTimeline] = useState(null);
  const [hoveredDrug, setHoveredDrug] = useState(null);
  const [viewWeeks, setViewWeeks] = useState([0, 30]);
  const printRef = useRef();

  const PROTOCOL_LABELS = {
    ALL:"ALL (ICiCLe ALL-14)", ALCL:"ALCL (COG ANHL0131)", BNHL:"Mature B-NHL (CCLG/FAB-LMB)",
    HR_NBL:"High-Risk Neuroblastoma", LR_NBL:"Low/Int-Risk Neuroblastoma",
    WILMS:"Wilms / Renal (SIOP-RTSG)", RMS:"RMS / STS (EpSSG/CWS)",
    OSTEO:"Osteosarcoma (EURAMOS-1)", EWING:"Ewing Sarcoma (Euro-EWING 2012)",
    MEDULLO:"Medulloblastoma (PNET5)", CNS_GCT:"CNS GCT (ESCP/SIOP)",
    HEPATO:"Hepatoblastoma (SIOPEL/PHITT)", LCH:"LCH (LCH-IV)",
  };

  const handleGroupSelect = (g) => { setSelectedGroup(g); if (g.protocols.length === 1) { setSelectedProtocol(g.protocols[0]); setStep(2); } else { setStep(1); } };
  const handleProtocolSelect = (p) => { setSelectedProtocol(p); setStep(2); };
  const handleAnswerChange = (id, val) => setAnswers(a => ({ ...a, [id]: val }));

  const calcBSA = useCallback((w, h) => {
    if (!w || !h) return "";
    return (Math.sqrt((Number(w) * Number(h)) / 3600)).toFixed(2);
  }, []);

  const handlePatientChange = (k, v) => {
    const updated = { ...patientInfo, [k]: v };
    if (k === "weight" || k === "height") updated.bsa = calcBSA(updated.weight, updated.height);
    setPatientInfo(updated);
  };

  const handleCompute = () => {
    const allAnswers = { ...answers, _bsa: patientInfo.bsa || "1.0" };
    const r = computeRiskAndRegimen(selectedProtocol, allAnswers);
    setResult(r);
    const tk = getTimelineKey(selectedProtocol, r.arm);
    if (tk) {
      const parts = tk.split("-");
      const tl = buildTimeline(parts[0], parts.slice(1).join("-"), allAnswers);
      if (tl) { setTimeline(tl); setViewWeeks([0, Math.min(30, tl.totalWeeks)]); }
      else setTimeline(null);
    } else setTimeline(null);
    setStep(4);
  };

  const questions = selectedProtocol ? STRATIFICATION_QUESTIONS[selectedProtocol] || [] : [];
  const allAnswered = questions.every(q => answers[q.id] !== undefined && answers[q.id] !== "");

  const renderGantt = () => {
    if (!timeline) return (
      <div style={{background:"#f9f9f9",border:"1px dashed #ccc",borderRadius:8,padding:32,textAlign:"center",color:"#666"}}>
        <div style={{fontSize:32}}>📋</div>
        <div style={{marginTop:8}}>No Gantt timeline for this pathway. Review regimen above and consult the full protocol document.</div>
      </div>
    );
    const visW = viewWeeks[1] - viewWeeks[0];
    const TRACK_H = 36, HEADER_H = 52, LABEL_W = 200, TOTAL_W = 860;
    const BAR_W = (TOTAL_W - LABEL_W) / visW;
    const toX = (w) => LABEL_W + (w - viewWeeks[0]) * BAR_W;
    const totalH = HEADER_H + timeline.phases.length * 14 + 8 + timeline.drugs.length * TRACK_H + 48;

    return (
      <div>
        <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:12,flexWrap:"wrap"}}>
          <span style={{fontSize:12,color:"#666",fontFamily:"monospace"}}>View weeks:</span>
          <input type="range" min={0} max={Math.max(0,timeline.totalWeeks-10)} value={viewWeeks[0]}
            onChange={e => { const v=Number(e.target.value); setViewWeeks([v, Math.min(v+30, timeline.totalWeeks)]); }} style={{width:120}} />
          <span style={{fontFamily:"monospace",fontSize:12,background:"#f0f0f0",padding:"2px 6px",borderRadius:4}}>{viewWeeks[0]}–{viewWeeks[1]}w</span>
          <button onClick={()=>setViewWeeks([0,Math.min(30,timeline.totalWeeks)])} style={{fontSize:11,padding:"2px 8px",border:"1px solid #ccc",borderRadius:4,cursor:"pointer",background:"#fff"}}>Reset</button>
          <button onClick={()=>{const e=Math.min(viewWeeks[1]+10,timeline.totalWeeks);const s=Math.max(0,e-30);setViewWeeks([s,e]);}} style={{fontSize:11,padding:"2px 8px",border:"1px solid #ccc",borderRadius:4,cursor:"pointer",background:"#fff"}}>→ Later</button>
          <span style={{marginLeft:"auto",fontSize:11,color:"#888"}}>Total: {timeline.totalWeeks} weeks</span>
        </div>
        <div style={{overflowX:"auto"}}>
          <svg width={TOTAL_W} height={totalH} style={{fontFamily:"'Courier New',monospace",display:"block"}}>
            {timeline.phases.map((ph,i) => {
              const s=Math.max(ph.s,viewWeeks[0]),e=Math.min(ph.e,viewWeeks[1]);
              if(s>=e)return null;
              return <rect key={i} x={toX(s)} y={0} width={(e-s)*BAR_W} height={totalH} fill={ph.c} opacity={0.5}/>;
            })}
            {timeline.phases.map((ph,i) => {
              const s=Math.max(ph.s,viewWeeks[0]),e=Math.min(ph.e,viewWeeks[1]);
              if(s>=e||(e-s)*BAR_W<20)return null;
              return <text key={i} x={toX(s)+(e-s)*BAR_W/2} y={10} textAnchor="middle" fontSize={9} fill="#666" fontWeight="600">{ph.n.substring(0,Math.floor((e-s)*BAR_W/7))}</text>;
            })}
            {Array.from({length:visW+1},(_,i)=>i+viewWeeks[0]).map(w=>(
              <g key={w}>
                <line x1={toX(w)} y1={HEADER_H-12} x2={toX(w)} y2={totalH} stroke="#e0e0e0" strokeWidth={w%4===0?1:0.4}/>
                {w%2===0&&<text x={toX(w)+2} y={HEADER_H-2} fontSize={8} fill="#999">w{w}</text>}
              </g>
            ))}
            {timeline.drugs.map((drug,di) => {
              const y=HEADER_H+di*TRACK_H;
              const col=CLASS_COLORS[drug.c]||CLASS_COLORS.other;
              const isHov=hoveredDrug===di;
              return (
                <g key={di}>
                  <rect x={0} y={y} width={TOTAL_W} height={TRACK_H} fill={isHov?"#f5f5f5":(di%2===0?"#fff":"#fafafa")}/>
                  <rect x={0} y={y} width={LABEL_W-4} height={TRACK_H} fill={isHov?"#eee":"#f8f8f8"}/>
                  <text x={8} y={y+22} fontSize={10} fill="#333" fontWeight={isHov?"700":"500"} style={{cursor:"pointer"}} onMouseEnter={()=>setHoveredDrug(di)} onMouseLeave={()=>setHoveredDrug(null)}>{drug.n.length>28?drug.n.substring(0,26)+"…":drug.n}</text>
                  <text x={8} y={y+32} fontSize={8} fill={col.text}>{drug.route}</text>
                  <line x1={0} y1={y+TRACK_H} x2={TOTAL_W} y2={y+TRACK_H} stroke="#ebebeb" strokeWidth={1}/>
                  {drug.bars.map((bar,bi)=>{
                    const s=Math.max(bar.s,viewWeeks[0]),e=Math.min(bar.e,viewWeeks[1]);
                    if(s>=e)return null;
                    const bw=(e-s)*BAR_W;
                    return(
                      <g key={bi} style={{cursor:"pointer"}} onMouseEnter={()=>setHoveredDrug(di)} onMouseLeave={()=>setHoveredDrug(null)}>
                        <rect x={toX(s)+1} y={y+6} width={Math.max(2,bw-2)} height={TRACK_H-14} rx={3} fill={col.bg} opacity={isHov?1:0.85}/>
                        {bw>30&&<text x={toX(s)+bw/2} y={y+TRACK_H/2+2} textAnchor="middle" fontSize={8} fill="#fff" fontWeight="700">{drug.n.split(" ")[0].substring(0,6)}</text>}
                      </g>
                    );
                  })}
                </g>
              );
            })}
            {timeline.monitoring.map((m,mi)=>{
              if(m.w<viewWeeks[0]||m.w>viewWeeks[1])return null;
              const x=toX(m.w);
              return(
                <g key={mi}>
                  <line x1={x} y1={HEADER_H} x2={x} y2={totalH-40} stroke="#e74c3c" strokeWidth={1.5} strokeDasharray="4,3" opacity={0.6}/>
                  <text x={x} y={totalH-28} fontSize={11} textAnchor="middle">{MONITOR_ICONS[m.t]||"📌"}</text>
                  <text x={x} y={totalH-16} fontSize={7.5} fill="#c0392b" textAnchor="middle">w{m.w}</text>
                  <title>{m.l}</title>
                </g>
              );
            })}
            {viewWeeks[0]===0&&<g><line x1={toX(0)} y1={HEADER_H} x2={toX(0)} y2={totalH} stroke="#2ecc71" strokeWidth={2}/><text x={toX(0)+4} y={HEADER_H+12} fontSize={9} fill="#27ae60" fontWeight="700">▶ START</text></g>}
            <line x1={LABEL_W} y1={0} x2={LABEL_W} y2={totalH} stroke="#ccc" strokeWidth={1}/>
          </svg>
        </div>
        {hoveredDrug!==null&&timeline.drugs[hoveredDrug]&&(
          <div style={{marginTop:8,background:"#1a1a2e",color:"#eee",borderRadius:8,padding:"10px 16px",fontSize:13,lineHeight:1.6}}>
            <strong style={{color:"#58d68d",fontSize:14}}>{timeline.drugs[hoveredDrug].n}</strong>
            <span style={{marginLeft:12,fontSize:11,background:CLASS_COLORS[timeline.drugs[hoveredDrug].c]?.bg||"#555",color:"#fff",padding:"1px 6px",borderRadius:10}}>{timeline.drugs[hoveredDrug].c}</span>
            <div style={{marginTop:4}}><span style={{color:"#aaa"}}>Dose: </span>{timeline.drugs[hoveredDrug].dose}</div>
            <div><span style={{color:"#aaa"}}>Route: </span>{timeline.drugs[hoveredDrug].route}</div>
          </div>
        )}
        <div style={{marginTop:10,display:"flex",gap:12,flexWrap:"wrap"}}>
          {timeline.monitoring.map((m,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:4,fontSize:11,color:"#666"}}>
              <span>{MONITOR_ICONS[m.t]||"📌"}</span><span><strong style={{color:"#c0392b"}}>w{m.w}</strong> {m.l}</span>
            </div>
          ))}
        </div>
        <div style={{marginTop:10,display:"flex",gap:8,flexWrap:"wrap",paddingTop:8,borderTop:"1px solid #eee"}}>
          {Object.entries(CLASS_COLORS).filter(([k])=>timeline.drugs.some(d=>d.c===k)).map(([k,v])=>(
            <span key={k} style={{fontSize:10,background:v.bg,color:"#fff",padding:"2px 8px",borderRadius:10,fontWeight:600}}>{k}</span>
          ))}
        </div>
      </div>
    );
  };

  const STEP_LABELS = ["Condition","Protocol","Patient","Stratification","Pathway"];

  return (
    <div style={{minHeight: embedded ? undefined : "100vh",background:"#f4f6f9",fontFamily:"system-ui,sans-serif"}}>
      {!embedded && <div style={{background:"#1a1a2e",color:"#fff",padding:"16px 24px",display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
        <div style={{fontSize:18,fontWeight:700}}>🧬 Oncology Pathway Engine</div>
        <div style={{width:1,height:20,background:"#444"}}/>
        <div style={{fontSize:13,color:"#a8b2c1"}}>Pediatric Oncology — Intelligent Treatment Pathway Engine</div>
        <div style={{marginLeft:"auto",fontSize:11,color:"#aaa",background:"#111",padding:"2px 10px",borderRadius:10}}>⚠ Decision-support only — verify all doses against institutional protocol</div>
      </div>}
      <div style={{background:"#fff",borderBottom:"1px solid #e0e0e0",padding:"0 24px",display:"flex",gap:0,overflowX:"auto"}}>
        {STEP_LABELS.map((l,i)=>(
          <div key={i} onClick={()=>{if(i<step)setStep(i);}} style={{padding:"12px 20px",fontSize:12,fontWeight:600,color:i===step?"#1a1a2e":"#999",borderBottom:i===step?"3px solid #1a1a2e":"3px solid transparent",cursor:i<step?"pointer":"default",transition:"all 0.2s",whiteSpace:"nowrap"}}>
            <span style={{background:i===step?"#1a1a2e":i<step?"#27ae60":"#ddd",color:"#fff",borderRadius:"50%",width:18,height:18,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:10,marginRight:6}}>{i<step?"✓":i+1}</span>
            {l}
          </div>
        ))}
      </div>
      <div style={{maxWidth:1100,margin:"0 auto",padding:"24px 16px"}}>
        {step===0&&(
          <div>
            <h2 style={{fontSize:20,fontWeight:700,marginBottom:6,color:"#1a1a2e"}}>Select Tumour Group</h2>
            <p style={{color:"#666",fontSize:13,marginBottom:20}}>14 protocols across 9 tumour groups.</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:12}}>
              {TUMOR_GROUPS.map(g=>(
                <button key={g.id} onClick={()=>handleGroupSelect(g)} style={{background:"#fff",border:"2px solid #e0e0e0",borderRadius:12,padding:"20px 16px",cursor:"pointer",textAlign:"left",transition:"all 0.15s",display:"flex",flexDirection:"column",gap:6}}>
                  <span style={{fontSize:28}}>{g.icon}</span>
                  <span style={{fontSize:13,fontWeight:700,color:"#1a1a2e"}}>{g.label}</span>
                  <span style={{fontSize:10,color:"#888"}}>{g.protocols.length} protocol{g.protocols.length>1?"s":""}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        {step===1&&selectedGroup&&(
          <div>
            <button onClick={()=>setStep(0)} style={{fontSize:12,color:"#666",background:"none",border:"none",cursor:"pointer",marginBottom:16}}>← Back</button>
            <h2 style={{fontSize:20,fontWeight:700,marginBottom:20,color:"#1a1a2e"}}>{selectedGroup.icon} {selectedGroup.label} — Select Protocol</h2>
            <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
              {selectedGroup.protocols.map(p=>(
                <button key={p} onClick={()=>handleProtocolSelect(p)} style={{background:"#fff",border:"2px solid #e0e0e0",borderRadius:12,padding:"18px 24px",cursor:"pointer",fontSize:14,fontWeight:600,color:"#1a1a2e"}}>{PROTOCOL_LABELS[p]||p}</button>
              ))}
            </div>
          </div>
        )}
        {step===2&&(
          <div>
            <button onClick={()=>setStep(selectedGroup?.protocols.length>1?1:0)} style={{fontSize:12,color:"#666",background:"none",border:"none",cursor:"pointer",marginBottom:16}}>← Back</button>
            <h2 style={{fontSize:20,fontWeight:700,marginBottom:6,color:"#1a1a2e"}}>Patient Details</h2>
            <p style={{color:"#666",fontSize:13,marginBottom:20}}>Used for BSA-based dose calculations on the timeline.</p>
            <div style={{background:"#fff",borderRadius:12,padding:24,border:"1px solid #e0e0e0",display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:16,maxWidth:700}}>
              {[["name","Patient Name / ID","text"],["dob","Date of Birth","date"],["mrn","MRN","text"],["weight","Weight (kg)","number"],["height","Height (cm)","number"]].map(([k,l,t])=>(
                <div key={k}>
                  <label style={{fontSize:11,fontWeight:600,color:"#666",display:"block",marginBottom:4}}>{l}</label>
                  <input type={t} value={patientInfo[k]} onChange={e=>handlePatientChange(k,e.target.value)} style={{width:"100%",padding:"8px 10px",border:"1px solid #ddd",borderRadius:6,fontSize:13,boxSizing:"border-box"}}/>
                </div>
              ))}
              <div>
                <label style={{fontSize:11,fontWeight:600,color:"#666",display:"block",marginBottom:4}}>BSA (m²) — auto-calculated</label>
                <input readOnly value={patientInfo.bsa||"—"} style={{width:"100%",padding:"8px 10px",border:"1px solid #ddd",borderRadius:6,fontSize:13,background:"#f9f9f9",boxSizing:"border-box"}}/>
              </div>
            </div>
            <div style={{marginTop:16,padding:12,background:"#fff8e1",borderRadius:8,fontSize:12,color:"#7d6400",border:"1px solid #f1c40f",maxWidth:700}}>
              ⚠ BSA is used for indicative dose calculations only. All doses must be independently verified by a pharmacist and prescriber against the active institutional protocol before administration.
            </div>
            <button onClick={()=>setStep(3)} style={{marginTop:20,background:"#1a1a2e",color:"#fff",border:"none",borderRadius:8,padding:"12px 28px",fontSize:14,fontWeight:600,cursor:"pointer"}}>Continue to Risk Stratification →</button>
          </div>
        )}
        {step===3&&selectedProtocol&&(
          <div>
            <button onClick={()=>setStep(2)} style={{fontSize:12,color:"#666",background:"none",border:"none",cursor:"pointer",marginBottom:16}}>← Back</button>
            <h2 style={{fontSize:20,fontWeight:700,marginBottom:4,color:"#1a1a2e"}}>Risk Stratification</h2>
            <p style={{color:"#666",fontSize:13,marginBottom:20}}>{PROTOCOL_LABELS[selectedProtocol]} — answer all questions to compute the protocol arm and treatment pathway.</p>
            <div style={{background:"#fff",borderRadius:12,padding:24,border:"1px solid #e0e0e0",maxWidth:620,display:"flex",flexDirection:"column",gap:18}}>
              {questions.map(q=>(
                <div key={q.id}>
                  <label style={{fontSize:13,fontWeight:600,color:"#1a1a2e",display:"block",marginBottom:4}}>
                    {q.label}{q.hint&&<span style={{fontSize:11,color:"#888",fontWeight:400,marginLeft:6}}>({q.hint})</span>}
                  </label>
                  {q.type==="select"?(
                    <select value={answers[q.id]||""} onChange={e=>handleAnswerChange(q.id,e.target.value)} style={{width:"100%",padding:"9px 10px",border:"1px solid #ddd",borderRadius:6,fontSize:13,background:"#fff"}}>
                      <option value="">— select —</option>
                      {q.options.map(o=><option key={o} value={o}>{o}</option>)}
                    </select>
                  ):(
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <input type="number" value={answers[q.id]||""} onChange={e=>handleAnswerChange(q.id,e.target.value)} style={{width:120,padding:"9px 10px",border:"1px solid #ddd",borderRadius:6,fontSize:13}}/>
                      {q.unit&&<span style={{fontSize:12,color:"#888"}}>{q.unit}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button onClick={handleCompute} disabled={!allAnswered} style={{marginTop:20,background:allAnswered?"#1a1a2e":"#bbb",color:"#fff",border:"none",borderRadius:8,padding:"12px 28px",fontSize:14,fontWeight:600,cursor:allAnswered?"pointer":"not-allowed"}}>Compute Pathway & Generate Timeline →</button>
          </div>
        )}
        {step===4&&result&&(
          <div ref={printRef}>
            <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:20,flexWrap:"wrap"}}>
              <button onClick={()=>setStep(3)} style={{fontSize:12,color:"#666",background:"none",border:"none",cursor:"pointer"}}>← Edit stratification</button>
              <button onClick={()=>window.print()} style={{marginLeft:"auto",fontSize:12,background:"#fff",border:"1px solid #ccc",borderRadius:6,padding:"6px 14px",cursor:"pointer"}}>🖨 Print / Export</button>
            </div>
            <div style={{background:"#fff",borderRadius:12,border:`3px solid ${result.color}`,padding:20,marginBottom:20}}>
              <div style={{display:"flex",gap:16,alignItems:"flex-start",flexWrap:"wrap"}}>
                <div style={{flex:1,minWidth:280}}>
                  <div style={{fontSize:11,color:"#888",fontWeight:600,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Computed Risk Group</div>
                  <div style={{fontSize:20,fontWeight:800,color:result.color}}>{result.risk}</div>
                  <div style={{fontSize:13,color:"#444",marginTop:8,lineHeight:1.5}}><strong>Protocol:</strong> {result.protocol}</div>
                  <div style={{fontSize:13,color:"#444",marginTop:4,lineHeight:1.6}}><strong>Regimen:</strong> {result.regimen}</div>
                </div>
                {patientInfo.name&&(
                  <div style={{background:"#f9f9f9",borderRadius:8,padding:"12px 16px",fontSize:12,color:"#555",minWidth:200}}>
                    <div style={{fontWeight:700,color:"#1a1a2e",marginBottom:6}}>{patientInfo.name}</div>
                    {patientInfo.mrn&&<div>MRN: {patientInfo.mrn}</div>}
                    {patientInfo.dob&&<div>DOB: {patientInfo.dob}</div>}
                    {patientInfo.weight&&<div>Weight: {patientInfo.weight} kg</div>}
                    {patientInfo.height&&<div>Height: {patientInfo.height} cm</div>}
                    {patientInfo.bsa&&<div style={{fontWeight:700,marginTop:4}}>BSA: {patientInfo.bsa} m²</div>}
                  </div>
                )}
              </div>
              <div style={{marginTop:12,padding:10,background:"#fff3cd",borderRadius:6,fontSize:11,color:"#856404",border:"1px solid #ffc107"}}>
                <strong>⚠ Clinical decision-support only.</strong> This pathway is generated based on protocol reference data. All drug doses, schedules, and monitoring requirements must be independently verified by a clinician and pharmacist against the active institutional protocol before any treatment decision is made.
              </div>
            </div>
            <div style={{background:"#fff",borderRadius:12,border:"1px solid #e0e0e0",padding:20}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
                <div style={{fontSize:16,fontWeight:700,color:"#1a1a2e"}}>Treatment Timeline</div>
                {timeline&&<div style={{fontSize:11,background:"#1a1a2e",color:"#fff",padding:"2px 10px",borderRadius:10}}>{timeline.totalWeeks} weeks total</div>}
              </div>
              {renderGantt()}
            </div>
            <button onClick={()=>{setStep(0);setSelectedGroup(null);setSelectedProtocol(null);setAnswers({});setResult(null);setTimeline(null);setPatientInfo({name:"",dob:"",mrn:"",weight:"",height:"",bsa:""}); }} style={{marginTop:20,background:"#fff",border:"2px solid #1a1a2e",color:"#1a1a2e",borderRadius:8,padding:"10px 24px",fontSize:13,fontWeight:600,cursor:"pointer"}}>← New Patient Pathway</button>
          </div>
        )}
      </div>
    </div>
  );
}