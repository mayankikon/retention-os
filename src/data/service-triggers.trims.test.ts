import { describe, expect, it } from "vitest";
import {
  getTrimsForMakeModel,
  isTrimValidForMakeModel,
} from "@/data/audience-attributes";
import {
  getOemTrimsForMakeModel,
  isOemTrimValidForMakeModel,
} from "@/data/service-triggers";

describe("vehicle trim options", () => {
  it("returns trims for a known make and model", () => {
    expect(getTrimsForMakeModel("Toyota", "RAV4")).toEqual([
      "LE",
      "XLE",
      "XLE Premium",
      "Limited",
      "Prime SE",
      "Prime XSE",
    ]);
  });

  it("returns no trims until both make and model are set", () => {
    expect(getTrimsForMakeModel("Toyota", "")).toEqual([]);
    expect(getTrimsForMakeModel("", "RAV4")).toEqual([]);
  });

  it("validates trim against the selected make and model", () => {
    expect(isTrimValidForMakeModel("Honda", "Civic", "Si")).toBe(true);
    expect(isTrimValidForMakeModel("Honda", "Civic", "XLE")).toBe(false);
    expect(isTrimValidForMakeModel("Honda", "Civic", "")).toBe(true);
  });

  it("exposes the same trims through OEM helpers", () => {
    expect(getOemTrimsForMakeModel("Ford", "F-150")).toEqual(
      getTrimsForMakeModel("Ford", "F-150"),
    );
    expect(isOemTrimValidForMakeModel("Ford", "F-150", "XLT")).toBe(true);
  });
});
