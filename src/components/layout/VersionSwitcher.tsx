"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProductVersion } from "@/contexts/product-version-context";
import { canSelectProductVersion } from "@/lib/product-version";
import { PRODUCT_VERSION_OPTIONS } from "@/types/product-version";
import type { ProductVersionId } from "@/types/product-version";

export function VersionSwitcher() {
  const { versionId, setVersionId } = useProductVersion();

  return (
    <div className="border-t border-border px-5 py-4">
      <label
        htmlFor="product-version"
        className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground"
      >
        Version
      </label>
      <Select
        value={versionId}
        onValueChange={(value) => {
          setVersionId(value as ProductVersionId);
        }}
      >
        <SelectTrigger
          id="product-version"
          className="h-9 w-full"
          aria-label="Product version"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent side="top" position="popper">
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
    </div>
  );
}
