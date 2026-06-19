# Audience Filtering Step — Design

**Date:** 2026-06-19
**Status:** Approved (pending spec review)

## Problem

The campaign setup wizard lets users define messaging, triggers, and a schedule, but
there is no way to **target which customers/vehicles** a campaign reaches. Today the only
audience control is a *suppression* list (negative filter) on the Review step. Users need
to positively filter the audience by vehicle and customer attributes during campaign setup.

## Goal

Add a dedicated **Audience** step to the campaign setup wizard where users build a list of
filter rules over vehicle and customer attributes. Rules combine with AND. A simulated
reach count ("matches ~N vehicles") gives live feedback. The Review step shows a read-only
recap of the chosen filters.

This is a prototype: there is no real customer/vehicle dataset, so the reach count is a
deterministic simulation, not a true query result.

## Scope

In scope:
- New `audience` step between `configuration` and `review`.
- Stackable rule builder UI (add / edit / remove rules).
- Nine filter attributes with type-driven operators and value editors.
- Deterministic simulated reach count.
- Read-only audience summary in the Review step.
- Optional-step validation (only validates rules the user actually added).

Out of scope (YAGNI / later):
- OR logic or nested rule groups (flat AND-only).
- Real audience data / backend query.
- Persisting an exact matched-customer list.

## Attributes & Filter Model

Each rule is a flat object; the draft holds an ordered list combined with **AND**.

```ts
// src/types/campaign-setup.ts

export const AUDIENCE_ATTRIBUTES = [
  "vehicleYear",
  "vehicleMake",
  "vehicleModel",
  "customerName",
  "customerZip",
  "customerCity",
  "installedDate",
  "registrationDate",
  "odometer",
] as const;
export type AudienceAttribute = (typeof AUDIENCE_ATTRIBUTES)[number];

export interface AudienceFilterRule {
  id: string;                // local uid, used for React keys
  attribute: AudienceAttribute;
  operator: string;          // one of the attribute's allowed operators
  value: string;             // primary value (or list as comma string)
  valueTo?: string;          // upper bound for "between" operators
}
```

Added to `CampaignSetupDraft`:

```ts
audienceFilters: AudienceFilterRule[];
```

Default in `createDefaultSetupDraft`: `audienceFilters: []`.

### Attribute metadata (single source of truth)

New file `src/data/audience-attributes.ts` defines, per attribute: display label, value
type (`number | enum | enumDependent | text | date`), allowed operators (label + value),
and how to source enum options (e.g. reuse `getOemMakes` / `getOemModelsForMake` from
`src/data/service-triggers.ts`).

| Attribute | Label | Type | Operators | Value editor |
|---|---|---|---|---|
| vehicleYear | Vehicle year | number | is between, ≥, ≤, is | number input(s) |
| vehicleMake | Vehicle make | enum | is any of, is not | multi-select (OEM makes) |
| vehicleModel | Vehicle model | enumDependent | is any of | multi-select (models for selected makes; falls back to free text if no make rule present) |
| customerName | Customer Name | text | contains, is | text input |
| customerZip | Customer Zip Code | text | is any of, starts with | text input (comma-separated) |
| customerCity | Customer City | text | is any of | text input (comma-separated) |
| installedDate | Installed Date | date | is between, before, after | date input(s) |
| registrationDate | Registration Date | date | is between, before, after | date input(s) |
| odometer | Odometer | number | is between, ≥, ≤ | number input(s) |

Operators whose value type is "between" use both `value` and `valueTo`; all others use
`value` only.

Note on `vehicleModel`: to avoid coupling complexity in the prototype, the model editor is
a plain comma-separated text input (consistent with zip/city) rather than a true
make-dependent cascade. The "enumDependent" type is reserved in metadata for a future
upgrade but renders as text input for now. (Decision recorded to keep scope flat.)

## UI

New file `src/components/campaigns/setup/steps/AudienceStep.tsx`, following the existing
`FormField` + bordered-card pattern from `ConfigurationStep.tsx`.

Layout:
- A `FormField` titled "Audience filters" with hint: "Add one or more rules. A customer
  must match every rule (AND) to be included. Leave empty to target all customers."
- Empty state: muted helper text + **"+ Add filter"** button.
- One bordered card per rule, each row containing:
  1. Attribute `Select` (the dropdown from the screenshot — all nine attributes).
  2. Operator `Select` (options come from the chosen attribute's metadata).
  3. Value editor (input / two inputs for "between" / multi-select for enum), driven by
     attribute + operator type.
  4. Remove button (✕, `variant="ghost"`, `aria-label="Remove filter"`).
- **"+ Add filter"** button below the list appends a rule defaulting to the first attribute
  and its first operator, with empty value(s).
- Footer summary line: **`AND · matches ~N vehicles`** rendered from the simulated reach.

Changing a rule's attribute resets its operator to that attribute's first operator and
clears `value`/`valueTo` (operators are not portable across types).

Components reused: `FormField`, `Select`/`SelectTrigger`/`SelectContent`/`SelectItem`,
`Input`, `Button`, `Checkbox` (for multi-select enums), `cn`.

## Simulated Reach

New file `src/lib/audience-filters.ts`:

```ts
export function estimateAudienceReach(rules: AudienceFilterRule[]): number;
export function isRuleComplete(rule: AudienceFilterRule): boolean;
export function summarizeAudienceFilters(rules: AudienceFilterRule[]): string[];
```

`estimateAudienceReach`:
- Base pool constant (e.g. `BASE_AUDIENCE_POOL = 5000`).
- For each **complete** rule, multiply the running total by a deterministic per-attribute
  shrink factor (e.g. enum "is any of" → larger pool, "is" exact → smaller). Factors are
  fixed constants per attribute/operator, optionally nudged by a stable hash of the value
  string so different values yield different-but-stable counts.
- Floor at a minimum (e.g. 25). Round to a tidy number.
- **No `Math.random` / `Date.now`** — output is a pure function of the rules, so the same
  filters always show the same count (stable demos; consistent with repo constraints).
- Incomplete rules are ignored.

`isRuleComplete`: true when required value(s) are present and, for "between", min ≤ max.

`summarizeAudienceFilters`: returns human-readable strings like
`"Vehicle year is between 2018–2022"`, `"Vehicle make is any of Honda, Ford"` — used by the
Review summary.

## Validation

New `validateAudienceStep` in `src/lib/campaign-setup-validation.ts`:
- The step is **optional**: zero rules → valid (targets all customers).
- For each added rule, flag incomplete ones: empty value, or "between" with min > max.
  Errors keyed by `rule.id` (e.g. `errors[`audience.${rule.id}`]`).
- Added to the `validateSetupStep` switch under `case "audience"`.
- **Not** added to `validateAllStepsBeforeActivate` (optional step must not block activation).

## Review Summary

`ReviewStep.tsx` gains a small read-only recap section ("Audience"):
- If `audienceFilters` is empty: "All customers (no audience filters)".
- Otherwise: a list rendered from `summarizeAudienceFilters(draft.audienceFilters)` plus the
  reach line "~N vehicles". Styled like the existing "Active triggers" summary card in
  `ConfigurationStep`.

## Files Touched

New:
- `src/components/campaigns/setup/steps/AudienceStep.tsx`
- `src/data/audience-attributes.ts`
- `src/lib/audience-filters.ts`

Modified:
- `src/types/campaign-setup.ts` — `SETUP_STEPS` (+`"audience"`), `AudienceAttribute`,
  `AudienceFilterRule`, `CampaignSetupDraft.audienceFilters`.
- `src/data/campaign-setup.defaults.ts` — `SETUP_STEP_META` entry, default `audienceFilters: []`.
- `src/components/campaigns/setup/CampaignSetupWizard.tsx` — render `<AudienceStep>`.
- `src/lib/campaign-setup-validation.ts` — `validateAudienceStep` + switch case.
- `src/components/campaigns/setup/steps/ReviewStep.tsx` — audience recap section.

## Testing

- Unit-test `estimateAudienceReach`: empty rules → base pool; determinism (same input →
  same output); incomplete rules ignored; floor respected; more rules → smaller-or-equal count.
- Unit-test `isRuleComplete` and `summarizeAudienceFilters` for each attribute type and the
  "between" min > max case.
- Unit-test `validateAudienceStep`: empty → valid; complete rules → valid; incomplete /
  inverted-range rule → error keyed by rule id.
- Manual: add/remove rules in the wizard, switch attributes (operator + value reset),
  confirm reach updates, confirm Review recap matches, confirm activation works with and
  without filters.

## Open Questions

None. (Combine logic = flat AND-only; Review shows read-only summary — both confirmed.)
