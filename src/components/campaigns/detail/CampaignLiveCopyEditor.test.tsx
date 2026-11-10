import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps, ReactNode } from "react";
import { CampaignLiveCopyEditor } from "@/components/campaigns/detail/CampaignLiveCopyEditor";
import { createDefaultSetupDraft } from "@/data/campaign-setup.defaults";
import type { Campaign } from "@/types/campaign";

const pushMock = vi.fn();
const upsertCampaignMock = vi.fn();
const setFlashMock = vi.fn();

const activeCampaign: Campaign = {
  id: "cmp-live",
  name: "Service reminder",
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
  setupDraft: {
    ...createDefaultSetupDraft(),
    primaryPromoText: "Hi [@FN@], service your [@MOD@].",
    reminder1Text: "Reminder for [@FN@].",
    reminder2Enabled: false,
    reminder3Enabled: false,
  },
};

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/hooks/use-campaigns", () => ({
  useCampaigns: () => [activeCampaign],
}));

vi.mock("@/lib/campaign-store", () => ({
  upsertUserCreatedCampaign: (...args: unknown[]) =>
    upsertCampaignMock(...args),
  setCampaignFlashMessage: (...args: unknown[]) => setFlashMock(...args),
}));

vi.mock(
  "@ikontechnologies-arlington/nxtg-design-shiftpackage/primitives",
  () => ({
    Button: ({
      children,
      ...props
    }: ComponentProps<"button"> & { children?: ReactNode }) => (
      <button {...props}>{children}</button>
    ),
    Label: ({
      children,
      htmlFor,
      ...props
    }: ComponentProps<"label"> & { for?: string }) => (
      <label htmlFor={htmlFor ?? props.for}>{children}</label>
    ),
    Checkbox: ({
      checked,
      onCheckedChange,
      id,
    }: {
      checked?: boolean;
      onCheckedChange?: (checked: boolean) => void;
      id?: string;
    }) => (
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(event) => onCheckedChange?.(event.target.checked)}
      />
    ),
    Textarea: (props: ComponentProps<"textarea">) => <textarea {...props} />,
    buttonVariants: () => "button",
  }),
);

describe("CampaignLiveCopyEditor", () => {
  beforeEach(() => {
    pushMock.mockReset();
    upsertCampaignMock.mockReset();
    setFlashMock.mockReset();
  });

  afterEach(() => cleanup());

  it("shows a send checkbox per reminder and collapses turned-off ones", () => {
    render(<CampaignLiveCopyEditor campaignId="cmp-live" />);

    expect(screen.getByLabelText(/^Initial message/)).toBeInTheDocument();
    expect(screen.getByLabelText("Send reminder 1")).toBeChecked();
    expect(screen.getByLabelText(/^Reminder 1 Text/)).toBeInTheDocument();
    expect(screen.getByLabelText("Send reminder 2")).not.toBeChecked();
    expect(screen.queryByLabelText(/^Reminder 2 Text/)).not.toBeInTheDocument();
    expect(screen.getAllByText(/Won't send to new recipients/)).toHaveLength(2);
    expect(screen.queryByLabelText("Campaign name")).not.toBeInTheDocument();
    expect(screen.getByText(/variables are locked/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Unchecked reminders stop sending after you save/),
    ).toBeInTheDocument();
  });

  it("saves a reminder turned off without requiring its text", async () => {
    const user = userEvent.setup();
    render(<CampaignLiveCopyEditor campaignId="cmp-live" />);

    fireEvent.change(screen.getByLabelText(/^Reminder 1 Text/), {
      target: { value: "" },
    });
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Reminder 1 text is required while it's turned on.",
    );
    expect(upsertCampaignMock).not.toHaveBeenCalled();

    await user.click(screen.getByLabelText("Send reminder 1"));
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(upsertCampaignMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "active",
          reminderToggleEvents: [
            expect.objectContaining({ reminderId: "reminder1", enabled: false }),
          ],
        }),
      );
    });
  });

  it("blocks variable changes and saves surrounding copy without status changes", async () => {
    const user = userEvent.setup();
    render(<CampaignLiveCopyEditor campaignId="cmp-live" />);

    const initialMessage = screen.getByLabelText(/^Initial message/);
    fireEvent.change(initialMessage, {
      target: {
        value: "Hello [@FN@], please service your [@MOD@].",
      },
    });
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(upsertCampaignMock).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "cmp-live",
          status: "active",
          liveCopy: expect.objectContaining({
            initialMessage: "Hello [@FN@], please service your [@MOD@].",
          }),
        }),
      );
    });
    expect(setFlashMock).toHaveBeenCalledWith({
      kind: "copyUpdated",
      campaignName: "Service reminder",
    });
    expect(pushMock).toHaveBeenCalledWith("/campaigns/cmp-live");
  });
});
