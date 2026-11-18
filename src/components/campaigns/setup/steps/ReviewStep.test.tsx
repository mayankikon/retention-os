import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps, ReactNode } from "react";
import { ReviewStep } from "@/components/campaigns/setup/steps/ReviewStep";
import { createDefaultSetupDraft } from "@/data/campaign-setup.defaults";
import { toDateInputValue } from "@/lib/campaign-window";
import type { CampaignSetupDraft } from "@/types/campaign-setup";

vi.mock("@/lib/test-message", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/test-message")>();
  return {
    ...actual,
    sendTestMessage: async (phone: string) => ({
      ok: actual.normalizeTestPhone(phone) !== actual.TEST_SEND_FAILURE_DIGITS,
    }),
  };
});

vi.mock("@/contexts/product-version-context", () => ({
  useProductVersion: () => ({ versionId: "mvp_v1_0" }),
}));

vi.mock(
  "@ikontechnologies-arlington/nxtg-design-shiftpackage/primitives",
  () => ({
    Button: ({
      children,
      leadingIcon,
      loading,
      variant: _variant,
      ...props
    }: ComponentProps<"button"> & {
      children?: ReactNode;
      leadingIcon?: ReactNode;
      loading?: boolean;
      variant?: string;
    }) => {
      void _variant;
      return (
        <button {...props} disabled={props.disabled || loading}>
          {leadingIcon}
          {children}
        </button>
      );
    },
    Input: (props: ComponentProps<"input">) => <input {...props} />,
    Label: ({
      children,
      htmlFor,
      ...props
    }: ComponentProps<"label"> & { for?: string }) => (
      <label htmlFor={htmlFor ?? props.for}>{children}</label>
    ),
  }),
);

function shiftLocalDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toDateInputValue(date);
}

function renderReviewStep(startDate: string | null) {
  const draft: CampaignSetupDraft = {
    ...createDefaultSetupDraft(),
    campaignStartDate: startDate,
  };

  return render(
    <ReviewStep
      draft={draft}
      errors={{}}
      onChange={vi.fn()}
      onTestSend={vi.fn()}
      isTestSent
    />,
  );
}

describe("ReviewStep", () => {
  afterEach(() => cleanup());

  it("shows the targeted customer estimate", () => {
    renderReviewStep(shiftLocalDate(1));

    expect(screen.getByText("Customers Targeted")).toBeInTheDocument();
    expect(screen.queryByText("Roughly Reachable")).not.toBeInTheDocument();
  });

  it("leaves launch actions to the wizard footer", () => {
    renderReviewStep(shiftLocalDate(0));

    // Activate / Save Draft live in CampaignSetupWizard's footer now.
    expect(
      screen.queryByRole("button", { name: "Activate" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Save Draft" }),
    ).not.toBeInTheDocument();
  });

  it("omits the empty-filters note and timing copy", () => {
    renderReviewStep(shiftLocalDate(0));

    expect(
      screen.queryByText(/No audience filters applied/),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/Timing comes from/)).not.toBeInTheDocument();
  });

  it("confirms a sent test with the number it went to", async () => {
    const user = userEvent.setup();
    const onTestSend = vi.fn();
    render(
      <ReviewStep
        draft={{ ...createDefaultSetupDraft(), testPhoneNumber: "5555550123" }}
        errors={{}}
        onChange={vi.fn()}
        onTestSend={onTestSend}
        isTestSent={false}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Send Test" }));

    expect(
      await screen.findByText(/Test sent to \+1 \(555\) 555-0123/),
    ).toBeInTheDocument();
    expect(onTestSend).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Send again" })).toBeInTheDocument();
  });

  it("shows an inline failure and does not mark the test sent", async () => {
    const user = userEvent.setup();
    const onTestSend = vi.fn();
    render(
      <ReviewStep
        draft={{ ...createDefaultSetupDraft(), testPhoneNumber: "5555550199" }}
        errors={{}}
        onChange={vi.fn()}
        onTestSend={onTestSend}
        isTestSent={false}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Send Test" }));

    expect(
      await screen.findByText(/The test didn't send to/),
    ).toBeInTheDocument();
    expect(onTestSend).not.toHaveBeenCalled();
  });
});
