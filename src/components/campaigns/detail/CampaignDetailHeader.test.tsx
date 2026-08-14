import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { CampaignDetailHeader } from "@/components/campaigns/detail/CampaignDetailHeader";
import { createDefaultSetupDraft } from "@/data/campaign-setup.defaults";
import type { Campaign } from "@/types/campaign";

const pushMock = vi.fn();
const updateCampaignStatusMock = vi.fn();
const setCampaignFlashMessageMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/lib/campaign-store", () => ({
  updateCampaignStatus: (...args: unknown[]) =>
    updateCampaignStatusMock(...args),
  setCampaignFlashMessage: (...args: unknown[]) =>
    setCampaignFlashMessageMock(...args),
}));

vi.mock("@/components/layout/TitleBar", () => ({
  TitleBar: ({
    title,
    right,
  }: {
    title?: ReactNode;
    right?: ReactNode;
  }) => (
    <div>
      <h1>{title}</h1>
      <div>{right}</div>
    </div>
  ),
}));

vi.mock("@/components/campaigns/CampaignStatusBadge", () => ({
  CampaignStatusBadge: () => <span>status</span>,
}));

vi.mock(
  "@ikontechnologies-arlington/nxtg-design-shiftpackage/primitives",
  () => ({
    Button: ({
      children,
      onClick,
      leadingIcon,
    }: {
      children?: ReactNode;
      onClick?: () => void;
      leadingIcon?: ReactNode;
    }) => (
      <button type="button" onClick={onClick}>
        {leadingIcon}
        {children}
      </button>
    ),
    buttonVariants: () => "btn",
  }),
);

function buildCampaign(status: Campaign["status"]): Campaign {
  return {
    id: "cmp-test",
    name: "Test Campaign",
    dealer: "Ikon Motors North",
    timeZone: "CST",
    status,
    messages: 10,
    clickThroughRate: 5,
    createdBy: { id: "u1", name: "Ada Lovelace", initials: "AL" },
    createdAt: "2026-01-01T00:00:00.000Z",
    group: "Retention",
    lastUpdatedAt: "2026-01-02T00:00:00.000Z",
    nextUpdateAt: "2026-01-03T00:00:00.000Z",
  };
}

describe("CampaignDetailHeader", () => {
  beforeEach(() => {
    pushMock.mockReset();
    updateCampaignStatusMock.mockReset();
    setCampaignFlashMessageMock.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("shows Pause and Archive for an active campaign", () => {
    render(<CampaignDetailHeader campaign={buildCampaign("active")} />);
    expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Archive" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Resume" }),
    ).not.toBeInTheDocument();
  });

  it("shows Resume and Archive for a paused campaign", () => {
    render(<CampaignDetailHeader campaign={buildCampaign("paused")} />);
    expect(screen.getByRole("button", { name: "Resume" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Archive" })).toBeInTheDocument();
  });

  it("shows Archive for a completed campaign without pause controls", () => {
    render(<CampaignDetailHeader campaign={buildCampaign("completed")} />);
    expect(screen.getByRole("button", { name: "Archive" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Pause" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Resume" }),
    ).not.toBeInTheDocument();
  });

  it("hides status actions for archived campaigns", () => {
    render(<CampaignDetailHeader campaign={buildCampaign("archived")} />);
    expect(
      screen.queryByRole("button", { name: "Archive" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Pause" }),
    ).not.toBeInTheDocument();
  });

  it("archives after confirm, flashes, and redirects to the list", async () => {
    const user = userEvent.setup();
    const confirmMock = vi.fn(() => true);
    vi.stubGlobal("confirm", confirmMock);

    render(<CampaignDetailHeader campaign={buildCampaign("active")} />);
    await user.click(screen.getByRole("button", { name: "Archive" }));

    expect(confirmMock).toHaveBeenCalled();
    expect(updateCampaignStatusMock).toHaveBeenCalledWith(
      "cmp-test",
      "archived",
    );
    expect(setCampaignFlashMessageMock).toHaveBeenCalledWith({
      kind: "archived",
      campaignName: "Test Campaign",
    });
    expect(pushMock).toHaveBeenCalledWith("/campaigns");
  });

  it("does not archive when confirm is cancelled", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("confirm", vi.fn(() => false));

    render(<CampaignDetailHeader campaign={buildCampaign("active")} />);
    await user.click(screen.getByRole("button", { name: "Archive" }));

    expect(updateCampaignStatusMock).not.toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("shows Continue setup for an incomplete draft", () => {
    render(<CampaignDetailHeader campaign={buildCampaign("draft")} />);
    expect(
      screen.getByRole("link", { name: "Continue setup" }),
    ).toHaveAttribute("href", "/campaigns/cmp-test/edit");
    expect(screen.queryByRole("link", { name: "Edit" })).not.toBeInTheDocument();
  });

  it("shows Edit and Review & activate for a complete draft", () => {
    const campaign = buildCampaign("draft");
    campaign.setupDraft = {
      ...createDefaultSetupDraft(),
      campaignName: "Complete draft",
      groupId: "Ikon Motors",
      subfleets: ["Ikon Motors North"],
      campaignStartDate: "2026-09-01",
      campaignEndDate: "2026-09-30",
      sendTimeLocal: "12:00",
    };

    render(<CampaignDetailHeader campaign={campaign} />);
    expect(screen.getByRole("link", { name: "Edit" })).toHaveAttribute(
      "href",
      "/campaigns/cmp-test/edit",
    );
    expect(
      screen.getByRole("link", { name: "Review & activate" }),
    ).toHaveAttribute("href", "/campaigns/cmp-test/edit?step=review");
  });
});
