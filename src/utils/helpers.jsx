import { useEffect, useState } from "react";

const money = new Intl.NumberFormat("en-PK", {
  style: "currency",
  currency: "PKR",
  maximumFractionDigits: 0
});

export function formatMoney(value) {
  return money.format(value).replace("PKR", "Rs.");
}

export function resolveImage(url) {
  if (!url) return "https://placehold.co/400x400/f3f2f2/5a5a72?text=No+Image";
  if (url.startsWith("/uploads")) {
    return url;
  }
  return url;
}

export function getCategoryName(slug, categories) {
  return categories.find((category) => category.slug === slug)?.name || slug;
}

export function starString(rating) {
  return "★".repeat(Number(rating)) + "☆".repeat(5 - Number(rating));
}

export function titleCase(value) {
  return value.slice(0, 1).toUpperCase() + value.slice(1);
}

export function formatDate(value) {
  return value ? String(value).slice(0, 10) : "";
}

export function statusTone(status) {
  if (status === "delivered") return "success";
  if (status === "processing") return "warning";
  if (status === "cancelled") return "danger";
  return "info";
}

export function getCurrentRoute() {
  const path = window.location.pathname === "/index.html" ? "/" : window.location.pathname;
  return {
    path: path === "" ? "/" : path,
    search: window.location.search,
    params: new URLSearchParams(window.location.search)
  };
}

export function getCartTotals(cart, products) {
  const items = cart
    .map((entry) => {
      const product = products.find((item) => item.id === entry.id);
      return product ? { ...product, quantity: entry.quantity } : null;
    })
    .filter(Boolean);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.05);
  const delivery = subtotal === 0 || subtotal >= 5000 ? 0 : 350;
  return { items, subtotal, tax, delivery, total: subtotal + tax + delivery };
}

export function validateForm(form, names) {
  const errors = {};
  names.forEach((name) => {
    const field = form.elements[name];
    const value = field?.value?.trim() || "";
    if (!value) {
      errors[name] = "This field is required.";
      return;
    }
    if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      errors[name] = "Enter a valid email address.";
    }
    if (field.type === "password" && value.length < 6) {
      errors[name] = "Use at least 6 characters.";
    }
  });
  return errors;
}

export function useLocalStorage(key, fallback) {
  const [value, setValue] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(key)) || fallback;
    } catch {
      return fallback;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
