import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ReportShell } from "@/components/reports/ReportShell";

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell>
      <Suspense fallback={null}>
        <ReportShell>
          <Suspense fallback={null}>{children}</Suspense>
        </ReportShell>
      </Suspense>
    </AppShell>
  );
}
