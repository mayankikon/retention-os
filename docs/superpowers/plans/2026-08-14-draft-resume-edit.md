# Draft Resume / Edit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let creators reopen a Draft from detail, edit the setup wizard in place, Save Draft without duplicating the campaign, and continue toward Activate.

**Architecture:** Persist full `CampaignSetupDraft` on each draft `Campaign`. Add `/campaigns/[id]/edit` that hydrates `CampaignSetupWizard` in edit mode. Detail header CTAs deep-link by completeness. Save/Activate update the same id via store helpers.

**Tech Stack:** Next.js App Router, React client components, nuqs, localStorage campaign store, Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-08-14-draft-resume-edit-design.md`

## Global Constraints

- Wizard steps remain General → Messaging → Reminders → Configuration → Review
- Edit only when `status === "draft"`; Active/Paused out of scope
- Save Draft in edit mode updates in place and returns to `/campaigns/[id]`
- Discard changes discards unsaved edits only; never deletes the campaign
- Full `setupDraft` required for true resume; thin legacy drafts use recovery hydrate

## File map

| File | Responsibility |
|------|----------------|
| `src/types/campaign.ts` | Optional `setupDraft` on `Campaign` |
| `src/lib/create-campaign-from-draft.ts` | Attach `setupDraft`; add `updateCampaignFromDraft` |
| `src/lib/campaign-setup-resume.ts` | Completeness, first incomplete step, hydrate from campaign |
| `src/lib/campaign-store.ts` | `upsertUserCreatedCampaign` / replace-by-id helper |
| `src/components/campaigns/setup/CampaignSetupWizard.tsx` | Create vs edit modes |
| `src/components/campaigns/setup/StepShellLayout.tsx` | Edit titles/breadcrumbs; pass stepper jump |
| `src/components/campaigns/setup/StepperHeader.tsx` | Clickable completed/current steps |
| `src/app/campaigns/[id]/edit/page.tsx` | Edit route + not-found / not-draft / corrupt guards |
| `src/components/campaigns/detail/CampaignDetailHeader.tsx` | Draft CTAs |
| Docs: `docs/flows/campaign-setup.md`, `docs/architecture/repo-structure.md` | Sync routes/behavior |

---

### Task 1: Persist setup draft + resume helpers

**Files:**
- Modify: `src/types/campaign.ts`
- Modify: `src/lib/create-campaign-from-draft.ts`
- Create: `src/lib/campaign-setup-resume.ts`
- Modify: `src/lib/campaign-store.ts`
- Test: `src/lib/create-campaign-from-draft.test.ts`, `src/lib/campaign-setup-resume.test.ts`

**Interfaces:**
- Produces: `Campaign.setupDraft?: CampaignSetupDraft`
- Produces: `updateCampaignFromDraft(existing, draft, user, options) => Campaign`
- Produces: `isSetupDraftComplete(draft)`, `getFirstIncompleteSetupStep(draft)`, `getCompletedSetupSteps(draft)`, `hydrateSetupDraftFromCampaign(campaign)`, `hasRecoverableSetupDraft(campaign)`

- [ ] **Step 1: Write failing tests** for `createCampaignFromDraft` storing `setupDraft`, `updateCampaignFromDraft` preserving id/createdAt, and resume helpers (complete vs incomplete landing).

- [ ] **Step 2: Implement types + helpers + store upsert**

- [ ] **Step 3: Run tests** — `npx vitest run src/lib/create-campaign-from-draft.test.ts src/lib/campaign-setup-resume.test.ts`

---

### Task 2: Wizard edit mode + clickable stepper

**Files:**
- Modify: `CampaignSetupWizard.tsx`, `StepShellLayout.tsx`, `StepperHeader.tsx`

**Interfaces:**
- Consumes: resume helpers + `updateCampaignFromDraft` / `addUserCreatedCampaign`
- Produces: `CampaignSetupWizardProps { mode?: "create" | "edit"; campaignId?: string; initialDraft?: CampaignSetupDraft; initialStep?: SetupStepId }`

- [ ] **Step 1: Extend wizard** — hydrate initial draft/completed steps; edit Save/Activate Now update same id; edit Save redirects to detail; Cancel targets detail in edit mode; leave-guard Discard changes goes to detail without delete.

- [ ] **Step 2: Stepper** — optional `onStepSelect`; only completed + current clickable; `aria-current` on current.

- [ ] **Step 3: Smoke-test mentally / unit where cheap** — no full wizard E2E required if helpers covered.

---

### Task 3: Edit route + detail CTAs

**Files:**
- Create: `src/app/campaigns/[id]/edit/page.tsx`
- Modify: `CampaignDetailHeader.tsx` + `.test.tsx`
- Docs: `docs/flows/campaign-setup.md`, `docs/architecture/repo-structure.md` (if present)

- [ ] **Step 1: Edit page** — load campaign client-side; not found / not draft / thin payload recovery UI; render wizard in edit mode with landing step from helpers (honor `?step=` when allowed).

- [ ] **Step 2: Detail header** — incomplete → Continue setup; complete → Edit + Review & activate; links to `/campaigns/[id]/edit` (± `?step=review`).

- [ ] **Step 3: Header tests** for draft CTAs; run vitest for header + resume + create-from-draft.

- [ ] **Step 4: Update flow docs**

---

## Verification

```bash
npx vitest run src/lib/create-campaign-from-draft.test.ts src/lib/campaign-setup-resume.test.ts src/components/campaigns/detail/CampaignDetailHeader.test.tsx
```

Manual: create draft → open detail → Continue/Edit → change field → Save Draft → same id on detail → Review & activate when complete.
