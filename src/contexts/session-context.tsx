"use client";

import { createContext, useContext, useMemo } from "react";
import { MOCK_CURRENT_USER } from "@/data/current-user.mock";
import type { AppUser } from "@/types/user";

interface SessionContextValue {
  user: AppUser;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const value = useMemo(() => ({ user: MOCK_CURRENT_USER }), []);

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useCurrentUser(): AppUser {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useCurrentUser must be used within SessionProvider");
  }
  return context.user;
}
