# ADR: Adopt Shift design-system package

**Date:** 2026-07-28  
**Status:** Accepted

## Context

Retention OS currently uses local Shadcn/Radix primitives and hand-rolled tokens in `src/styles/globals.css`. NXTG apps are standardizing on `@ikontechnologies-arlington/nxtg-design-shiftpackage` (GitHub Packages) for tokens, primitives, motion, and theme.

## Decision

- Install `@ikontechnologies-arlington/nxtg-design-shiftpackage` from GitHub Packages
- Import package CSS tokens + motion styles in `src/styles/globals.css`
- Add Tailwind `@source` for the package `dist` so primitive utility classes compile
- Wrap the app with `AppThemeProvider`, `GroovedPanelPreferenceProvider`, and package `TooltipProvider` via a local `"use client"` providers boundary
- Keep app-specific brand/status tokens; bridge shell colors to Shift theme tokens under `.dark`

## Consequences

- Shift primitives can be adopted incrementally without restyling the whole app first
- Future installs need GitHub Packages auth (`GITHUB_TOKEN` + `.npmrc`) and may require `--legacy-peer-deps` until `lucide-react` peer ranges catch up
- Local `@/components/ui/*` removed; all design primitives import from the Shift package
- App chrome uses Shift `Sidebar` + `AppGroovedMainColumn` (see smart-marketing-web pattern)
- Components that import Shift must be Client Components (`"use client"`) because the package barrel evaluates Base UI context at module load
- Loading routes use a local `LoadingSkeleton` (not Shift) to avoid createContext in `loading.tsx`
- List tables use Shift `DesignSystemTableShellNoTabs` + `TableHeaderCell`; `PaginationBar` wraps Shift `Paginator` (`variant="inline"`) in the shell footer
- App-level `TitleBar` lives in `src/components/layout/TitleBar.tsx` (not exported by the package)
