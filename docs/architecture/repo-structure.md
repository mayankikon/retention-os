# Repository structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout, design-system + NuqsAdapter, global styles
│   ├── page.tsx                # Redirect → /campaigns
│   ├── campaigns/
│   │   ├── page.tsx            # List view (server shell + client list)
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   ├── new/page.tsx        # Campaign setup wizard (create)
│   │   ├── redlines/page.tsx   # Engineering handoff specs
│   │   └── [id]/
│   │       ├── page.tsx        # Campaign detail (Details + Change log tabs)
│   │       ├── edit/page.tsx   # Draft resume / edit setup wizard
│   │       └── copy/page.tsx   # Active/paused message-body-only edit
│   ├── reports/
│   │   ├── layout.tsx          # App shell + Reports (all versions)
│   │   ├── page.tsx            # KPI strip + dealership performance
│   │   └── activity/page.tsx   # Dealership customer activity
│   ├── templates/
│   │   ├── page.tsx            # Templates list
│   │   ├── new/page.tsx        # Create template wizard
│   │   └── [id]/
│   │       ├── page.tsx        # Template detail + history/usage
│   │       └── edit/page.tsx   # Edit template wizard
│   └── story-map/page.tsx      # Story map roadmap board
├── components/
│   ├── accounts/               # Dormant Toolbox-owned account UI modules; no SM route
│   ├── templates/              # Template list, wizard, detail
│   ├── campaigns/              # List + detail + setup feature components
│   │   ├── detail/             # Detail tabs + live copy-only editor
│   │   └── setup/              # Wizard steps, shell, confirmation
│   ├── reporting/              # Shared reporting UI kit (cards, selects, empty states)
│   ├── reports/                # Reports + activity drill-down
│   ├── story-map/              # Roadmap sidebar, timeline, bars
│   ├── layout/AppShell.tsx       # Shift Sidebar (Toolbox / Retention OS lockup when expanded, condensed mark when collapsed) + AppGroovedMainColumn
│   ├── layout/app-navigation.ts   # Smart Marketing-owned nav destinations only
│   ├── layout/AppToast.tsx       # Bottom-right success toast (live copy save)
│   ├── layout/TitleBar.tsx       # Shift 2.0 page title bar (app-level; not in package)
│   ├── layout/ToolboxRetentionOsLogo.tsx  # Toolbox + Retention OS sidebar lockup
│   ├── layout/VersionSwitcher.tsx  # Sidebar footer product version switcher
│   ├── layout/LoadingSkeleton.tsx  # Server-safe loading placeholder
│   ├── providers/design-system-providers.tsx  # Shift AppTheme + chrome providers
│   └── (feature components — UI primitives from Shift package)
├── contexts/
│   ├── product-version-context.tsx
│   └── session-context.tsx
├── data/
│   ├── accounts.mock.ts
│   ├── campaigns.mock.ts
│   ├── reporting.mock.ts       # CER leaderboard, weekly CER, activity rows
│   ├── templates.seed.ts       # Seeded system message templates
│   ├── lookups.ts
│   └── story-map.defaults.ts   # Predefined story map backlog features
├── lib/
│   ├── account-filters.ts
│   ├── account-search-params.ts
│   ├── account-store.ts
│   ├── product-version.ts      # Version persistence + feature gates
│   ├── template-store.ts       # Template CRUD + localStorage
│   ├── template-usage.ts       # Campaigns using a template
│   ├── template-validation.ts
│   ├── filters.ts
│   ├── dates.ts
│   ├── format.ts
│   ├── pagination.ts
│   ├── reporting.ts            # Shared CER math, weekly/activity filters, CSV
│   ├── report-date-range.ts    # Report date presets, range math, URL range parsing
│   ├── reports.ts              # Report rank, KPIs, date-range metrics, campaign column, activity filter
│   ├── campaign-search-params.ts
│   ├── campaign-setup-resume.ts # Draft completeness + hydrate for edit
│   ├── campaign-live-copy.ts    # Live copy extraction, variable locks, update
│   ├── create-campaign-from-draft.ts
│   ├── app-dialog-shell.ts     # Shared dialog chrome classes (productdemo parity)
│   └── story-map/              # Timeline math, constants, localStorage
├── styles/globals.css            # App tokens + Shift package CSS imports
└── types/
    ├── account.ts
    ├── product-version.ts
    ├── template.ts
    ├── reporting.ts
    ├── reports.ts
    └── campaign.ts

docs/
├── architecture/
├── decisions/
└── flows/
```
