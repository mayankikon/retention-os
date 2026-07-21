import {
  getAudienceAttributeMeta,
  getAudienceValueLabel,
  isModelValidForMake,
  isPurchaseDateRangeComplete,
  isPurchaseDateRangeValid,
  parseDateRange,
  serializeDateRange,
} from "@/data/audience-attributes";
import type { AudienceFilterRule } from "@/types/campaign-setup";

/** Simulated starting audience size before any filters narrow it. */
export const BASE_AUDIENCE_POOL = 5000;

/** Reach never drops below this, so the count always reads as plausible. */
const MIN_AUDIENCE = 25;

function hasText(value: string | undefined): boolean {
  return Boolean(value && value.trim().length > 0);
}

/** A rule is applied once a value has been chosen/entered. */
export function isRuleComplete(rule: AudienceFilterRule): boolean {
  if (rule.attribute === "vehiclePurchaseDate") {
    return isPurchaseDateRangeComplete(rule.value);
  }

  return hasText(rule.value);
}

export function getSelectedMakeFromRules(
  rules: AudienceFilterRule[],
): string | undefined {
  const makeRule = rules.find(
    (rule) => rule.attribute === "vehicleMake" && isRuleComplete(rule),
  );
  return makeRule?.value.trim();
}

/** Stable, order-independent hash of a string for deterministic value nudges. */
function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** Base share of the pool a rule keeps, before the value-specific nudge. */
function baseShrinkFactor(rule: AudienceFilterRule): number {
  switch (rule.attribute) {
    case "customerZip":
      return 0.45;
    case "vehicleYear":
    case "vehicleModel":
    case "customerCity":
      return 0.5;
    case "vehiclePurchaseDate":
      return 0.6;
    default:
      return 0.55;
  }
}

/**
 * Deterministic simulated audience size. Starts from BASE_AUDIENCE_POOL and
 * multiplies by a per-rule factor (always <= 1, so adding rules can only
 * shrink the pool). The factor is nudged by a stable hash of the rule's value
 * so different values yield different-but-repeatable counts. Incomplete rules
 * are ignored. No randomness or time — same rules always give the same number.
 */
export function estimateAudienceReach(rules: AudienceFilterRule[]): number {
  let total = BASE_AUDIENCE_POOL;

  for (const rule of rules) {
    if (!isRuleComplete(rule)) {
      continue;
    }
    const nudge = 0.8 + (hashString(rule.value.trim()) % 20) / 100;
    total *= baseShrinkFactor(rule) * nudge;
  }

  const rounded = Math.round(total / 5) * 5;
  return Math.max(MIN_AUDIENCE, rounded);
}

/** Simulated deliverable reach after consent / channel availability (~82–90%). */
export function estimateDeliverableReach(targetedCustomers: number): number {
  const rate = 0.82 + (targetedCustomers % 9) / 100;
  const rounded = Math.round((targetedCustomers * rate) / 5) * 5;
  return Math.max(MIN_AUDIENCE, Math.min(targetedCustomers, rounded));
}

/** Human-readable recap lines for complete rules (used by the Review step). */
export function summarizeAudienceFilters(rules: AudienceFilterRule[]): string[] {
  return rules.filter(isRuleComplete).map((rule) => {
    const meta = getAudienceAttributeMeta(rule.attribute);
    return `${meta.label}: ${getAudienceValueLabel(rule.attribute, rule.value.trim())}`;
  });
}

export function syncModelRulesAfterMakeChange(
  rules: AudienceFilterRule[],
  makeValue: string,
): AudienceFilterRule[] {
  return rules.map((rule) => {
    if (
      rule.attribute === "vehicleModel" &&
      rule.value &&
      !isModelValidForMake(makeValue, rule.value)
    ) {
      return { ...rule, value: "" };
    }
    return rule;
  });
}

export function validatePurchaseDateRangeRule(
  rule: AudienceFilterRule,
): string | undefined {
  if (rule.attribute !== "vehiclePurchaseDate") {
    return undefined;
  }

  const { startDate, endDate } = parseDateRange(rule.value);
  const hasStart = hasText(startDate);
  const hasEnd = hasText(endDate);

  if (!hasStart && !hasEnd) {
    return "Select a start and end purchase date.";
  }

  if (!hasStart || !hasEnd) {
    return "Select both a start and end purchase date.";
  }

  if (!isPurchaseDateRangeValid(rule.value)) {
    return "Start date must be on or before the end date.";
  }

  return undefined;
}
