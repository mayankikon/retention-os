const STORAGE_KEY = "retention-os-account-smart-marketing";
export const ACCOUNTS_UPDATED_EVENT = "accounts-updated";

type SmartMarketingOverrides = Record<string, boolean>;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readOverrides(): SmartMarketingOverrides {
  if (!isBrowser()) return {};

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as SmartMarketingOverrides;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function getSmartMarketingOverrides(): SmartMarketingOverrides {
  return readOverrides();
}

export function setSmartMarketingEnabled(
  accountId: string,
  isEnabled: boolean,
): void {
  if (!isBrowser()) return;

  const overrides = readOverrides();
  overrides[accountId] = isEnabled;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  window.dispatchEvent(new CustomEvent(ACCOUNTS_UPDATED_EVENT));
}
