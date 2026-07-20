"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  canSelectProductVersion,
  getProductVersionOption,
  readStoredProductVersion,
  writeStoredProductVersion,
} from "@/lib/product-version";
import {
  DEFAULT_PRODUCT_VERSION_ID,
  type ProductVersionId,
  type ProductVersionOption,
} from "@/types/product-version";

interface ProductVersionContextValue {
  versionId: ProductVersionId;
  version: ProductVersionOption;
  setVersionId: (versionId: ProductVersionId) => void;
}

const ProductVersionContext =
  createContext<ProductVersionContextValue | null>(null);

export function ProductVersionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [versionId, setVersionIdState] = useState<ProductVersionId>(
    DEFAULT_PRODUCT_VERSION_ID,
  );
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setVersionIdState(readStoredProductVersion());
    setHasHydrated(true);
  }, []);

  const setVersionId = useCallback((nextVersionId: ProductVersionId) => {
    if (!canSelectProductVersion(nextVersionId)) return;
    setVersionIdState(nextVersionId);
    writeStoredProductVersion(nextVersionId);
  }, []);

  const value = useMemo(
    () => ({
      versionId,
      version: getProductVersionOption(versionId),
      setVersionId,
    }),
    [versionId, setVersionId],
  );

  // Avoid flashing the wrong version label before localStorage hydrates.
  if (!hasHydrated) {
    return (
      <ProductVersionContext.Provider
        value={{
          versionId: DEFAULT_PRODUCT_VERSION_ID,
          version: getProductVersionOption(DEFAULT_PRODUCT_VERSION_ID),
          setVersionId,
        }}
      >
        {children}
      </ProductVersionContext.Provider>
    );
  }

  return (
    <ProductVersionContext.Provider value={value}>
      {children}
    </ProductVersionContext.Provider>
  );
}

export function useProductVersion(): ProductVersionContextValue {
  const context = useContext(ProductVersionContext);
  if (!context) {
    throw new Error(
      "useProductVersion must be used within ProductVersionProvider",
    );
  }
  return context;
}
