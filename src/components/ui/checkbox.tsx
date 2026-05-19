"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, ...props }, ref) => (
    <span className="relative inline-flex h-4 w-4 shrink-0 items-center justify-center">
      <input
        type="checkbox"
        ref={ref}
        checked={checked}
        className={cn(
          "peer h-4 w-4 shrink-0 appearance-none rounded-sm border border-input bg-card shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 checked:border-brand-primary checked:bg-brand-primary",
          className,
        )}
        {...props}
      />
      <Check
        className="pointer-events-none absolute h-3 w-3 text-white opacity-0 peer-checked:opacity-100"
        aria-hidden
      />
    </span>
  ),
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
