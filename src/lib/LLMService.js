/**
 * CIEE LLM Service Layer
 * Unified factory for all analyzer invocations.
 * Standardised response: { success, data, error, metadata }
 * Exponential backoff retry on transient failures.
 */

import { base44 } from '@/api/base44Client';

const MAX_RETRIES = 3;
const RETRY_BASE_MS = 800;

async function withRetry(fn, retries = MAX_RETRIES) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, RETRY_BASE_MS * Math.pow(2, attempt)));
    }
  }
}

function wrap(data, meta = {}) {
  return { success: true, data, error: null, metadata: { ts: new Date().toISOString(), ...meta } };
}

function wrapErr(err, meta = {}) {
  return { success: false, data: null, error: err?.message || String(err), metadata: { ts: new Date().toISOString(), ...meta } };
}

async function uploadIfPresent(file) {
  if (!file) return null;
  const { file_url } = await base44.integrations.Core.UploadFile({ file });
  return file_url;
}

// ── Biopsy AI ────────────────────────────────────────────────────────────────
export async function invokeBiopsyAnalyzer({ biopsyText = '', biopsyFile = null }) {
  const meta = { analyzer: 'BiopsyAI', model: 'claude_sonnet_4_6' };
  try {
    return wrap(await withRetry(async () => {
      const fileUrl = await uploadIfPresent(biopsyFile);
      return base44.integrations.Core.InvokeLLM({
        prompt: `You are a senior nephropathologist with expertise in paediatric renal biopsies. Analyse the provided biopsy report/image with expert-level histopathological analysis.

${biopsyText ? `Report text:\n${biopsyText}` : ''}

Return structured JSON matching the schema. For primary_diagnosis use one of: FSGS, MCD, IgAN, Membranous, MesPGN, LupusNephritis, ANCA, Alport, DiabeticNephropathy, TMA, MPGN, Other.
For evidence_grade use ISPN/KDIGO 2021 evidence grades: 1A, 1B, 2B, 2C, or X.
For guideline_ref cite the specific KDIGO 2021 Glomerular Diseases or IPNA 2021 section.`,
        file_urls: fileUrl ? [fileUrl] : undefined,
        response_json_schema: {
          type: 'object',
          properties: {
            primary_diagnosis: { type: 'string' },
            histology_class: { type: 'string', enum: ['FSGS', 'MCD', 'IgAN', 'Membranous', 'MesPGN', 'LupusNephritis', 'ANCA', 'Alport', 'DiabeticNephropathy', 'TMA', 'MPGN', 'Other'] },
            confidence_level: { type: 'string' },
            glomerular_findings: { type: 'array', items: { type: 'string' } },
            tubular_findings: { type: 'array', items: { type: 'string' } },
            interstitial_findings: { type: 'array', items: { type: 'string' } },
            vascular_findings: { type: 'array', items: { type: 'string' } },
            immunofluorescence: { type: 'string' },
            electron_microscopy: { type: 'string' },
            severity_grade: { type: 'string' },
            prognosis: { type: 'string' },
            treatment_recommendations: { type: 'array', items: { type: 'string' } },
            differential_diagnoses: { type: 'array', items: { type: 'string' } },
            follow_up_needed: { type: 'boolean' },
            key_references: { type: 'array', items: { type: 'string' } },
            evidence_grade: { type: 'string', enum: ['1A', '1B', '2B', '2C', 'X'] },
            guideline_ref: { type: 'string' },
            recommendation_strength: { type: 'string', enum: ['Recommendation', 'Suggestion', 'Practice Point'] },
          },
          required: ['primary_diagnosis', 'histology_class', 'confidence_level']
        },
      });
    }), meta);
  } catch (err) {
    return wrapErr(err, meta);
  }
}

// ── Lab AI ───────────────────────────────────────────────────────────────────
export async function invokeLabAnalyzer({ labText = '', labFile = null, labType = 'RFT', patientAge = '', patientHeightCm = null }) {
  const meta = { analyzer: 'LabAI', model: 'claude_sonnet_4_6' };
  try {
    return wrap(await withRetry(async () => {
      const fileUrl = await uploadIfPresent(labFile);
      return base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert paediatric nephrologist analysing laboratory results.

Lab Type: ${labType}
Patient Age: ${patientAge} years
${patientHeightCm ? `Patient Height: ${patientHeightCm} cm (for Schwartz GFR if needed)` : ''}
${labText ? `Lab Values:\n${labText}` : ''}

Extract these specific values where present: Creatinine_mg_dL, BUN_mg_dL, eGFR_mL_min_1_73m2, Potassium_mEq_L, Sodium_mEq_L, Calcium_mg_dL, Phosphate_mg_dL, Albumin_g_dL, Haemoglobin_g_dL, WBC, Platelets.

Schwartz GFR formula (use as fallback if eGFR not reported): eGFR = (0.413 × height_cm) / Cr_mg_dL
${patientHeightCm ? `Calculate Schwartz eGFR: (0.413 × ${patientHeightCm}) / [extracted Cr value]` : ''}

For evidence_grade use KDIGO 2012 AKI or IPNA 2021 CKD grades: 1A, 1B, 2B, 2C, or X.
For guideline_ref cite specific KDIGO section.`,
        file_urls: fileUrl ? [fileUrl] : undefined,
        response_json_schema: {
          type: 'object',
          properties: {
            primary_interpretation: { type: 'string' },
            extracted_values: {
              type: 'object',
              properties: {
                creatinine_mg_dL: { type: 'number' },
                bun_mg_dL: { type: 'number' },
                egfr_reported: { type: 'number' },
                egfr_schwartz: { type: 'number' },
                egfr_used: { type: 'number' },
                egfr_source: { type: 'string', enum: ['reported', 'schwartz_calculated', 'unavailable'] },
                potassium_mEq_L: { type: 'number' },
                sodium_mEq_L: { type: 'number' },
                calcium_mg_dL: { type: 'number' },
                phosphate_mg_dL: { type: 'number' },
                albumin_g_dL: { type: 'number' },
                haemoglobin_g_dL: { type: 'number' },
              }
            },
            critical_values: { type: 'array', items: { type: 'string' } },
            abnormal_findings: { type: 'array', items: { type: 'string' } },
            ckd_stage: { type: 'string' },
            aki_stage: { type: 'string' },
            calculations: {
              type: 'object',
              properties: {
                anion_gap: { type: 'string' },
                corrected_values: { type: 'array', items: { type: 'string' } },
                schwartz_workings: { type: 'string' },
              }
            },
            acid_base_disorder: { type: 'string' },
            compensation_status: { type: 'string' },
            severity: { type: 'string' },
            differential_diagnosis: { type: 'array', items: { type: 'string' } },
            treatment_recommendations: { type: 'array', items: { type: 'string' } },
            additional_tests: { type: 'array', items: { type: 'string' } },
            clinical_pearls: { type: 'array', items: { type: 'string' } },
            evidence_grade: { type: 'string', enum: ['1A', '1B', '2B', '2C', 'X'] },
            guideline_ref: { type: 'string' },
            recommendation_strength: { type: 'string', enum: ['Recommendation', 'Suggestion', 'Practice Point'] },
          },
          required: ['primary_interpretation', 'extracted_values']
        },
      });
    }), meta);
  } catch (err) {
    return wrapErr(err, meta);
  }
}

// ── Genetics AI ──────────────────────────────────────────────────────────────
const NEPHROTIC_GENES = ['NPHS1', 'NPHS2', 'WT1', 'LAMB2', 'PLCE1', 'TRPC6', 'INF2', 'ACTN4', 'CD2AP', 'COL4A3', 'COL4A4', 'COL4A5'];

export async function invokeGeneticsAnalyzer({ reportText = '', reportFile = null, clinicalContext = '' }) {
  const meta = { analyzer: 'GeneticsAI', model: 'claude_sonnet_4_6' };
  try {
    return wrap(await withRetry(async () => {
      const fileUrl = await uploadIfPresent(reportFile);
      return base44.integrations.Core.InvokeLLM({
        prompt: `You are a paediatric clinical geneticist specialising in nephrology. Apply ACMG/AMP 2015 variant classification (Richards et al., Genet Med 2015) rigorously.

${clinicalContext ? `Clinical context: ${clinicalContext}` : ''}
${reportText ? `Genetic report:\n${reportText}` : ''}
${fileUrl ? '(Genetic report file attached)' : ''}

ACMG CLASSIFICATION RULES:
- Collect pathogenic criteria: PVS1 (null+LOF gene, Very Strong) | PS1-PS4 (Strong) | PM1-PM6 (Moderate) | PP1-PP5 (Supporting)
- Collect benign criteria: BA1 (AF≥5%, Stand-alone=Benign alone) | BS1-BS4 (Strong) | BP1-BP7 (Supporting)
- Classify: Pathogenic = PVS1+PS | PVS1+≥2PM | ≥2PS | PS+≥3PM etc. Likely Path = PVS1+PM | PS+PM | ≥3PM etc. Benign = BA1 or ≥2BS. Likely Benign = BS+BP or ≥2BP. VUS = all other.
- PP3/BP4 count ONCE per variant (tools share algorithmic basis). PS2 needs both parents confirmed; PM6 if assumed.

NEPHROLOGY GENES (flag if identified): ${NEPHROTIC_GENES.join(', ')}.
CNI SUPPRESSOR: If Pathogenic/Likely Pathogenic in NPHS1, NPHS2, WT1, or LAMB2 → prescription_suppressor_triggered=true, cni_contraindicated=true (ISPN 2021 §3.5, Grade 2C).

List applicable criteria codes in pathogenic_evidence[] and benign_evidence[]. State the combination rule used in acmg_classification_rationale (one sentence).`,
        file_urls: fileUrl ? [fileUrl] : undefined,
        response_json_schema: {
          type: 'object',
          properties: {
            gene_identified: { type: 'string' },
            variant_hgvs: { type: 'string' },
            variant_type: { type: 'string', enum: ['Nonsense', 'Frameshift', 'Missense', 'Splice site', 'Synonymous', 'In-frame indel', 'Stop-loss', 'Copy number variant', 'Structural', 'Unknown'] },
            zygosity: { type: 'string', enum: ['Homozygous', 'Heterozygous', 'Compound heterozygous', 'Hemizygous', 'Unknown'] },
            inheritance_pattern: { type: 'string', enum: ['Autosomal Recessive', 'Autosomal Dominant', 'X-linked', 'De novo', 'Unknown'] },
            acmg_class: { type: 'string', enum: ['Pathogenic', 'Likely Pathogenic', 'VUS', 'Likely Benign', 'Benign'] },
            acmg_classification_rationale: { type: 'string' },
            pathogenic_evidence: { type: 'array', items: { type: 'string' } },
            benign_evidence: { type: 'array', items: { type: 'string' } },
            population_frequency_note: { type: 'string' },
            is_nephrotic_gene: { type: 'boolean' },
            cni_contraindicated: { type: 'boolean' },
            prescription_suppressor_triggered: { type: 'boolean' },
            suppression_reason: { type: 'string' },
            disease_association: { type: 'string' },
            clinical_significance: { type: 'string' },
            management_implications: { type: 'array', items: { type: 'string' } },
            family_testing_recommended: { type: 'boolean' },
            family_testing_rationale: { type: 'string' },
            counseling_points: { type: 'array', items: { type: 'string' } },
            next_steps: { type: 'array', items: { type: 'string' } },
            evidence_grade: { type: 'string', enum: ['1A', '1B', '2B', '2C', 'X'] },
            guideline_ref: { type: 'string' },
            recommendation_strength: { type: 'string', enum: ['Recommendation', 'Suggestion', 'Practice Point'] },
          },
          required: ['acmg_class', 'is_nephrotic_gene', 'cni_contraindicated', 'prescription_suppressor_triggered', 'acmg_classification_rationale', 'pathogenic_evidence', 'benign_evidence']
        },
      });
    }), meta);
  } catch (err) {
    return wrapErr(err, meta);
  }
}

// ── Case AI ──────────────────────────────────────────────────────────────────
export async function invokeCaseAnalyzer({ caseDetails = {} }) {
  const meta = { analyzer: 'CaseAI', model: 'claude_sonnet_4_6' };
  try {
    return wrap(await withRetry(async () => {
      return base44.integrations.Core.InvokeLLM({
        prompt: `You are a senior consultant paediatric nephrologist conducting attending-level clinical case analysis.

Patient: ${caseDetails.age || '?'} years old ${caseDetails.gender || ''}
${caseDetails.presentation ? `Presenting Complaint: ${caseDetails.presentation}` : ''}
${caseDetails.history ? `History: ${caseDetails.history}` : ''}
${caseDetails.examination ? `Examination: ${caseDetails.examination}` : ''}
${caseDetails.investigations ? `Investigations: ${caseDetails.investigations}` : ''}

For every recommendation, cite the specific guideline section and GRADE evidence level (1A/1B/2B/2C/X) using ISPN 2023, IPNA 2020, or KDIGO 2021.
Structure your traceability_links as: [{ recommendation, guideline, section, evidence_grade, recommendation_strength }]`,
        response_json_schema: {
          type: 'object',
          properties: {
            case_summary: { type: 'string' },
            problem_list: { type: 'array', items: { type: 'string' } },
            differential_diagnoses: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  diagnosis: { type: 'string' },
                  probability: { type: 'string' },
                  reasoning: { type: 'string' }
                }
              }
            },
            most_likely_diagnosis: { type: 'string' },
            confidence_level: { type: 'string' },
            pathophysiology: { type: 'string' },
            additional_investigations: { type: 'array', items: { type: 'string' } },
            management_plan: {
              type: 'object',
              properties: {
                immediate: { type: 'array', items: { type: 'string' } },
                short_term: { type: 'array', items: { type: 'string' } },
                long_term: { type: 'array', items: { type: 'string' } }
              }
            },
            prognosis: { type: 'string' },
            red_flags: { type: 'array', items: { type: 'string' } },
            counseling_points: { type: 'array', items: { type: 'string' } },
            follow_up_plan: { type: 'string' },
            guidelines_applied: { type: 'array', items: { type: 'string' } },
            traceability_links: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  recommendation: { type: 'string' },
                  guideline: { type: 'string' },
                  section: { type: 'string' },
                  evidence_grade: { type: 'string' },
                  recommendation_strength: { type: 'string' }
                }
              }
            },
          },
          required: ['most_likely_diagnosis', 'management_plan', 'traceability_links']
        },
      });
    }), meta);
  } catch (err) {
    return wrapErr(err, meta);
  }
}
