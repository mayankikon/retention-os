"use client";

import { Button } from "@ikontechnologies-arlington/nxtg-design-shiftpackage/primitives";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { AppDialogShell } from "@/components/layout/AppDialogShell";
import { APP_DIALOG_INSTRUCTION_CLASS } from "@/lib/app-dialog-shell";

interface CampaignSetupLeaveHandlers {
  onSaveDraft: () => void;
}

interface CampaignSetupLeaveGuardContextValue {
  isSetupActive: boolean;
  registerSetup: (handlers: CampaignSetupLeaveHandlers) => void;
  unregisterSetup: () => void;
  /** Call before intentional finish (activate / schedule / save draft). */
  clearSetup: () => void;
  requestNavigation: (href: string) => void;
}

const CampaignSetupLeaveGuardContext =
  createContext<CampaignSetupLeaveGuardContextValue | null>(null);

export function CampaignSetupLeaveGuardProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const handlersRef = useRef<CampaignSetupLeaveHandlers | null>(null);
  const [isSetupActive, setIsSetupActive] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  const registerSetup = useCallback((handlers: CampaignSetupLeaveHandlers) => {
    handlersRef.current = handlers;
    setIsSetupActive(true);
  }, []);

  const unregisterSetup = useCallback(() => {
    handlersRef.current = null;
    setIsSetupActive(false);
    setPendingHref(null);
  }, []);

  const clearSetup = useCallback(() => {
    handlersRef.current = null;
    setIsSetupActive(false);
    setPendingHref(null);
  }, []);

  const requestNavigation = useCallback(
    (href: string) => {
      if (!handlersRef.current) {
        router.push(href);
        return;
      }
      setPendingHref(href);
    },
    [router],
  );

  const handleStay = () => {
    setPendingHref(null);
  };

  const handleAbandon = () => {
    const href = pendingHref ?? "/campaigns";
    clearSetup();
    router.push(href);
  };

  const handleSaveDraft = () => {
    setPendingHref(null);
    handlersRef.current?.onSaveDraft();
  };

  useEffect(() => {
    if (!isSetupActive) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isSetupActive]);

  const value = useMemo(
    () => ({
      isSetupActive,
      registerSetup,
      unregisterSetup,
      clearSetup,
      requestNavigation,
    }),
    [
      isSetupActive,
      registerSetup,
      unregisterSetup,
      clearSetup,
      requestNavigation,
    ],
  );

  return (
    <CampaignSetupLeaveGuardContext.Provider value={value}>
      {children}

      <AppDialogShell
        open={pendingHref !== null}
        onOpenChange={(open) => {
          if (!open) handleStay();
        }}
        title="Campaign In Progress"
        size="compact"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleStay}
              className="cursor-pointer"
            >
              Keep Editing
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleAbandon}
              className="cursor-pointer"
            >
              Abandon
            </Button>
            <Button
              type="button"
              size="lg"
              onClick={handleSaveDraft}
              className="cursor-pointer"
            >
              Save Draft
            </Button>
          </>
        }
      >
        <p className={APP_DIALOG_INSTRUCTION_CLASS}>
          You have a campaign building in progress. Do you want to save this as
          a draft or abandon it?
        </p>
      </AppDialogShell>
    </CampaignSetupLeaveGuardContext.Provider>
  );
}

export function useCampaignSetupLeaveGuard(): CampaignSetupLeaveGuardContextValue {
  const context = useContext(CampaignSetupLeaveGuardContext);
  if (!context) {
    throw new Error(
      "useCampaignSetupLeaveGuard must be used within CampaignSetupLeaveGuardProvider",
    );
  }
  return context;
}

/** Safe for shells that may render outside the provider during tests. */
export function useOptionalCampaignSetupLeaveGuard(): CampaignSetupLeaveGuardContextValue | null {
  return useContext(CampaignSetupLeaveGuardContext);
}
