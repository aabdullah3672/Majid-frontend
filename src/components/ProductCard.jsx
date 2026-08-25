import Icon from "./Icon.jsx";
import { formatMoney, resolveImage } from "../utils/helpers.jsx";

function ProductRating({ rating }) {
  return (
    <div className="rating-stars" aria-label={`${rating} out of 5 stars`}>
      {[0, 1, 2, 3, 4].map((index) => {
        const fill = Math.max(0, Math.min(1, rating - index));
        return <span className="rating-star" style={{ "--fill": `${fill * 100}%` }} key={index}></span>;
      })}
    </div>
  );
}

export default function ProductCard({ product, addToCart, navigate }) {
  const rating = product.rating ?? (product.featured ? 5 : 4);
  const isOutOfStock = product.stock === 0;

  const handleCardClick = (e) => {
    // Don't navigate if user clicked a button
    if (e.target.closest("button")) return;
    navigate?.(`/product/${product.id}`);
  };

  return (
    <article className="product-card" aria-label={product.name} onClick={handleCardClick} style={{ cursor: navigate ? "pointer" : "default" }}>
      <div className="product-media">
        <img src={resolveImage(product.image)} alt={product.name} loading="lazy" />
      </div>
      <div className="product-body">
        <h3>{product.name}</h3>
        <p className="product-subtitle">{product.subtitle}</p>
        <div className="rating-swatch-row">
          <ProductRating rating={rating} />
          {product.colors?.length > 0 && (
            <div className="swatches" aria-label="Available colors">
              {product.colors.map((color) => (
                <span className="swatch" title={color} style={{ background: color }} key={color}></span>
              ))}
            </div>
          )}
        </div>
        <div className="product-footer">
          <div className="price-row">
            <span className="price">{formatMoney(product.price)}</span>
            {product.compareAt > product.price && (
              <span className="compare-price">{formatMoney(product.compareAt)}</span>
            )}
          </div>
          {isOutOfStock ? (
            <button className="btn buy-now-button sold-out-button" type="button" disabled>
              Sold Out
            </button>
          ) : (
            <button className="btn buy-now-button" type="button" onClick={() => addToCart(product.id)}>
              <Icon name="cart" />
              <span>Buy Now</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
