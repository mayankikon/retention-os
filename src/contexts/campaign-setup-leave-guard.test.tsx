import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect, type ComponentProps, type ReactNode } from "react";
import {
  CampaignSetupLeaveGuardProvider,
  useCampaignSetupLeaveGuard,
} from "@/contexts/campaign-setup-leave-guard";

const pushMock = vi.fn();
const saveDraftMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/components/layout/AppDialogShell", () => ({
  AppDialogShell: ({
    open,
    title,
    children,
    footer,
  }: {
    open: boolean;
    title: string;
    children: ReactNode;
    footer?: ReactNode;
  }) =>
    open ? (
      <div role="dialog" aria-label={title}>
        <h2>{title}</h2>
        {children}
        {footer}
      </div>
    ) : null,
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
  }),
);

function SetupHarness({ mode = "create" }: { mode?: "create" | "edit" }) {
  const { registerSetup, unregisterSetup, requestNavigation } =
    useCampaignSetupLeaveGuard();

  useEffect(() => {
    registerSetup({ mode, onSaveDraft: saveDraftMock });
    return () => unregisterSetup();
  }, [mode, registerSetup, unregisterSetup]);

  return (
    <button type="button" onClick={() => requestNavigation("/templates")}>
      Leave setup
    </button>
  );
}

describe("CampaignSetupLeaveGuardProvider", () => {
  beforeEach(() => {
    pushMock.mockReset();
    saveDraftMock.mockReset();
  });

  afterEach(() => cleanup());

  it("uses unfinished-draft language and the three locked actions", async () => {
    const user = userEvent.setup();
    render(
      <CampaignSetupLeaveGuardProvider>
        <SetupHarness />
      </CampaignSetupLeaveGuardProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Leave setup" }));

    expect(
      screen.getByRole("dialog", { name: "Leave campaign setup?" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "You haven’t finished setting up this campaign. Save it as a draft to continue later, or discard it and leave.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Keep editing" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Discard draft" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Save draft" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Abandon" }),
    ).not.toBeInTheDocument();
  });

  it("discards the unfinished draft and leaves setup", async () => {
    const user = userEvent.setup();
    render(
      <CampaignSetupLeaveGuardProvider>
        <SetupHarness />
      </CampaignSetupLeaveGuardProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Leave setup" }));
    await user.click(screen.getByRole("button", { name: "Discard draft" }));

    expect(pushMock).toHaveBeenCalledWith("/templates");
    expect(saveDraftMock).not.toHaveBeenCalled();
  });

  it("keeps the new-setup modal copy out of draft edit mode", async () => {
    const user = userEvent.setup();
    render(
      <CampaignSetupLeaveGuardProvider>
        <SetupHarness mode="edit" />
      </CampaignSetupLeaveGuardProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Leave setup" }));

    expect(
      screen.getByRole("dialog", { name: "Leave draft editing?" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("You haven’t finished setting up this campaign."),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Discard changes" }),
    ).toBeInTheDocument();
  });
});
