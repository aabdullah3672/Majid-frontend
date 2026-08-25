import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { useCatalog } from "../context/CatalogContext.jsx";
import { formatMoney, resolveImage, getCategoryName } from "../utils/helpers.jsx";
import Icon from "../components/Icon.jsx";
import { Truck, ShieldCheck, Award, BadgeCheck } from "lucide-react";

export default function ProductDetailPage({ route, navigate, addToCart }) {
  const { categories } = useCatalog();
  const productId = route.path.split("/product/")[1];
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.getProduct(productId)
      .then((data) => {
        if (cancelled) return;
        setProduct(data.product || data);
        setSelectedColor((data.product || data)?.colors?.[0] || null);
      })
      .catch(() => { if (!cancelled) setProduct(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [productId]);

  if (loading) {
    return (
      <main className="page-shell">
        <div className="container" style={{ padding: "80px 24px", textAlign: "center" }}>
          <p style={{ color: "var(--ronin-muted)" }}>Loading product...</p>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="page-shell">
        <div className="container" style={{ padding: "80px 24px" }}>
          <h1>Product not found</h1>
          <p style={{ color: "var(--ronin-muted)" }}>This product may have been removed or doesn't exist.</p>
          <button className="btn btn-primary" type="button" onClick={() => navigate("/products")} style={{ marginTop: "16px" }}>Browse Products</button>
        </div>
      </main>
    );
  }

  const images = product.images?.length
    ? product.images.map((img) => img.url || img)
    : [product.image];

  const rating = product.avgRating || product.rating || (product.featured ? 5 : 4);
  const reviewCount = product.reviewCount || 0;
  const isOutOfStock = product.stock === 0;

  return (
    <main className="page-shell">
      <div className="container pdp-layout">
        {/* Breadcrumb */}
        <nav className="pdp-breadcrumb" aria-label="Breadcrumb">
          <button className="button-link" type="button" onClick={() => navigate("/")}>Home</button>
          <span>/</span>
          <button className="button-link" type="button" onClick={() => navigate("/products")}>Products</button>
          <span>/</span>
          <button className="button-link" type="button" onClick={() => navigate(`/products?category=${product.category}`)}>{getCategoryName(product.category, categories)}</button>
          <span>/</span>
          <span className="pdp-breadcrumb-current">{product.name}</span>
        </nav>

        {/* Image Gallery */}
        <div className="pdp-gallery">
          <div className="pdp-main-image">
            <img src={resolveImage(images[activeImage])} alt={product.name} />
          </div>
          {images.length > 1 && (
            <div className="pdp-thumbnails">
              {images.map((img, i) => (
                <button
                  className={`pdp-thumb${i === activeImage ? " is-active" : ""}`}
                  type="button"
                  key={i}
                  onClick={() => setActiveImage(i)}
                >
                  <img src={resolveImage(img)} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="pdp-info">
          {product.badge && <span className="pdp-badge">{product.badge}</span>}
          <h1 className="pdp-title">{product.name}</h1>
          <p className="pdp-subtitle">{product.subtitle}</p>

          {/* Rating */}
          <div className="pdp-rating">
            <div className="rating-stars">
              {[0, 1, 2, 3, 4].map((i) => {
                const fill = Math.max(0, Math.min(1, rating - i));
                return <span className="rating-star" style={{ "--fill": `${fill * 100}%` }} key={i}></span>;
              })}
            </div>
            <span className="pdp-review-count">
              {reviewCount > 0 ? `${reviewCount} review${reviewCount > 1 ? "s" : ""}` : "No reviews yet"}
            </span>
          </div>

          {/* Price */}
          <div className="pdp-price-block">
            <span className="pdp-price">{formatMoney(product.price)}</span>
            {product.compareAt > product.price && (
              <>
                <span className="pdp-compare-price">{formatMoney(product.compareAt)}</span>
                <span className="pdp-discount-badge">
                  {Math.round((1 - product.price / product.compareAt) * 100)}% OFF
                </span>
              </>
            )}
          </div>

          {/* Color Variants */}
          {product.colors?.length > 0 && (
            <div className="pdp-colors">
              <span className="pdp-label">Color: <strong>{selectedColor || "—"}</strong></span>
              <div className="pdp-color-options">
                {product.colors.map((color) => (
                  <button
                    className={`pdp-color-swatch${selectedColor === color ? " is-active" : ""}`}
                    type="button"
                    key={color}
                    title={color}
                    style={{ background: color }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Quantity + Add to Cart */}
          <div className="pdp-actions">
            <div className="pdp-quantity">
              <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
              <span>{quantity}</span>
              <button type="button" onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))}>+</button>
            </div>
            {isOutOfStock ? (
              <button className="btn btn-primary pdp-cart-btn" disabled>Sold Out</button>
            ) : (
              <button className="btn btn-primary pdp-cart-btn" type="button" onClick={() => { for (let i = 0; i < quantity; i++) addToCart(product.id); }}>
                <Icon name="cart" /> Add to Cart
              </button>
            )}
          </div>

          {/* Stock info */}
          <p className="pdp-stock">
            {isOutOfStock
              ? "Currently out of stock"
              : product.stock < 10
                ? `Only ${product.stock} left in stock`
                : "In stock — ready to ship"
            }
          </p>

          {/* Meta info */}
          <div className="pdp-meta">
            {product.brand && <div className="pdp-meta-item"><strong>Brand:</strong> {product.brand}</div>}
            <div className="pdp-meta-item"><strong>Category:</strong> {getCategoryName(product.category, categories)}</div>
            <div className="pdp-meta-item"><strong>SKU:</strong> {product.id}</div>
          </div>
        </div>
      </div>

      {/* Trust band */}
      <section className="trust-band">
        <div className="container trust-band-inner">
          <h3 className="trust-title"><em>Exceptional Quality</em> <span>Delivered</span></h3>
          <div className="trust-items">
            <div className="trust-item"><Truck size={28} color="#5a5a72" /><div><strong>Free Shipping</strong><span>Nationwide</span></div></div>
            <div className="trust-item"><ShieldCheck size={28} color="#2ecc71" /><div><strong>70M+ Satisfied</strong><span>Customers</span></div></div>
            <div className="trust-item"><Award size={28} color="#f39c12" /><div><strong>365 Days</strong><span>Warranty</span></div></div>
            <div className="trust-item"><BadgeCheck size={28} color="#6e71e4" /><div><strong>Certified</strong><span>Products</span></div></div>
          </div>
        </div>
      </section>
    </main>
  );
}
