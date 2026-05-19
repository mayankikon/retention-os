# Smart Marketing Campaign Manager (retention-os)

Phase 1 implementation of the **Campaign Summary / List View** for Ikon Smart Marketing Campaign Manager, with placeholder brand tokens and mock data.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000/campaigns](http://localhost:3000/campaigns).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm test` | Unit tests (Vitest) |
| `npm run lint` | ESLint |

## Routes

| Path | Description |
|------|-------------|
| `/campaigns` | Campaign list (filters, search, pagination) |
| `/campaigns/new` | Campaign setup wizard (SOP-aligned, 5 steps) |
| `/campaigns/redlines` | Engineering handoff / interaction specs |
| `/campaigns/[id]` | Detail stub |

## Documentation

See [`docs/`](docs/) for architecture, flows, and ADRs.

## Brand tokens

Swap Ikon tokens in [`src/styles/globals.css`](src/styles/globals.css) (search for `Ikon swap target`).
