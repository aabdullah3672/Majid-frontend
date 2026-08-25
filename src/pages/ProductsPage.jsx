import { useEffect, useMemo, useState } from "react";
import { useCatalog } from "../context/CatalogContext.jsx";
import { api } from "../api/client.js";
import ProductCard from "../components/ProductCard.jsx";
import Icon from "../components/Icon.jsx";
import { getCategoryName } from "../utils/helpers.jsx";

export default function ProductsPage({ route, navigate, addToCart }) {
  const { categories } = useCatalog();
  const params = route.params;

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [query, setQuery] = useState(params.get("q") || "");
  const [sort, setSort] = useState(params.get("sort") || "featured");
  const [selectedCategory, setSelectedCategory] = useState(params.get("category") || "");
  const [selectedSubcategory, setSelectedSubcategory] = useState(params.get("subcategory") || "");
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const pageSize = 12;

  // Sync URL params to local state
  useEffect(() => {
    setQuery(params.get("q") || "");
    setSort(params.get("sort") || "featured");
    setSelectedCategory(params.get("category") || "");
    setSelectedSubcategory(params.get("subcategory") || "");
    setPage(1);
  }, [route.search]);

  // Fetch products from API with server-side filtering
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const fetchParams = new URLSearchParams();
    if (selectedCategory) fetchParams.set("category", selectedCategory);
    if (selectedSubcategory) fetchParams.set("subcategory", selectedSubcategory);
    if (query) fetchParams.set("q", query);
    if (sort) fetchParams.set("sort", sort);
    fetchParams.set("page", String(page));
    fetchParams.set("pageSize", String(pageSize));

    api.getProducts(Object.fromEntries(fetchParams))
      .then((data) => {
        if (cancelled) return;
        setProducts(data.products || []);
        setTotalCount(data.total || data.products?.length || 0);
      })
      .catch(() => {
        if (!cancelled) {
          setProducts([]);
          setTotalCount(0);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [selectedCategory, selectedSubcategory, query, sort, page]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const from = totalCount ? (page - 1) * pageSize + 1 : 0;
  const to = Math.min(page * pageSize, totalCount);

  const handleCategoryClick = (slug) => {
    if (selectedCategory === slug) {
      setSelectedCategory("");
      setSelectedSubcategory("");
    } else {
      setSelectedCategory(slug);
      setSelectedSubcategory("");
    }
    setPage(1);
  };

  const handleSubcategoryClick = (categorySlug, sub) => {
    setSelectedCategory(categorySlug);
    if (selectedSubcategory === sub) {
      setSelectedSubcategory("");
    } else {
      setSelectedSubcategory(sub);
    }
    setPage(1);
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedSubcategory("");
    setQuery("");
    setPage(1);
  };

  return (
    <main className="page-shell">
      <section className="page-heading container">
        <p className="eyebrow">Shop catalog</p>
        <h1>Products</h1>
        <p>Filter by category, compare prices, and add essentials to your cart.</p>
      </section>

      <section className="shop-section container">
        <div className="shop-actions">
          <button className="btn btn-secondary filter-toggle" type="button" onClick={() => setFiltersOpen((open) => !open)}>
            <Icon name="filter" />
            <span>Filters</span>
          </button>
          <label className="search-mini">
            <span>Search products</span>
            <input
              type="search"
              placeholder="Try USB hub, earbuds..."
              value={query}
              onChange={(event) => { setQuery(event.target.value); setPage(1); }}
            />
          </label>
          <label className="sort-box">
            <span>Sort</span>
            <select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }}>
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </label>
        </div>

        <div className="shop-layout">
          <aside className={`filter-panel${filtersOpen ? " is-open" : ""}`} aria-label="Product filters">
            <div className="filter-title">
              <h2>Categories</h2>
              <button className="text-button" type="button" onClick={clearFilters}>Clear</button>
            </div>
            {categories.map((category) => (
              <details className="filter-group" open={selectedCategory === category.slug} key={category.slug}>
                <summary>{category.name}</summary>
                <label className="filter-option">
                  <input
                    type="checkbox"
                    checked={selectedCategory === category.slug && !selectedSubcategory}
                    onChange={() => handleCategoryClick(category.slug)}
                  />
                  All {category.name}
                </label>
                {category.subcategories.map((subcategory) => (
                  <label className="filter-option" key={subcategory}>
                    <input
                      type="checkbox"
                      checked={selectedCategory === category.slug && selectedSubcategory === subcategory}
                      onChange={() => handleSubcategoryClick(category.slug, subcategory)}
                    />
                    {subcategory}
                  </label>
                ))}
              </details>
            ))}
          </aside>

          <div className="product-results">
            <div className="result-meta">
              {loading ? "Loading..." : `Showing ${from}–${to} of ${totalCount} products`}
            </div>
            {!loading && products.length > 0 && (
              <div className="product-grid listing-grid">
                {products.map((product) => <ProductCard key={product.id} product={product} addToCart={addToCart} navigate={navigate} />)}
              </div>
            )}
            {!loading && products.length === 0 && (
              <div className="empty-state">
                <h2>No products found</h2>
                <p>Try a different category, subcategory, or search term.</p>
                <button className="btn btn-primary" type="button" onClick={() => navigate("/products")}>Reset catalog</button>
              </div>
            )}
            {totalPages > 1 && (
              <nav className="pagination" aria-label="Product pages">
                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    className={`page-button${index + 1 === page ? " is-active" : ""}`}
                    type="button"
                    key={index + 1}
                    onClick={() => setPage(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}
              </nav>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
