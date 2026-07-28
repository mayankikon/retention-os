"use client";

import {
  AppThemeProvider,
  GroovedPanelPreferenceProvider,
  TooltipProvider,
} from "@ikontechnologies-arlington/nxtg-design-shiftpackage";

interface DesignSystemProvidersProps {
  children: React.ReactNode;
}

/**
 * Client boundary for Shift design-system providers.
 * The published package does not ship `"use client"` directives.
 */
export function DesignSystemProviders({ children }: DesignSystemProvidersProps) {
  return (
    <AppThemeProvider>
      <GroovedPanelPreferenceProvider>
        <TooltipProvider>{children}</TooltipProvider>
      </GroovedPanelPreferenceProvider>
    </AppThemeProvider>
  );
}
