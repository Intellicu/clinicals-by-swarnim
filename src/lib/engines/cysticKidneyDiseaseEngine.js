/**
 * Approach to Cystic Kidney Disease — CIEE built-in.
 * Source: De Rechter & Mekahli (UZ Leuven) — "ADPKD in the young" · Gimpel et al,
 * Nat Rev Nephrol 2019 (ADPKD paediatric consensus) · Emma F (Bambino Gesù) —
 * "Approach to Renal Cystic Diseases in Children" (IPNA Primer) · Guay-Woodford
 * et al, J Pediatr 2014 (hepatorenal fibrocystic disease phenocopies).
 *
 * Decision pathway:
 *  - Presentation-driven entry (family history / antenatal / polyuric child / incidental cyst)
 *  - Differential diagnosis framework (ARPKD vs ADPKD vs NPHP vs ADTKD/HNF1B vs cystic dysplasia vs MCDK vs simple cyst)
 *  - ADPKD: screening choice, age-based US/MRI diagnostic criteria, BP & proteinuria targets by age, extra-renal surveillance
 *  - ARPKD: neonatal respiratory/renal crisis, hepatic surveillance, RRT trajectory
 *  - Nephronophthisis (NPHP): concentrating-defect work-up, genetic panel, extra-renal (Senior-Løken/Joubert)
 *  - HNF1B/ADTKD, MCDK and incidental simple cysts
 *  - Age-banded monitoring targets for titration
 */

export const CKD_CYSTIC_GUIDELINE = {
  id: 'GS-ERKNET-CYSTIC-2019',
  guideline_name: 'ERKNet/ESPN — Cystic Kidney Disease in Children',
  guideline_section: 'Differential Diagnosis · ADPKD Consensus · ARPKD/NPHP Management',
  issuing_body: 'ERKNet · ESPN · IPNA · PKD Research Group KU Leuven',
  year: 2019,
  evidence_grade: 'B–X',
  recommendation_strength: 'Expert consensus / practice points',
  doi: null,
  pmid: null,
  reference: 'Gimpel C, et al. Nat Rev Nephrol 2019;15:713-726 · De Rechter S & Mekahli D, Clin Kidney J 2018 · Emma F, IPNA Primer 2018 · Guay-Woodford LM, J Pediatr 2014.',
};

const mk = (grade, strength, section) => ({
  guideline_name: 'ERKNet/ESPN — Cystic Kidney Disease in Children',
  guideline_section: section,
  evidence_grade: grade,
  recommendation_strength: strength,
  issuing_body: 'ERKNet · ESPN · IPNA · PKD Research Group KU Leuven',
  year: 2019, doi: null, pmid: null,
});

export const CKD_CYSTIC_SOURCES = {
  'GS-CYSTIC-B': mk('B', 'Consensus recommendation', 'Moderate-quality consensus'),
  'GS-CYSTIC-C': mk('C', 'Consensus recommendation', 'Low-quality consensus'),
  'GS-CYSTIC-X': mk('X', 'Practice point (ungraded)', 'Practice point / expert opinion'),
};

const B = 'GS-CYSTIC-B';
const C = 'GS-CYSTIC-C';
const X = 'GS-CYSTIC-X';

export const CKD_CYSTIC_PATHWAY = {
  entry: 'CK-01',
  nodes: {
    // ── Phase 1 — Presentation ─────────────────────────────────────────────
    'CK-01': {
      id: 'CK-01', type: 'QUESTION', critical: true, source: X,
      question: 'What is the clinical scenario?',
      detail: 'Renal cystic disease in children spans a wide spectrum — from benign simple cysts to life-threatening ARPKD. The presentation (family history, antenatal imaging, polyuria, or incidental finding) determines the differential and work-up pathway.',
      options: [
        { label: 'Family history of ADPKD — at-risk child', set: { path: 'adpkd_fh' }, next: 'CK-DIFF-01' },
        { label: 'Antenatal/neonatal bilaterally enlarged, echogenic kidneys', set: { path: 'neonatal' }, next: 'CK-DIFF-01' },
        { label: 'Polyuria/polydipsia + growth failure, no family history', set: { path: 'nphp' }, next: 'CK-DIFF-01' },
        { label: 'Incidental renal cyst(s) on imaging', set: { path: 'incidental' }, next: 'CK-DIFF-01' },
      ],
    },

    // ── Phase 2 — Differential diagnosis framework ────────────────────────
    'CK-DIFF-01': {
      id: 'CK-DIFF-01', type: 'ACTION', source: X,
      action: 'Differential diagnosis framework by presentation, inheritance, laterality, size and onset (adapted from Emma F, IPNA Primer): ARPKD — AR, bilateral, large (early), congenital onset, ± congenital hepatic fibrosis/Caroli. ADPKD — AD, bilateral, large (late/adult), childhood-to-adult onset, family history in ~75–90%. Nephronophthisis (NPHP) — AR, bilateral, normal/small kidneys, childhood onset, corticomedullary cysts + loss of concentrating ability. ADTKD/HNF1B — AD (often de novo), bilateral, normal/small, childhood onset, small cortical cysts or hyperechoic kidneys ± MODY5 diabetes. Cystic dysplasia / MCDK — CAKUT (non-genetic), usually unilateral, normal/small, congenital, non-functioning. Simple cysts — no inheritance, unilateral, normal size, adulthood onset (rare and should prompt work-up if found in a young child).',
      next: 'CK-DIFF-02',
    },
    'CK-DIFF-02': {
      id: 'CK-DIFF-02', type: 'QUESTION', critical: true, source: X,
      question: 'Based on the pattern above, which category best fits?',
      options: [
        { label: 'ADPKD (AD pattern / family history / late-onset cysts)', set: { dx: 'adpkd' }, next: 'CK-ADPKD-01' },
        { label: 'ARPKD (AR / neonatal bilateral large echogenic kidneys ± liver fibrosis)', set: { dx: 'arpkd' }, next: 'CK-ARPKD-01' },
        { label: 'Nephronophthisis / ciliopathy (normal-small kidneys, concentrating defect)', set: { dx: 'nphp' }, next: 'CK-NPHP-01' },
        { label: 'HNF1B/ADTKD (small cortical cysts, hyperechoic kidneys, ± diabetes)', set: { dx: 'hnf1b' }, next: 'CK-HNF1B-01' },
        { label: 'Cystic dysplasia / MCDK (unilateral, non-communicating, CAKUT)', set: { dx: 'mcdk' }, next: 'CK-MCDK-01' },
        { label: 'Isolated simple cyst — no family history, no other findings', set: { dx: 'simple' }, next: 'CK-SIMPLE-01' },
      ],
    },

    // ── ADPKD branch ────────────────────────────────────────────────────────
    'CK-ADPKD-01': {
      id: 'CK-ADPKD-01', type: 'QUESTION', critical: true, source: B,
      question: 'Screening choice for an asymptomatic at-risk child (parent with ADPKD)?',
      detail: 'ADPKD is NOT purely a late-onset disease — nephromegaly and cyst formation begin in utero/childhood even though ESKD occurs in adulthood (median 56y for PKD1 truncating, 68y non-truncating, 80y for PKD2). Screening in minors is an INFORMED PARENTAL CHOICE — inform parents of the possibilities, limits and consequences (stress/medicalising a healthy child vs. enabling preventive BP treatment and patient empowerment) before deciding.',
      options: [
        { label: 'No screening — defer until legal age of majority', set: { screen: 'none' }, next: 'CK-ADPKD-02' },
        { label: 'Regular clinical screening (BP + urine annually, defer imaging/genetics)', set: { screen: 'clinical' }, next: 'CK-ADPKD-03' },
        { label: 'Immediate diagnostic testing (ultrasound ± genetics)', set: { screen: 'immediate' }, next: 'CK-ADPKD-DX' },
      ],
    },
    'CK-ADPKD-02': {
      id: 'CK-ADPKD-02', type: 'TERMINAL', source: X,
      action: 'No screening chosen — document the informed parental decision. The family/adolescent is responsible for informing the young person once they reach legal age of majority so they can pursue diagnostic testing (ultrasound/genetics) and clinical screening (BP, proteinuria) if they wish. Revisit the discussion at each routine visit.',
    },
    'CK-ADPKD-03': {
      id: 'CK-ADPKD-03', type: 'ACTION', source: B,
      action: 'Regular clinical screening WITHOUT imaging/genetics: annual BP measurement (24h ABPM preferred once ≥5 years old) and annual urine protein/albumin-to-creatinine ratio. This detects the disease manifestations that matter (hypertension, proteinuria) while deferring definitive imaging/genetic diagnosis to a later, family-chosen time point.',
      next: 'CK-ADPKD-MONITOR',
    },
    'CK-ADPKD-DX': {
      id: 'CK-ADPKD-DX', type: 'ACTION', source: B,
      action: 'Ultrasound remains the gold-standard first test. Age-based ultrasonographic diagnostic criteria for at-risk individuals: <15 years + positive family history — even 1 or more renal cyst(s) is highly suggestive; fetus/neonate — hyperechogenic or enlarged (>2SD) kidneys is highly suggestive. 15–39 years — ≥3 cysts (unilateral or bilateral). 30–59 years — ≥2 cysts in each kidney. ≥60 years — ≥4 cysts in each kidney (and <2 cysts at ≥40y is sufficient to EXCLUDE disease). If ultrasound is negative in a child <15y, rescreen at 3-year intervals. A solitary cyst warrants follow-up imaging (do not mistake a dilated calyx/prominent medullary pyramid for a cyst). Multiple cysts WITHOUT family history → work up for other cystic renal diseases including parental renal ultrasound. MRI is more sensitive but is NOT the diagnostic method of choice under 15y (requires sedation) and has no validated diagnostic thresholds <15y. Genetic testing (PKD1, PKD2 ± GANAB, DNAJB11) is indicated for very-early-onset/rapidly progressive disease or unusual genetic constellations (biallelic hypomorphic alleles, digenic ADPKD + another cystic-nephropathy allele).',
      next: 'CK-ADPKD-MONITOR',
    },

    // Renal monitoring — age-banded targets
    'CK-ADPKD-MONITOR': {
      id: 'CK-ADPKD-MONITOR', type: 'ACTION', source: B,
      action: 'ADPKD renal monitoring & AGE-BANDED TARGETS for titration once diagnosed/screened: Blood pressure — monitor in ALL at-risk/diagnosed children at least once yearly; preferred method is 24h ambulatory BP monitoring (ABPM) from age >5 years (masked hypertension is common — up to 41% in cohort data — so clinic BP alone under-detects). Start antihypertensive treatment (ACEi/ARB first-line) if BP >p90 for age/sex/height, or a fixed >130/85 mmHg from age 16+. Target BP <p75 for age or <125/72 mmHg (age 16+); a lower target of <p50 or <120/70 mmHg (age 16+) may be additionally beneficial for slowing progression. Proteinuria — measure (not dipstick) at least annually; prevalence ~20% in childhood ADPKD and is both a therapeutic target and a prognostic marker; if present, start ACEi or ARB as first-line therapy regardless of BP. Renal cyst growth by ultrasound — monitoring is NOT meaningful more than once every 3 years (or sooner only if new symptoms), since total kidney volume grows too slowly in most children to guide decisions more frequently.',
      monitoring: [
        { parameter: 'Blood pressure (24h ABPM preferred, age >5y)', frequency: 'Annually (all at-risk/diagnosed)', target: '<p75 for age or <125/72 mmHg (16+); <p50/<120/70 may be additionally beneficial', alert: 'BP >p90 for age or >130/85 mmHg (16+)', alert_action: 'Start ACEi/ARB first-line; reduce dietary salt' },
        { parameter: 'Urine protein/albumin-creatinine ratio', frequency: 'Annually', target: 'Normal for age', alert: 'Proteinuria present', alert_action: 'Start ACEi/ARB' },
        { parameter: 'Renal ultrasound (cyst number/kidney volume)', frequency: 'Every 3 years (or if new symptoms)', target: 'No rapid volume increase', alert: 'Rapid growth, new pain/hematuria', alert_action: 'Escalate imaging, consider MRI/htTKV in eligible age groups' },
      ],
      next: 'CK-ADPKD-LIFESTYLE',
    },
    'CK-ADPKD-LIFESTYLE': {
      id: 'CK-ADPKD-LIFESTYLE', type: 'ACTION', source: C,
      action: 'Lifestyle measures (no paediatric RCTs — extrapolated from general paediatrics/adult CKD/adult ADPKD data): maintain normal BMI (obesity is a risk factor for progression); low dietary salt intake (potentiates antihypertensive efficacy); HIGH water intake to suppress endogenous vasopressin production (vasopressin/cAMP signalling drives cyst growth); avoid excessive protein intake. CAUTION: avoid NSAIDs, especially during reduced hydration (nephrotoxic risk is amplified in ADPKD). In case of nocturnal enuresis, AVOID vasopressin analogues (desmopressin) — they work by the exact mechanism (V2R/cAMP) that drives cystogenesis.',
      next: 'CK-ADPKD-DISEASE-SPECIFIC',
    },
    'CK-ADPKD-DISEASE-SPECIFIC': {
      id: 'CK-ADPKD-DISEASE-SPECIFIC', type: 'ACTION', source: C, prescribes: 'tolvaptan',
      action: 'Disease-specific therapy consensus for children: tolvaptan (vasopressin V2-receptor antagonist) may be used OFF-LABEL for selected rapidly-progressing paediatric cases (an ongoing phase IIIb trial is evaluating safety/efficacy in ages 4–17); requires close monitoring for aquaresis, hypernatraemia, and hepatotoxicity (LFTs at baseline, monthly ×18 months, then periodically). Statins (e.g. pravastatin) — no consensus reached in children; a phase III paediatric RCT (ages 8–22) showed reduced height-adjusted total kidney volume growth but NO effect on eGFR. mTOR inhibitors and somatostatin analogues are NOT recommended (no benefit shown, consensus explicitly against use).',
      next: 'CK-ADPKD-EXTRARENAL',
    },
    'CK-ADPKD-EXTRARENAL': {
      id: 'CK-ADPKD-EXTRARENAL', type: 'ACTION', source: C,
      action: 'Extra-renal surveillance in childhood ADPKD (screen selectively, not universally): Liver cysts — rare and asymptomatic in children (<5%, no severe cases reported); avoid exogenous oestrogens (oral contraceptives can accelerate hepatic cyst growth); no routine screening needed. Mitral valve prolapse (~12% in children) — screen ONLY if a heart murmur is found on exam. Intracranial aneurysm — exceptional in children; screen ONLY if there are neurological symptoms, a strong family history of aneurysm rupture, or when psychologically indicated (e.g. severe parental anxiety) — NOT as routine practice. Abdominal/back pain (10–20%) — investigate proportionate to intensity/associated symptoms; avoid chronic or high-dose NSAIDs. Hematuria (5–15%) and rare complications (cyst haemorrhage, upper UTI 15–25%, renal stones) are managed with standard paediatric protocols.',
      next: 'CK-ADPKD-PSYCHOSOCIAL',
    },
    'CK-ADPKD-PSYCHOSOCIAL': {
      id: 'CK-ADPKD-PSYCHOSOCIAL', type: 'TERMINAL', source: X,
      action: 'Psychosocial support: help parents discuss the possibility of inheritance with their children in age-appropriate, positive-framed language; reinforce that ADPKD is a manageable, late-progressing disease with effective interventions (BP control, ACEi/ARB for proteinuria) that meaningfully slow progression. Encourage patient empowerment rather than fear. Direct families to global registries/resources: ADPedKD (adpedkd.org) and the ADPKD Route Map (pkdinternational.org) for longitudinal data collection and patient information.',
    },

    // ── ARPKD branch ─────────────────────────────────────────────────────────
    'CK-ARPKD-01': {
      id: 'CK-ARPKD-01', type: 'ACTION', source: B,
      action: 'ARPKD (PKHD1, occasionally DZIP1L) — key distinguishing features from ADPKD: neonatal (early) massive bilateral nephromegaly with medullary-predominant microcysts, early hypertension, marked concentrating defect, oligohydramnios if severe (often lethal <28 weeks gestation), and congenital hepatic fibrosis that is ALWAYS present (vs. ADPKD liver cysts, which are rare in childhood). >300 PKHD1 mutations described with only weak genotype–phenotype correlation — expression can be highly variable even within the same family, so imaging siblings into adulthood (± genetic testing) is appropriate rather than assuming a mild sibling phenotype.',
      next: 'CK-ARPKD-RENAL',
    },
    'CK-ARPKD-RENAL': {
      id: 'CK-ARPKD-RENAL', type: 'ACTION', source: B,
      action: 'ARPKD renal trajectory & AGE-BANDED monitoring: neonatal period — >60% of neonates with pulmonary hypoplasia survive; ~25% require postnatal dialysis; hypertension is frequently severe and requires aggressive early treatment (ACEi/ARB, often multi-drug). By 10 years of age, ~60% require renal replacement therapy. Because progression is fast and early, monitor renal function and BP MORE frequently than in ADPKD.',
      monitoring: [
        { parameter: 'Blood pressure', frequency: 'Weekly–monthly in infancy; every 1–3 months in childhood', target: 'Age-appropriate normal (treat aggressively — often needs multiple agents)', alert: 'Hypertension refractory to single agent', alert_action: 'Escalate to combination antihypertensives; nephrology review' },
        { parameter: 'Creatinine / eGFR', frequency: 'Every 1–3 months (more often in infancy/if declining)', target: 'Stable for age', alert: 'Rapid eGFR decline', alert_action: 'RRT planning (dialysis access, transplant work-up)' },
        { parameter: 'Electrolytes (Na, K, HCO3)', frequency: 'With each renal function check', target: 'Normal for age', alert: 'Salt-wasting or acidosis', alert_action: 'Sodium supplementation, bicarbonate correction' },
      ],
      next: 'CK-ARPKD-HEPATIC',
    },
    'CK-ARPKD-HEPATIC': {
      id: 'CK-ARPKD-HEPATIC', type: 'ACTION', source: B,
      action: 'ARPKD hepatic surveillance: congenital hepatic fibrosis is universal; cholangiodysplasia is common; a Caroli phenotype (dilated intrahepatic bile ducts) is seen in up to 80% of those with perinatal manifestations. Recurrent cholangitis and progressive cirrhosis/portal hypertension may require liver transplantation in up to 10% of patients. Monitor liver function tests, spleen size (portal hypertension marker), and screen for oesophageal varices in those with splenomegaly or thrombocytopenia.',
      monitoring: [
        { parameter: 'Liver function tests + spleen size (US)', frequency: 'Every 6–12 months', target: 'No progression of portal hypertension signs', alert: 'Splenomegaly, thrombocytopenia, varices', alert_action: 'Hepatology referral, endoscopic variceal screening' },
      ],
      next: 'TERM-ARPKD',
    },
    'TERM-ARPKD': {
      id: 'TERM-ARPKD', type: 'TERMINAL', source: B,
      action: 'ARPKD management plan established — coordinate combined nephrology + hepatology follow-up given the near-universal hepatic involvement. Growth failure is common — apply the CKD Growth Failure engine in parallel. Genetic counselling: recurrence risk 25% for future siblings (autosomal recessive); PKHD1 sequencing available for confirmation and prenatal counselling.',
    },

    // ── Nephronophthisis / ciliopathy branch ─────────────────────────────────
    'CK-NPHP-01': {
      id: 'CK-NPHP-01', type: 'ACTION', source: B,
      action: 'Nephronophthisis (NPHP1–NPHP20 and related ciliopathy genes) presents very differently from PKD: normal or SMALL kidneys (not enlarged), a severe urinary concentrating defect causing early polyuria/polydipsia and secondary enuresis, growth failure, and anaemia that is often disproportionate to the degree of renal impairment. Kidneys show corticomedullary cysts with loss of the normal corticomedullary differentiation on ultrasound — very different from the peripheral cortical cysts of ADPKD. Progresses to ESKD at a median age of ~13 years for the juvenile form (infantile and adolescent forms exist with different tempo). Because it is autosomal recessive with no family history in most cases, it is frequently mistaken initially for isolated growth failure or diabetes insipidus.',
      next: 'CK-NPHP-WORKUP',
    },
    'CK-NPHP-WORKUP': {
      id: 'CK-NPHP-WORKUP', type: 'ACTION', source: B,
      action: 'Work-up: renal ultrasound (normal/small kidneys, ↑echogenicity, loss of corticomedullary differentiation ± corticomedullary cysts), genetic multigene panel (NPHP1 most common — often a homozygous deletion; also NPHP2/INVS, NPHP3, NEK8, ANKS6 and other ciliopathy genes), and screen for extra-renal ciliopathy features: Senior-Løken syndrome (retinitis pigmentosa — refer for electroretinogram/ophthalmology), Joubert syndrome (cerebellar vermis hypoplasia — "molar tooth sign" on MRI), and hepatic fibrosis.',
      monitoring: [
        { parameter: 'eGFR / creatinine', frequency: 'Every 3–6 months', target: 'Stable trajectory tracked against expected ESKD age', alert: 'Accelerating decline', alert_action: 'RRT/transplant planning' },
        { parameter: 'Electrolytes (salt-wasting screen)', frequency: 'Every 3–6 months', target: 'Normal for age', alert: 'Hyponatraemia/volume depletion', alert_action: 'Sodium supplementation, liberalise fluid/salt intake' },
        { parameter: 'Ophthalmology exam (retinitis pigmentosa screen)', frequency: 'Annually', target: 'No visual field loss', alert: 'Retinal changes', alert_action: 'Confirms Senior-Løken; refer paediatric ophthalmology' },
      ],
      next: 'TERM-NPHP',
    },
    'TERM-NPHP': {
      id: 'TERM-NPHP', type: 'TERMINAL', source: B,
      action: 'Nephronophthisis management plan established — this is a CKD-progression disease from diagnosis; apply the CKD Engine, CKD-MBD Engine, and CKD Growth Failure Engine in parallel for staged monitoring as eGFR declines. Genetic counselling: autosomal recessive, 25% recurrence risk for siblings.',
    },

    // ── HNF1B/ADTKD branch ────────────────────────────────────────────────────
    'CK-HNF1B-01': {
      id: 'CK-HNF1B-01', type: 'ACTION', source: C,
      action: 'HNF1B-related disease (TCF2 gene) — autosomal dominant, but FREQUENT de novo mutation (so absence of family history does not exclude it). The most common radiological finding is hyperechogenic kidneys of NORMAL SIZE or only mildly enlarged (<3 SD) — small cortical cysts may appear postnatally. Other presentations include unilateral MCDK, unilateral or bilateral renal agenesis, and renal hypoplasia. Extra-renal: MODY5 diabetes typically manifests in adulthood — screen fasting glucose/HbA1c periodically from adolescence; genital tract anomalies and hypomagnesaemia can occur.',
      monitoring: [
        { parameter: 'Fasting glucose / HbA1c', frequency: 'Annually from adolescence', target: 'Normal', alert: 'Impaired fasting glucose', alert_action: 'Endocrinology referral (MODY5 evaluation)' },
        { parameter: 'Magnesium', frequency: 'Annually', target: 'Normal', alert: 'Hypomagnesaemia', alert_action: 'Oral magnesium supplementation' },
      ],
      next: 'TERM-HNF1B',
    },
    'TERM-HNF1B': {
      id: 'TERM-HNF1B', type: 'TERMINAL', source: C,
      action: 'HNF1B/ADTKD management plan established — monitor renal function per CKD stage, screen for MODY5 diabetes from adolescence, and offer genetic counselling (autosomal dominant, but consider de novo origin if no family history).',
    },

    // ── MCDK / cystic dysplasia branch ───────────────────────────────────────
    'CK-MCDK-01': {
      id: 'CK-MCDK-01', type: 'ACTION', source: C,
      action: 'Multicystic dysplastic kidney (MCDK) / cystic dysplasia are CAKUT — non-genetic, sporadic, usually UNILATERAL, non-communicating cystic replacement of the kidney with no function on the affected side. Most involute spontaneously over years. Management: confirm the contralateral kidney is normal (compensatory hypertrophy expected), screen for VUR/CAKUT in the contralateral kidney (~potential for associated anomalies), monitor blood pressure (rare association with hypertension), and periodic ultrasound to confirm involution — nephrectomy is reserved for symptomatic cases (infection, hypertension, mass effect) or a kidney that fails to involute with uncertain malignant potential.',
      next: 'TERM-MCDK',
    },
    'TERM-MCDK': {
      id: 'TERM-MCDK', type: 'TERMINAL', source: C,
      action: 'MCDK/cystic dysplasia plan established — annual BP and renal function of the solitary functioning kidney, periodic ultrasound until involution confirmed, no genetic counselling implications (non-heritable CAKUT in the vast majority of isolated cases).',
    },

    // ── Simple cyst branch ────────────────────────────────────────────────────
    'CK-SIMPLE-01': {
      id: 'CK-SIMPLE-01', type: 'ACTION', source: X,
      action: 'Isolated simple cysts are RARE in young children (prevalence rises sharply with age: <1% at 0–20y, climbing to >30% by >70y) — so a solitary cyst found in a child should prompt confirmation it is truly a simple cyst and not a dilated calyx or prominent medullary pyramid, and should raise the threshold for asking about family history again. If truly solitary with no family history and no other findings: follow-up imaging at a routine interval is sufficient; no genetic testing needed. If MULTIPLE cysts are found with a NEGATIVE family history, escalate to a full cystic-nephropathy work-up including parental renal ultrasound (return to CK-DIFF-01).',
      next: 'TERM-SIMPLE',
    },
    'TERM-SIMPLE': {
      id: 'TERM-SIMPLE', type: 'TERMINAL', source: X,
      action: 'Isolated simple cyst — routine follow-up imaging only; no further intervention needed unless the cyst enlarges rapidly, becomes symptomatic, or additional cysts appear on follow-up (in which case restart the differential diagnosis framework).',
    },
  },
};

// Hub-ready engine record
export const CKD_CYSTIC_ENGINE = {
  id: 'cystic-kidney-disease-engine',
  label: 'Approach to Cystic Kidney Disease Engine',
  desc: 'Differential diagnosis framework (ARPKD vs ADPKD vs NPHP vs HNF1B/ADTKD vs MCDK vs simple cyst) · ADPKD age-based US criteria & BP/proteinuria targets · ARPKD neonatal/hepatic surveillance · NPHP work-up · lifestyle & disease-specific therapy',
  group: 'CKD & Genetics',
  builtin: true,
  guideline_source: CKD_CYSTIC_GUIDELINE,
  ciee_sources: CKD_CYSTIC_SOURCES,
  ciee_pathway: CKD_CYSTIC_PATHWAY,
};