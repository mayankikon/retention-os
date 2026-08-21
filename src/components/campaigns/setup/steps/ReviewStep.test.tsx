import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import type { ComponentProps, ReactNode } from "react";
import { ReviewStep } from "@/components/campaigns/setup/steps/ReviewStep";
import { createDefaultSetupDraft } from "@/data/campaign-setup.defaults";

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

describe("ReviewStep", () => {
  afterEach(() => cleanup());

  it("offers Activate Now and Save Draft without a separate Schedule action", () => {
    render(
      <ReviewStep
        draft={{
          ...createDefaultSetupDraft(),
          campaignStartDate: "2026-09-10",
        }}
        errors={{}}
        onChange={vi.fn()}
        onTestSend={vi.fn()}
        onActivateNow={vi.fn()}
        onSaveDraft={vi.fn()}
        isTestSent
        isActivating={false}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Activate Now" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Save Draft" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Schedule" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/future start date remains Active/i),
    ).toBeInTheDocument();
  });
});
