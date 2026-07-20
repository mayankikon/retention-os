import { AppShell } from "@/components/layout/AppShell";
import { TemplateDetailView } from "@/components/templates/TemplateDetailView";

interface TemplateDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TemplateDetailPage({
  params,
}: TemplateDetailPageProps) {
  const { id } = await params;

  return (
    <AppShell>
      <TemplateDetailView templateId={id} />
    </AppShell>
  );
}
