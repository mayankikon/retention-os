export const PRODUCT_VERSION_IDS = [
  "poc_v0_5",
  "mvp_v1_0",
  "post_mvp_v1_1",
  "post_mvp_v1_2",
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
    id: "poc_v0_5",
    label: "POC V0.5",
    shortLabel: "POC V0.5",
    isSelectable: true,
  },
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
    isSelectable: false,
  },
  {
    id: "post_mvp_v1_2",
    label: "Post MVP V1.2",
    shortLabel: "V1.2",
    isSelectable: false,
  },
  {
    id: "post_mvp_v1_4",
    label: "Post MVP V1.4",
    shortLabel: "V1.4",
    isSelectable: false,
  },
];

export const DEFAULT_PRODUCT_VERSION_ID: ProductVersionId = "mvp_v1_0";
