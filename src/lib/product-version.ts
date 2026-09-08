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
export const PRODUCT_VERSION_STORAGE_SCHEMA_KEY =
  "retention-os-product-version-schema";
export const PRODUCT_VERSION_STORAGE_SCHEMA = "2";
export const PRODUCT_VERSION_UPDATED_EVENT = "product-version-updated";

/**
 * One-time remap from the pre-rename ladder (POC V0.5 → … → Post MVP V1.2).
 * Applied only when the storage schema is still unset / older than v2.
 */
const LEGACY_PRODUCT_VERSION_ID_MAP: Record<string, ProductVersionId> = {
  poc_v0_5: "mvp_v1_0",
  mvp_v1_0: "post_mvp_v1_1",
  post_mvp_v1_1: "post_mvp_v1_2",
  post_mvp_v1_2: "post_mvp_v1_3",
};

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

/** MVP V1.0: SMS only. Post MVP V1.1+: SMS + email. */
export function isEmailChannelAvailable(versionId: ProductVersionId): boolean {
  return versionId !== "mvp_v1_0";
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
 * MVP V1.0: Oil Change only.
 */
export function getAvailableMessageTemplates(
  versionId: ProductVersionId,
): CampaignMessageTemplate[] {
  const published = getTemplates()
    .filter((template) => template.status === "published")
    .map(messageTemplateToPickerItem);

  if (versionId === "mvp_v1_0") {
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
    return versionId !== "mvp_v1_0";
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

function migrateLegacyStoredProductVersion(raw: string): ProductVersionId {
  const mapped = LEGACY_PRODUCT_VERSION_ID_MAP[raw];
  if (mapped && canSelectProductVersion(mapped)) {
    return mapped;
  }
  if (isProductVersionId(raw) && canSelectProductVersion(raw)) {
    return raw;
  }
  return DEFAULT_PRODUCT_VERSION_ID;
}

export function readStoredProductVersion(): ProductVersionId {
  if (!isBrowser()) return DEFAULT_PRODUCT_VERSION_ID;

  try {
    const schema = window.localStorage.getItem(
      PRODUCT_VERSION_STORAGE_SCHEMA_KEY,
    );
    const raw = window.localStorage.getItem(PRODUCT_VERSION_STORAGE_KEY);

    if (schema !== PRODUCT_VERSION_STORAGE_SCHEMA) {
      const migrated = raw
        ? migrateLegacyStoredProductVersion(raw)
        : DEFAULT_PRODUCT_VERSION_ID;
      window.localStorage.setItem(PRODUCT_VERSION_STORAGE_KEY, migrated);
      window.localStorage.setItem(
        PRODUCT_VERSION_STORAGE_SCHEMA_KEY,
        PRODUCT_VERSION_STORAGE_SCHEMA,
      );
      return migrated;
    }

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
  window.localStorage.setItem(
    PRODUCT_VERSION_STORAGE_SCHEMA_KEY,
    PRODUCT_VERSION_STORAGE_SCHEMA,
  );
  window.dispatchEvent(
    new CustomEvent(PRODUCT_VERSION_UPDATED_EVENT, {
      detail: { versionId },
    }),
  );
}
