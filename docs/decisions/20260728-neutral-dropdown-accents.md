# Neutral dropdown accent tokens

Date: 2026-07-28

## Context

Shift Select and DropdownMenu items use semantic `--accent` / `--accent-foreground` for hover and focus. Those tokens were bridged to brand interactive green (`--theme-text-interactive`) and a mint fill (`--theme-background-accent`), so every dropdown highlight looked branded green.

## Decision

Keep brand CTAs on `--primary` / `--brand-primary`. Remap menu highlight tokens to neutrals in `src/styles/globals.css`:

- `--accent` / `--theme-background-accent` → cool gray fill (same family as page muted surfaces)
- `--accent-foreground` → `--theme-text-primary`
- `--ring` → `--theme-stroke-hover` (neutral focus ring, not stroke-accent green)

## Consequences

All Select and menu item hover/focus states are neutral app-wide without per-call-site class overrides. Primary buttons and brand text remain green.
