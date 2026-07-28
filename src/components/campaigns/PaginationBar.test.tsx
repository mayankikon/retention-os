import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PaginationBar } from "@/components/campaigns/PaginationBar";

describe("PaginationBar", () => {
  afterEach(() => {
    cleanup();
  });

  it("disables Prev on first page", () => {
    render(
      <PaginationBar
        currentPage={1}
        totalPages={3}
        totalItems={30}
        pageSize={10}
        onPageChange={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next page" })).not.toBeDisabled();
  });

  it("disables Next on last page", () => {
    render(
      <PaginationBar
        currentPage={3}
        totalPages={3}
        totalItems={30}
        pageSize={10}
        onPageChange={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
  });

  it("calls onPageChange when Next is clicked", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(
      <PaginationBar
        currentPage={1}
        totalPages={5}
        totalItems={50}
        pageSize={10}
        onPageChange={onPageChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Next page" }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});
