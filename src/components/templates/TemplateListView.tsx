"use client";

import Link from "next/link";
import { FilePlus2 } from "lucide-react";
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
import { useTemplates } from "@/hooks/use-templates";
import { formatTimestamp } from "@/lib/dates";
import { getTemplateUsageCount } from "@/lib/template-usage";

export function TemplateListView() {
  const templates = useTemplates();

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Templates
          </h1>
          <p className="text-sm text-muted-foreground">
            Create and manage message templates used in campaign setup.{" "}
            {templates.length} templates
          </p>
        </div>
        <Button asChild>
          <Link href="/templates/new">
            <FilePlus2 className="h-4 w-4" aria-hidden />
            Create template
          </Link>
        </Button>
      </header>

      <div className="w-full overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Heading</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Campaigns using</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead>Updated by</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.map((template) => {
              const usageCount = getTemplateUsageCount(template.id);

              return (
                <TableRow key={template.id}>
                  <TableCell>
                    <Link
                      href={`/templates/${template.id}`}
                      className="font-medium text-brand-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                    >
                      {template.heading}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                      {template.message}
                    </p>
                  </TableCell>
                  <TableCell>
                    <TemplateStatusBadge status={template.status} />
                  </TableCell>
                  <TableCell className="tabular-nums text-foreground">
                    {usageCount}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatTimestamp(template.updatedAt)}
                  </TableCell>
                  <TableCell className="text-sm text-foreground">
                    {template.updatedBy.name}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
