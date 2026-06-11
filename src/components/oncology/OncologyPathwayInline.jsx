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
      if (cnsTx || stage === "IV" || (stage === "III" && highLDH)) {
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

const MONITOR_ICONS = { labs:"🧪", bma:"🔬", imaging:"📷", surgery:"🔪", audiology:"👂", echo:"❤️", supportive:"💊", path:"🔬", genetics:"🧬" };

const PROTOCOL_LABELS = {
  ALL:"ALL (ICiCLe ALL-14)", ALCL:"ALCL (COG ANHL0131)", BNHL:"Mature B-NHL (CCLG/FAB-LMB)",
  HR_NBL:"High-Risk Neuroblastoma", LR_NBL:"Low/Int-Risk Neuroblastoma",
  WILMS:"Wilms / Renal (SIOP-RTSG)", RMS:"RMS / STS (EpSSG/CWS)",
  OSTEO:"Osteosarcoma (EURAMOS-1)", EWING:"Ewing Sarcoma (Euro-EWING 2012)",
  MEDULLO:"Medulloblastoma (PNET5)", CNS_GCT:"CNS GCT (ESCP/SIOP)",
  HEPATO:"Hepatoblastoma (SIOPEL/PHITT)", LCH:"LCH (LCH-IV)",
};

const STEP_LABELS = ["Condition","Protocol","Patient","Stratification","Pathway"];

export default function OncologyPathwayInline() {
  const [step, setStep] = useState(0);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedProtocol, setSelectedProtocol] = useState(null);
  const [answers, setAnswers] = useState({});
  const [patientInfo, setPatientInfo] = useState({ weight:"", height:"", bsa:"" });
  const [result, setResult] = useState(null);
  const [hoveredDrug, setHoveredDrug] = useState(null);
  const [viewWeeks, setViewWeeks] = useState([0, 30]);
  const [timeline, setTimeline] = useState(null);

  const calcBSA = useCallback((w, h) => {
    if (!w || !h) return "";
    return (Math.sqrt((Number(w) * Number(h)) / 3600)).toFixed(2);
  }, []);

  const handlePatientChange = (k, v) => {
    const updated = { ...patientInfo, [k]: v };
    if (k === "weight" || k === "height") updated.bsa = calcBSA(updated.weight, updated.height);
    setPatientInfo(updated);
  };

  const handleGroupSelect = (g) => {
    setSelectedGroup(g);
    if (g.protocols.length === 1) { setSelectedProtocol(g.protocols[0]); setStep(2); }
    else { setStep(1); }
  };

  const handleCompute = () => {
    const allAnswers = { ...answers, _bsa: patientInfo.bsa || "1.0" };
    const r = computeRiskAndRegimen(selectedProtocol, allAnswers);
    setResult(r);
    setStep(4);
    // Simple timeline placeholder — link to full page for Gantt
    setTimeline(null);
  };

  const questions = selectedProtocol ? STRATIFICATION_QUESTIONS[selectedProtocol] || [] : [];
  const allAnswered = questions.every(q => answers[q.id] !== undefined && answers[q.id] !== "");

  const s = { fontFamily: "system-ui,sans-serif" };

  return (
    <div style={{ ...s, background: "#f4f6f9", borderRadius: 12, padding: 16, minHeight: 400 }}>
      {/* Step indicator */}
      <div style={{ background: "#fff", borderRadius: 10, marginBottom: 16, display: "flex", gap: 0, overflowX: "auto", border: "1px solid #e0e0e0" }}>
        {STEP_LABELS.map((l, i) => (
          <div key={i} onClick={() => { if (i < step) setStep(i); }}
            style={{ padding: "10px 16px", fontSize: 11, fontWeight: 600, color: i === step ? "#1a1a2e" : "#999", borderBottom: i === step ? "3px solid #1a1a2e" : "3px solid transparent", cursor: i < step ? "pointer" : "default", whiteSpace: "nowrap" }}>
            <span style={{ background: i === step ? "#1a1a2e" : i < step ? "#27ae60" : "#ddd", color: "#fff", borderRadius: "50%", width: 16, height: 16, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 9, marginRight: 5 }}>{i < step ? "✓" : i + 1}</span>
            {l}
          </div>
        ))}
      </div>

      {/* Disclaimer banner */}
      <div style={{ marginBottom: 12, padding: "8px 12px", background: "#fff8e1", borderRadius: 8, fontSize: 11, color: "#856404", border: "1px solid #f1c40f" }}>
        🧬 <strong>Oncology Pathway Engine</strong> — Decision-support only. Verify all doses against institutional protocol before prescribing.
      </div>

      {/* Step 0: Tumour Group */}
      {step === 0 && (
        <div>
          <p style={{ fontSize: 13, color: "#555", marginBottom: 12 }}>Select tumour group to begin pathway computation (14 protocols, 9 tumour groups):</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 10 }}>
            {TUMOR_GROUPS.map(g => (
              <button key={g.id} onClick={() => handleGroupSelect(g)}
                style={{ background: "#fff", border: "2px solid #e0e0e0", borderRadius: 10, padding: "16px 12px", cursor: "pointer", textAlign: "left", display: "flex", flexDirection: "column", gap: 5, transition: "all 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#1a1a2e"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#e0e0e0"}>
                <span style={{ fontSize: 24 }}>{g.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#1a1a2e" }}>{g.label}</span>
                <span style={{ fontSize: 10, color: "#888" }}>{g.protocols.length} protocol{g.protocols.length > 1 ? "s" : ""}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 1: Protocol */}
      {step === 1 && selectedGroup && (
        <div>
          <button onClick={() => setStep(0)} style={{ fontSize: 12, color: "#666", background: "none", border: "none", cursor: "pointer", marginBottom: 12 }}>← Back</button>
          <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: "#1a1a2e" }}>{selectedGroup.icon} {selectedGroup.label} — Select Protocol</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {selectedGroup.protocols.map(p => (
              <button key={p} onClick={() => { setSelectedProtocol(p); setStep(2); }}
                style={{ background: "#fff", border: "2px solid #e0e0e0", borderRadius: 10, padding: "14px 20px", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#1a1a2e" }}>
                {PROTOCOL_LABELS[p] || p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Clinical Parameters (no patient identifiers) */}
      {step === 2 && (
        <div>
          <button onClick={() => setStep(selectedGroup?.protocols.length > 1 ? 1 : 0)} style={{ fontSize: 12, color: "#666", background: "none", border: "none", cursor: "pointer", marginBottom: 12 }}>← Back</button>
          <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, color: "#1a1a2e" }}>Clinical Parameters</p>
          <p style={{ fontSize: 12, color: "#666", marginBottom: 14 }}>Weight and height are used for BSA-based dose calculations. No patient identifiers required.</p>
          <div style={{ background: "#fff", borderRadius: 10, padding: 20, border: "1px solid #e0e0e0", display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 14, maxWidth: 500 }}>
            {[["weight","Weight (kg)","number"],["height","Height (cm)","number"]].map(([k,l,t]) => (
              <div key={k}>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#666", display: "block", marginBottom: 4 }}>{l}</label>
                <input type={t} value={patientInfo[k]} onChange={e => handlePatientChange(k, e.target.value)}
                  style={{ width: "100%", padding: "7px 10px", border: "1px solid #ddd", borderRadius: 6, fontSize: 13, boxSizing: "border-box" }} />
              </div>
            ))}
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#666", display: "block", marginBottom: 4 }}>BSA (m²) — auto-calculated</label>
              <input readOnly value={patientInfo.bsa || "—"} style={{ width: "100%", padding: "7px 10px", border: "1px solid #ddd", borderRadius: 6, fontSize: 13, background: "#f9f9f9", boxSizing: "border-box" }} />
            </div>
          </div>
          <button onClick={() => setStep(3)} style={{ marginTop: 16, background: "#1a1a2e", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Continue to Risk Stratification →</button>
        </div>
      )}

      {/* Step 3: Stratification */}
      {step === 3 && selectedProtocol && (
        <div>
          <button onClick={() => setStep(2)} style={{ fontSize: 12, color: "#666", background: "none", border: "none", cursor: "pointer", marginBottom: 12 }}>← Back</button>
          <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, color: "#1a1a2e" }}>Risk Stratification</p>
          <p style={{ fontSize: 12, color: "#666", marginBottom: 14 }}>{PROTOCOL_LABELS[selectedProtocol]}</p>
          <div style={{ background: "#fff", borderRadius: 10, padding: 20, border: "1px solid #e0e0e0", maxWidth: 600, display: "flex", flexDirection: "column", gap: 16 }}>
            {questions.map(q => (
              <div key={q.id}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#1a1a2e", display: "block", marginBottom: 4 }}>
                  {q.label}{q.hint && <span style={{ fontSize: 11, color: "#888", fontWeight: 400, marginLeft: 6 }}>({q.hint})</span>}
                </label>
                {q.type === "select" ? (
                  <select value={answers[q.id] || ""} onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
                    style={{ width: "100%", padding: "8px 10px", border: "1px solid #ddd", borderRadius: 6, fontSize: 13, background: "#fff" }}>
                    <option value="">— select —</option>
                    {q.options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input type="number" value={answers[q.id] || ""} onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
                      style={{ width: 120, padding: "8px 10px", border: "1px solid #ddd", borderRadius: 6, fontSize: 13 }} />
                    {q.unit && <span style={{ fontSize: 12, color: "#888" }}>{q.unit}</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
          <button onClick={handleCompute} disabled={!allAnswered}
            style={{ marginTop: 16, background: allAnswered ? "#1a1a2e" : "#bbb", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 13, fontWeight: 600, cursor: allAnswered ? "pointer" : "not-allowed" }}>
            Compute Pathway →
          </button>
        </div>
      )}

      {/* Step 4: Result */}
      {step === 4 && result && (
        <div>
          <button onClick={() => setStep(3)} style={{ fontSize: 12, color: "#666", background: "none", border: "none", cursor: "pointer", marginBottom: 12 }}>← Edit stratification</button>
          <div style={{ background: "#fff", borderRadius: 12, border: `3px solid ${result.color}`, padding: 20, marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 260 }}>
                <div style={{ fontSize: 10, color: "#888", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Computed Risk Group</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: result.color }}>{result.risk}</div>
                <div style={{ fontSize: 13, color: "#444", marginTop: 8 }}><strong>Protocol:</strong> {result.protocol}</div>
                <div style={{ fontSize: 13, color: "#444", marginTop: 4, lineHeight: 1.5 }}><strong>Regimen:</strong> {result.regimen}</div>
              </div>
              {(patientInfo.weight || patientInfo.bsa) && (
                <div style={{ background: "#f9f9f9", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#555", minWidth: 140 }}>
                  {patientInfo.weight && <div>Weight: {patientInfo.weight} kg</div>}
                  {patientInfo.height && <div>Height: {patientInfo.height} cm</div>}
                  {patientInfo.bsa && <div style={{ fontWeight: 700, marginTop: 4 }}>BSA: {patientInfo.bsa} m²</div>}
                </div>
              )}
            </div>
            <div style={{ marginTop: 12, padding: "8px 12px", background: "#fff3cd", borderRadius: 6, fontSize: 11, color: "#856404", border: "1px solid #ffc107" }}>
              ⚠ Clinical decision-support only. All drug doses must be independently verified by a clinician and pharmacist against the active institutional protocol.
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a href="/OncologyPathway" target="_blank" rel="noopener noreferrer"
              style={{ background: "#1a1a2e", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", textDecoration: "none", display: "inline-block" }}>
              🧬 Open Full Gantt Timeline →
            </a>
            <button onClick={() => { setStep(0); setSelectedGroup(null); setSelectedProtocol(null); setAnswers({}); setResult(null); setPatientInfo({ weight:"",height:"",bsa:"" }); }}
              style={{ background: "#fff", border: "2px solid #1a1a2e", color: "#1a1a2e", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              ← New Patient Pathway
            </button>
          </div>
        </div>
      )}
    </div>
  );
}