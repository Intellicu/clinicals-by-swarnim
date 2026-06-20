/**
 * CIEE Engine Generator — Component 1 (GuidelineSource Repository) +
 * Component 2 (DecisionNode Processor).
 *
 * Parses unstructured clinical guideline text (uploaded PDF/doc/pasted) into a
 * structured, executable directed decision graph that the SAME
 * PathwayExecutionEngine (CIEEEngineRunner) traverses node-by-node.
 *
 * This is the backbone capability of the patent: one execution engine running
 * any guideline-derived graph, with node-level evidence traceability,
 * prescription suppression and auto-generated monitoring schedules.
 */
import { base44 } from '@/api/base44Client';

// ── JSON schema constraining the LLM to emit a runnable decision graph ────────
export const CIEE_GRAPH_SCHEMA = {
  type: 'object',
  properties: {
    guideline_source: {
      type: 'object',
      description: 'Component 1 — the single evidence source for this engine',
      properties: {
        id: { type: 'string', description: 'short id, e.g. GS-KDIGO-2021-AKI' },
        guideline_name: { type: 'string' },
        guideline_section: { type: 'string' },
        issuing_body: { type: 'string', description: 'KDIGO, ISPN, IPNA, ISPD, AAP, IAP, ESPN, etc.' },
        year: { type: 'number' },
        evidence_grade: { type: 'string', enum: ['1A', '1B', '2B', '2C', 'X'] },
        recommendation_strength: { type: 'string', enum: ['Recommendation', 'Suggestion', 'Practice Point'] },
        doi: { type: 'string' },
        pmid: { type: 'string' },
      },
      required: ['id', 'guideline_name', 'issuing_body'],
    },
    engine: {
      type: 'object',
      properties: {
        label: { type: 'string', description: 'Engine name, 3-6 words' },
        desc: { type: 'string', description: 'One-line description' },
        scenario: { type: 'string', description: 'url-slug-lowercase' },
        group: { type: 'string' },
      },
      required: ['label', 'scenario'],
    },
    pathway: {
      type: 'object',
      description: 'Component 2 — directed decision graph',
      properties: {
        entry: { type: 'string', description: 'id of the first node' },
        nodes: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'e.g. DN-01' },
              type: { type: 'string', enum: ['QUESTION', 'ASSESSMENT', 'ACTION', 'MONITORING', 'TERMINAL'] },
              critical: { type: 'boolean', description: 'true if this is a critical branch point' },
              question: { type: 'string', description: 'for QUESTION/ASSESSMENT nodes' },
              detail: { type: 'string', description: 'optional clarifying note' },
              action: { type: 'string', description: 'for ACTION/MONITORING/TERMINAL nodes' },
              prescribes: { type: 'string', description: 'drug name if this node prescribes a drug (enables PrescriptionSuppressor + monitoring)' },
              tone: { type: 'string', enum: ['danger', 'muted'], description: 'optional visual emphasis' },
              next: { type: 'string', description: 'next node id for ACTION/MONITORING nodes' },
              options: {
                type: 'array',
                description: 'branch options for QUESTION/ASSESSMENT nodes',
                items: {
                  type: 'object',
                  properties: {
                    label: { type: 'string' },
                    next: { type: 'string', description: 'next node id' },
                    tone: { type: 'string', enum: ['danger', 'muted'] },
                    set: { type: 'object', description: 'context variables to set, e.g. {"genetic_variant_status":"PATHOGENIC"}' },
                  },
                  required: ['label', 'next'],
                },
              },
              monitoring: {
                type: 'array',
                description: 'monitoring rules generated when this node executes (TDM targets, surveillance)',
                items: {
                  type: 'object',
                  properties: {
                    parameter: { type: 'string' },
                    frequency: { type: 'string' },
                    target: { type: 'string', description: 'target / TDM range' },
                    alert: { type: 'string', description: 'alert condition' },
                    alert_action: { type: 'string' },
                  },
                  required: ['parameter', 'frequency'],
                },
              },
            },
            required: ['id', 'type'],
          },
        },
      },
      required: ['entry', 'nodes'],
    },
  },
  required: ['guideline_source', 'engine', 'pathway'],
};

const GEN_PROMPT = (topic, text) => `You are the DecisionNode Processor of a Clinical Intelligence Execution Engine (CIEE). Convert the clinical guideline below into a STRUCTURED, EXECUTABLE decision graph for a paediatric/clinical decision-support engine.

TOPIC: ${topic || '(infer from the document)'}
${text ? `\nGUIDELINE SOURCE TEXT:\n${text.substring(0, 9000)}` : ''}

Produce a directed graph of decision nodes that a clinician traverses one step at a time:
- QUESTION / ASSESSMENT nodes ask a clinical question and MUST provide 2-4 "options", each pointing to the "next" node id. Use "set" on an option to record a context variable that later nodes or the PrescriptionSuppressor can use (e.g. {"genetic_variant_status":"PATHOGENIC"} or {"dialysis_status":true}).
- ACTION nodes specify a clinical action/treatment and a single "next" node. If the action prescribes a drug, set "prescribes" to the drug name (generic). For calcineurin inhibitors use "tacrolimus" or "cyclosporine" so the PrescriptionSuppressor safety constraint can intercept them.
- MONITORING nodes specify surveillance; include a "monitoring" array with parameter/frequency/target/alert.
- Exactly one or more TERMINAL nodes end branches.

RULES:
1. Every "next" and every option "next" MUST reference an existing node id. No dangling edges.
2. There must be a reachable TERMINAL node from every branch.
3. Node ids: DN-01, DN-02, ... in traversal order. entry = "DN-01".
4. Drug nodes that start a CNI/immunosuppressant should be preceded by a genetic-status QUESTION so the PrescriptionSuppressor can block CNI when a pathogenic variant is present.
5. Keep clinically faithful to the source guideline. Cite the issuing body, year, DOI/PMID and GRADE evidence level in guideline_source.
6. Aim for 8-25 nodes — enough to be clinically useful, not exhaustive.

Return ONLY the JSON object matching the schema.`;

// Robustly turn any InvokeLLM response into our parsed graph object.
function coerceToObject(resp) {
  if (resp == null) return null;
  // wrapper field carrying the graph as a (possibly stringified) JSON value
  if (typeof resp === 'object' && resp.graph_json != null) {
    return typeof resp.graph_json === 'string' ? coerceToObject(resp.graph_json) : resp.graph_json;
  }
  // already the target object?
  if (typeof resp === 'object' && (resp.pathway || resp.guideline_source)) return resp;
  // unwrap common text wrappers
  let text = typeof resp === 'string'
    ? resp
    : (resp.result || resp.text || resp.content || resp.output_text ||
       resp.choices?.[0]?.message?.content || JSON.stringify(resp));
  text = String(text).trim();
  // strip markdown code fences
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  // slice to the outermost JSON object
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first !== -1 && last !== -1 && last > first) text = text.slice(first, last + 1);
  return JSON.parse(text);
}

// Single-string wrapper schema — Base44 reliably honours a flat schema, and we
// parse the nested graph out of the string ourselves (the full graph schema with
// free-form context objects is rejected by structured-output mode).
const WRAPPER_SCHEMA = {
  type: 'object',
  properties: {
    graph_json: { type: 'string', description: 'The full engine graph as a JSON string with keys: guideline_source, engine, pathway' },
  },
  required: ['graph_json'],
};

// ── Component 2 invocation ───────────────────────────────────────────────────
export async function generateCIEEPathway({ topic = '', guidelineText = '', fileUrl = null }) {
  const base = GEN_PROMPT(topic, guidelineText);
  const attempts = [
    {
      label: 'wrapped',
      opts: {
        prompt: base + '\n\nReturn a JSON object with ONE field "graph_json" whose value is a JSON STRING containing the full object {guideline_source, engine, pathway}. Escape the inner JSON properly.',
        response_json_schema: WRAPPER_SCHEMA,
        ...(fileUrl ? { file_urls: [fileUrl] } : {}),
      },
    },
    {
      label: 'plain',
      opts: {
        prompt: base + '\n\nReturn ONLY the JSON object (keys: guideline_source, engine, pathway). No markdown, no commentary.',
        ...(fileUrl ? { file_urls: [fileUrl] } : {}),
      },
    },
  ];

  const errors = [];
  for (const a of attempts) {
    try {
      const raw = await base44.integrations.Core.InvokeLLM(a.opts);
      const parsed = coerceToObject(raw);
      if (parsed && parsed.pathway) {
        const normalized = normalizeGenerated(parsed);
        const validation = validatePathway(normalized.pathway);
        return { success: true, data: normalized, validation, error: null };
      }
      errors.push(`${a.label}: response had no pathway`);
    } catch (err) {
      errors.push(`${a.label}: ${err?.message || err}`);
    }
  }
  return { success: false, data: null, validation: null, error: `Generation failed — ${errors.join(' | ')}` };
}

// Convert the LLM's array-of-nodes form into the runtime {entry, nodes:{id:node}} map
export function normalizeGenerated(parsed) {
  const gs = parsed.guideline_source || {};
  const sourceId = gs.id || 'GS-GENERATED';
  const sources = {
    [sourceId]: {
      guideline_name: gs.guideline_name || 'Generated guideline',
      guideline_section: gs.guideline_section || '—',
      evidence_grade: gs.evidence_grade || 'X',
      recommendation_strength: gs.recommendation_strength || 'Practice Point',
      issuing_body: gs.issuing_body || 'Unspecified',
      year: gs.year || null,
      doi: gs.doi || null,
      pmid: gs.pmid || null,
    },
  };

  const rawNodes = parsed.pathway?.nodes || [];
  // accept either an array of nodes or an {id: node} object map
  const nodesArr = Array.isArray(rawNodes)
    ? rawNodes
    : Object.entries(rawNodes).map(([id, n]) => ({ id, ...n }));
  const nodes = {};
  for (const n of nodesArr) {
    if (!n || !n.id) continue;
    nodes[n.id] = { ...n, source: n.source || sourceId };
  }

  return {
    guideline_source: { id: sourceId, ...sources[sourceId] },
    sources,
    engine: parsed.engine || {},
    pathway: { entry: parsed.pathway?.entry || nodesArr[0]?.id, nodes },
  };
}

// ── Graph validation — guarantees a runnable, dangling-edge-free graph ────────
export function validatePathway(pathway) {
  const errors = [];
  const warnings = [];
  if (!pathway || !pathway.nodes) return { valid: false, errors: ['No pathway nodes'], warnings };

  const ids = new Set(Object.keys(pathway.nodes));
  if (!pathway.entry || !ids.has(pathway.entry)) errors.push(`Entry node "${pathway.entry}" not found`);

  let hasTerminal = false;
  for (const id of ids) {
    const node = pathway.nodes[id];
    if (node.type === 'TERMINAL') { hasTerminal = true; continue; }

    if (node.type === 'QUESTION' || node.type === 'ASSESSMENT') {
      if (!node.options || node.options.length < 2) errors.push(`${id}: decision node needs ≥2 options`);
      (node.options || []).forEach((o, i) => {
        if (!o.next || !ids.has(o.next)) errors.push(`${id} option ${i + 1} → "${o.next}" is a dangling edge`);
      });
    } else {
      if (!node.next || !ids.has(node.next)) errors.push(`${id}: "next" → "${node.next}" is a dangling edge`);
    }
  }
  if (!hasTerminal) errors.push('Graph has no TERMINAL node');

  // reachability from entry
  if (pathway.entry && ids.has(pathway.entry)) {
    const seen = new Set();
    const stack = [pathway.entry];
    while (stack.length) {
      const cur = stack.pop();
      if (seen.has(cur)) continue;
      seen.add(cur);
      const node = pathway.nodes[cur];
      if (!node) continue;
      if (node.options) node.options.forEach(o => o.next && stack.push(o.next));
      if (node.next) stack.push(node.next);
    }
    const unreachable = [...ids].filter(i => !seen.has(i));
    if (unreachable.length) warnings.push(`Unreachable nodes: ${unreachable.join(', ')}`);
  }

  return { valid: errors.length === 0, errors, warnings, nodeCount: ids.size };
}
