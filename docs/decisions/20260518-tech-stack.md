# ADR: Tech stack for Campaign Manager UI

**Date:** 2026-05-18  
**Status:** Accepted

## Context

Greenfield UI for Smart Marketing Campaign Manager list view and future setup flow. Requirements: App Router, branded tokens, URL-synced filters, accessible components, unit tests.

## Decision

- **Next.js 16** App Router with React 19
- **Tailwind CSS v4** with CSS `@theme` tokens in `src/styles/globals.css`
- **Shadcn-style** Radix primitives (no full CLI dependency tree)
- **nuqs** for search params (bookmarkable filter state)
- **TanStack Table** for column definitions and rendering
- **Vitest + Testing Library** for unit/component tests
- **Mock data** until backend contracts are finalized

## Consequences

- Fast iteration without API dependency
- Single-file token swap when Ikon brand guidelines are finalized
- `selectCampaigns()` in `src/lib/filters.ts` is the seam for server-side filtering later
