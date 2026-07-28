"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@ikontechnologies-arlington/nxtg-design-shiftpackage/primitives";
import { TitleBar } from "@/components/layout/TitleBar";

export function CampaignListHeader() {
  const router = useRouter();

  return (
    <TitleBar
      title="Campaigns"
      right={
        <Button
          size="header"
          leadingIcon={<Plus aria-hidden />}
          onClick={() => router.push("/campaigns/new")}
        >
          Create Campaign
        </Button>
      }
    />
  );
}
