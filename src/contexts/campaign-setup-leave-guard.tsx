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
  mode: "create" | "edit";
  onSaveDraft: () => void | Promise<void>;
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
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const registerSetup = useCallback((handlers: CampaignSetupLeaveHandlers) => {
    handlersRef.current = handlers;
    setIsSetupActive(true);
  }, []);

  const unregisterSetup = useCallback(() => {
    handlersRef.current = null;
    setIsSetupActive(false);
    setPendingHref(null);
    setIsSavingDraft(false);
    setSaveError(null);
  }, []);

  const clearSetup = useCallback(() => {
    handlersRef.current = null;
    setIsSetupActive(false);
    setPendingHref(null);
    setIsSavingDraft(false);
    setSaveError(null);
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
    setIsSavingDraft(false);
    setSaveError(null);
  };

  const handleDiscardDraft = () => {
    const href = pendingHref ?? "/campaigns";
    clearSetup();
    router.push(href);
  };

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    setSaveError(null);

    try {
      await handlersRef.current?.onSaveDraft();
      setPendingHref(null);
    } catch {
      setSaveError("Draft could not be saved. Try again or keep editing.");
      setIsSavingDraft(false);
    }
  };

  const isCreateMode = handlersRef.current?.mode !== "edit";
  const dialogTitle = isCreateMode
    ? "Leave campaign setup?"
    : "Leave draft editing?";
  const discardLabel = isCreateMode ? "Discard draft" : "Discard changes";

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
        title={dialogTitle}
        size="compact"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleStay}
              disabled={isSavingDraft}
              className="cursor-pointer"
            >
              Keep editing
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleDiscardDraft}
              disabled={isSavingDraft}
              className="cursor-pointer"
            >
              {discardLabel}
            </Button>
            <Button
              type="button"
              size="lg"
              onClick={handleSaveDraft}
              disabled={isSavingDraft}
              className="cursor-pointer"
            >
              {isSavingDraft ? "Saving…" : "Save draft"}
            </Button>
          </>
        }
      >
        {isCreateMode ? (
          <p className={APP_DIALOG_INSTRUCTION_CLASS}>
            You haven’t finished setting up this campaign. Save it as a draft to
            continue later, or discard it and leave.
          </p>
        ) : (
          <p className={APP_DIALOG_INSTRUCTION_CLASS}>
            You have unsaved changes to this draft. Save them to continue later,
            or discard the changes and leave.
          </p>
        )}
        {saveError ? (
          <p className="mt-3 text-sm text-destructive" role="alert">
            {saveError}
          </p>
        ) : null}
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
