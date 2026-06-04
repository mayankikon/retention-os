import { describe, expect, it } from "vitest";
import {
  buildEmailPreviewContent,
  getEmailPreviewSubject,
} from "@/lib/email-preview";

describe("email preview", () => {
  it("builds subject lines for primary and reminder messages", () => {
    expect(
      getEmailPreviewSubject("ABC Motors", "Spring Oil Change", "primary"),
    ).toBe("Spring Oil Change");
    expect(
      getEmailPreviewSubject("ABC Motors", "Spring Oil Change", "reminder1"),
    ).toBe("Reminder: Spring Oil Change");
  });

  it("formats body copy without orphan url lines", () => {
    const content = buildEmailPreviewContent(
      "Hey John, It's Jay from ABC Motors. We noticed your Honda Accord may be due for service. Schedule here: schedule.dealer.com/appt or call us at (555) 123-4567",
      "",
    );

    expect(content.paragraphs[0]).toContain("Hey John");
    expect(content.ctaHref).toBe("schedule.dealer.com/appt");
    expect(content.phoneNumber).toBe("(555) 123-4567");
    expect(content.paragraphs.join(" ")).not.toContain("schedule.dealer.com");
    expect(content.paragraphs.join(" ")).not.toContain("(555)");
  });
});
