"use client";

import { useCurrentUser } from "@/contexts/session-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function AppTitleBar() {
  const user = useCurrentUser();

  return (
    <header className="sticky top-0 z-10 shrink-0 border-b border-border bg-card">
      <div className="flex h-14 items-center justify-end gap-4 px-6 lg:px-10">
        <div
          className="flex items-center gap-2.5"
          title={`${user.name} · ${user.role}`}
        >
          <Avatar className="h-9 w-9" aria-label={user.name}>
            <AvatarFallback className="bg-brand-primary/10 text-xs font-medium text-brand-primary">
              {user.initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-foreground">
            {user.name}
          </span>
        </div>
      </div>
    </header>
  );
}
