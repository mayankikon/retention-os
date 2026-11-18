import { describe, expect, it, vi } from "vitest";
import {
  formatTestPhone,
  isValidTestPhone,
  sendTestMessage,
} from "@/lib/test-message";

describe("test-message", () => {
  it("accepts 10-digit US numbers with or without +1", () => {
    expect(isValidTestPhone("(555) 555-0123")).toBe(true);
    expect(isValidTestPhone("+1 555 555 0123")).toBe(true);
    expect(isValidTestPhone("555-0123")).toBe(false);
  });

  it("formats valid numbers for confirmation copy", () => {
    expect(formatTestPhone("5555550123")).toBe("+1 (555) 555-0123");
    expect(formatTestPhone(" 12 ")).toBe("12");
  });

  it("fails only for the prototype failure number", async () => {
    vi.useFakeTimers();
    const ok = sendTestMessage("+1 (555) 555-0123");
    const failed = sendTestMessage("+1 (555) 555-0199");
    await vi.runAllTimersAsync();
    expect(await ok).toEqual({ ok: true });
    expect(await failed).toEqual({ ok: false });
    vi.useRealTimers();
  });
});
