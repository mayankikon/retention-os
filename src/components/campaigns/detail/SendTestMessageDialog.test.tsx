import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps, ReactNode } from "react";
import { SendTestMessageDialog } from "@/components/campaigns/detail/SendTestMessageDialog";

vi.mock("@/lib/test-message", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/test-message")>();
  return {
    ...actual,
    sendTestMessage: async (phone: string) => ({
      ok: actual.normalizeTestPhone(phone) !== actual.TEST_SEND_FAILURE_DIGITS,
    }),
  };
});

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
      leadingIcon,
      loading,
      ...props
    }: ComponentProps<"button"> & {
      leadingIcon?: ReactNode;
      loading?: boolean;
      size?: string;
      variant?: string;
    }) => {
      const { size: _s, variant: _v, ...rest } = props;
      void _s;
      void _v;
      return (
        <button {...rest} disabled={rest.disabled || loading}>
          {leadingIcon}
          {children}
        </button>
      );
    },
    Input: (props: ComponentProps<"input">) => <input {...props} />,
    Label: ({ children, htmlFor }: ComponentProps<"label">) => (
      <label htmlFor={htmlFor}>{children}</label>
    ),
  }),
);

function renderDialog() {
  const onSent = vi.fn();
  const onOpenChange = vi.fn();
  render(
    <SendTestMessageDialog
      open
      onOpenChange={onOpenChange}
      onSent={onSent}
    />,
  );
  return { onSent, onOpenChange };
}

describe("SendTestMessageDialog", () => {
  afterEach(() => cleanup());

  it("sends, reports the number, and closes", async () => {
    const user = userEvent.setup();
    const { onSent, onOpenChange } = renderDialog();

    expect(
      screen.getByText(/campaign, its audience, and its reporting don't change/),
    ).toBeInTheDocument();
    await user.type(screen.getByLabelText("Test Mobile Number"), "5555550123");
    await user.click(screen.getByRole("button", { name: "Send Test" }));

    expect(onSent).toHaveBeenCalledWith("5555550123");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("rejects an incomplete number without sending", async () => {
    const user = userEvent.setup();
    const { onSent } = renderDialog();

    await user.type(screen.getByLabelText("Test Mobile Number"), "555");
    await user.click(screen.getByRole("button", { name: "Send Test" }));

    expect(
      screen.getByText("Enter a 10-digit US mobile number."),
    ).toBeInTheDocument();
    expect(onSent).not.toHaveBeenCalled();
  });

  it("stays open with an error when the send fails", async () => {
    const user = userEvent.setup();
    const { onSent, onOpenChange } = renderDialog();

    await user.type(screen.getByLabelText("Test Mobile Number"), "5555550199");
    await user.click(screen.getByRole("button", { name: "Send Test" }));

    expect(await screen.findByText(/The test didn't send/)).toBeInTheDocument();
    expect(onSent).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
