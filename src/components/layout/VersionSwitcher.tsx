"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ikontechnologies-arlington/nxtg-design-shiftpackage/primitives";
import { useProductVersion } from "@/contexts/product-version-context";
import { canSelectProductVersion } from "@/lib/product-version";
import { PRODUCT_VERSION_OPTIONS } from "@/types/product-version";
import type { ProductVersionId } from "@/types/product-version";

/** Compact version control for the Shift Sidebar footer panel. */
export function VersionSwitcher() {
  const { versionId, setVersionId } = useProductVersion();

  return (
    <>
      <label
        htmlFor="product-version"
        className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground"
      >
        Version
      </label>
      <Select
        value={versionId}
        onValueChange={(value) => {
          if (value == null) return;
          setVersionId(value as ProductVersionId);
        }}
        items={PRODUCT_VERSION_OPTIONS.map((option) => ({
          value: option.id,
          label: option.label,
        }))}
      >
        <SelectTrigger
          id="product-version"
          className="control-hover-stroke h-9 w-full"
          aria-label="Product version"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent side="top">
          {PRODUCT_VERSION_OPTIONS.map((option) => (
            <SelectItem
              key={option.id}
              value={option.id}
              disabled={!canSelectProductVersion(option.id)}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}
