import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ReportingShell } from "@/components/reporting/ReportingShell";
import { ReportingVersionGate } from "@/components/reporting/ReportingVersionGate";

export default function ReportingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell>
      <ReportingVersionGate />
      <ReportingShell>
        <Suspense fallback={null}>{children}</Suspense>
      </ReportingShell>
    </AppShell>
  );
}
