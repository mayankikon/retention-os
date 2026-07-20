"use client";

import { use } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { TemplateWizard } from "@/components/templates/TemplateWizard";
import { useTemplate } from "@/hooks/use-templates";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface EditTemplatePageProps {
  params: Promise<{ id: string }>;
}

export default function EditTemplatePage({ params }: EditTemplatePageProps) {
  const { id } = use(params);
  const template = useTemplate(id);

  return (
    <AppShell>
      {template ? (
        <TemplateWizard mode="edit" initialTemplate={template} />
      ) : (
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold">Template not found</h1>
          <Button asChild variant="outline">
            <Link href="/templates">Back to templates</Link>
          </Button>
        </div>
      )}
    </AppShell>
  );
}
