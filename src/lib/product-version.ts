import {
  buildMessageTemplatePatch,
  messageTemplateToPickerItem,
  type CampaignMessageTemplate,
} from "@/data/campaign-message-templates";
import { DELIVERY_CHANNEL_OPTIONS } from "@/data/delivery-channels";
import { getTemplates } from "@/lib/template-store";
import type {
  CampaignMessageTemplateId,
  CampaignSetupDraft,
  DeliveryChannel,
} from "@/types/campaign-setup";
import {
  CUSTOM_TEMPLATE_ID,
  OIL_CHANGE_TEMPLATE_ID,
} from "@/types/template";
import {
  DEFAULT_PRODUCT_VERSION_ID,
  PRODUCT_VERSION_IDS,
  PRODUCT_VERSION_OPTIONS,
  type ProductVersionId,
  type ProductVersionOption,
} from "@/types/product-version";

export const PRODUCT_VERSION_STORAGE_KEY = "retention-os-product-version";
export const PRODUCT_VERSION_UPDATED_EVENT = "product-version-updated";

export function isProductVersionId(value: string): value is ProductVersionId {
  return (PRODUCT_VERSION_IDS as readonly string[]).includes(value);
}

export function getProductVersionOption(
  versionId: ProductVersionId,
): ProductVersionOption {
  const option = PRODUCT_VERSION_OPTIONS.find((item) => item.id === versionId);
  if (!option) {
    return PRODUCT_VERSION_OPTIONS.find(
      (item) => item.id === DEFAULT_PRODUCT_VERSION_ID,
    )!;
  }
  return option;
}

export function canSelectProductVersion(versionId: ProductVersionId): boolean {
  return getProductVersionOption(versionId).isSelectable;
}

/** POC V0.5: SMS only. MVP+: SMS + email. */
export function isEmailChannelAvailable(versionId: ProductVersionId): boolean {
  return versionId !== "poc_v0_5";
}

export function getAvailableDeliveryChannelOptions(
  versionId: ProductVersionId,
) {
  if (isEmailChannelAvailable(versionId)) {
    return DELIVERY_CHANNEL_OPTIONS;
  }
  return DELIVERY_CHANNEL_OPTIONS.filter((option) => option.value !== "email");
}

/**
 * Published managed templates available in campaign setup for this version.
 * Custom is added separately in the Messaging step UI.
 * POC V0.5: Oil Change only.
 */
export function getAvailableMessageTemplates(
  versionId: ProductVersionId,
): CampaignMessageTemplate[] {
  const published = getTemplates()
    .filter((template) => template.status === "published")
    .map(messageTemplateToPickerItem);

  if (versionId === "poc_v0_5") {
    return published.filter(
      (template) => template.id === OIL_CHANGE_TEMPLATE_ID,
    );
  }

  return published;
}

export function isMessageTemplateAvailable(
  versionId: ProductVersionId,
  templateId: CampaignMessageTemplateId | null,
): boolean {
  if (!templateId) return false;
  if (templateId === CUSTOM_TEMPLATE_ID) {
    return versionId !== "poc_v0_5";
  }
  return getAvailableMessageTemplates(versionId).some(
    (template) => template.id === templateId,
  );
}

/**
 * Align a setup draft with the active product version so gated features
 * cannot linger after a version switch.
 */
export function applyProductVersionToDraft(
  draft: CampaignSetupDraft,
  versionId: ProductVersionId,
): Partial<CampaignSetupDraft> {
  const patch: Partial<CampaignSetupDraft> = {};

  if (!isEmailChannelAvailable(versionId)) {
    const nextChannels = draft.deliveryChannels.filter(
      (channel): channel is DeliveryChannel => channel !== "email",
    );
    if (nextChannels.length !== draft.deliveryChannels.length) {
      patch.deliveryChannels =
        nextChannels.length > 0 ? nextChannels : (["sms"] as DeliveryChannel[]);
    }
  }

  if (!isMessageTemplateAvailable(versionId, draft.messageTemplateId)) {
    Object.assign(patch, buildMessageTemplatePatch(OIL_CHANGE_TEMPLATE_ID));
  }

  return patch;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function readStoredProductVersion(): ProductVersionId {
  if (!isBrowser()) return DEFAULT_PRODUCT_VERSION_ID;

  try {
    const raw = window.localStorage.getItem(PRODUCT_VERSION_STORAGE_KEY);
    if (!raw || !isProductVersionId(raw)) {
      return DEFAULT_PRODUCT_VERSION_ID;
    }
    if (!canSelectProductVersion(raw)) {
      return DEFAULT_PRODUCT_VERSION_ID;
    }
    return raw;
  } catch {
    return DEFAULT_PRODUCT_VERSION_ID;
  }
}

export function writeStoredProductVersion(versionId: ProductVersionId): void {
  if (!isBrowser()) return;
  if (!canSelectProductVersion(versionId)) return;

  window.localStorage.setItem(PRODUCT_VERSION_STORAGE_KEY, versionId);
  window.dispatchEvent(
    new CustomEvent(PRODUCT_VERSION_UPDATED_EVENT, {
      detail: { versionId },
    }),
  );
}
