"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Archive, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { TemplateStatusBadge } from "@/components/templates/TemplateStatusBadge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCurrentUser } from "@/contexts/session-context";
import { useTemplate } from "@/hooks/use-templates";
import { formatTimestamp } from "@/lib/dates";
import {
  deleteTemplate,
  setTemplateStatus,
} from "@/lib/template-store";
import {
  canHardDeleteTemplate,
  getCampaignsUsingTemplate,
  getTemplateUsageCount,
} from "@/lib/template-usage";

interface TemplateDetailViewProps {
  templateId: string;
}

export function TemplateDetailView({ templateId }: TemplateDetailViewProps) {
  const router = useRouter();
  const user = useCurrentUser();
  const template = useTemplate(templateId);
  const usage = getCampaignsUsingTemplate(templateId);
  const usageCount = getTemplateUsageCount(templateId);
  const canDelete = canHardDeleteTemplate(templateId);

  if (!template) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Template not found</h1>
        <Button asChild variant="outline">
          <Link href="/templates">Back to templates</Link>
        </Button>
      </div>
    );
  }

  const actor = {
    id: user.id,
    name: user.name,
    initials: user.initials,
  };

  const handleArchive = () => {
    setTemplateStatus(template.id, "archived", actor);
  };

  const handleRestore = () => {
    setTemplateStatus(template.id, "draft", actor);
  };

  const handlePublish = () => {
    setTemplateStatus(template.id, "published", actor);
  };

  const handleDelete = () => {
    if (!canDelete) return;
    const confirmed = window.confirm(
      `Permanently delete “${template.heading}”? This cannot be undone.`,
    );
    if (!confirmed) return;
    deleteTemplate(template.id);
    router.push("/templates");
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {template.heading}
            </h1>
            <TemplateStatusBadge status={template.status} />
          </div>
          <p className="text-sm text-muted-foreground">{template.message}</p>
          <p className="text-xs text-muted-foreground">
            Created by {template.createdBy.name} ·{" "}
            {formatTimestamp(template.createdAt)}
            {" · "}
            Last updated by {template.updatedBy.name} ·{" "}
            {formatTimestamp(template.updatedAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href={`/templates/${template.id}/edit`}>
              <Pencil className="h-4 w-4" aria-hidden />
              Edit
            </Link>
          </Button>
          {template.status !== "published" ? (
            <Button type="button" onClick={handlePublish}>
              Publish
            </Button>
          ) : null}
          {template.status === "archived" ? (
            <Button type="button" variant="outline" onClick={handleRestore}>
              <RotateCcw className="h-4 w-4" aria-hidden />
              Restore to draft
            </Button>
          ) : (
            <Button type="button" variant="outline" onClick={handleArchive}>
              <Archive className="h-4 w-4" aria-hidden />
              Archive
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            disabled={!canDelete}
            onClick={handleDelete}
            title={
              canDelete
                ? "Permanently delete"
                : "Cannot delete while campaigns use this template — archive instead"
            }
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            Delete
          </Button>
        </div>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Content</h2>
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm space-y-4 text-sm">
          <ContentBlock label="Primary promo text" value={template.primaryPromoText} />
          <ContentBlock label="Dealer URL" value={template.dealerUrl || "—"} />
          <ContentBlock
            label="Campaign image"
            value={template.campaignImageFileName || "None"}
          />
          <ContentBlock
            label="Reminder 1"
            value={
              template.reminder1Enabled
                ? template.reminder1Text
                : "Disabled"
            }
          />
          <ContentBlock
            label="Reminder 2"
            value={
              template.reminder2Enabled
                ? template.reminder2Text
                : "Disabled"
            }
          />
          <ContentBlock
            label="Reminder 3"
            value={
              template.reminder3Enabled
                ? template.reminder3Text
                : "Disabled"
            }
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">
          Where it&apos;s used ({usageCount})
        </h2>
        {usage.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-card px-4 py-8 text-sm text-muted-foreground">
            No campaigns are currently using this template.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Dealer</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usage.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell>
                      <Link
                        href={`/campaigns/${campaign.id}`}
                        className="font-medium text-brand-primary hover:underline"
                      >
                        {campaign.name}
                      </Link>
                    </TableCell>
                    <TableCell>{campaign.dealer}</TableCell>
                    <TableCell className="capitalize">{campaign.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">
          Version history
        </h2>
        <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Who</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Summary</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {template.auditEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {formatTimestamp(event.at)}
                  </TableCell>
                  <TableCell className="text-sm">{event.actor.name}</TableCell>
                  <TableCell className="text-sm capitalize">
                    {event.action.replaceAll("_", " ")}
                  </TableCell>
                  <TableCell className="text-sm text-foreground">
                    {event.summary}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}

function ContentBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 whitespace-pre-wrap text-foreground">{value}</p>
    </div>
  );
}
