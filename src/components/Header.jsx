import { useEffect, useState } from "react";
import { useCatalog } from "../context/CatalogContext.jsx";
import { clearSession } from "../api/client.js";
import Icon from "./Icon.jsx";
import CategoryIcon from "./CategoryIcon.jsx";
import { resolveImage } from "../utils/helpers.jsx";

const utilityLinks = [
  { label: "Product Customization", to: "/products?q=custom" },
  { label: "Express Delivery", to: "/products?sort=newest" },
  { label: "Track Order", to: "/cart" },
  { label: "Contact Us", to: "/about" }
];

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/reviews", label: "Reviews" },
  { to: "/about", label: "About" }
];

function Brand({ navigate }) {
  return (
    <button className="brand button-link" type="button" onClick={() => navigate("/")} aria-label="VoltXpress home">
      <span className="brand-mark">TD</span>
      <span className="brand-name">Tech Dealz</span>
    </button>
  );
}

function MegaMenu({ category, navigate }) {
  return (
    <div className="mega-menu" role="menu" aria-label={`${category.name} categories`}>
      <div className="mega-menu-inner">
        <div className="mega-menu-copy">
          <span>{category.name}</span>
          <strong>Shop by type</strong>
        </div>
        <div className="mega-menu-grid">
          {category.subcategories.map((sub) => (
            <button
              className="mega-menu-item button-link"
              type="button"
              role="menuitem"
              key={sub}
              onClick={() => navigate(`/products?category=${category.slug}&subcategory=${encodeURIComponent(sub)}`)}
            >
              <img src={resolveImage(category.image)} alt="" loading="lazy" />
              <span>{sub}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function MobileNavigation({ navigate, route, categories }) {
  return (
    <>
      {navLinks.map((link) => (
        <button
          className={`mobile-nav-link button-link${route.path === link.to ? " is-active" : ""}`}
          type="button"
          key={link.to}
          onClick={() => navigate(link.to)}
        >
          {link.label}
        </button>
      ))}
      {categories.map((category) => (
        <details className="mobile-accordion" key={category.slug}>
          <summary>
            <span><CategoryIcon name={category.icon} size={18} />{category.name}</span>
            <Icon name="chevronDown" />
          </summary>
          <div className="mobile-accordion-panel">
            <button className="mobile-mega-link button-link" type="button" onClick={() => navigate(`/products?category=${category.slug}`)}>
              <img src={resolveImage(category.image)} alt="" loading="lazy" />
              <span>All {category.name}</span>
            </button>
            {category.subcategories.map((sub) => (
              <button
                className="mobile-mega-link button-link"
                type="button"
                key={sub}
                onClick={() => navigate(`/products?category=${category.slug}&subcategory=${encodeURIComponent(sub)}`)}
              >
                <img src={resolveImage(category.image)} alt="" loading="lazy" />
                <span>{sub}</span>
              </button>
            ))}
          </div>
        </details>
      ))}
      <div className="mobile-utility-links">
        {utilityLinks.map((link) => (
          <button className="button-link" type="button" key={link.label} onClick={() => navigate(link.to)}>{link.label}</button>
        ))}
      </div>
    </>
  );
}

export default function Header({ route, navigate, cart, session, onSessionChange }) {
  const { categories } = useCatalog();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeMega, setActiveMega] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [query, setQuery] = useState("");
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Determine active category from current URL
  const activeCategory = route.params?.get("category") || "";

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const submitSearch = (event) => {
    event.preventDefault();
    const search = query.trim();
    navigate(search ? `/products?q=${encodeURIComponent(search)}` : "/products");
    setQuery("");
    setMenuOpen(false);
    setActiveMega("");
  };

  const navigateAndClose = (to) => {
    navigate(to);
    setMenuOpen(false);
    setActiveMega("");
  };

  return (
    <>
    <header className={`site-header${isScrolled ? " is-scrolled" : ""}`}>
      <div className="utility-bar">
        <div className="container utility-bar-inner">
          {utilityLinks.map((link) => (
            <button className="utility-link button-link" type="button" key={link.label} onClick={() => navigateAndClose(link.to)}>
              {link.label}
            </button>
          ))}
        </div>
      </div>
      <div className="container navbar">
        <button className="menu-toggle" type="button" onClick={() => setMenuOpen((open) => !open)} aria-label="Open navigation" aria-expanded={menuOpen}>
          <Icon name={menuOpen ? "close" : "menu"} />
        </button>

        <Brand navigate={navigate} />

        {/* Icon-only category navigation (like Ronin.pk) */}
        <nav className="nav-icons" aria-label="Product categories" onMouseLeave={() => setActiveMega("")}>
          {categories.map((category) => (
            <div
              className={`nav-icon-item${activeMega === category.slug ? " is-open" : ""}${activeCategory === category.slug ? " is-active" : ""}`}
              key={category.slug}
              onMouseEnter={() => setActiveMega(category.slug)}
              onFocus={() => setActiveMega(category.slug)}
              onKeyDown={(event) => { if (event.key === "Escape") setActiveMega(""); }}
            >
              <button
                className="nav-icon-btn button-link"
                type="button"
                aria-haspopup="true"
                aria-expanded={activeMega === category.slug}
                aria-label={category.name}
                title={category.name}
                onClick={() => navigateAndClose(`/products?category=${category.slug}`)}
              >
                <CategoryIcon name={category.icon} size={20} />
                <span className="nav-icon-text">{category.name}</span>
              </button>
              <MegaMenu category={category} navigate={navigateAndClose} />
            </div>
          ))}
        </nav>

        <div className="header-actions">
          <button className={`header-icon button-link${route.path === "/auth" ? " is-active" : ""}`} type="button" onClick={() => {
            if (session) {
              clearSession();
              onSessionChange(null);
              navigateAndClose("/");
            } else {
              navigateAndClose("/auth");
            }
          }} aria-label={session ? "Logout" : "Account"}>
            <Icon name="user" />
          </button>
          {session?.user?.role === "admin" && (
            <button className={`header-icon button-link${route.path === "/admin" ? " is-active" : ""}`} type="button" onClick={() => navigateAndClose("/admin")} aria-label="Admin panel">
              <Icon name="briefcase" />
            </button>
          )}
          <button className={`header-icon cart-link button-link${route.path === "/cart" ? " is-active" : ""}`} type="button" onClick={() => navigateAndClose("/cart")} aria-label={`Cart with ${cartCount} items`}>
            <Icon name="cart" />
            <span className={`cart-badge${cartCount === 0 ? " is-empty" : ""}`}>{cartCount}</span>
          </button>
        </div>

        <form className="search-form" onSubmit={submitSearch} role="search">
          <Icon name="search" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="Search products" aria-label="Search products" />
          <button type="submit" aria-label="Submit search"><Icon name="arrowRight" /></button>
        </form>
      </div>
      <div className={`container mobile-menu${menuOpen ? " is-open" : ""}`}>
        <MobileNavigation navigate={navigateAndClose} route={route} categories={categories} />
      </div>
    </header>

    {/* Mobile bottom navigation bar — outside header so position:fixed works */}
    <nav className="mobile-bottom-bar" aria-label="Mobile navigation">
      <button className={`mobile-bottom-item${route.path === "/" ? " is-active" : ""}`} type="button" onClick={() => navigateAndClose("/")}>
        <Icon name="grid" />
        <span>Home</span>
      </button>
      <button className={`mobile-bottom-item${route.path === "/products" ? " is-active" : ""}`} type="button" onClick={() => navigateAndClose("/products")}>
        <Icon name="box" />
        <span>Products</span>
      </button>
      <button className={`mobile-bottom-item${route.path === "/cart" ? " is-active" : ""}`} type="button" onClick={() => navigateAndClose("/cart")}>
        <Icon name="cart" />
        {cartCount > 0 && <span className="mobile-bottom-badge">{cartCount}</span>}
        <span>Cart</span>
      </button>
      <button className={`mobile-bottom-item${route.path === "/auth" ? " is-active" : ""}`} type="button" onClick={() => {
        if (session) {
          clearSession();
          onSessionChange(null);
          navigateAndClose("/");
        } else {
          navigateAndClose("/auth");
        }
      }}>
        <Icon name="user" />
        <span>{session ? "Logout" : "Account"}</span>
      </button>
    </nav>
    </>
  );
}

export { Brand };
