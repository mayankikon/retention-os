# Repository structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout, NuqsAdapter, global styles
│   ├── page.tsx                # Redirect → /campaigns
│   ├── campaigns/
│   │   ├── page.tsx            # List view (server shell + client list)
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   ├── new/page.tsx        # Campaign setup wizard
│   │   ├── redlines/page.tsx   # Engineering handoff specs
│   │   └── [id]/page.tsx       # Campaign detail (Details + Change log tabs)
│   ├── accounts/
│   │   ├── page.tsx            # Dealership accounts list
│   │   └── loading.tsx
│   ├── templates/
│   │   ├── page.tsx            # Templates list
│   │   ├── new/page.tsx        # Create template wizard
│   │   └── [id]/
│   │       ├── page.tsx        # Template detail + history/usage
│   │       └── edit/page.tsx   # Edit template wizard
│   └── story-map/page.tsx      # Story map roadmap board
├── components/
│   ├── accounts/               # Dealership accounts list
│   ├── templates/              # Template list, wizard, detail
│   ├── campaigns/              # List + detail + setup feature components
│   │   ├── detail/             # Campaign detail tabs (Details, Change log)
│   │   └── setup/              # Wizard steps, shell, confirmation
│   ├── story-map/              # Roadmap sidebar, timeline, bars
│   ├── layout/AppShell.tsx
│   ├── layout/AppTitleBar.tsx
│   ├── layout/VersionSwitcher.tsx  # Sidebar product version dropdown
│   └── ui/                     # Shadcn primitives
├── contexts/
│   ├── product-version-context.tsx
│   └── session-context.tsx
├── data/
│   ├── accounts.mock.ts
│   ├── campaigns.mock.ts
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
│   ├── campaign-search-params.ts
│   └── story-map/              # Timeline math, constants, localStorage
├── styles/globals.css            # Ikon-swappable design tokens
└── types/
    ├── account.ts
    ├── product-version.ts
    ├── template.ts
    └── campaign.ts

docs/
├── architecture/
├── decisions/
└── flows/
```
