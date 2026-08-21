import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { StrictMode, type ReactNode } from "react";
import { CampaignDetailView } from "@/components/campaigns/detail/CampaignDetailView";
import type { Campaign } from "@/types/campaign";

const consumeFlashMock = vi.fn();

const activeCampaign: Campaign = {
  id: "cmp-live",
  name: "Spring Service Reminder",
  dealer: "Ikon Motors North",
  timeZone: "CST",
  status: "active",
  messages: 12,
  clickThroughRate: 4,
  createdBy: { id: "u1", name: "Ada Lovelace", initials: "AL" },
  createdAt: "2026-01-01T00:00:00.000Z",
  group: "Service",
  lastUpdatedAt: "2026-01-02T00:00:00.000Z",
  nextUpdateAt: "2026-01-03T00:00:00.000Z",
};

vi.mock("@/hooks/use-campaigns", () => ({
  useCampaigns: () => [activeCampaign],
}));

vi.mock("@/lib/campaign-store", () => ({
  consumeCampaignFlashMessage: () => consumeFlashMock(),
}));

vi.mock("@/lib/campaign-analytics", () => ({
  getCampaignAnalytics: () => ({ messagesSent: 12 }),
}));

vi.mock("@/lib/campaign-changelog", () => ({
  buildCampaignChangelog: () => [],
}));

vi.mock("@/components/campaigns/detail/CampaignDetailHeader", () => ({
  CampaignDetailHeader: ({ campaign }: { campaign: Campaign }) => (
    <h1>{campaign.name}</h1>
  ),
}));

vi.mock("@/components/campaigns/detail/CampaignDetailsTab", () => ({
  CampaignDetailsTab: () => <div>details</div>,
}));

vi.mock("@/components/campaigns/detail/CampaignChangelogTab", () => ({
  CampaignChangelogTab: () => <div>changelog</div>,
}));

vi.mock(
  "@ikontechnologies-arlington/nxtg-design-shiftpackage/primitives",
  () => ({
    buttonVariants: () => "button",
  }),
);

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children?: ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

describe("CampaignDetailView", () => {
  afterEach(() => {
    cleanup();
    consumeFlashMock.mockReset();
  });

  it("shows a bottom-right toast after live copy is updated", () => {
    consumeFlashMock.mockReturnValue({
      kind: "copyUpdated",
      campaignName: "Spring Service Reminder",
    });

    render(<CampaignDetailView campaignId="cmp-live" />);

    expect(screen.getByTestId("app-toast")).toHaveTextContent(
      "Spring Service Reminder copy updated for new and not-yet-sent recipients.",
    );
  });

  it("keeps the toast when the mount effect runs twice and the message is already consumed", () => {
    consumeFlashMock
      .mockReturnValueOnce({
        kind: "copyUpdated",
        campaignName: "Spring Service Reminder",
      })
      .mockReturnValue(null);

    render(
      <StrictMode>
        <CampaignDetailView campaignId="cmp-live" />
      </StrictMode>,
    );

    expect(consumeFlashMock.mock.calls.length).toBeGreaterThan(1);
    expect(screen.getByTestId("app-toast")).toHaveTextContent(
      "Spring Service Reminder copy updated for new and not-yet-sent recipients.",
    );
  });
});
