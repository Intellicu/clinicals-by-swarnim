/**
 * CLINICAL INTELLIGENCE EXECUTION ENGINE (CIEE)
 * 7-Component Architecture per patent specification
 * Components: GuidelineSource, DecisionNode, PatientContextLayer,
 *             PathwayExecutionEngine, MonitoringRuleGenerator,
 *             PrescriptionSuppressor, TraceabilityLinker
 *
 * SRNS 21-node exemplar pathway (ISPN 2021)
 */

// ── Component 1: GuidelineSource Repository ───────────────────────────────
export const GUIDELINE_SOURCES = {
  'GS-ISPN-2021-SRNS': {
    guideline_name: 'ISPN Clinical Practice Recommendations for SRNS',
    guideline_section: '3.1–3.8',
    evidence_grade: '1B',
    recommendation_strength: 'Recommendation',
    issuing_body: 'International Society for Pediatric Nephrology',
    year: 2021,
    doi: '10.1007/s00467-020-04861-4',
    pmid: '33484378',
  },
  'GS-IPNA-2021-NS': {
    guideline_name: 'IPNA Clinical Practice Recommendations — Idiopathic Nephrotic Syndrome',
    guideline_section: '4.1–4.6',
    evidence_grade: '1B',
    recommendation_strength: 'Recommendation',
    issuing_body: 'International Pediatric Nephrology Association',
    year: 2021,
    doi: '10.1007/s00467-020-04774-2',
    pmid: '33184696',
  },
  'GS-KDIGO-2021-GD': {
    guideline_name: 'KDIGO 2021 Clinical Practice Guideline for Glomerular Diseases',
    guideline_section: '5.1–5.4',
    evidence_grade: '2B',
    recommendation_strength: 'Suggestion',
    issuing_body: 'KDIGO',
    year: 2021,
    doi: '10.1016/j.kint.2021.05.021',
    pmid: '34556256',
  },
  'GS-ISPN-2021-GENETICS': {
    guideline_name: 'ISPN Genetic Testing Recommendations in Paediatric NS',
    guideline_section: '2.3',
    evidence_grade: '2C',
    recommendation_strength: 'Suggestion',
    issuing_body: 'International Society for Pediatric Nephrology',
    year: 2021,
    doi: '10.1007/s00467-020-04861-4',
    pmid: '33484378',
  },
  'GS-TDM-CNI': {
    guideline_name: 'ISPN TDM Recommendations — Tacrolimus in Paediatric NS',
    guideline_section: '3.4',
    evidence_grade: '1B',
    recommendation_strength: 'Recommendation',
    issuing_body: 'International Society for Pediatric Nephrology',
    year: 2021,
    doi: '10.1007/s00467-020-04861-4',
    pmid: '33484378',
  },
};

// ── Component 2: DecisionNode Processor — SRNS 21-node pathway ───────────
export const SRNS_DECISION_NODES = {
  'DN-01': { node_id: 'DN-01', node_type: 'QUESTION', clinical_question: 'Has the patient failed 8 weeks of standard prednisolone therapy?', is_critical_branch: true, guideline_source_id: 'GS-ISPN-2021-SRNS', disease: 'NS', phase: 'diagnosis' },
  'DN-02': { node_id: 'DN-02', node_type: 'ASSESSMENT', clinical_question: 'Patient age at onset?', is_critical_branch: false, guideline_source_id: 'GS-ISPN-2021-SRNS', disease: 'NS', phase: 'diagnosis' },
  'DN-03': { node_id: 'DN-03', node_type: 'ACTION', clinical_question: 'Order genetic panel: NPHS1, NPHS2, WT1, LAMB2, PLCE1, TRPC6, INF2', is_critical_branch: true, guideline_source_id: 'GS-ISPN-2021-GENETICS', disease: 'NS', phase: 'workup' },
  'DN-04': { node_id: 'DN-04', node_type: 'ACTION', clinical_question: 'Order renal biopsy', is_critical_branch: true, guideline_source_id: 'GS-ISPN-2021-SRNS', disease: 'NS', phase: 'workup' },
  'DN-05': { node_id: 'DN-05', node_type: 'QUESTION', clinical_question: 'Is genetic variant PATHOGENIC or LIKELY PATHOGENIC?', is_critical_branch: true, guideline_source_id: 'GS-ISPN-2021-GENETICS', disease: 'NS', phase: 'workup' },
  'DN-06': { node_id: 'DN-06', node_type: 'ASSESSMENT', clinical_question: 'Biopsy histology result?', is_critical_branch: false, guideline_source_id: 'GS-ISPN-2021-SRNS', disease: 'NS', phase: 'workup' },
  'DN-07': { node_id: 'DN-07', node_type: 'ACTION', clinical_question: 'GENETIC SRNS — CNI CONTRAINDICATED. Offer supportive care, renin-angiotensin blockade, genetic counselling', is_critical_branch: true, guideline_source_id: 'GS-ISPN-2021-GENETICS', disease: 'NS', phase: 'treatment' },
  'DN-08': { node_id: 'DN-08', node_type: 'QUESTION', clinical_question: 'Biopsy histology: FSGS?', is_critical_branch: false, guideline_source_id: 'GS-ISPN-2021-SRNS', disease: 'NS', phase: 'treatment' },
  'DN-09': { node_id: 'DN-09', node_type: 'ACTION', clinical_question: 'Initiate Tacrolimus 0.1–0.2 mg/kg/day (target trough 5–10 ng/mL) + low-dose prednisolone', is_critical_branch: false, guideline_source_id: 'GS-ISPN-2021-SRNS', disease: 'NS', phase: 'treatment' },
  'DN-10': { node_id: 'DN-10', node_type: 'ACTION', clinical_question: 'Initiate Cyclosporine 4–5 mg/kg/day (target trough 100–200 ng/mL) + low-dose prednisolone', is_critical_branch: false, guideline_source_id: 'GS-KDIGO-2021-GD', disease: 'NS', phase: 'treatment' },
  'DN-11': { node_id: 'DN-11', node_type: 'MONITORING', clinical_question: 'Tacrolimus TDM — check trough at Week 2', is_critical_branch: true, guideline_source_id: 'GS-TDM-CNI', disease: 'NS', phase: 'monitoring' },
  'DN-12': { node_id: 'DN-12', node_type: 'QUESTION', clinical_question: 'Tacrolimus trough within target range 4–8 ng/mL (maintenance)?', is_critical_branch: true, guideline_source_id: 'GS-TDM-CNI', disease: 'NS', phase: 'monitoring' },
  'DN-13': { node_id: 'DN-13', node_type: 'ACTION', clinical_question: 'Adjust Tacrolimus dose — recheck trough in 1 week', is_critical_branch: false, guideline_source_id: 'GS-TDM-CNI', disease: 'NS', phase: 'monitoring' },
  'DN-14': { node_id: 'DN-14', node_type: 'ASSESSMENT', clinical_question: 'Assess CNI response at 6 months — proteinuria remission?', is_critical_branch: true, guideline_source_id: 'GS-ISPN-2021-SRNS', disease: 'NS', phase: 'response' },
  'DN-15': { node_id: 'DN-15', node_type: 'ACTION', clinical_question: 'CNI FAILURE — switch to Rituximab 375 mg/m² × 4 doses', is_critical_branch: true, guideline_source_id: 'GS-ISPN-2021-SRNS', disease: 'NS', phase: 'escalation' },
  'DN-16': { node_id: 'DN-16', node_type: 'ACTION', clinical_question: 'Add ACE-I (enalapril 0.1–0.5 mg/kg/day) for anti-proteinuric effect', is_critical_branch: false, guideline_source_id: 'GS-IPNA-2021-NS', disease: 'NS', phase: 'treatment' },
  'DN-17': { node_id: 'DN-17', node_type: 'ASSESSMENT', clinical_question: 'Dialysis status?', is_critical_branch: true, guideline_source_id: 'GS-ISPN-2021-SRNS', disease: 'NS', phase: 'assessment' },
  'DN-18': { node_id: 'DN-18', node_type: 'ACTION', clinical_question: 'ESRD — prepare for renal replacement therapy / transplant evaluation', is_critical_branch: true, guideline_source_id: 'GS-ISPN-2021-SRNS', disease: 'NS', phase: 'escalation' },
  'DN-19': { node_id: 'DN-19', node_type: 'ACTION', clinical_question: 'Continue CNI + ACE-I maintenance — clinic every 3 months', is_critical_branch: false, guideline_source_id: 'GS-ISPN-2021-SRNS', disease: 'NS', phase: 'maintenance' },
  'DN-20': { node_id: 'DN-20', node_type: 'MONITORING', clinical_question: 'UPCR monthly + eGFR quarterly + TDM per schedule', is_critical_branch: false, guideline_source_id: 'GS-ISPN-2021-SRNS', disease: 'NS', phase: 'monitoring' },
  'DN-21': { node_id: 'DN-21', node_type: 'TERMINAL', clinical_question: 'Pathway complete — outcomes logged', is_critical_branch: false, guideline_source_id: 'GS-ISPN-2021-SRNS', disease: 'NS', phase: 'terminal' },
};

// ── Component 3: PatientContextLayer ────────────────────────────────────────
export function buildContextVector({
  age_months, weight_kg, height_cm, bsa, egfr,
  creatinine_mg_dL,
  genetic_variant_status, genetic_gene, acmg_class,
  biopsy_histology,
  resistance_type, prior_cni_response,
  dialysis_status, comorbidities,
}) {
  const ctx = {
    age_months: age_months ?? null,
    weight_kg: weight_kg ?? null,
    height_cm: height_cm ?? null,
    bsa: bsa ?? null,
    egfr: egfr ?? null,
    genetic_variant_status: genetic_variant_status ?? 'UNKNOWN',
    genetic_gene: genetic_gene ?? null,
    acmg_class: acmg_class ?? null,
    biopsy_histology: biopsy_histology ?? null,
    resistance_type: resistance_type ?? null,
    prior_cni_response: prior_cni_response ?? null,
    dialysis_status: dialysis_status ?? false,
    comorbidities: comorbidities ?? [],
  };

  // Schwartz GFR fallback
  if (!ctx.egfr && ctx.height_cm && creatinine_mg_dL) {
    ctx.egfr = (0.413 * ctx.height_cm) / creatinine_mg_dL;
    ctx.egfr_source = 'schwartz_calculated';
  }

  return ctx;
}

// ── Component 5: PrescriptionSuppressor ─────────────────────────────────────
const CNI_DRUGS = ['tacrolimus', 'cyclosporine', 'ciclosporin', 'calcineurin inhibitor', 'cni', 'prograf', 'neoral', 'sandimmun'];

export function checkPrescriptionSuppressor(drugName, context) {
  const drug = (drugName || '').toLowerCase();
  const isCNI = CNI_DRUGS.some(d => drug.includes(d));

  const acmg = (context.acmg_class || '').toLowerCase();
  const isPathogenic = acmg === 'pathogenic' || acmg === 'likely pathogenic' ||
    context.genetic_variant_status === 'PATHOGENIC';

  if (isCNI && isPathogenic) {
    return {
      suppressed: true,
      rule: 'PrescriptionSuppressor-R1',
      reason: `CNI (${drugName}) contraindicated: genetic_variant_status = PATHOGENIC (${context.genetic_gene || 'gene'} ${context.acmg_class}). Genetic SRNS does not respond to CNI therapy (ISPN 2021 §3.5, Evidence Grade 2C).`,
      guideline_source_id: 'GS-ISPN-2021-GENETICS',
      evidence_grade: '2C',
      suppression_event: {
        ts: new Date().toISOString(),
        drug: drugName,
        acmg_class: context.acmg_class,
        gene: context.genetic_gene,
        rule_id: 'PrescriptionSuppressor-R1',
      },
    };
  }

  return { suppressed: false };
}

// ── Component 6: TraceabilityLinker ─────────────────────────────────────────
export function buildTraceabilityLink(guidelineSourceId, additionalMeta = {}) {
  const gs = GUIDELINE_SOURCES[guidelineSourceId];
  if (!gs) return { guideline_source_id: guidelineSourceId, ...additionalMeta };
  return {
    guideline_source_id: guidelineSourceId,
    guideline_name: gs.guideline_name,
    guideline_section: gs.guideline_section,
    evidence_grade: gs.evidence_grade,
    recommendation_strength: gs.recommendation_strength,
    issuing_body: gs.issuing_body,
    year: gs.year,
    doi: gs.doi,
    pmid: gs.pmid,
    ...additionalMeta,
  };
}

// ── Component 7: MonitoringRuleGenerator ─────────────────────────────────────
export const MONITORING_RULES = {
  'MR-TAC-TDM-W2': {
    rule_id: 'MR-TAC-TDM-W2',
    drug_name: 'Tacrolimus',
    monitoring_parameter: 'Trough blood level (C0)',
    frequency: 'Week 2 after initiation, then monthly',
    target_value: '4–8 ng/mL (maintenance); 5–10 ng/mL (induction)',
    alert_condition: 'Trough <4 ng/mL OR >10 ng/mL',
    alert_action: 'Adjust dose; repeat level in 7 days',
    guideline_source_id: 'GS-TDM-CNI',
  },
  'MR-UPCR-MONTHLY': {
    rule_id: 'MR-UPCR-MONTHLY',
    drug_name: null,
    monitoring_parameter: 'Urine Protein:Creatinine Ratio (UPCR)',
    frequency: 'Monthly',
    target_value: 'UPCR <200 mg/g = remission',
    alert_condition: 'UPCR >2000 mg/g',
    alert_action: 'Flag relapse — review pathway',
    guideline_source_id: 'GS-ISPN-2021-SRNS',
  },
  'MR-EGFR-QUARTERLY': {
    rule_id: 'MR-EGFR-QUARTERLY',
    drug_name: null,
    monitoring_parameter: 'eGFR (Schwartz or CKD-EPI)',
    frequency: 'Every 3 months',
    target_value: '>60 mL/min/1.73m²',
    alert_condition: 'eGFR <30 mL/min/1.73m²',
    alert_action: 'Escalate to renal replacement planning',
    guideline_source_id: 'GS-ISPN-2021-SRNS',
  },
  'MR-CRE-CNI': {
    rule_id: 'MR-CRE-CNI',
    drug_name: 'Cyclosporine / Tacrolimus',
    monitoring_parameter: 'Serum creatinine',
    frequency: 'Monthly on CNI',
    target_value: 'Baseline or <20% rise from pre-CNI',
    alert_condition: 'Creatinine rise >20% above pre-CNI baseline',
    alert_action: 'Reduce CNI dose; assess nephrotoxicity',
    guideline_source_id: 'GS-TDM-CNI',
  },
};

export function generateMonitoringRules(drugs = [], context = {}) {
  const rules = [];
  const drugList = drugs.map(d => d.toLowerCase());

  if (drugList.some(d => d.includes('tacrolimus') || d.includes('cyclosporine') || d.includes('cni'))) {
    rules.push(buildTraceabilityLink(MONITORING_RULES['MR-TAC-TDM-W2'].guideline_source_id, MONITORING_RULES['MR-TAC-TDM-W2']));
    rules.push(buildTraceabilityLink(MONITORING_RULES['MR-CRE-CNI'].guideline_source_id, MONITORING_RULES['MR-CRE-CNI']));
  }
  rules.push(buildTraceabilityLink(MONITORING_RULES['MR-UPCR-MONTHLY'].guideline_source_id, MONITORING_RULES['MR-UPCR-MONTHLY']));
  rules.push(buildTraceabilityLink(MONITORING_RULES['MR-EGFR-QUARTERLY'].guideline_source_id, MONITORING_RULES['MR-EGFR-QUARTERLY']));

  return rules;
}

// ── Component 4: PathwayExecutionEngine ─────────────────────────────────────
const SRNS_BRANCHES = {
  'DN-01': (ctx) => ctx.dialysis_status ? 'DN-17' : 'DN-02',
  'DN-02': (ctx) => (ctx.age_months !== null && ctx.age_months < 12) ? 'DN-03' : 'DN-03',
  'DN-03': () => 'DN-04',
  'DN-04': () => 'DN-05',
  'DN-05': (ctx) => {
    const pathogenic = ctx.acmg_class === 'Pathogenic' || ctx.acmg_class === 'Likely Pathogenic' || ctx.genetic_variant_status === 'PATHOGENIC';
    return pathogenic ? 'DN-07' : 'DN-06';
  },
  'DN-06': (ctx) => {
    const histology = (ctx.biopsy_histology || '').toUpperCase();
    return histology.includes('FSGS') ? 'DN-08' : 'DN-10';
  },
  'DN-07': () => 'DN-16',
  'DN-08': () => 'DN-09',
  'DN-09': () => 'DN-11',
  'DN-10': () => 'DN-11',
  'DN-11': () => 'DN-12',
  'DN-12': (ctx) => ctx.tdm_in_range ? 'DN-14' : 'DN-13',
  'DN-13': () => 'DN-12',
  'DN-14': (ctx) => ctx.prior_cni_response === 'FAILURE' ? 'DN-15' : 'DN-19',
  'DN-15': () => 'DN-20',
  'DN-16': () => 'DN-20',
  'DN-17': () => 'DN-18',
  'DN-18': () => 'DN-21',
  'DN-19': () => 'DN-20',
  'DN-20': () => 'DN-21',
  'DN-21': () => null,
};

export function executeSRNSPathway(patientContextInput) {
  const ctx = buildContextVector(patientContextInput);
  const pathway_output = [];
  const monitoring_rules = [];
  const suppression_log = [];
  const traceability_metadata = [];
  const evaluation_log = [];

  let current_node_id = 'DN-01';
  const MAX_STEPS = 30;
  let steps = 0;

  while (current_node_id && steps < MAX_STEPS) {
    steps++;
    const node = SRNS_DECISION_NODES[current_node_id];
    if (!node) break;

    // Log evaluation for critical branches
    if (node.is_critical_branch) {
      evaluation_log.push({
        node_id: current_node_id,
        clinical_question: node.clinical_question,
        node_type: node.node_type,
        context_snapshot: { acmg_class: ctx.acmg_class, genetic_variant_status: ctx.genetic_variant_status, biopsy_histology: ctx.biopsy_histology, dialysis_status: ctx.dialysis_status },
      });
    }

    // TraceabilityLinker for this node
    const trace = buildTraceabilityLink(node.guideline_source_id, { node_id: current_node_id, node_type: node.node_type });
    traceability_metadata.push(trace);

    // Handle PRESCRIPTION nodes — check PrescriptionSuppressor
    if (node.node_type === 'ACTION' && node.clinical_question.toLowerCase().includes('tacrolimus')) {
      const suppCheck = checkPrescriptionSuppressor('tacrolimus', ctx);
      if (suppCheck.suppressed) {
        suppression_log.push(suppCheck.suppression_event);
        pathway_output.push({ node_id: current_node_id, type: 'SUPPRESSED', action: `[SUPPRESSED] ${node.clinical_question}`, reason: suppCheck.reason, trace });
        current_node_id = 'DN-16'; // redirect to ACE-I + supportive care
        continue;
      }
      monitoring_rules.push(...generateMonitoringRules(['tacrolimus'], ctx));
    }

    if (node.node_type === 'ACTION' && node.clinical_question.toLowerCase().includes('cyclosporine')) {
      const suppCheck = checkPrescriptionSuppressor('cyclosporine', ctx);
      if (suppCheck.suppressed) {
        suppression_log.push(suppCheck.suppression_event);
        pathway_output.push({ node_id: current_node_id, type: 'SUPPRESSED', action: `[SUPPRESSED] ${node.clinical_question}`, reason: suppCheck.reason, trace });
        current_node_id = 'DN-16';
        continue;
      }
      monitoring_rules.push(...generateMonitoringRules(['cyclosporine'], ctx));
    }

    pathway_output.push({ node_id: current_node_id, type: node.node_type, action: node.clinical_question, trace });

    if (node.node_type === 'TERMINAL') break;

    const branch_fn = SRNS_BRANCHES[current_node_id];
    current_node_id = branch_fn ? branch_fn(ctx) : null;
  }

  return {
    pathway_id: 'SRNS-ISPN-2021',
    pathway_name: 'SRNS Management Pathway (ISPN 2021)',
    context_vector: ctx,
    pathway_output,
    monitoring_rules: [...new Map(monitoring_rules.map(r => [r.rule_id, r])).values()],
    suppression_log,
    traceability_metadata,
    evaluation_log,
    entry_node: 'DN-01',
    completed: pathway_output.some(o => o.node_id === 'DN-21'),
  };
}
