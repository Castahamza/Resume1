/** Free-tier limits and plan helpers (safe for client or server). */

export const FREE_MONTHLY_AI_LIMIT = 10;
export const FREE_MAX_RESUMES = 1;

export const FREE_TEMPLATE_ID = "modern";

/**
 * @param {string | null | undefined} plan — from profiles.plan
 * @returns {boolean} true if Pro or Lifetime (paid features)
 */
export function isPaidPlan(plan) {
  return plan === "pro" || plan === "lifetime";
}

/**
 * Alias for feature gates (resumes, AI, premium templates).
 * @param {string | null | undefined} plan
 */
export function hasPremiumAccess(plan) {
  return isPaidPlan(plan);
}

/**
 * @param {string | null | undefined} plan
 * @param {string} templateId
 * @returns {boolean}
 */
export function canUseTemplate(plan, templateId) {
  if (isPaidPlan(plan)) return true;
  return templateId === FREE_TEMPLATE_ID;
}

/**
 * @param {string | null | undefined} plan
 */
export function planBadgeLabel(plan) {
  if (plan === "pro") return "Pro";
  if (plan === "lifetime") return "Lifetime";
  return "Free";
}
