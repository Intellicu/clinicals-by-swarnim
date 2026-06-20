/**
 * IgA Nephropathy / IgA Vasculitis Nephritis Intelligence Engine — CIEE built-in.
 * Source: IPNA Clinical Practice Recommendations for the diagnosis and management
 * of children with IgA nephropathy and IgA vasculitis nephritis (Vivarelli et al.,
 * Pediatr Nephrol 2024). DOI 10.1007/s00467-024-06502-6.
 *
 * Run by the shared PathwayExecutionEngine (CIEEEngineRunner).
 */

export const IGA_IPNA_GUIDELINE = {
  id: 'GS-IPNA-2024-IGA',
  guideline_name: 'IPNA 2024 — IgA Nephropathy & IgA Vasculitis Nephritis',
  guideline_section: 'Diagnosis · Biopsy · Supportive · Glucocorticoids · IgAVN',
  issuing_body: 'International Pediatric Nephrology Association',
  year: 2024,
  evidence_grade: 'A–D / X',
  recommendation_strength: 'GRADE',
  doi: '10.1007/s00467-024-06502-6',
  pmid: '39331079',
  reference: 'Vivarelli M, et al. Pediatr Nephrol. 2024.',
};

// Evidence-grade source variants (IPNA uses GRADE A/B/C/D and X for ungraded-but-strong)
const mk = (grade, strength, section) => ({
  guideline_name: 'IPNA 2024 — IgAN & IgAV Nephritis',
  guideline_section: section,
  evidence_grade: grade,
  recommendation_strength: strength,
  issuing_body: 'International Pediatric Nephrology Association',
  year: 2024,
  doi: '10.1007/s00467-024-06502-6',
  pmid: '39331079',
});

export const IGA_IPNA_SOURCES = {
  'GS-IPNA-2024-IGA-A': mk('A', 'Strong recommendation', 'IgAN — strong (grade A)'),
  'GS-IPNA-2024-IGA-B': mk('B', 'Moderate/strong recommendation', 'Moderate-quality evidence (grade B)'),
  'GS-IPNA-2024-IGA-C': mk('C', 'Moderate/weak recommendation', 'Low-quality evidence (grade C)'),
  'GS-IPNA-2024-IGA-D': mk('D', 'Weak recommendation', 'IgAVN — very low evidence (grade D)'),
  'GS-IPNA-2024-IGA-X': mk('X', 'Strong recommendation (ungraded)', 'Practice / definition (grade X)'),
};

const A = 'GS-IPNA-2024-IGA-A';
const B = 'GS-IPNA-2024-IGA-B';
const C = 'GS-IPNA-2024-IGA-C';
const D = 'GS-IPNA-2024-IGA-D';
const X = 'GS-IPNA-2024-IGA-X';

export const IGA_IPNA_PATHWAY = {
  entry: 'DN-01',
  nodes: {
    'DN-01': {
      id: 'DN-01', type: 'QUESTION', critical: true, source: X,
      question: 'Clinical context?',
      detail: 'IgAN and IgAV nephritis are histologically similar but managed differently; IgAVN is the renal manifestation of systemic IgA vasculitis.',
      options: [
        { label: 'Isolated kidney findings (haematuria ± proteinuria) — suspect IgAN', set: { dx: 'IgAN' }, next: 'DN-02' },
        { label: 'Systemic IgA vasculitis (palpable purpura ± abdominal/joint) — assess for IgAVN', set: { dx: 'IgAVN' }, next: 'DN-30' },
      ],
    },

    // ── IgAN branch ───────────────────────────────────────────────────────
    'DN-02': {
      id: 'DN-02', type: 'ASSESSMENT', source: B,
      question: 'Urinary findings (first-morning sample)?',
      detail: 'Exclude orthostatic proteinuria with first-morning void. Normal UPCR <0.2 mg/mg (20 mg/mmol).',
      options: [
        { label: 'Isolated microscopic haematuria OR resolved gross haematuria, no proteinuria', next: 'DN-03' },
        { label: 'Haematuria WITH proteinuria (UPCR ≥0.2)', next: 'DN-04' },
      ],
    },
    'DN-03': {
      id: 'DN-03', type: 'ACTION', source: B,
      action: 'No specific treatment for isolated microscopic haematuria or fully resolved gross haematuria without persistent urinary abnormality. Lifelong yearly BP + urinalysis (can relapse years later).',
      next: 'TERM-IGAN-MON',
    },
    'DN-04': {
      id: 'DN-04', type: 'QUESTION', critical: true, source: A,
      question: 'Rapidly progressive course — unexplained >50% decline in eGFR over ≤3 months?',
      options: [
        { label: 'Yes — RPGN', set: { rpgn: true }, tone: 'danger', next: 'DN-05' },
        { label: 'No', next: 'DN-06' },
      ],
    },
    'DN-05': {
      id: 'DN-05', type: 'ACTION', source: A,
      action: 'Perform kidney biopsy PROMPTLY. RPGN-IgAN = >50% eGFR decline ≤3 months WITH endocapillary proliferation (≥E1) and crescents in ≥25% of glomeruli (C2).',
      next: 'DN-07',
    },
    'DN-07': {
      id: 'DN-07', type: 'ACTION', source: C, prescribes: 'methylprednisolone',
      action: 'Treat RPGN-IgAN with IV glucocorticoid pulses + additional immunosuppression (cyclophosphamide or MMF), per the KDIGO 2021 ANCA-associated vasculitis regimen.',
      rx: { drug: 'Methylprednisolone + cyclophosphamide or MMF', dose: 'IV MP 30 mg/kg/day (max 1 g) ×3 → oral prednisolone taper; + CYC or MMF per AAV regimen', route: 'IV then oral', duration: 'Induction 3–6 months' },
      safety: [
        { title: 'Live vaccines', detail: 'Suppress live vaccines during active immunosuppression — log and schedule post-treatment.' },
        { title: 'Cyclophosphamide — fertility', detail: 'Fertility-preservation counselling required before cyclophosphamide.', gate: true, ack: 'Fertility-preservation counselling documented (cyclophosphamide)' },
        { title: 'PJP prophylaxis', detail: 'Add co-trimoxazole PJP prophylaxis during intensive immunosuppression.' },
      ],
      monitoring: [
        { parameter: 'eGFR + serum creatinine', frequency: 'Weekly initially, then monthly', target: 'Stabilisation/recovery of eGFR', alert: 'Continued decline', alert_action: 'Escalate immunosuppression; nephrology MDT' },
        { parameter: 'Infection surveillance + steroid toxicity', frequency: 'Each visit', target: 'No serious infection', alert: 'Infection / glucocorticoid toxicity', alert_action: 'PJP prophylaxis; adjust therapy' },
      ],
      next: 'DN-20',
    },
    'DN-06': {
      id: 'DN-06', type: 'QUESTION', critical: true, source: X,
      question: 'Proteinuria level on repeat first-morning UPCR?',
      detail: 'Confirm on ≥2 clear-urine samples 1–2 weeks apart; normal C3 supports primary IgAN.',
      options: [
        { label: 'Nephrotic-range (UPCR >2) and/or reduced eGFR', next: 'DN-08' },
        { label: 'UPCR >0.5 mg/mg (×2 measurements)', next: 'DN-09' },
        { label: 'UPCR 0.2–0.5 mg/mg (×3 measurements)', next: 'DN-10' },
      ],
    },
    'DN-08': { id: 'DN-08', type: 'ACTION', source: X, action: 'Perform kidney biopsy PROMPTLY (nephrotic-range proteinuria and/or reduced eGFR).', next: 'DN-11' },
    'DN-09': { id: 'DN-09', type: 'ACTION', source: X, action: 'Kidney biopsy recommended (persistent haematuria + UPCR >0.5).', next: 'DN-11' },
    'DN-10': { id: 'DN-10', type: 'ACTION', source: D, action: 'Kidney biopsy suggested (haematuria + UPCR 0.2–0.5 on ≥3 samples). Biopsy is required to diagnose primary IgAN; exclude secondary causes.', next: 'DN-11' },
    'DN-11': {
      id: 'DN-11', type: 'ASSESSMENT', source: C,
      question: 'Biopsy pattern?',
      detail: 'Classify by Oxford MEST-C. Note the overlap with minimal change disease.',
      options: [
        { label: 'Nephrotic syndrome with MCD pattern + IgA deposits', next: 'DN-12' },
        { label: 'IgAN (Oxford MEST-C)', next: 'DN-13' },
      ],
    },
    'DN-12': { id: 'DN-12', type: 'ACTION', source: C, action: 'Treat as per the IPNA Steroid-Sensitive Nephrotic Syndrome (SSNS) guideline (prednisolone protocol).', next: 'TERM-IGAN' },
    'DN-13': {
      id: 'DN-13', type: 'ACTION', source: C, prescribes: 'enalapril',
      action: 'Optimal supportive care: moderate salt <3–5 g/day; RASB (ACEi or ARB) at maximally tolerated dose aiming UPCR <0.2; BP target ≤50th percentile (if proteinuria) or ≤75th percentile (ABPM); healthy weight; regular exercise; no smoking/vaping. Tonsillectomy NOT recommended.',
      rx: { drug: 'Enalapril (ACEi) or an ARB', dose: 'Enalapril 0.1–0.5 mg/kg/day, titrate to maximally tolerated dose', route: 'Oral', duration: 'Long-term while proteinuric' },
      safety: [
        { title: 'Pregnancy — fetopathy', detail: 'ACEi/ARB contraindicated in pregnancy. Counsel fertile patients; document.' },
      ],
      monitoring: [
        { parameter: 'UPCR (first-morning)', frequency: 'Monthly until stable, then 3-monthly', target: 'UPCR <0.2 mg/mg', alert: 'UPCR >1 g/day persists at 3–6 months', alert_action: 'Consider glucocorticoids (risk–benefit)' },
        { parameter: 'BP, serum creatinine, potassium', frequency: '1–2 weeks after RASB start, then periodically', target: 'BP at target; stable eGFR/K+', alert: 'Rising K+ or falling eGFR', alert_action: 'Reduce/hold RASB' },
      ],
      next: 'DN-14',
    },
    'DN-14': {
      id: 'DN-14', type: 'QUESTION', critical: true, source: C,
      question: 'After 3–6 months of maximal RASB, does proteinuria >1 g/day (≈UPCR >1) persist?',
      options: [
        { label: 'Yes — persistent proteinuria >1 g/day', set: { persistent_proteinuria: true }, next: 'DN-15' },
        { label: 'No — controlled (UPCR <0.5)', next: 'DN-19' },
      ],
    },
    'DN-15': {
      id: 'DN-15', type: 'ACTION', source: X,
      action: 'Glucocorticoids are NOT routine in children with IgAN. Consider a 6-month course ONLY after careful risk–benefit evaluation of glucocorticoid toxicity, and preferably enrol the patient in a clinical trial.',
      next: 'DN-16',
    },
    'DN-16': {
      id: 'DN-16', type: 'QUESTION', source: B,
      question: 'Nephrotic syndrome present and failing glucocorticoids alone?',
      options: [
        { label: 'Yes — IgAN with nephrotic syndrome, GC failure', next: 'DN-17' },
        { label: 'No — proceed with glucocorticoid course', next: 'DN-18' },
      ],
    },
    'DN-17': { id: 'DN-17', type: 'ACTION', source: B, action: 'Add an immunosuppressive agent in combination with glucocorticoids (selected settings — IgAN with nephrotic syndrome failing GC alone).', next: 'DN-20' },
    'DN-18': {
      id: 'DN-18', type: 'ACTION', source: C, prescribes: 'prednisolone',
      action: 'Glucocorticoid course (~6 months): oral prednisone 0.8–1 mg/kg/day with taper, OR IV methylprednisolone pulses + alternate-day oral prednisone. Add PJP prophylaxis.',
      rx: { drug: 'Prednisolone (± IV methylprednisolone)', dose: 'Oral 0.8–1 mg/kg/day with taper over 6 months, or IV MP pulses + alternate-day oral', route: 'Oral / IV', duration: '~6 months' },
      safety: [
        { title: 'Live vaccines', detail: 'Suppress live vaccines during glucocorticoid immunosuppression — log and schedule post-treatment.' },
        { title: 'PJP prophylaxis', detail: 'Add co-trimoxazole PJP prophylaxis.' },
      ],
      monitoring: [
        { parameter: 'Proteinuria (UPCR)', frequency: 'Monthly', target: 'UPCR <0.2', alert: 'No response by end of course', alert_action: 'Reassess; consider additional IS / trial' },
        { parameter: 'Glucocorticoid toxicity (growth, BP, glucose, eyes, mood)', frequency: 'Each visit', target: 'No significant toxicity', alert: 'Toxicity threshold reached', alert_action: 'Change treatment strategy' },
      ],
      next: 'DN-20',
    },
    'DN-19': { id: 'DN-19', type: 'ACTION', source: C, action: 'Continue RASB. Discontinue immunosuppression after full remission (UPCR <0.2) sustained ≥12 months; continue supportive RASB and lifelong monitoring.', next: 'DN-20' },
    'DN-20': {
      id: 'DN-20', type: 'MONITORING', source: X,
      action: 'Lifelong yearly BP + urinalysis (relapses can occur after years). Adjust follow-up intervals by severity/response. Re-evaluate for secondary IgAN if proteinuria persists after 3–6 months supportive therapy.',
      next: 'TERM-IGAN',
    },

    // ── IgA vasculitis nephritis (IgAVN) branch ───────────────────────────
    'DN-30': {
      id: 'DN-30', type: 'ACTION', source: B,
      action: 'IgA vasculitis: treat extra-renal manifestations per SHARE. Do NOT use glucocorticoids to PREVENT nephritis, and do NOT use heparin/dipyridamole/aspirin/montelukast for prevention. Monitor urine + BP for the development of nephritis for ≥12 months even if initially normal.',
      next: 'DN-43',
    },
    // ── Phase 6 — Extra-renal manifestations ──────────────────────────────
    'DN-43': {
      id: 'DN-43', type: 'QUESTION', source: B,
      question: 'Severe extra-renal symptoms needing glucocorticoids?',
      detail: 'Severe bowel symptoms (after excluding intussusception), severe arthritis, or orchitis. Note: extra-renal glucocorticoids do NOT prevent kidney involvement — renal monitoring continues regardless.',
      options: [
        { label: 'Yes — severe bowel / arthritis / orchitis', next: 'DN-44' },
        { label: 'No', next: 'DN-31' },
      ],
    },
    'DN-44': {
      id: 'DN-44', type: 'ACTION', source: B, prescribes: 'prednisolone',
      action: 'Short course of oral prednisolone for severe extra-renal symptoms (exclude intussusception before treating abdominal pain). Does NOT prevent nephritis — continue urine + BP monitoring.',
      rx: { drug: 'Prednisolone', dose: '1–2 mg/kg/day (max 60 mg), short course with taper', route: 'Oral', duration: '~1–2 weeks' },
      safety: [
        { title: 'Live vaccines', detail: 'Defer live vaccines during/after significant glucocorticoid exposure; schedule once off immunosuppression.' },
      ],
      next: 'DN-31',
    },
    'DN-31': {
      id: 'DN-31', type: 'QUESTION', critical: true, source: X,
      question: 'Kidney involvement (first-morning UPCR / eGFR)?',
      options: [
        { label: 'Nephrotic-range proteinuria (UPCR >2)', next: 'DN-32' },
        { label: 'eGFR <90 (any proteinuria level)', next: 'DN-32' },
        { label: 'Moderate proteinuria (UPCR 1–2) for 2–4 weeks', next: 'DN-33' },
        { label: 'Mild proteinuria (UPCR 0.2–0.5) for >4 weeks', next: 'DN-34' },
        { label: 'Isolated haematuria, no proteinuria (UPCR <0.2)', next: 'DN-35', tone: 'muted' },
      ],
    },
    'DN-32': { id: 'DN-32', type: 'ACTION', source: X, action: 'Perform kidney biopsy (ISKDC grading) — nephrotic-range proteinuria or reduced eGFR.', next: 'DN-36' },
    'DN-33': { id: 'DN-33', type: 'ACTION', source: D, action: 'Kidney biopsy suggested (moderate proteinuria 2–4 weeks).', next: 'DN-36' },
    'DN-34': { id: 'DN-34', type: 'ACTION', source: D, action: 'Kidney biopsy suggested (mild proteinuria persisting >4 weeks).', next: 'DN-36' },
    'DN-35': { id: 'DN-35', type: 'ACTION', source: B, action: 'Do NOT use glucocorticoids for isolated microscopic/macroscopic haematuria without proteinuria. Monitor urine + BP.', next: 'DN-40' },
    'DN-36': {
      id: 'DN-36', type: 'QUESTION', critical: true, source: D,
      question: 'Nephrotic-range proteinuria (UPCR >2) OR RPGN with histological risk (ISKDC ≥ II)?',
      options: [
        { label: 'Yes — nephrotic-range / RPGN / ISKDC ≥ II', tone: 'danger', next: 'DN-37' },
        { label: 'No — proteinuria UPCR ≥0.2 without the above', next: 'DN-38' },
      ],
    },
    'DN-37': {
      id: 'DN-37', type: 'ACTION', source: D, prescribes: 'methylprednisolone',
      action: '3–6 month glucocorticoid course — IV methylprednisolone pulses followed by tapering oral prednisone, OR an oral course. Target UPCR <0.2.',
      rx: { drug: 'Methylprednisolone → Prednisolone', dose: 'IV MP 30 mg/kg/day (max 1 g) ×3 pulses → oral prednisolone 1 mg/kg/day with taper', route: 'IV then oral', duration: '3–6 months' },
      safety: [
        { title: 'Live vaccines', detail: 'Suppress live vaccines during active immunosuppression — log and schedule post-treatment.' },
        { title: 'Glucocorticoid toxicity', detail: 'If toxicity flag positive (growth, BP, glucose, mood) — consider dose reduction / change strategy.' },
      ],
      monitoring: [
        { parameter: 'Urinalysis (UPCR + haematuria)', frequency: 'Monthly ×6, then per risk', target: 'UPCR <0.2 mg/mg', alert: 'UPCR ≥0.2 mg/mg', alert_action: 'Re-enter treatment decision' },
        { parameter: 'eGFR (Schwartz)', frequency: 'Diagnosis, 4–8 weeks, quarterly', target: '≥90 mL/min/1.73m²', alert: 'Decline >25%', alert_action: 'Escalate to RPGN pathway' },
        { parameter: 'BP', frequency: 'Monthly ×3, then quarterly', target: '<90th percentile', alert: '≥90th percentile', alert_action: 'Initiate/optimise RASB' },
        { parameter: 'Serum albumin', frequency: 'At biopsy, then per clinical', target: '≥30 g/L', alert: '<30 g/L', alert_action: 'Nephrotic flag — escalate treatment' },
        { parameter: 'Glucocorticoid toxicity (BP, height, weight, glucose)', frequency: 'Quarterly', target: 'No toxicity', alert: 'Toxicity', alert_action: 'Dose reduction' },
      ],
      next: 'DN-39',
    },
    'DN-39': {
      id: 'DN-39', type: 'QUESTION', critical: true, source: D,
      question: 'Insufficient response to glucocorticoids, or UPCR >2 persists?',
      options: [
        { label: 'Yes', tone: 'danger', next: 'DN-41' },
        { label: 'No — responding', next: 'DN-42' },
      ],
    },
    'DN-41': {
      id: 'DN-41', type: 'ACTION', source: D, prescribes: 'mycophenolate',
      action: 'Add a second-line immunosuppressant (MMF, a CNI, cyclophosphamide, or mizoribine where available) to reduce the glucocorticoid dose / for UPCR >2 / insufficient response. Repeat kidney biopsy if proteinuria persists >4 weeks.',
      rx: { drug: 'Mycophenolate mofetil (or CNI / cyclophosphamide)', dose: 'MMF 1200 mg/m²/day in 2 doses · Tacrolimus C0 3–7 ng/mL · Cyclosporine C0 60–100 ng/mL · CYC per protocol', route: 'Oral / IV (CYC)', duration: 'Min 8–12 weeks; taper after ≥4 weeks remission' },
      safety: [
        { title: 'Live vaccines', detail: 'Suppress live vaccines during active immunosuppression — log and schedule post-treatment.' },
        { title: 'MMF — pregnancy / teratogenicity', detail: 'MMF is teratogenic. Document contraception counselling in fertile patients before prescribing.', gate: true, ack: 'Contraception counselling documented (MMF teratogenicity)' },
        { title: 'Cyclophosphamide — fertility', detail: 'Fertility-preservation counselling required before cyclophosphamide.', gate: true, ack: 'Fertility-preservation counselling documented (cyclophosphamide)' },
      ],
      monitoring: [
        { parameter: 'MMF/MPA exposure + CBC', frequency: 'Monthly → quarterly', target: 'AUC ~30–60 mg·h/L; normal CBC', alert: 'Cytopenia / low AUC', alert_action: 'Dose adjust; consider MPS' },
        { parameter: 'CNI trough (if used)', frequency: 'Quarterly', target: 'Tac 3–7 / CsA 60–100 ng/mL', alert: 'Out of range; creatinine ↑', alert_action: 'Dose adjust; biopsy at 2–3 yrs' },
        { parameter: 'Cyclophosphamide (if used): CBC + urine', frequency: 'Every 14 days', target: 'Normal CBC; clear urine', alert: 'Leukopenia / haematuria', alert_action: 'Hold; urgent review' },
      ],
      next: 'DN-40',
    },
    'DN-38': {
      id: 'DN-38', type: 'ACTION', source: D, prescribes: 'enalapril',
      action: 'RASB (ACEi or ARB) for proteinuria (UPCR ≥0.2). Maintain BP <90th percentile for age/sex/height; add non-RASB antihypertensives if target not met.',
      rx: { drug: 'Enalapril (ACEi) or an ARB', dose: 'Enalapril 0.1–0.5 mg/kg/day, titrate to max tolerated', route: 'Oral', duration: 'Long-term while proteinuric' },
      safety: [
        { title: 'Pregnancy — fetopathy', detail: 'ACEi/ARB contraindicated in pregnancy (renal/skull fetopathy). Counsel fertile patients; document.' },
      ],
      monitoring: [
        { parameter: 'UPCR + BP', frequency: 'Monthly initially', target: 'UPCR <0.2; BP <90th percentile', alert: 'Persistent proteinuria/HTN', alert_action: 'Escalate per pathway' },
        { parameter: 'Serum creatinine + potassium', frequency: 'After RASB start, then periodically', target: 'Stable', alert: 'Rising K+/falling eGFR', alert_action: 'Reduce/hold RASB' },
      ],
      next: 'DN-40',
    },
    'DN-42': { id: 'DN-42', type: 'ACTION', source: D, action: 'Continue RASB. Use immunosuppression for a minimum of 8–12 weeks; discontinue after ≥4 weeks of remission (UPCR <0.2, no gross haematuria, eGFR >90).', next: 'DN-40' },
    // ── Phase 7 — Monitoring, remission, relapse ──────────────────────────
    'DN-40': {
      id: 'DN-40', type: 'MONITORING', source: X,
      action: 'Follow-up: monthly for 6 months, then every 3 months for a further 6 months, then every 6 months for ≥5 years. Yearly lifelong BP + urinalysis. Target UPCR <0.2.',
      next: 'DN-46',
    },
    'DN-46': {
      id: 'DN-46', type: 'QUESTION', critical: true, source: X,
      question: 'On follow-up — remission or relapse?',
      detail: 'Remission: UPCR <0.2 mg/mg ×2 samples ≥1 month apart with eGFR ≥90. Relapse: haematuria ≥2+ OR UPCR ≥0.2 ×2 samples with eGFR <90 or >25% decline.',
      options: [
        { label: 'Remission', set: { remission: true }, next: 'DN-47' },
        { label: 'Relapse — restart treatment', set: { relapse: true }, tone: 'danger', next: 'DN-36' },
        { label: 'Stable — continue monitoring', next: 'DN-48' },
      ],
    },
    'DN-47': {
      id: 'DN-47', type: 'ACTION', source: X,
      action: 'Remission: continue RASB; taper/withdraw immunosuppression. Live vaccines may be scheduled once off immunosuppression.',
      next: 'DN-48',
    },
    'DN-48': {
      id: 'DN-48', type: 'MONITORING', source: X,
      action: 'Lifelong yearly BP + urinalysis for all patients with a history of IgAVN (relapses can occur late). Re-enter the treatment algorithm on relapse.',
      next: 'TERM-IGAVN',
    },

    // ── Terminals ─────────────────────────────────────────────────────────
    'TERM-IGAN': { id: 'TERM-IGAN', type: 'TERMINAL', source: X, action: 'IgAN management plan generated — supportive RASB ± selective immunosuppression with lifelong monitoring.' },
    'TERM-IGAN-MON': { id: 'TERM-IGAN-MON', type: 'TERMINAL', source: B, action: 'No specific treatment indicated — lifelong yearly BP + urinalysis to detect progression.' },
    'TERM-IGAVN': { id: 'TERM-IGAVN', type: 'TERMINAL', source: X, action: 'IgAVN management plan generated — structured follow-up for ≥5 years with lifelong BP + urinalysis.' },
  },
};

export const IGA_IPNA_ENGINE = {
  id: 'iga-ipna-2024',
  label: 'IgA Nephropathy / IgA Vasculitis Engine',
  desc: 'IPNA 2024 — diagnosis & biopsy indications → supportive RASB → selective glucocorticoids (IgAN) · IgAVN severity-based treatment, with RPGN pathway and lifelong monitoring',
  group: 'Glomerular Disease',
  builtin: true,
  guideline_source: IGA_IPNA_GUIDELINE,
  ciee_sources: IGA_IPNA_SOURCES,
  ciee_pathway: IGA_IPNA_PATHWAY,
};
