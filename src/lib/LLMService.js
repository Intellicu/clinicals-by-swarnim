/**
 * ClinicalHub LLM Service
 * Unified factory for all analyzer invocations.
 * Response: { success, data, error, metadata }
 * Offline: results cached in localStorage by input hash.
 */
import { base44 } from '@/api/base44Client';

const MAX_RETRIES = 2;
const RETRY_BASE_MS = 600;
const CACHE_PREFIX = 'ch_llm_';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

async function withRetry(fn, retries = MAX_RETRIES) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try { return await fn(); }
    catch (err) {
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

// Simple hash for cache key
function hashStr(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) { h = (Math.imul(31, h) + str.charCodeAt(i)) | 0; }
  return Math.abs(h).toString(36);
}

function cacheGet(key) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL_MS) { localStorage.removeItem(CACHE_PREFIX + key); return null; }
    return data;
  } catch { return null; }
}

function cacheSet(key, data) {
  try { localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ ts: Date.now(), data })); } catch { /* storage full */ }
}

async function invokeWithCache(cacheKey, meta, invokeFn) {
  const cached = cacheGet(cacheKey);
  if (cached) return { ...wrap(cached, meta), metadata: { ...wrap(cached, meta).metadata, fromCache: true } };
  try {
    const data = await withRetry(invokeFn);
    cacheSet(cacheKey, data);
    return wrap(data, meta);
  } catch (err) {
    return wrapErr(err, meta);
  }
}

// ── Biopsy AI ──────────────────────────────────────────────────────────────────────────────
export async function invokeBiopsyAnalyzer({ biopsyText = '', biopsyFile = null }) {
  const meta = { analyzer: 'BiopsyAI' };
  const key = hashStr('biopsy:' + biopsyText);
  return invokeWithCache(key, meta, async () => {
    const fileUrl = await uploadIfPresent(biopsyFile);
    return base44.integrations.Core.InvokeLLM({
      prompt: `Paediatric nephropathologist. Analyse this renal biopsy report with expert histopathological analysis.${biopsyText ? `\n\nReport:\n${biopsyText}` : ''}

histology_class: one of FSGS|MCD|IgAN|Membranous|MesPGN|LupusNephritis|ANCA|Alport|DiabeticNephropathy|TMA|MPGN|Other
evidence_grade: KDIGO/ISPN 2021 grade (1A|1B|2B|2C|X). Cite specific guideline section in guideline_ref.`,
      file_urls: fileUrl ? [fileUrl] : undefined,
      response_json_schema: {
        type: 'object',
        properties: {
          primary_diagnosis: { type: 'string' },
          histology_class: { type: 'string', enum: ['FSGS','MCD','IgAN','Membranous','MesPGN','LupusNephritis','ANCA','Alport','DiabeticNephropathy','TMA','MPGN','Other'] },
          confidence_level: { type: 'string' },
          severity_grade: { type: 'string' },
          prognosis: { type: 'string' },
          glomerular_findings: { type: 'array', items: { type: 'string' } },
          tubular_findings: { type: 'array', items: { type: 'string' } },
          interstitial_findings: { type: 'array', items: { type: 'string' } },
          vascular_findings: { type: 'array', items: { type: 'string' } },
          immunofluorescence: { type: 'string' },
          electron_microscopy: { type: 'string' },
          treatment_recommendations: { type: 'array', items: { type: 'string' } },
          differential_diagnoses: { type: 'array', items: { type: 'string' } },
          key_references: { type: 'array', items: { type: 'string' } },
          evidence_grade: { type: 'string', enum: ['1A','1B','2B','2C','X'] },
          guideline_ref: { type: 'string' },
          recommendation_strength: { type: 'string', enum: ['Recommendation','Suggestion','Practice Point'] },
        },
        required: ['primary_diagnosis','histology_class','confidence_level']
      },
    });
  });
}

// ── Lab AI ───────────────────────────────────────────────────────────────────────────────
export async function invokeLabAnalyzer({ labText = '', labFile = null, labType = 'RFT', patientAge = '', patientHeightCm = null }) {
  const meta = { analyzer: 'LabAI' };
  const key = hashStr(`lab:${labType}:${patientAge}:${patientHeightCm}:${labText}`);
  return invokeWithCache(key, meta, async () => {
    const fileUrl = await uploadIfPresent(labFile);
    return base44.integrations.Core.InvokeLLM({
      prompt: `Paediatric nephrologist. Analyse these lab results.\nLab: ${labType} | Age: ${patientAge}y${patientHeightCm ? ` | Height: ${patientHeightCm}cm` : ''}${labText ? `\n\nValues:\n${labText}` : ''}

Extract: Creatinine(mg/dL), BUN(mg/dL), eGFR, K, Na, Ca, PO4, Albumin, Hb.
Schwartz eGFR = (0.413 × height_cm) / Cr if eGFR not reported${patientHeightCm ? ` → (0.413 × ${patientHeightCm}) / [Cr]` : ''}.
evidence_grade: KDIGO 2012 AKI / IPNA 2021 CKD (1A|1B|2B|2C|X).`,
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
              egfr_source: { type: 'string', enum: ['reported','schwartz_calculated','unavailable'] },
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
          acid_base_disorder: { type: 'string' },
          compensation_status: { type: 'string' },
          severity: { type: 'string' },
          differential_diagnosis: { type: 'array', items: { type: 'string' } },
          treatment_recommendations: { type: 'array', items: { type: 'string' } },
          additional_tests: { type: 'array', items: { type: 'string' } },
          clinical_pearls: { type: 'array', items: { type: 'string' } },
          evidence_grade: { type: 'string', enum: ['1A','1B','2B','2C','X'] },
          guideline_ref: { type: 'string' },
          recommendation_strength: { type: 'string', enum: ['Recommendation','Suggestion','Practice Point'] },
        },
        required: ['primary_interpretation','extracted_values']
      },
    });
  });
}

// ── Genetics AI ───────────────────────────────────────────────────────────────────────────
export async function invokeGeneticsAnalyzer({ reportText = '', reportFile = null, clinicalContext = '' }) {
  const meta = { analyzer: 'GeneticsAI' };
  const key = hashStr(`genetics:${clinicalContext}:${reportText}`);
  return invokeWithCache(key, meta, async () => {
    const fileUrl = await uploadIfPresent(reportFile);
    return base44.integrations.Core.InvokeLLM({
      prompt: `Classify this genetic variant per ACMG/AMP 2015 (Richards et al., Genet Med 2015).${clinicalContext ? `\nContext: ${clinicalContext}` : ''}${reportText ? `\n\nReport:\n${reportText}` : ''}

Criteria: PVS1(null+LOF) | PS1-PS4(Strong) | PM1-PM6(Moderate) | PP1-PP5(Supporting) | BA1(AF≥5%=Benign alone) | BS1-BS4(Strong benign) | BP1-BP7(Supporting benign). PP3/BP4 count once per variant.
Nephropathy genes: NPHS1,NPHS2,WT1,LAMB2,PLCE1,TRPC6,INF2,ACTN4,COL4A3/4/5.
If P/LP in NPHS1/NPHS2/WT1/LAMB2: cni_contraindicated=true, prescription_suppressor_triggered=true (ISPN 2021 §3.5, 2C).`,
      file_urls: fileUrl ? [fileUrl] : undefined,
      response_json_schema: {
        type: 'object',
        properties: {
          gene_identified: { type: 'string' },
          variant_hgvs: { type: 'string' },
          variant_type: { type: 'string', enum: ['Nonsense','Frameshift','Missense','Splice site','Synonymous','In-frame indel','Stop-loss','Copy number variant','Structural','Unknown'] },
          zygosity: { type: 'string', enum: ['Homozygous','Heterozygous','Compound heterozygous','Hemizygous','Unknown'] },
          inheritance_pattern: { type: 'string', enum: ['Autosomal Recessive','Autosomal Dominant','X-linked','De novo','Unknown'] },
          acmg_class: { type: 'string', enum: ['Pathogenic','Likely Pathogenic','VUS','Likely Benign','Benign'] },
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
          evidence_grade: { type: 'string', enum: ['1A','1B','2B','2C','X'] },
          guideline_ref: { type: 'string' },
          recommendation_strength: { type: 'string', enum: ['Recommendation','Suggestion','Practice Point'] },
        },
        required: ['acmg_class','is_nephrotic_gene','cni_contraindicated','prescription_suppressor_triggered','acmg_classification_rationale','pathogenic_evidence','benign_evidence']
      },
    });
  });
}

// ── Case AI ───────────────────────────────────────────────────────────────────────────────
export async function invokeCaseAnalyzer({ caseDetails = {} }) {
  const meta = { analyzer: 'CaseAI' };
  const key = hashStr('case:' + JSON.stringify(caseDetails));
  return invokeWithCache(key, meta, async () => {
    return base44.integrations.Core.InvokeLLM({
      prompt: `Senior paediatric nephrologist. Attending-level case analysis.\n\nPatient: ${caseDetails.age||'?'}y ${caseDetails.gender||''}${caseDetails.presentation ? `\nPresentation: ${caseDetails.presentation}` : ''}${caseDetails.history ? `\nHistory: ${caseDetails.history}` : ''}${caseDetails.examination ? `\nExamination: ${caseDetails.examination}` : ''}${caseDetails.investigations ? `\nInvestigations: ${caseDetails.investigations}` : ''}

For every recommendation cite guideline + section + GRADE level (1A/1B/2B/2C/X) using ISPN 2023, IPNA 2020, or KDIGO 2021.`,
      response_json_schema: {
        type: 'object',
        properties: {
          case_summary: { type: 'string' },
          problem_list: { type: 'array', items: { type: 'string' } },
          differential_diagnoses: { type: 'array', items: { type: 'object', properties: { diagnosis: { type: 'string' }, probability: { type: 'string' }, reasoning: { type: 'string' } } } },
          most_likely_diagnosis: { type: 'string' },
          confidence_level: { type: 'string' },
          pathophysiology: { type: 'string' },
          additional_investigations: { type: 'array', items: { type: 'string' } },
          management_plan: { type: 'object', properties: { immediate: { type: 'array', items: { type: 'string' } }, short_term: { type: 'array', items: { type: 'string' } }, long_term: { type: 'array', items: { type: 'string' } } } },
          prognosis: { type: 'string' },
          red_flags: { type: 'array', items: { type: 'string' } },
          counseling_points: { type: 'array', items: { type: 'string' } },
          follow_up_plan: { type: 'string' },
          guidelines_applied: { type: 'array', items: { type: 'string' } },
          traceability_links: { type: 'array', items: { type: 'object', properties: { recommendation: { type: 'string' }, guideline: { type: 'string' }, section: { type: 'string' }, evidence_grade: { type: 'string' }, recommendation_strength: { type: 'string' } } } },
        },
        required: ['most_likely_diagnosis','management_plan','traceability_links']
      },
    });
  });
}
