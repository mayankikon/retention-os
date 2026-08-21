import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import type { ComponentProps, ReactNode } from "react";
import { ReviewStep } from "@/components/campaigns/setup/steps/ReviewStep";
import { createDefaultSetupDraft } from "@/data/campaign-setup.defaults";
import { toDateInputValue } from "@/lib/campaign-window";
import type { CampaignSetupDraft } from "@/types/campaign-setup";

vi.mock("@/contexts/product-version-context", () => ({
  useProductVersion: () => ({ versionId: "mvp_v1_0" }),
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
      onActivateNow={vi.fn()}
      onSaveDraft={vi.fn()}
      isTestSent
      isActivating={false}
    />,
  );
}

describe("ReviewStep", () => {
  afterEach(() => cleanup());

  it("labels the launch button Activate when the start date is today", () => {
    renderReviewStep(shiftLocalDate(0));

    expect(screen.getByRole("button", { name: "Activate" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Save Draft" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Schedule" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Customers Targeted")).toBeInTheDocument();
    expect(screen.queryByText("Roughly Reachable")).not.toBeInTheDocument();
  });

  it("labels the launch button Schedule when the start date is later than today", () => {
    renderReviewStep(shiftLocalDate(1));

    expect(screen.getByRole("button", { name: "Schedule" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Activate" }),
    ).not.toBeInTheDocument();
  });
});
