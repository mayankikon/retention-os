"use client";

import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@ikontechnologies-arlington/nxtg-design-shiftpackage/primitives";
import { UiStyleToggle } from "@/components/layout/UiStyleToggle";
import { VersionSwitcher } from "@/components/layout/VersionSwitcher";
import { useCurrentUser } from "@/contexts/session-context";

/** Solid caret matching the Figma `chevron-down` glyph in the user menu. */
function CaretDown() {
  return (
    <svg viewBox="0 0 24 24" className="size-6 shrink-0" aria-hidden>
      <path d="M7 10l5 5 5-5z" fill="currentColor" />
    </svg>
  );
}

/**
 * Toolbox UI style top bar (Figma: Full Top Bar). The user menu replaces the
 * Shift sidebar footer chip and holds the version + theme controls.
 */
export function ToolboxTopBar() {
  const user = useCurrentUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="hidden h-[54px] w-full shrink-0 gap-px toolbox:flex">
      <div className="flex min-w-0 flex-1 items-center border-r border-b border-[#dcdcdc] bg-white py-[7px] pr-4 pl-8" />
      <Popover open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <PopoverTrigger
          render={
            <button
              type="button"
              className="flex h-[54px] shrink-0 cursor-pointer items-center justify-end gap-2 border-b border-[#dcdcdc] bg-[#f4f4f4] pr-8 pl-4 text-[16px] font-semibold leading-[22px] text-[#111] hover:bg-[#ececec]"
              aria-label={`User menu for ${user.name}`}
            >
              {user.name}
              <CaretDown />
            </button>
          }
        />
        <PopoverContent align="end" sideOffset={4} className="w-64 gap-0 p-4">
          <div className="mb-4">
            <p className="text-sm font-semibold text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.role}</p>
          </div>
          <VersionSwitcher />
          {/* Switching back to Shift hides this bar, so close its menu too. */}
          <UiStyleToggle onUiStyleChange={() => setIsMenuOpen(false)} />
        </PopoverContent>
      </Popover>
    </div>
  );
}
