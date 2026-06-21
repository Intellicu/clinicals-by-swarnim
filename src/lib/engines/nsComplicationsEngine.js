/**
 * Complications & Supportive Management in Nephrotic Syndrome — CIEE built-in.
 *
 * A triage engine for the major complications of childhood nephrotic syndrome
 * and their supportive management. Run by the shared PathwayExecutionEngine
 * (CIEEEngineRunner).
 *
 * Sources: IPNA Clinical Practice Recommendations for SSNS (Trautmann et al.,
 * Pediatr Nephrol 2023;38:877–919; DOI 10.1007/s00467-022-05739-3) and KDIGO
 * 2021 Glomerular Diseases — supportive-care sections.
 */

export const NS_COMPLICATIONS_GUIDELINE = {
  id: 'GS-NS-COMPLICATIONS',
  guideline_name: 'Nephrotic Syndrome — complications & supportive care (IPNA 2022 / KDIGO 2021)',
  guideline_section: 'Hypovolaemia · Oedema · Infection · Thrombosis · AKI · Metabolic · Steroid toxicity · Supportive care',
  issuing_body: 'IPNA / KDIGO',
  year: 2022,
  evidence_grade: 'B–X',
  recommendation_strength: 'GRADE',
  doi: '10.1007/s00467-022-05739-3',
  pmid: '36269406',
  reference: 'Trautmann A, et al. Pediatr Nephrol 2023;38:877–919; KDIGO 2021 Glomerular Diseases.',
};

const mk = (grade, strength, section) => ({
  guideline_name: 'NS — complications & supportive care',
  guideline_section: section,
  evidence_grade: grade,
  recommendation_strength: strength,
  issuing_body: 'IPNA / KDIGO',
  year: 2022,
  doi: '10.1007/s00467-022-05739-3',
  pmid: '36269406',
});

export const NS_COMPLICATIONS_SOURCES = {
  'GS-NSC-B': mk('B', 'Moderate recommendation', 'Moderate (grade B)'),
  'GS-NSC-C': mk('C', 'Weak recommendation', 'Low quality (grade C)'),
  'GS-NSC-X': mk('X', 'Practice point (ungraded)', 'Practice point (grade X)'),
};

const B = 'GS-NSC-B';
const C = 'GS-NSC-C';
const X = 'GS-NSC-X';

export const NS_COMPLICATIONS_PATHWAY = {
  entry: 'DN-01',
  nodes: {
    'DN-01': {
      id: 'DN-01', type: 'QUESTION', critical: true, source: X,
      question: 'Which nephrotic syndrome complication or supportive-care need are you managing?',
      detail: 'Children with active nephrotic syndrome lose immunoglobulins, complement factors and anticoagulant proteins in the urine — predisposing to infection, thrombosis and hypovolaemia. Select the issue to manage.',
      options: [
        { label: 'Hypovolaemia / circulatory compromise', next: 'DN-HYPO', tone: 'danger' },
        { label: 'Severe oedema / anasarca', next: 'DN-EDEMA' },
        { label: 'Infection (peritonitis / cellulitis / sepsis)', next: 'DN-INF', tone: 'danger' },
        { label: 'Thromboembolism (VTE / renal vein thrombosis)', next: 'DN-VTE', tone: 'danger' },
        { label: 'Acute kidney injury', next: 'DN-AKI' },
        { label: 'Dyslipidaemia', next: 'DN-LIPID' },
        { label: 'Endocrine / metabolic (thyroid · vitamin D · anaemia)', next: 'DN-METAB' },
        { label: 'Steroid toxicity & bone health', next: 'DN-STEROID' },
        { label: 'General supportive management (diet · fluids · vaccination)', next: 'DN-SUPP' },
      ],
    },

    // ── Hypovolaemia ──────────────────────────────────────────────────────
    'DN-HYPO': {
      id: 'DN-HYPO', type: 'ACTION', source: B, prescribes: 'albumin',
      action: 'Hypovolaemia / circulatory compromise. Clues: abdominal pain, tachycardia, cool peripheries, oliguria, hypotension (late), haemoconcentration (rising haematocrit) and low urinary sodium (<10–20 mmol/L). Resuscitate promptly; do NOT give diuretics while hypovolaemic.',
      rx: { drug: 'Albumin 20% (salt-poor)', dose: '0.5–1 g/kg IV over 2–4 h for significant hypovolaemia; if shock, first give 0.9% saline 10–20 mL/kg bolus', route: 'IV', duration: 'Repeat per response' },
      monitoring: [
        { parameter: 'HR, BP, peripheral perfusion, urine output', frequency: 'Continuous during resuscitation', target: 'Restored perfusion & urine output', alert: 'Persistent shock', alert_action: 'Repeat fluids; escalate to PICU' },
        { parameter: 'Respiratory status during albumin', frequency: 'Throughout infusion', target: 'No respiratory distress', alert: 'Pulmonary oedema / hypertension', alert_action: 'Slow/stop infusion; consider furosemide once euvolaemic' },
      ],
      safety: [
        { title: 'No diuretics while hypovolaemic', detail: 'Diuretics worsen hypovolaemia and precipitate shock/AKI — only after circulating volume is restored.' },
      ],
      next: 'TERM-DONE',
    },

    // ── Severe oedema / anasarca ──────────────────────────────────────────
    'DN-EDEMA': {
      id: 'DN-EDEMA', type: 'ACTION', source: B, prescribes: 'furosemide',
      action: 'Severe oedema / anasarca. First confirm the child is NOT hypovolaemic. Salt restriction; fluid restriction only if symptomatic hyponatraemia. For refractory symptomatic oedema (respiratory compromise, scrotal/labial or skin breakdown): IV albumin 20% 0.5–1 g/kg over 4 h with IV furosemide mid/end of infusion. Add spironolactone; metolazone for diuretic-resistant oedema.',
      rx: { drug: 'Furosemide (± Albumin 20%)', dose: 'Furosemide 1–2 mg/kg/dose IV/PO; with albumin 20% 0.5–1 g/kg over 4 h if refractory', route: 'IV / Oral', duration: 'Titrate to oedema' },
      monitoring: [
        { parameter: 'Weight + fluid balance', frequency: 'Daily', target: 'Gradual negative balance', alert: 'Rapid fluid shifts', alert_action: 'Reassess volume status' },
        { parameter: 'Electrolytes + renal function', frequency: 'Daily during IV diuresis', target: 'Normal K⁺/Na⁺, stable creatinine', alert: 'Hypokalaemia / hyponatraemia / rising creatinine', alert_action: 'Adjust diuretics; replace K⁺' },
      ],
      safety: [
        { title: 'Exclude hypovolaemia first', detail: 'Aggressive diuresis in a hypovolaemic child causes shock and AKI — assess perfusion, Hct and urinary sodium before diuretics.' },
      ],
      next: 'TERM-DONE',
    },

    // ── Infection ─────────────────────────────────────────────────────────
    'DN-INF': {
      id: 'DN-INF', type: 'ACTION', source: B, prescribes: 'ceftriaxone',
      action: 'Infection. Active NS children are functionally immunocompromised (urinary IgG and complement-factor loss ± immunosuppression); encapsulated organisms predominate (Streptococcus pneumoniae, E. coli). Spontaneous bacterial peritonitis (SBP): fever + abdominal pain/tenderness with ascites → diagnostic ascitic tap (PMN >250/mm³). Also consider cellulitis, pneumonia and sepsis. Start empirical broad-spectrum antibiotics promptly.',
      rx: { drug: 'Ceftriaxone (or Cefotaxime)', dose: 'Ceftriaxone 50–75 mg/kg/day IV (or cefotaxime 100–150 mg/kg/day in divided doses)', route: 'IV', duration: '7–14 days per source' },
      monitoring: [
        { parameter: 'Cultures (blood / ascitic fluid) + CRP', frequency: 'At presentation, then per response', target: 'Clinical & biochemical resolution', alert: 'No response at 48–72 h', alert_action: 'Broaden cover; image; surgical review' },
      ],
      safety: [
        { title: 'Vaccination & prophylaxis', detail: 'Pneumococcal (PCV + PPSV23) and varicella vaccination when feasible; penicillin prophylaxis during gross oedema/relapse in selected children. Live vaccines only off immunosuppression.' },
        { title: 'Varicella exposure', detail: 'Non-immune child on immunosuppression with VZV contact → VZIG and/or aciclovir.' },
      ],
      next: 'TERM-DONE',
    },

    // ── Thromboembolism ───────────────────────────────────────────────────
    'DN-VTE': {
      id: 'DN-VTE', type: 'ACTION', source: B, prescribes: 'enoxaparin',
      action: 'Thromboembolism. NS is prothrombotic (urinary antithrombin-III loss, raised fibrinogen, haemoconcentration). Highest risk with serum albumin <20 g/L, severe relapse, central venous lines and immobility. Sites: deep-vein thrombosis, pulmonary embolism, renal vein thrombosis (flank pain, macroscopic haematuria, AKI) and cerebral sinus venous thrombosis. Treat confirmed thrombosis with therapeutic anticoagulation.',
      rx: { drug: 'Enoxaparin (LMWH)', dose: '1 mg/kg/dose SC every 12 h (titrate to anti-Xa 0.5–1.0); transition to warfarin INR 2–3', route: 'SC', duration: '≥3 months and until remission' },
      monitoring: [
        { parameter: 'Anti-Xa level / INR + platelets', frequency: 'After initiation and dose changes', target: 'Anti-Xa 0.5–1.0 / INR 2–3', alert: 'Sub/supra-therapeutic; bleeding', alert_action: 'Adjust dose; hold if bleeding' },
      ],
      safety: [
        { title: 'No routine prophylactic anticoagulation', detail: 'Prophylaxis is not given routinely — encourage mobilisation and hydration, avoid haemoconcentration and central lines; consider prophylaxis only in very high-risk children.' },
      ],
      next: 'TERM-DONE',
    },

    // ── Acute kidney injury ───────────────────────────────────────────────
    'DN-AKI': {
      id: 'DN-AKI', type: 'ACTION', source: C,
      action: 'Acute kidney injury in NS. Common causes: pre-renal hypovolaemia, sepsis, drug-induced injury (diuretics, NSAIDs, ACE-I/ARB, antibiotics — ATN/AIN), bilateral renal vein thrombosis, and intrinsic glomerular disease. Assess volume status first: correct hypovolaemia (albumin ± saline); stop nephrotoxins; treat sepsis; consider acute interstitial nephritis. Follow KDIGO AKI supportive care.',
      monitoring: [
        { parameter: 'Creatinine / eGFR + urine output', frequency: 'At least daily', target: 'Recovering function', alert: 'Stage 2–3 AKI / oligo-anuria', alert_action: 'Nephrology review; consider RRT' },
        { parameter: 'Potassium + acid–base', frequency: 'Daily', target: 'K⁺ normal; no acidosis', alert: 'Hyperkalaemia / severe acidosis', alert_action: 'Emergency management; consider dialysis' },
      ],
      safety: [
        { title: 'Hold nephrotoxins during AKI', detail: 'Withhold ACE-I/ARB and diuretics during active AKI; avoid NSAIDs, aminoglycosides and contrast.' },
      ],
      next: 'TERM-DONE',
    },

    // ── Dyslipidaemia ─────────────────────────────────────────────────────
    'DN-LIPID': {
      id: 'DN-LIPID', type: 'ACTION', source: C,
      action: 'Dyslipidaemia. Driven by increased hepatic lipoprotein synthesis; usually resolves with remission, so it does not require treatment in steroid-sensitive disease that remits quickly.',
      care: [
        { category: 'First episode / remitting', detail: 'No specific lipid therapy — resolves with remission.' },
        { category: 'Persistent NS (SRNS / SDNS)', detail: 'CHILD-1 → CHILD-2 diet; consider a statin in older children/adolescents with persistently elevated LDL (e.g. age ≥8–10 y, LDL >160 mg/dL).' },
      ],
      monitoring: [
        { parameter: 'Fasting lipid profile', frequency: 'Baseline; periodically if NS persists', target: 'LDL trending down with remission', alert: 'Persistent severe hyperlipidaemia', alert_action: 'Dietitian ± statin in older child' },
      ],
      next: 'TERM-DONE',
    },

    // ── Endocrine / metabolic ─────────────────────────────────────────────
    'DN-METAB': {
      id: 'DN-METAB', type: 'ACTION', source: C,
      action: 'Endocrine & metabolic complications from urinary loss of carrier proteins in prolonged/severe nephrotic syndrome.',
      care: [
        { category: 'Hypothyroidism', detail: 'Urinary loss of thyroxine-binding globulin/thyroid hormone — check TSH & FT4 in prolonged/severe NS; levothyroxine if hypothyroid (often resolves with remission).' },
        { category: 'Vitamin D / calcium', detail: 'Urinary loss of vitamin-D-binding protein — supplement vitamin D and calcium, especially with prolonged proteinuria or long-term steroids.' },
        { category: 'Anaemia', detail: 'Urinary transferrin/erythropoietin loss in severe persistent NS — check Hb and iron studies; treat the cause.' },
      ],
      monitoring: [
        { parameter: 'TFT · 25-OH vitamin D · calcium · Hb', frequency: 'In prolonged/severe NS, then per findings', target: 'Within reference range', alert: 'Deficiency / hypothyroidism', alert_action: 'Supplement / replace; re-test after remission' },
      ],
      next: 'TERM-DONE',
    },

    // ── Steroid toxicity & bone health ────────────────────────────────────
    'DN-STEROID': {
      id: 'DN-STEROID', type: 'ACTION', source: B,
      action: 'Steroid toxicity & bone health. Monitor for and mitigate the adverse effects of corticosteroid exposure; move to a steroid-sparing agent for frequently relapsing / steroid-dependent disease.',
      care: [
        { category: 'Growth & metabolic', detail: 'Track height velocity, weight/BMI, blood pressure and blood glucose; watch for Cushingoid features and behavioural change.' },
        { category: 'Eyes', detail: 'Annual ophthalmology for cataract / glaucoma on long-term steroids.' },
        { category: 'Bone', detail: 'Calcium + vitamin D supplementation; encourage weight-bearing activity.' },
        { category: 'Steroid minimisation', detail: 'Use the lowest effective dose; start a steroid-sparing agent for FRNS/SDNS. Provide stress-dose steroids for adrenal suppression.' },
      ],
      monitoring: [
        { parameter: 'Growth chart · BP · glucose · eye exam', frequency: 'Each visit; eye exam annually', target: 'Normal growth/BP/glucose', alert: 'Growth failure / hypertension / hyperglycaemia / cataract', alert_action: 'Reduce steroids; steroid-sparing agent; specialist referral' },
      ],
      next: 'TERM-DONE',
    },

    // ── General supportive management ─────────────────────────────────────
    'DN-SUPP': {
      id: 'DN-SUPP', type: 'ACTION', source: X,
      action: 'General supportive management of nephrotic syndrome.',
      care: [
        { category: 'Diet', detail: 'Normal age-appropriate protein (do NOT protein-restrict); no-added-salt diet during oedema; adequate energy. Fluid restriction only for symptomatic hyponatraemia.' },
        { category: 'Vaccination', detail: 'Pneumococcal and varicella vaccination plus annual inactivated influenza; give live vaccines only off immunosuppression or before starting it.' },
        { category: 'Infection prophylaxis', detail: 'Penicillin prophylaxis during gross oedema/relapse in selected children; prompt treatment of suspected infection.' },
        { category: 'Education & monitoring', detail: 'Home urine dipstick diary; teach families to recognise relapse and the warning signs of infection, thrombosis and hypovolaemia.' },
      ],
      monitoring: [
        { parameter: 'Home dipstick · weight · BP · growth', frequency: 'Dipstick daily during illness, then weekly; clinic review per phase', target: 'Sustained remission, normal growth/BP', alert: 'Relapse or complication', alert_action: 'Re-enter the relevant pathway' },
      ],
      next: 'TERM-DONE',
    },

    'TERM-DONE': { id: 'TERM-DONE', type: 'TERMINAL', source: X, action: 'Management plan generated — treatment, monitoring and safety constraints recorded. Use Back or Run Again to manage another complication.' },
  },
};

export const NS_COMPLICATIONS_ENGINE = {
  id: 'ns-complications-engine',
  label: 'NS Complications & Supportive Care Engine',
  desc: 'Complications of nephrotic syndrome — hypovolaemia, severe oedema/anasarca, infection (SBP/cellulitis/sepsis), thromboembolism, AKI, dyslipidaemia, endocrine/metabolic loss, steroid toxicity — plus general supportive management (diet, fluids, vaccination), with dosing, monitoring & safety',
  group: 'Glomerular Disease',
  builtin: true,
  guideline_source: NS_COMPLICATIONS_GUIDELINE,
  ciee_sources: NS_COMPLICATIONS_SOURCES,
  ciee_pathway: NS_COMPLICATIONS_PATHWAY,
};
