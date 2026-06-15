/**
 * APP ROUTE REGISTRY
 * Every navigable destination in the app with a validated path.
 * AI-generated "Find More In App" links MUST match an entry here.
 * If no match is found, the button is hidden.
 */

export const APP_ROUTE_REGISTRY = [
  // ── Core Pages ──────────────────────────────────────────────────
  { label: "Drug Dosing & Formulary",       page: "DrugsDosing",          params: "" },
  { label: "Drug Database",                  page: "DrugsDosing",          params: "" },
  { label: "Formulary",                      page: "DrugsDosing",          params: "" },
  { label: "AI Prescriber",                  page: "AIPrescriber",         params: "" },
  { label: "Guidelines Library",             page: "GuidelinesLibrary",    params: "" },
  { label: "Nephrology Guidelines",          page: "GuidelinesLibrary",    params: "" },
  { label: "KDIGO Guidelines",               page: "GuidelinesLibrary",    params: "?search=KDIGO" },
  { label: "Emergency Hub",                  page: "EmergencyHub",         params: "" },
  { label: "Calculators Hub",                page: "CalculatorsHub",       params: "" },
  { label: "Clinical AI Hub",                page: "ClinicalAIHub",        params: "" },
  { label: "Teaching Hub",                   page: "TeachingHub",          params: "" },
  { label: "Case Library",                   page: "CaseLibrary",          params: "" },
  { label: "Nutrition Hub",                  page: "NutritionHub",         params: "" },
  { label: "Research Hub",                   page: "ResearchHub",          params: "" },
  { label: "General Pediatrics Hub",         page: "GeneralPediatricsHub", params: "" },
  { label: "Rare Disease Module",            page: "RareDiseaseModule",    params: "" },
  { label: "Pediatric Rheumatology",         page: "PediatricRheumatology",params: "" },
  { label: "Pediatric Endocrinology",        page: "PediatricEndocrinology",params: "" },
  { label: "Urology & Nephrology Hub",       page: "UrologyNephrologyHub", params: "" },
  { label: "Tubular Disorders Hub",          page: "TubularDisordersHub",  params: "" },
  { label: "Differential Diagnosis Engine",  page: "DifferentialEngine",   params: "" },
  { label: "Admission Orders",               page: "AdmissionOrders",      params: "" },
  { label: "Discharge Summary",              page: "DischargeSummary",     params: "" },
  { label: "Daily Summary",                  page: "DailySummary",         params: "" },
  { label: "Genetic Report Analyzer",        page: "GeneticReportAnalyzer",params: "" },
  { label: "Monitoring Dashboard",           page: "MonitoringTasksDashboard", params: "" },

  // ── Clinical Support / Engines ──────────────────────────────────
  { label: "Clinical Pathways",              page: "ClinicalSupport",      params: "?tab=pathways" },
  { label: "All Intelligence Engines",       page: "ClinicalSupport",      params: "?tab=engines" },
  { label: "Nephrotic Syndrome Engine",      page: "ClinicalSupport",      params: "?tab=pathways&scenario=ns-engine" },
  { label: "AKI Engine",                     page: "ClinicalSupport",      params: "?tab=pathways&scenario=aki-engine" },
  { label: "CKD Engine",                     page: "ClinicalSupport",      params: "?tab=pathways&scenario=ckd-engine" },
  { label: "Hyperkalemia Engine",            page: "ClinicalSupport",      params: "?tab=pathways&scenario=hyperkalemia-deep-engine" },
  { label: "Hyponatremia Engine",            page: "ClinicalSupport",      params: "?tab=pathways&scenario=hyponatremia-engine" },
  { label: "Hypertension Engine",            page: "ClinicalSupport",      params: "?tab=pathways&scenario=htn-engine" },
  { label: "RPGN Engine",                    page: "ClinicalSupport",      params: "?tab=pathways&scenario=rpgn-deep-engine" },
  { label: "HUS / aHUS / TMA Engine",        page: "ClinicalSupport",      params: "?tab=pathways&scenario=hus-engine" },
  { label: "RRT / Dialysis Engine",          page: "ClinicalSupport",      params: "?tab=pathways&scenario=rrt-engine" },
  { label: "Renal Biopsy Engine",            page: "ClinicalSupport",      params: "?tab=pathways&scenario=renal-biopsy-engine" },
  { label: "Tubular Disorders Engine",       page: "ClinicalSupport",      params: "?tab=pathways&scenario=tubular-engine" },
  { label: "Rheumatology Engine",            page: "ClinicalSupport",      params: "?tab=pathways&scenario=rheumatology-engine" },
  { label: "Fabry Disease Engine",           page: "ClinicalSupport",      params: "?tab=pathways&scenario=fabry-engine" },
  { label: "Cystinosis Engine",              page: "ClinicalSupport",      params: "?tab=pathways&scenario=cystinosis-engine" },
  { label: "Primary Hyperoxaluria Engine",   page: "ClinicalSupport",      params: "?tab=pathways&scenario=hyperoxaluria-engine" },
  { label: "Kidney Stone Engine",            page: "ClinicalSupport",      params: "?tab=pathways&scenario=stone-engine" },
  { label: "Electrolytes Engine",            page: "ClinicalSupport",      params: "?tab=pathways&scenario=electrolytes-hub" },
  { label: "Acid-Base Engine",               page: "ClinicalSupport",      params: "?tab=pathways&scenario=acid-base-hub" },
  { label: "Glomerulonephritis Engine",      page: "ClinicalSupport",      params: "?tab=pathways&scenario=gn-engine" },
  { label: "Oncology Engine",                page: "ClinicalSupport",      params: "?tab=pathways&scenario=oncology-engine" },
  { label: "CAKUT Engine",                   page: "ClinicalSupport",      params: "?tab=pathways&scenario=cakut-engine" },
  { label: "Voiding Dysfunction Engine",     page: "ClinicalSupport",      params: "?tab=pathways&scenario=voiding-engine" },

  // ── Glomerular Diseases ─────────────────────────────────────────
  { label: "Glomerular Diseases",            page: "GlomerularDiseases",   params: "" },
  { label: "Glomerular Diseases Management", page: "GlomerularDiseases",   params: "" },
  { label: "Lupus Nephritis",                page: "GlomerularDiseases",   params: "?tab=lupus-nephritis" },
  { label: "Lupus Nephritis Management",     page: "GlomerularDiseases",   params: "?tab=lupus-nephritis" },
  { label: "LN Drug Dosing",                 page: "DrugsDosing",          params: "?search=mycophenolate" },
  { label: "IgA Nephropathy",                page: "GlomerularDiseases",   params: "?tab=igan" },
  { label: "FSGS",                           page: "GlomerularDiseases",   params: "?tab=fsgs" },
  { label: "Membranous Nephropathy",         page: "GlomerularDiseases",   params: "?tab=membranous" },
  { label: "SRNS Pathway",                   page: "GlomerularDiseases",   params: "?tab=srns" },
  { label: "RPGN Management",               page: "GlomerularDiseases",   params: "?tab=rpgn" },

  // ── Calculators ─────────────────────────────────────────────────
  { label: "BP Percentile Calculator",       page: "BPPercentiles",        params: "" },
  { label: "Schwartz GFR Calculator",        page: "SchwartzGFR",          params: "" },
  { label: "AKI Stager",                     page: "AKIStager",            params: "" },
  { label: "Fluid Calculator",               page: "FluidCalculator",      params: "" },
  { label: "ABG Interpreter",                page: "ABGInterpreter",       params: "" },
  { label: "Sodium Calculator",              page: "SodiumCalculator",     params: "" },
  { label: "Potassium Calculator",           page: "PotassiumCalculator",  params: "" },
  { label: "FENa Calculator",                page: "FENaCalculator",       params: "" },
  { label: "Anthropometry Calculator",       page: "Anthropometry",        params: "" },
  { label: "SLE Activity Calculators",       page: "PediatricRheumatology",params: "?tab=calculators" },
  { label: "SLEDAI Calculator",              page: "PediatricRheumatology",params: "?tab=calculators" },

  // ── Clinical AI Analyzers ───────────────────────────────────────
  { label: "Biopsy Analyzer",                page: "ClinicalAIHub",        params: "?tab=biopsy" },
  { label: "Lab Report Analyzer",            page: "ClinicalAIHub",        params: "?tab=lab" },
  { label: "Clinical Case Analyzer",         page: "ClinicalAIHub",        params: "?tab=case" },
  { label: "UDS / Uroflow Analyzer",         page: "ClinicalAIHub",        params: "?tab=uroflow" },
  { label: "ECG Analyzer",                   page: "ClinicalAIHub",        params: "?tab=ecg" },
  { label: "Radiology Analyzer",             page: "ClinicalAIHub",        params: "?tab=radiology" },

  // ── RRT & Dialysis ──────────────────────────────────────────────
  { label: "RRT Assistant",                  page: "RRTAssistant",         params: "" },
  { label: "Dialysis Protocols",             page: "RRTAssistant",         params: "" },
  { label: "HD Protocol",                    page: "RRTAssistant",         params: "?tab=hd" },
  { label: "PD Protocol",                    page: "RRTAssistant",         params: "?tab=pd" },
  { label: "CRRT Protocol",                  page: "RRTAssistant",         params: "?tab=crrt" },
];

/**
 * Validate an AI-generated link label against the registry.
 * Returns the matched route object or null if not found.
 */
export function resolveAILink(label, page) {
  if (!label && !page) return null;
  const lbl = (label || "").toLowerCase().trim();
  const pg = (page || "").toLowerCase().trim();

  // 1. Try exact label match
  let match = APP_ROUTE_REGISTRY.find(r => r.label.toLowerCase() === lbl);
  if (match) return match;

  // 2. Try page match
  if (pg) {
    match = APP_ROUTE_REGISTRY.find(r => r.page.toLowerCase() === pg);
    if (match) return match;
  }

  // 3. Try partial label match (label contains registry label or vice versa)
  match = APP_ROUTE_REGISTRY.find(r =>
    lbl.includes(r.label.toLowerCase()) || r.label.toLowerCase().includes(lbl)
  );
  if (match) return match;

  // 4. Page name fuzzy match
  if (pg) {
    match = APP_ROUTE_REGISTRY.find(r => r.page.toLowerCase().includes(pg) || pg.includes(r.page.toLowerCase()));
    if (match) return match;
  }

  return null;
}

/**
 * Structured reference library — known guidelines with working URLs.
 * AI-cited references are mapped to these entries for clickable links.
 */
export const REFERENCE_LIBRARY = {
  "KDIGO": { url: "https://kdigo.org/guidelines/", type: "Guideline Organisation" },
  "KDIGO AKI": { url: "https://kdigo.org/guidelines/acute-kidney-injury/", year: 2012, type: "Guideline" },
  "KDIGO CKD": { url: "https://kdigo.org/guidelines/ckd-evaluation-and-management/", year: 2024, type: "Guideline" },
  "KDIGO Lupus Nephritis": { url: "https://kdigo.org/guidelines/glomerulonephritis/", year: 2024, type: "Guideline" },
  "KDIGO GN": { url: "https://kdigo.org/guidelines/glomerulonephritis/", year: 2021, type: "Guideline" },
  "KDIGO CKD-MBD": { url: "https://kdigo.org/guidelines/ckd-mbd/", year: 2017, type: "Guideline" },
  "KDIGO Transplant": { url: "https://kdigo.org/guidelines/kidney-transplant-recipient/", year: 2009, type: "Guideline" },
  "KDIGO Hepatitis C": { url: "https://kdigo.org/guidelines/hepatitis-c/", year: 2018, type: "Guideline" },
  "IPNA": { url: "https://ipna.info/", type: "Society" },
  "IPNA Nephrotic Syndrome": { url: "https://pubmed.ncbi.nlm.nih.gov/32827053/", year: 2020, type: "Guideline", pmid: "32827053" },
  "ISPN": { url: "https://www.theispn.org/", type: "Society" },
  "IAP": { url: "https://www.iapindia.org/", type: "Society" },
  "AAP 2017 Hypertension": { url: "https://pubmed.ncbi.nlm.nih.gov/29084805/", year: 2017, type: "Guideline", pmid: "29084805" },
  "ISKDC Nephrotic Syndrome": { url: "https://pubmed.ncbi.nlm.nih.gov/4538056/", year: 1978, type: "Classic Paper", pmid: "4538056" },
  "RITUXNS": { url: "https://pubmed.ncbi.nlm.nih.gov/33674568/", year: 2021, type: "RCT", pmid: "33674568" },
  "REENAL": { url: "https://pubmed.ncbi.nlm.nih.gov/35710988/", year: 2022, type: "RCT", pmid: "35710988" },
  "PREDNOS": { url: "https://pubmed.ncbi.nlm.nih.gov/28490537/", year: 2017, type: "RCT", pmid: "28490537" },
  "PREDNOS2": { url: "https://pubmed.ncbi.nlm.nih.gov/32891816/", year: 2020, type: "RCT", pmid: "32891816" },
  "FONT": { url: "https://pubmed.ncbi.nlm.nih.gov/19833900/", year: 2009, type: "RCT", pmid: "19833900" },
  "PodoNet": { url: "https://pubmed.ncbi.nlm.nih.gov/31366463/", year: 2019, type: "Registry", pmid: "31366463" },
  "CureGN": { url: "https://pubmed.ncbi.nlm.nih.gov/31658958/", year: 2019, type: "Registry", pmid: "31658958" },
  "ESCAPE": { url: "https://pubmed.ncbi.nlm.nih.gov/19571794/", year: 2009, type: "RCT", pmid: "19571794" },
  "4C Study": { url: "https://pubmed.ncbi.nlm.nih.gov/23761621/", year: 2013, type: "Cohort Study", pmid: "23761621" },
  "CKiD": { url: "https://www.statepi.jhsph.edu/ckid/", type: "Study" },
  "ISN/RPS Classification": { url: "https://pubmed.ncbi.nlm.nih.gov/29605031/", year: 2018, type: "Classification", pmid: "29605031" },
  "ISN/RPS 2018": { url: "https://pubmed.ncbi.nlm.nih.gov/29605031/", year: 2018, type: "Classification", pmid: "29605031" },
  "SHARE": { url: "https://www.shareproject.eu/", type: "Guideline" },
  "ACR": { url: "https://www.rheumatology.org/Practice-Quality/Clinical-Support/Clinical-Practice-Guidelines", type: "Society" },
  "EULAR": { url: "https://www.eular.org/", type: "Society" },
};

/**
 * Resolve a reference string to a library entry.
 * Returns { url, year, pmid, type } or null.
 */
export function resolveReference(refText) {
  if (!refText) return null;
  const lower = refText.toLowerCase();
  for (const [key, entry] of Object.entries(REFERENCE_LIBRARY)) {
    if (lower.includes(key.toLowerCase())) return { key, ...entry };
  }
  // Try to extract a DOI or PubMed ID from the text
  const pmidMatch = refText.match(/PMID[:\s]*(\d{7,9})/i);
  if (pmidMatch) return { url: `https://pubmed.ncbi.nlm.nih.gov/${pmidMatch[1]}/`, type: "PubMed" };
  const doiMatch = refText.match(/10\.\d{4,}\/\S+/);
  if (doiMatch) return { url: `https://doi.org/${doiMatch[0]}`, type: "DOI" };
  return null;
}