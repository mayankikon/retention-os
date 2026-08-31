import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { ReportingShell } from "@/components/reporting/ReportingShell";

const pathnameMock = vi.fn(() => "/reporting");

vi.mock("next/navigation", () => ({
  usePathname: () => pathnameMock(),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("ReportingShell", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the rooftop leaderboard title on the reporting home tab", () => {
    pathnameMock.mockReturnValue("/reporting");
    render(
      <ReportingShell>
        <div>leaderboard body</div>
      </ReportingShell>,
    );

    expect(
      screen.getByRole("heading", { name: "Top rooftops by CER" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Leaderboard" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("renames the weekly tab to Smart Service Lead Weekly CER", () => {
    pathnameMock.mockReturnValue("/reporting/weekly");
    render(
      <ReportingShell>
        <div>weekly body</div>
      </ReportingShell>,
    );

    expect(
      screen.getByRole("heading", {
        name: "Smart Service Lead Weekly CER (By Message)",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Global Weekly Click Rate")).not.toBeInTheDocument();
  });

  it("renames the activity tab to Smart Service Lead Activity Detail", () => {
    pathnameMock.mockReturnValue("/reporting/activity");
    render(
      <ReportingShell>
        <div>activity body</div>
      </ReportingShell>,
    );

    expect(
      screen.getByRole("heading", {
        name: "Smart Service Lead Activity Detail",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Clicks Activity Detail")).not.toBeInTheDocument();
  });
});
