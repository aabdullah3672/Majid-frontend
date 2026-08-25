import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/client.js";
import { categories as fallbackCategories, defaultReviews as fallbackReviews, products as fallbackProducts } from "../data/catalog.js";

const CatalogContext = createContext({
  categories: fallbackCategories,
  products: fallbackProducts,
  defaultReviews: fallbackReviews,
  refreshCatalog: () => {}
});

export function CatalogProvider({ children }) {
  const [catalogVersion, setCatalogVersion] = useState(0);
  const [catalog, setCatalog] = useState({
    categories: fallbackCategories,
    products: fallbackProducts,
    defaultReviews: fallbackReviews
  });

  const refreshCatalog = () => setCatalogVersion((v) => v + 1);

  useEffect(() => {
    let cancelled = false;

    api.getCatalog()
      .then((data) => {
        if (cancelled) return;
        setCatalog({
          categories: data.categories?.length ? data.categories : fallbackCategories,
          products: data.products?.length ? data.products : fallbackProducts,
          defaultReviews: data.reviews?.length ? data.reviews : fallbackReviews
        });
      })
      .catch(() => {
        if (!cancelled) {
          setCatalog({
            categories: fallbackCategories,
            products: fallbackProducts,
            defaultReviews: fallbackReviews
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [catalogVersion]);

  return (
    <CatalogContext.Provider value={{ ...catalog, refreshCatalog }}>
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog() {
  return useContext(CatalogContext);
}
