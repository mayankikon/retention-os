# Shift design-system UI cutover

**Date:** 2026-07-28  
**Status:** Approved for implementation

## Goal

Replace all local `@/components/ui/*` primitives with `@ikontechnologies-arlington/nxtg-design-shiftpackage`. Match Shift visuals/behavior exactly. Delete the local `ui/` folder.

## Scope

- Swap imports for Button, Input, Textarea, Label, Badge, Select, Dialog, Checkbox, Switch, Avatar, Table, Tooltip, Skeleton
- Adapt Base UI APIs (`asChild` → `render`, Select `items`, Checkbox `onCheckedChange`)
- Map status badges to Shift `Badge` tones
- Remove unused Radix UI dependencies after cutover

## Out of scope

- Redesigning AppShell / feature layout beyond primitive swap
- Migrating non-UI domain components
