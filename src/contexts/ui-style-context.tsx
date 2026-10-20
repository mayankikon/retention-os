"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import {
  DEFAULT_UI_STYLE_ID,
  UI_STYLE_ATTRIBUTE,
  UI_STYLE_STORAGE_KEY,
  applyUiStyleToDocument,
  isUiStyleId,
  readStoredUiStyle,
  writeStoredUiStyle,
  type UiStyleId,
} from "@/lib/ui-style";

interface UiStyleContextValue {
  uiStyle: UiStyleId;
  setUiStyle: (uiStyle: UiStyleId) => void;
}

const UiStyleContext = createContext<UiStyleContextValue | null>(null);

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

/** localStorage is the store; other tabs reach us through `storage` events. */
function subscribe(listener: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key !== UI_STYLE_STORAGE_KEY) return;
    applyUiStyleToDocument(readStoredUiStyle());
    listener();
  };
  listeners.add(listener);
  window.addEventListener("storage", handleStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

/**
 * The `<html>` attribute (set by the head bootstrap script, then by
 * `setUiStyle`) is what's on screen, so it is the snapshot — this still works
 * when localStorage is blocked.
 */
function getSnapshot(): UiStyleId {
  const attribute = document.documentElement.getAttribute(UI_STYLE_ATTRIBUTE);
  return isUiStyleId(attribute) ? attribute : DEFAULT_UI_STYLE_ID;
}

function getServerSnapshot(): UiStyleId {
  return DEFAULT_UI_STYLE_ID;
}

export function UiStyleProvider({ children }: { children: React.ReactNode }) {
  const uiStyle = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const setUiStyle = useCallback((nextUiStyle: UiStyleId) => {
    applyUiStyleToDocument(nextUiStyle);
    writeStoredUiStyle(nextUiStyle);
    notify();
  }, []);

  const value = useMemo(() => ({ uiStyle, setUiStyle }), [uiStyle, setUiStyle]);

  return (
    <UiStyleContext.Provider value={value}>{children}</UiStyleContext.Provider>
  );
}

export function useUiStyle(): UiStyleContextValue {
  const context = useContext(UiStyleContext);
  if (!context) {
    throw new Error("useUiStyle must be used within UiStyleProvider");
  }
  return context;
}
