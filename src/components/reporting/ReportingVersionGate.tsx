"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProductVersion } from "@/contexts/product-version-context";
import { isExistingReportingAvailable } from "@/lib/product-version";

/** Existing reporting lives on Post MVP V1.1 only. */
export function ReportingVersionGate() {
  const router = useRouter();
  const { versionId } = useProductVersion();

  useEffect(() => {
    if (!isExistingReportingAvailable(versionId)) {
      router.replace("/campaigns");
    }
  }, [router, versionId]);

  return null;
}
