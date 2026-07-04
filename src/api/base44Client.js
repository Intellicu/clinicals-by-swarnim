import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

//Create a client with authentication required
export const base44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: '',
  requiresAuth: false,
  appBaseUrl
});

// ── Global anti-hallucination layer ──────────────────────────────────────────
// Every InvokeLLM call in the app passes through here. Free-text clinical
// prompts get the strict evidence rules prepended; callers that already
// include them (e.g. via invokeGrounded) are not double-wrapped.
import { GROUNDING_RULES } from '@/lib/ai/groundingRules';
import { enableOfflineSnapshots } from '@/lib/offline/entitySnapshot';

// ── Offline reference-data layer ─────────────────────────────────────────────
// Formulary, dose rules, guidelines and search index reads fall back to a
// local snapshot when there is no connectivity (bedside / low-resource use).
enableOfflineSnapshots(base44);


if (base44?.integrations?.Core?.InvokeLLM) {
  const _invokeLLM = base44.integrations.Core.InvokeLLM.bind(base44.integrations.Core);
  base44.integrations.Core.InvokeLLM = (opts = {}) => {
    if (typeof opts?.prompt === 'string' && !opts.prompt.includes('STRICT EVIDENCE RULES')) {
      return _invokeLLM({ ...opts, prompt: `${GROUNDING_RULES}\n\n${opts.prompt}` });
    }
    return _invokeLLM(opts);
  };
}
