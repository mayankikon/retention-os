import { describe, expect, it } from "vitest";
import {
  canHardDeleteTemplate,
  getCampaignsUsingTemplate,
  getTemplateUsageCount,
} from "@/lib/template-usage";

describe("template usage", () => {
  it("finds mock campaigns linked to oil change", () => {
    const usage = getCampaignsUsingTemplate("oil_change");
    expect(usage.some((campaign) => campaign.id === "cmp-002")).toBe(true);
    expect(getTemplateUsageCount("oil_change")).toBeGreaterThan(0);
    expect(canHardDeleteTemplate("oil_change")).toBe(false);
  });

  it("allows hard delete when unused", () => {
    expect(canHardDeleteTemplate("tpl-never-used")).toBe(true);
    expect(getCampaignsUsingTemplate("tpl-never-used")).toEqual([]);
  });
});
