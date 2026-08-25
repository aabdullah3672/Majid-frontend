import { useMemo, useRef } from "react";
import { useCatalog } from "../context/CatalogContext.jsx";
import Icon from "../components/Icon.jsx";
import Hero from "../components/Hero.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { resolveImage } from "../utils/helpers.jsx";

const arrivalVisuals = [
  { ribbon: "Software Earbuds", ribbonTone: "software", rating: 4.5, reviews: 0 },
  { ribbon: "Newly Launched", ribbonTone: "new", rating: 4, reviews: 15 },
  { ribbon: "Software Earbuds", ribbonTone: "software", rating: 4.5, reviews: 6 },
  { ribbon: "Software Based", ribbonTone: "software", rating: 4, reviews: 47 },
  { ribbon: "Newly Launched", ribbonTone: "new", rating: 4.5, reviews: 9 },
  { ribbon: "Software Earbuds", ribbonTone: "software", rating: 4, reviews: 4 },
  { ribbon: "Newly Launched", ribbonTone: "new", rating: 4.5, reviews: 2 },
  { ribbon: "Newly Launched", ribbonTone: "new", rating: 4, reviews: 11 }
];

const promoBanners = [
  {
    title: "Custom Engraving",
    copy: "Personalized tech accessories, bundled for gifting and corporate orders.",
    to: "/products?q=custom",
    image: "https://placehold.co/1600x420/f3f2f2/3015a4?text=VoltXpress+Custom+Engraving"
  },
  {
    title: "Power Desk Deals",
    copy: "Chargers, hubs, cables, and power banks for cleaner everyday setups.",
    to: "/products?category=mobile-accessories",
    image: "https://placehold.co/1600x420/e9edf7/d43134?text=Charging+Essentials"
  }
];

function SectionHeader({ id, eyebrow, title, actionLabel = "View All", onAction }) {
  const [first, ...rest] = title.split(" ");
  const accent = rest.join(" ") || first;

  return (
    <div className="ronin-section-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 id={id}>
          <span>{rest.length ? first : ""}</span>
          <span>{accent}</span>
        </h2>
      </div>
      {onAction && (
        <button className="view-all-pill button-link" type="button" onClick={onAction}>
          <span>{actionLabel.split(" ")[0]}</span>
          <span>{actionLabel.split(" ").slice(1).join(" ") || ""}</span>
        </button>
      )}
    </div>
  );
}

function PromoBanner({ banner, navigate }) {
  return (
    <button className="promo-banner button-link" type="button" onClick={() => navigate(banner.to)} aria-label={banner.title}>
      <img src={banner.image} alt="" loading="lazy" />
      <span className="promo-banner-content">
        <strong>{banner.title}</strong>
        <span>{banner.copy}</span>
      </span>
    </button>
  );
}

function ProductCarouselSection({ title, viewAllLink, products, navigate, addToCart, theme = "gray", banner = null }) {
  const trackRef = useRef(null);
  const sectionId = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-title`;

  const scrollCarousel = (direction) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({
      left: direction * Math.min(360, track.clientWidth * 0.88),
      behavior: "smooth"
    });
  };

  return (
    <section className={`product-carousel-section product-carousel-section-${theme}`} aria-labelledby={sectionId}>
      <div className="container featured-carousel-shell">
        <SectionHeader id={sectionId} title={title} onAction={() => navigate(viewAllLink)} />
        {banner && <PromoBanner banner={banner} navigate={navigate} />}
        <div className="carousel-stage">
          <button className="carousel-arrow carousel-arrow-left button-link" type="button" onClick={() => scrollCarousel(-1)} aria-label={`Scroll ${title} left`}>
            <Icon name="arrowLeft" />
          </button>
          <div className="featured-carousel-track" ref={trackRef} tabIndex="0" aria-label={`${title} product carousel`}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} addToCart={addToCart} navigate={navigate} />
            ))}
          </div>
          <button className="carousel-arrow carousel-arrow-right button-link" type="button" onClick={() => scrollCarousel(1)} aria-label={`Scroll ${title} right`}>
            <Icon name="arrowRight" />
          </button>
        </div>
      </div>
    </section>
  );
}

function CategoryCard({ category, navigate }) {
  return (
    <button className="category-card button-link" type="button" onClick={() => navigate(`/products?category=${category.slug}`)}>
      <img src={resolveImage(category.image)} alt={category.name} />
      <div>
        <h3>{category.name}</h3>
        <p>{category.subcategories.length} subcategories</p>
      </div>
    </button>
  );
}

export default function HomePage({ navigate, addToCart }) {
  const { categories, products } = useCatalog();
  const carouselRows = useMemo(() => {
    const decorate = (items, offset = 0, fallbackRibbon = "New Arrival") => {
      return items.slice(0, 8).map((product, index) => {
        const visual = arrivalVisuals[(index + offset) % arrivalVisuals.length];
        return {
          ...product,
          ribbon: product.badge || fallbackRibbon,
          ribbonTone: visual.ribbonTone,
          rating: visual.rating,
          reviews: visual.reviews
        };
      });
    };

    return [
      {
        title: "New Arrivals",
        viewAllLink: "/products?sort=newest",
        products: decorate([...products].sort((a, b) => new Date(b.created) - new Date(a.created)), 0, "Newly Launched"),
        theme: "gray"
      },
      {
        title: "Top Trending",
        viewAllLink: "/products?sort=featured",
        products: decorate(products.filter((product) => product.featured), 2, "Top Pick"),
        theme: "white"
      },
      {
        title: "Power Picks",
        viewAllLink: "/products?category=mobile-accessories",
        products: decorate(products.filter((product) => ["mobile-accessories", "computer-laptop-accessories"].includes(product.category)), 4, "Setup Saver"),
        theme: "gray"
      }
    ];
  }, [products]);

  return (
    <main>
      <Hero navigate={navigate} />
      <section className="section section-light">
        <div className="container">
          <SectionHeader eyebrow="Browse by need" title="Top Categories" actionLabel="View All" onAction={() => navigate("/products")} />
          <div className="category-grid">
            {categories.map((category) => <CategoryCard key={category.slug} category={category} navigate={navigate} />)}
          </div>
        </div>
      </section>

      {carouselRows.map((row, index) => (
        <ProductCarouselSection
          key={row.title}
          title={row.title}
          viewAllLink={row.viewAllLink}
          products={row.products}
          navigate={navigate}
          addToCart={addToCart}
          theme={row.theme}
          banner={index === 1 ? promoBanners[0] : null}
        />
      ))}

      <section className="service-band">
        <div className="container service-grid">
          {[
            ["01", "7 day replacement", "Simple swaps for eligible accessories."],
            ["02", "Fast delivery", "Free delivery on orders over Rs. 5,000."],
            ["03", "Secure checkout", "COD, bank transfer, and card UI options."],
            ["04", "Support ready", "Accessory guidance before and after purchase."]
          ].map(([num, title, copy]) => (
            <div className="service-item" key={title}>
              <span className="service-icon">{num}</span>
              <strong>{title}</strong>
              <p>{copy}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
