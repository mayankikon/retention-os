import { AppShell } from "@/components/layout/AppShell";
import { TemplateWizard } from "@/components/templates/TemplateWizard";

export default function CreateTemplatePage() {
  return (
    <AppShell>
      <TemplateWizard mode="create" />
    </AppShell>
  );
}
