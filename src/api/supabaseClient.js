/**
 * Supabase implementation of the platform facade (Phase 3 + 4).
 *
 * This mirrors the exact surface the app uses from the Base44 SDK so that
 * src/api/client.js can switch to it by changing a single import. It is INERT
 * until VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are set — client.js only
 * selects this backend when they exist, so nothing changes until you flip it.
 *
 * Surface implemented:
 *   entities.<Name>.{ list, filter, get, create, update, delete, bulkCreate }
 *   auth.{ me, loginViaEmailPassword, loginWithProvider, logout, register,
 *          redirectToLogin, resendOtp, resetPassword, resetPasswordRequest, setToken }
 *   integrations.Core.{ InvokeLLM, UploadFile, ExtractDataFromUploadedFile,
 *                       SendEmail, GenerateImage }
 *   functions.invoke(name, payload)
 */
import { createClient } from "@supabase/supabase-js";

const URL = import.meta.env.VITE_SUPABASE_URL;
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(URL && ANON);

const sb = isSupabaseConfigured
  ? createClient(URL, ANON, { auth: { persistSession: true, autoRefreshToken: true } })
  : null;

// Base44 entity names are PascalCase; Postgres tables are snake_case.
const toSnake = (s) => s.replace(/([a-z0-9])([A-Z])/g, "$1_$2").replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2").toLowerCase();

// Base44 sort strings: "field" (asc) or "-field" (desc). Column names snake_case.
function applySort(query, sort) {
  if (!sort) return query;
  const desc = sort.startsWith("-");
  const col = toSnake(desc ? sort.slice(1) : sort);
  return query.order(col, { ascending: !desc });
}

// Base44 filter objects allow scalar equality plus a few operators. We map the
// common ones; extend here as needed.
function applyWhere(query, where = {}) {
  for (const [rawKey, val] of Object.entries(where)) {
    const col = toSnake(rawKey);
    if (val && typeof val === "object" && !Array.isArray(val)) {
      if ("$gt" in val) query = query.gt(col, val.$gt);
      if ("$gte" in val) query = query.gte(col, val.$gte);
      if ("$lt" in val) query = query.lt(col, val.$lt);
      if ("$lte" in val) query = query.lte(col, val.$lte);
      if ("$ne" in val) query = query.neq(col, val.$ne);
      if ("$in" in val) query = query.in(col, val.$in);
      if ("$contains" in val) query = query.ilike(col, `%${val.$contains}%`);
    } else if (Array.isArray(val)) {
      query = query.in(col, val);
    } else {
      query = query.eq(col, val);
    }
  }
  return query;
}

function makeEntity(name) {
  const table = toSnake(name);
  const from = () => sb.from(table);

  return {
    async list(sort, limit, skip = 0) {
      let q = from().select("*");
      q = applySort(q, sort);
      if (limit) q = q.range(skip, skip + limit - 1);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
    async filter(where, sort, limit) {
      let q = applyWhere(from().select("*"), where);
      q = applySort(q, sort);
      if (limit) q = q.limit(limit);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
    async get(id) {
      const { data, error } = await from().select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
    async create(record) {
      const { data, error } = await from().insert(record).select().single();
      if (error) throw error;
      return data;
    },
    async bulkCreate(records) {
      const { data, error } = await from().insert(records).select();
      if (error) throw error;
      return data || [];
    },
    async update(id, patch) {
      const { data, error } = await from().update(patch).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    async delete(id) {
      const { error } = await from().delete().eq("id", id);
      if (error) throw error;
      return { id };
    },
  };
}

// Lazily materialise entities so a typo doesn't crash at import time.
const entities = new Proxy({}, {
  get(cache, name) {
    if (typeof name !== "string") return undefined;
    if (!cache[name]) cache[name] = makeEntity(name);
    return cache[name];
  },
});

const auth = {
  async me() {
    const { data: { user } } = await sb.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    // Merge the app-level profile row (role, name, clinic…) if present
    let profile = {};
    try {
      const { data } = await sb.from("user_preferences").select("*").eq("owner_id", user.id).maybeSingle();
      profile = data || {};
    } catch { /* profile optional */ }
    return { id: user.id, email: user.email, role: user.app_metadata?.role || "user", ...profile };
  },
  async loginViaEmailPassword(email, password) {
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },
  async loginWithProvider(provider, redirectTo) {
    const { data, error } = await sb.auth.signInWithOAuth({ provider, options: { redirectTo } });
    if (error) throw error;
    return data;
  },
  async logout(redirectTo) {
    await sb.auth.signOut();
    if (redirectTo && typeof window !== "undefined") window.location.href = redirectTo;
  },
  async register(email, password, meta = {}) {
    const { data, error } = await sb.auth.signUp({ email, password, options: { data: meta } });
    if (error) throw error;
    return data;
  },
  redirectToLogin(redirectTo) {
    if (typeof window !== "undefined") {
      const url = new URL("/login", window.location.origin);
      if (redirectTo) url.searchParams.set("redirect", redirectTo);
      window.location.href = url.toString();
    }
  },
  async resendOtp(email) {
    const { error } = await sb.auth.resend({ type: "signup", email });
    if (error) throw error;
  },
  async resetPassword(newPassword) {
    const { error } = await sb.auth.updateUser({ password: newPassword });
    if (error) throw error;
  },
  async resetPasswordRequest(email, redirectTo) {
    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) throw error;
  },
  async setToken() { /* Supabase manages the session token internally; no-op */ },
};

// All external services run through Edge Functions so no secret key is ever in
// the browser. Names must match the deployed functions in supabase/functions/.
async function edge(fn, body) {
  const { data, error } = await sb.functions.invoke(fn, { body });
  if (error) throw error;
  return data;
}

const integrations = {
  Core: {
    // Returns the model's text (or the JSON object when a schema is supplied),
    // matching Base44's InvokeLLM return shape.
    async InvokeLLM(opts) {
      const data = await edge("invoke-llm", opts);
      return data?.result ?? data;
    },
    async UploadFile({ file }) {
      const path = `uploads/${Date.now()}_${file.name}`;
      const { error } = await sb.storage.from("uploads").upload(path, file);
      if (error) throw error;
      const { data } = sb.storage.from("uploads").getPublicUrl(path);
      return { file_url: data.publicUrl };
    },
    async ExtractDataFromUploadedFile(opts) {
      return edge("extract-file", opts);
    },
    async SendEmail(opts) {
      return edge("send-email", opts);
    },
    async GenerateImage(opts) {
      return edge("generate-image", opts);
    },
  },
};

const functions = {
  // Base44 server-function calls resolve to `{ data: <fn result> }`; mirror that
  // so call sites like `res.data?.success` keep working.
  invoke: async (name, payload) => ({ data: await edge(name, payload) }),
};

export const supabaseBackend = { entities, auth, integrations, functions, _sb: sb };
