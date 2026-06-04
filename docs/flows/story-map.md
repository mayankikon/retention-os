# Story map flow

Interactive roadmap for placing features on a timeline (Jun 2026 – Jun 2027).

## Route

- `/story-map` — client page with feature sidebar + scrollable timeline board

## Default features

On first load (or when missing from saved state), the backlog is seeded with 24 predefined capabilities from `src/data/story-map.defaults.ts` (Campaign Builder, Template Builder, Coupon Builder, etc.). Each appears as a separate backlog item.

## Flow tags

Each feature has a **flow** bucket: `Flow 1`, `Flow 2`, `Flow 3`, `Flow 4`, `Dependency`, or `N/A` (default). Set via the dropdown on each row in the sidebar; the tag also appears on timeline bars. Stored on `StoryMapFeature.flow`.

## Dependencies

Link one scheduled feature area to another to show that the **dependent** waits on a **blocker** (predecessor).

- **Dependencies…** — dialog on a scheduled feature; pick blockers from a dropdown
- **Link dependency** — timeline mode: click dependent, then click blocker
- **Dep** button on scheduled sidebar rows opens the dependency dialog
- Arrows on the timeline run from blocker end → dependent start (dashed red if the dependent starts before the blocker ends)
- Adding a link sets the dependent feature’s flow tag to **Dependency**
- Stored in `StoryMapState.dependencies` as `{ id, dependentFeatureId, blockerFeatureId }`

## Timeline rows

- Each horizontal row is a **lane** (`laneIndex`). Use the **+** button above the row gutter to add empty rows.
- **Drag the grip** on a row to reorder lanes up/down (features on that row move with it).
- **Trash** on a row removes the feature from the timeline (back to backlog), or removes an empty row when more than the minimum row count exists.
- Drag a feature bar vertically to move it to another row; dropping on an occupied row swaps positions.

## User flow

1. **Add feature** — Enter a name in the left sidebar and click Add. New features land in **Backlog** (`startDate: null`).
2. **Schedule** — Drag a backlog item onto the timeline. Drop position sets `startDate` (day column) and `laneIndex` (vertical row).
3. **Move** — Drag a bar horizontally to change start date (clamped so the bar stays within the timeline).
4. **Resize** — Drag the left edge to change start + duration; drag the right edge to change duration only (minimum 1 day).
5. **Prioritize** — Click a bar (without dragging) to open the priority dialog: **MVP**, **Post-MVP**, or **2027 future**. Bar color updates immediately.
6. **Overlap** — Multiple bars can share the same lane; selected bar uses a higher z-index.

## Persistence

- **Storage key:** `retention-os:story-map:v1` in `localStorage`
- **Shape:** `{ features: StoryMapFeature[], laneCount: number, dependencies: StoryMapDependency[] }`
- No server API in v1

## Timeline bounds

| Constant | Value |
|----------|--------|
| Start | `2026-06-01` |
| End | `2027-06-30` (inclusive) |
| Layout | Full width of board (no horizontal scroll); day columns scale as % of container |
| Lane height | 44px |

## Key modules

| Path | Role |
|------|------|
| `src/app/story-map/page.tsx` | Route entry |
| `src/components/story-map/` | UI (sidebar, timeline, bars, priority dialog) |
| `src/hooks/use-story-map-state.ts` | State + CRUD |
| `src/lib/story-map/timeline-math.ts` | Date/index/position helpers |
| `src/types/story-map.ts` | Types |
