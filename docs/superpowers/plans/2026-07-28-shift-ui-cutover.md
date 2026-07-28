# Shift UI Cutover Implementation Plan

> **For agentic workers:** Execute tasks in order. Each task = implement + verify.

**Goal:** Replace all `@/components/ui/*` with Shift package primitives.

**Spec:** `docs/superpowers/specs/2026-07-28-shift-ui-cutover-design.md`

## Tasks

1. Create shared import alias pattern and migrate simple components (Button/Input/Label/etc. without API changes)
2. Migrate Select call sites with `items` prop
3. Migrate Checkbox/Switch to Base UI checked API
4. Replace `Button asChild` with `render={<Link />}`
5. Migrate badges to Shift Badge tones
6. Delete `src/components/ui/`, prune Radix deps, update docs, run build+tests
