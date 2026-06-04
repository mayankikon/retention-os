/** iPhone 15 / 15 Pro logical screen size (CSS px). */
export const IPHONE_15_SCREEN_WIDTH_PX = 393;
export const IPHONE_15_SCREEN_HEIGHT_PX = 852;

/** Device bezel thickness around the screen viewport. */
export const IPHONE_DEVICE_BEZEL_PX = 6;

export const IPHONE_DEVICE_OUTER_WIDTH_PX =
  IPHONE_15_SCREEN_WIDTH_PX + IPHONE_DEVICE_BEZEL_PX * 2;

export const IPHONE_DEVICE_OUTER_HEIGHT_PX =
  IPHONE_15_SCREEN_HEIGHT_PX + IPHONE_DEVICE_BEZEL_PX * 2;

/** Outer chassis corner radius at full design size. */
export const IPHONE_DEVICE_OUTER_RADIUS_PX = 44;

/** Inner screen corner radius at full design size. */
export const IPHONE_SCREEN_RADIUS_PX = 36;

/** Visual scale for the setup wizard preview (~72% of full device size). */
export const IPHONE_PREVIEW_SCALE = 0.72;

export const IPHONE_PREVIEW_OUTER_WIDTH_PX = Math.round(
  IPHONE_DEVICE_OUTER_WIDTH_PX * IPHONE_PREVIEW_SCALE,
);

export const IPHONE_PREVIEW_OUTER_HEIGHT_PX = Math.round(
  IPHONE_DEVICE_OUTER_HEIGHT_PX * IPHONE_PREVIEW_SCALE,
);

export const IPHONE_PREVIEW_OUTER_RADIUS_PX = Math.round(
  IPHONE_DEVICE_OUTER_RADIUS_PX * IPHONE_PREVIEW_SCALE,
);
