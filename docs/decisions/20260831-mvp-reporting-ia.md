# ADR: MVP Smart Marketing reporting IA

Date: 2026-08-31

## Status

Accepted

## Context

SM2-207 / SM2-208 / SM2-209 add Ikon SM Admin reporting. The Campaign Manager prototype had no Reporting section. Legacy mocks used “Global Weekly Click Rate” and “Clicks Activity Detail”, and the leaderboard framed dealer groups as the ranked entity.

## Decision

- Add a first-class **Reporting** destination in Smart Marketing nav, gated to **Post MVP V1.1**.
- Persist that slice as a sidebar **Existing reporting** dropdown (single value). Other versions do not show the field.
- Share one reporting shell with three tabs: Leaderboard, Weekly CER, Activity Detail.
- Rank **rooftops** by CER%; show dealer group as a secondary label.
- Hide the leaderboard for ungrouped / single-rooftop accounts.
- Do not rank rooftops with fewer than 50 messages sent (Low sample treatment).
- Rename weekly and activity reports to **Smart Service Lead** + **CER** language.
- Add **Mileage** on activity detail, with `—` when unknown.
- Keep Dealer Admin in-group leaderboard out of MVP (SM2-211).

## Consequences

- Reporting is mock-backed and CSV is generated in the browser until reporting APIs exist.
- Product copy uses CER rather than “click rate” in report titles; card/row metrics still expose sent, clicks, and CER%.
