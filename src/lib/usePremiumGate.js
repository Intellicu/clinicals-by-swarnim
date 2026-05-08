/**
 * Premium Feature Gate
 * Controls access to high-cost AI features.
 * Currently: admin-only. Future-ready for premium_user tier.
 */

export const FEATURE_GATES = {
  GRANT_WRITING_STUDIO: "grant_writing_studio",
  LITERATURE_MONITOR: "literature_monitor",
  MANUSCRIPT_REVIEWER: "manuscript_reviewer",
  BULK_OCR: "bulk_ocr",
  AI_DISCUSSION: "ai_discussion",
  AI_GRANT_REVIEWER: "ai_grant_reviewer",
  ADVANCED_LIT_SYNTHESIS: "advanced_lit_synthesis",
};

/**
 * Returns whether a user can access a given feature.
 * user.role === 'admin' → full access
 * Future: 'premium_user' tier can be added here
 */
export function canAccess(user, featureKey) {
  if (!user) return false;
  const role = user.role || "user";
  if (role === "admin") return true;
  // Future: if (role === "premium_user") return PREMIUM_FEATURES.includes(featureKey);
  return false;
}

/**
 * Hook-style helper for React components
 */
export function usePremiumGate(user) {
  return {
    isAdmin: user?.role === "admin",
    isPremium: user?.role === "admin" || user?.role === "premium_user",
    canAccess: (featureKey) => canAccess(user, featureKey),
    userRole: user?.role || "user",
  };
}