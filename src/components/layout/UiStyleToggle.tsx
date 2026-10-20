"use client";

import { useId } from "react";
import { Switch } from "@ikontechnologies-arlington/nxtg-design-shiftpackage/primitives";
import { useUiStyle } from "@/contexts/ui-style-context";
import type { UiStyleId } from "@/lib/ui-style";

/**
 * Switch between the Shift and Toolbox (Figma 2026) styles. Users see the
 * Toolbox style as "Current NextGen theme".
 */
export function UiStyleToggle({
  onUiStyleChange,
}: {
  onUiStyleChange?: (uiStyle: UiStyleId) => void;
}) {
  const { uiStyle, setUiStyle } = useUiStyle();
  // Rendered in both the Shift sidebar and the Toolbox user menu.
  const switchId = useId();

  return (
    <div className="mt-3 flex items-center justify-between gap-3">
      <label
        htmlFor={switchId}
        className="cursor-pointer text-xs font-medium uppercase tracking-wide text-muted-foreground"
      >
        Current NextGen theme
      </label>
      <Switch
        id={switchId}
        checked={uiStyle === "toolbox"}
        onCheckedChange={(checked) => {
          const nextUiStyle = checked ? "toolbox" : "shift";
          setUiStyle(nextUiStyle);
          onUiStyleChange?.(nextUiStyle);
        }}
      />
    </div>
  );
}
