# Repository structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout, NuqsAdapter, global styles
│   ├── page.tsx                # Redirect → /campaigns
│   └── campaigns/
│       ├── page.tsx            # List view (server shell + client list)
│       ├── loading.tsx
│       ├── error.tsx
│       ├── new/page.tsx        # Campaign setup wizard
│       ├── redlines/page.tsx   # Engineering handoff specs
│       └── [id]/page.tsx       # Detail stub (out of scope)
├── components/
│   ├── campaigns/              # List + setup feature components
│   │   └── setup/              # Wizard steps, shell, confirmation
│   ├── layout/AppShell.tsx
│   ├── layout/AppTitleBar.tsx
│   └── ui/                     # Shadcn primitives
├── data/
│   ├── campaigns.mock.ts
│   └── lookups.ts
├── lib/
│   ├── filters.ts
│   ├── dates.ts
│   ├── format.ts
│   ├── pagination.ts
│   └── campaign-search-params.ts
├── styles/globals.css            # Ikon-swappable design tokens
└── types/campaign.ts

docs/
├── architecture/
├── decisions/
└── flows/
```
