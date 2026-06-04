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
│   └── story-map/page.tsx      # Story map roadmap board
├── components/
│   ├── campaigns/              # List + detail + setup feature components
│   │   ├── detail/             # Campaign detail tabs (Details, Change log)
│   │   └── setup/              # Wizard steps, shell, confirmation
│   ├── story-map/              # Roadmap sidebar, timeline, bars
│   ├── layout/AppShell.tsx
│   ├── layout/AppTitleBar.tsx
│   └── ui/                     # Shadcn primitives
├── data/
│   ├── campaigns.mock.ts
│   ├── lookups.ts
│   └── story-map.defaults.ts   # Predefined story map backlog features
├── lib/
│   ├── filters.ts
│   ├── dates.ts
│   ├── format.ts
│   ├── pagination.ts
│   ├── campaign-search-params.ts
│   └── story-map/              # Timeline math, constants, localStorage
├── styles/globals.css            # Ikon-swappable design tokens
└── types/campaign.ts

docs/
├── architecture/
├── decisions/
└── flows/
```
