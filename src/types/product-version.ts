export const PRODUCT_VERSION_IDS = [
  "mvp_v1_0",
  "post_mvp_v1_1",
  "post_mvp_v1_2",
  "post_mvp_v1_3",
  "post_mvp_v1_4",
] as const;

export type ProductVersionId = (typeof PRODUCT_VERSION_IDS)[number];

export interface ProductVersionOption {
  id: ProductVersionId;
  label: string;
  shortLabel: string;
  isSelectable: boolean;
}

export const PRODUCT_VERSION_OPTIONS: ProductVersionOption[] = [
  {
    id: "mvp_v1_0",
    label: "MVP V1.0",
    shortLabel: "MVP V1.0",
    isSelectable: true,
  },
  {
    id: "post_mvp_v1_1",
    label: "Post MVP V1.1",
    shortLabel: "V1.1",
    isSelectable: true,
  },
  {
    id: "post_mvp_v1_2",
    label: "Post MVP V1.2",
    shortLabel: "V1.2",
    isSelectable: false,
  },
  {
    id: "post_mvp_v1_3",
    label: "Post MVP V1.3",
    shortLabel: "V1.3",
    isSelectable: false,
  },
  {
    id: "post_mvp_v1_4",
    label: "Post MVP V1.4",
    shortLabel: "V1.4",
    isSelectable: false,
  },
];

export const DEFAULT_PRODUCT_VERSION_ID: ProductVersionId = "post_mvp_v1_1";

export const EXISTING_REPORTING_MODE_ID = "existing_reporting";
export const EXISTING_REPORTING_MODE_LABEL = "Existing reporting";

export const EXISTING_REPORTING_MODE_OPTIONS = [
  {
    id: EXISTING_REPORTING_MODE_ID,
    label: EXISTING_REPORTING_MODE_LABEL,
  },
] as const;
