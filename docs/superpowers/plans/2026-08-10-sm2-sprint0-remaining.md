# SM2 Sprint 0 Remaining Prototype — Implementation Plan

> **For agentic workers:** Execute task-by-task in order. Checkbox steps track progress.

**Goal:** Ship SM2-75, SM2-126, SM2-57 (labels/filters), and SM2-56 (light) in the retention-os prototype.

**Architecture:** Evolve campaign setup draft + lookups; keep wizard step structure; migrate campaign status enums/mocks; reuse DealershipScopeBar group/dealer helpers.

**Tech Stack:** Next.js App Router, React, TypeScript, nuqs, existing Shift design-system primitives, Jest.

**Spec:** `docs/superpowers/specs/2026-08-10-sm2-sprint0-remaining-design.md`

## Global Constraints

- Both product versions
- No Jira / Figma work
- No start/end dates; no template sets / rooftop activation
- Status live controls deferred (labels/filters only)
- Sequential: 75 → 126 → 57 → 56

---

### Task 1: SM2-75 — General Group + Dealership multi-select

**Files:**
- Modify: `src/types/campaign-setup.ts`
- Modify: `src/data/campaign-setup.defaults.ts`
- Modify: `src/data/lookups.ts` (dealer timezone map if missing)
- Modify: `src/lib/campaign-setup-validation.ts`
- Modify: `src/components/campaigns/setup/steps/GeneralStep.tsx`
- Modify: preview helpers that read dealership / timeZone
- Test: `src/lib/campaign-setup-validation` tests (or new)
- Docs: `docs/flows/campaign-setup.md`

- [ ] Extend draft with `groupId` + `dealershipIds`; keep `timeZone` as derived primary
- [ ] General UI: Group select, multi-select dealers with TZ, remove SOP name hint + standalone TZ when known
- [ ] Validation + preview uses first selected dealer
- [ ] Tests + docs

### Task 2: SM2-126 — Optional send time

**Files:**
- Modify: `src/types/campaign-setup.ts` (`sendTimeLocal`)
- Modify: `src/data/campaign-setup.defaults.ts`
- Modify: `src/components/campaigns/setup/steps/ConfigurationStep.tsx`
- Modify: review/summary displays if schedule is shown
- Test: validation / format helpers

- [ ] Add optional HH:mm control; keep SOP table
- [ ] Persist null when empty
- [ ] Tests + docs

### Task 3: SM2-57 — Status labels/filters

**Files:**
- Modify: `src/types/campaign.ts`
- Modify: `src/data/lookups.ts` (`STATUS_LABELS`, filters)
- Modify: `src/data/campaigns.mock.ts`
- Modify: `src/components/campaigns/CampaignStatusBadge.tsx`
- Modify: changelog / detail header if they reference stopped/scheduled
- Test: badge / filter tests

- [ ] New status union; migrate mocks; update filters/badges
- [ ] Hide or neutralize Stop → stopped if needed
- [ ] Tests + docs

### Task 4: SM2-56 — Templates light audit

**Files:**
- Inspect: `src/components/templates/TemplateWizard.tsx`
- Modify only if variable insert missing

- [ ] Parity with Messaging variable dialog or no-op if already present
- [ ] Docs only if behavior changes

### Task 5: Verification

- [ ] Run targeted Jest suites
- [ ] Manual smoke of General → Configuration → list status filter
