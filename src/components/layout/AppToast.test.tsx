import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppToast } from "@/components/layout/AppToast";

describe("AppToast", () => {
  afterEach(() => cleanup());

  it("shows the message in a status toast", () => {
    render(
      <AppToast message="Service reminder copy updated." onDismiss={vi.fn()} />,
    );

    expect(screen.getByTestId("app-toast")).toHaveTextContent(
      "Service reminder copy updated.",
    );
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("dismisses from the close button", async () => {
    const onDismiss = vi.fn();
    const user = userEvent.setup();
    render(<AppToast message="Copy updated" onDismiss={onDismiss} />);

    await user.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("dismisses after the timeout", () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    render(
      <AppToast
        message="Copy updated"
        onDismiss={onDismiss}
        durationMs={4000}
      />,
    );

    vi.advanceTimersByTime(3999);
    expect(onDismiss).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onDismiss).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});
