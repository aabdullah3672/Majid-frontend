import { useEffect, useState } from "react";
import { getSession } from "./api/client.js";
import { CatalogProvider, useCatalog } from "./context/CatalogContext.jsx";
import { getCurrentRoute, useLocalStorage } from "./utils/helpers.jsx";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import Icon from "./components/Icon.jsx";
import HomePage from "./pages/HomePage.jsx";
import ProductsPage from "./pages/ProductsPage.jsx";
import ProductDetailPage from "./pages/ProductDetailPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import AdminGate from "./pages/AdminPage.jsx";
import ReviewsPage from "./pages/ReviewsPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";

const CART_KEY = "voltxpress-cart";

function FloatingContactButton() {
  return (
    <a className="floating-contact" href="https://wa.me/923000000000" target="_blank" rel="noreferrer" aria-label="Contact VoltXpress on WhatsApp">
      <Icon name="whatsapp" />
    </a>
  );
}

function AppShell() {
  const { refreshCatalog } = useCatalog();
  const [route, setRoute] = useState(() => getCurrentRoute());
  const [cart, setCart] = useLocalStorage(CART_KEY, []);
  const [session, setSession] = useState(() => getSession());
  const [toast, setToast] = useState("");

  useEffect(() => {
    const onPopState = () => setRoute(getCurrentRoute());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const navigate = (to) => {
    window.history.pushState({}, "", to);
    setRoute(getCurrentRoute());
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const { products } = useCatalog();

  const addToCart = (productId) => {
    const product = products.find((item) => item.id === productId);
    if (!product) return;

    setCart((current) => {
      const existing = current.find((item) => item.id === productId);
      if (existing) {
        return current.map((item) => item.id === productId ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...current, { id: productId, quantity: 1 }];
    });
    setToast(`${product.name} added to cart.`);
  };

  const updateCartItem = (productId, action) => {
    setCart((current) => {
      return current
        .map((item) => {
          if (item.id !== productId) return item;
          if (action === "increase") return { ...item, quantity: item.quantity + 1 };
          if (action === "decrease") return { ...item, quantity: item.quantity - 1 };
          return item;
        })
        .filter((item) => action !== "remove" || item.id !== productId)
        .filter((item) => item.quantity > 0);
    });
  };

  const clearCart = () => setCart([]);

  const renderRoute = () => {
    if (route.path.startsWith("/product/")) {
      return <ProductDetailPage route={route} navigate={navigate} addToCart={addToCart} />;
    }
    switch (route.path) {
      case "/products":
        return <ProductsPage route={route} navigate={navigate} addToCart={addToCart} />;
      case "/cart":
        return <CartPage cart={cart} updateCartItem={updateCartItem} navigate={navigate} />;
      case "/checkout":
        return <CheckoutPage cart={cart} clearCart={clearCart} navigate={navigate} setToast={setToast} />;
      case "/auth":
        return <AuthPage navigate={navigate} onSessionChange={setSession} />;
      case "/admin":
        return <AdminGate session={session} navigate={navigate} onSessionChange={setSession} setToast={setToast} refreshCatalog={refreshCatalog} />;
      case "/reviews":
        return <ReviewsPage />;
      case "/about":
        return <AboutPage />;
      default:
        return <HomePage navigate={navigate} addToCart={addToCart} />;
    }
  };

  return (
    <>
      <Header route={route} navigate={navigate} cart={cart} session={session} />
      {renderRoute()}
      <Footer navigate={navigate} />
      <FloatingContactButton />
      <div className={`toast${toast ? " is-visible" : ""}`} role="status">{toast}</div>
    </>
  );
}

export default function App() {
  return (
    <CatalogProvider>
      <AppShell />
    </CatalogProvider>
  );
}
