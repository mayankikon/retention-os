"use client";

import { CampaignStatusBadge } from "@/components/campaigns/CampaignStatusBadge";
import { PaginationBar } from "@/components/campaigns/PaginationBar";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CAMPAIGN_STATUSES } from "@/types/campaign";

export default function CampaignRedlinesPage() {
  return (
    <AppShell>
      <div className="space-y-10">
        <header>
          <h1 className="text-2xl font-semibold">Campaign List — Redlines</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Engineering handoff reference for spacing, tokens, and interaction
            states. All values use placeholder Ikon tokens from{" "}
            <code className="rounded bg-muted px-1">src/styles/globals.css</code>
            .
          </p>
        </header>

        <RedlineSection title="Typography">
          <p className="text-2xl font-semibold">Page title — 24px / semibold</p>
          <p className="text-sm text-muted-foreground">
            Secondary — 14px / muted-foreground
          </p>
        </RedlineSection>

        <RedlineSection title="Buttons">
          <div className="flex flex-wrap gap-3">
            <Button>Primary (default)</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button disabled>Disabled</Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Focus: 2px ring-ring offset-2. Hover/active per variant in button.tsx.
          </p>
        </RedlineSection>

        <RedlineSection title="Search input">
          <Input placeholder="Search by campaign" className="max-w-xs" />
          <Input
            placeholder="Error state"
            hasError
            className="max-w-xs"
            defaultValue="Invalid"
          />
          <Input
            placeholder="Success state"
            hasSuccess
            className="max-w-xs"
            defaultValue="Valid"
          />
        </RedlineSection>

        <RedlineSection title="Status badges">
          <div className="flex flex-wrap gap-2">
            {CAMPAIGN_STATUSES.map((status) => (
              <CampaignStatusBadge key={status} status={status} />
            ))}
          </div>
        </RedlineSection>

        <RedlineSection title="Pagination">
          <PaginationBar
            currentPage={2}
            totalPages={5}
            onPageChange={() => undefined}
          />
          <p className="text-xs text-muted-foreground">
            Prev/Next disabled at bounds. Current page uses primary variant.
          </p>
        </RedlineSection>

        <RedlineSection title="Table row states">
          <ul className="list-inside list-disc text-sm text-muted-foreground">
            <li>Default: card background, border-b</li>
            <li>Hover: bg-muted/60</li>
            <li>Focus-visible: ring-2 ring-inset ring-ring</li>
            <li>Active: bg-muted/80</li>
          </ul>
        </RedlineSection>

        <RedlineSection title="Spacing">
          <ul className="list-inside list-disc text-sm text-muted-foreground">
            <li>Page padding: 32px vertical, 16–32px horizontal (responsive)</li>
            <li>Filter gap: 12px</li>
            <li>Table cell padding: 12px horizontal, 12px vertical</li>
            <li>Section gap in list view: 24px</li>
          </ul>
        </RedlineSection>
      </div>
    </AppShell>
  );
}

function RedlineSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-lg border border-border bg-card p-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
