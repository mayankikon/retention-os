import { describe, expect, it } from "vitest";
import {
  countSuppressionEntries,
  formatSuppressionListSummary,
} from "@/lib/suppression-list";

describe("suppression list", () => {
  it("counts non-empty lines and ignores comments", () => {
    const contents = `# header
5551234567

5559876543
`;
    expect(countSuppressionEntries(contents)).toBe(2);
  });

  it("formats summary with entry count", () => {
    expect(formatSuppressionListSummary("opt-outs.csv", 128)).toBe(
      "opt-outs.csv (128 numbers)",
    );
    expect(formatSuppressionListSummary(null, null)).toBe("None");
  });
});
