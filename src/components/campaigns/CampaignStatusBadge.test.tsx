import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  CampaignStatusBadge,
  getStatusBadgeConfig,
} from "@/components/campaigns/CampaignStatusBadge";
import { STATUS_LABELS } from "@/data/lookups";

describe("CampaignStatusBadge", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders correct label for each known status", () => {
    render(<CampaignStatusBadge status="active" />);
    expect(screen.getByText(STATUS_LABELS.active)).toBeInTheDocument();
  });

  it("falls back safely for unknown status", () => {
    render(<CampaignStatusBadge status="unknown-status" />);
    expect(screen.getByText("Unknown")).toBeInTheDocument();
  });
});

describe("getStatusBadgeConfig", () => {
  it("returns scheduled config with expected classes", () => {
    const config = getStatusBadgeConfig("scheduled");
    expect(config.label).toBe(STATUS_LABELS.scheduled);
    expect(config.className).toContain("status-scheduled");
  });

  it("returns fallback for invalid status", () => {
    const config = getStatusBadgeConfig("invalid");
    expect(config.label).toBe("Unknown");
  });
});
