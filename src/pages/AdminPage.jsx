import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { useCatalog } from "../context/CatalogContext.jsx";
import { formatMoney, titleCase, formatDate, statusTone, starString, resolveImage } from "../utils/helpers.jsx";
import AuthPage from "./AuthPage.jsx";

function StatCard({ label, value, detail }) {
  return <article className="stat-card"><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>;
}

function DashboardPanel() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api.adminSummary()
      .then((data) => {
        if (!cancelled) setSummary(data.summary);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = summary ? [
    ["Total orders", Number(summary.totalOrders).toLocaleString(), `Revenue ${formatMoney(summary.revenue)}`],
    ["Revenue", formatMoney(summary.revenue), `${summary.totalOrders} orders total`],
    ["Products", Number(summary.totalProducts).toLocaleString(), `${summary.lowStock} low stock`],
    ["Users", Number(summary.totalUsers).toLocaleString(), `${summary.newUsers} new users`]
  ] : [
    ["Total orders", "1,248", "+12% this month"],
    ["Revenue", "Rs. 8.4M", "+8.7% this month"],
    ["Products", "126", "18 low stock"],
    ["Users", "9,430", "342 new users"]
  ];

  return (
    <div className="admin-panel is-active">
      <div className="admin-title">
        <div>
          <p className="eyebrow">Overview</p>
          <h2>Dashboard</h2>
        </div>
      </div>
      <div className="stat-grid">
        {stats.map(([label, value, detail]) => <StatCard key={label} label={label} value={value} detail={detail} />)}
      </div>
    </div>
  );
}

function ProductForm({ product, categories, onSave, onCancel, message }) {
  const isNew = !product;
  const [form, setForm] = useState({
    id: product?.id || `prod-${Date.now()}`,
    name: product?.name || "",
    category: product?.category || (categories[0]?.slug || ""),
    subcategory: product?.subcategory || "",
    subtitle: product?.subtitle || "",
    price: product?.price || 0,
    compareAt: product?.compareAt || 0,
    badge: product?.badge || "New",
    image: product?.image || "",
    brand: product?.brand || "",
    stock: product?.stock || 0,
    featured: product?.featured || false,
    isNew: product?.isNew || false,
    isActive: product?.isActive !== false,
    colors: product?.colors || [],
    created: product?.created || new Date().toISOString().slice(0, 10)
  });
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(product?.image || "");

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const result = await api.uploadImage(file);
      update("image", result.url);
      setPreview(resolveImage(result.url));
    } catch (err) {
      alert("Image upload failed: " + err.message);
      setPreview(product?.image || "");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.image) {
      alert("Please upload a product image.");
      return;
    }
    onSave(form, isNew);
  };

  const displayImage = preview || resolveImage(form.image);

  return (
    <div className="admin-panel is-active">
      <div className="admin-title">
        <div>
          <p className="eyebrow">{isNew ? "New Product" : "Edit Product"}</p>
          <h2>{isNew ? "Add Product" : form.name}</h2>
        </div>
        <button className="btn btn-secondary" type="button" onClick={onCancel}>← Back to List</button>
      </div>
      {message && <p className="form-message">{message}</p>}
      <form className="form-panel" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="field">
            <span>Product Name *</span>
            <input value={form.name} onChange={(e) => update("name", e.target.value)} required />
          </label>
          <label className="field">
            <span>Category *</span>
            <select value={form.category} onChange={(e) => update("category", e.target.value)}>
              {categories.map((cat) => <option key={cat.slug} value={cat.slug}>{cat.name}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Subcategory *</span>
            <input value={form.subcategory} onChange={(e) => update("subcategory", e.target.value)} required />
          </label>
          <label className="field">
            <span>Brand</span>
            <input value={form.brand} onChange={(e) => update("brand", e.target.value)} />
          </label>
          <label className="field field-wide">
            <span>Subtitle / Description *</span>
            <input value={form.subtitle} onChange={(e) => update("subtitle", e.target.value)} required />
          </label>
          <label className="field">
            <span>Price (PKR) *</span>
            <input type="number" min="0" value={form.price} onChange={(e) => update("price", Number(e.target.value))} required />
          </label>
          <label className="field">
            <span>Compare At Price</span>
            <input type="number" min="0" value={form.compareAt} onChange={(e) => update("compareAt", Number(e.target.value))} />
          </label>
          <label className="field">
            <span>Stock *</span>
            <input type="number" min="0" value={form.stock} onChange={(e) => update("stock", Number(e.target.value))} required />
          </label>
          <label className="field">
            <span>Badge</span>
            <input value={form.badge} onChange={(e) => update("badge", e.target.value)} placeholder="e.g. New, Sale, Hot" />
          </label>
          <div className="field field-wide">
            <span>Product Image *</span>
            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ marginBottom: "8px" }} />
            {uploading && <small style={{ color: "var(--ronin-cta)" }}>Uploading...</small>}
            {displayImage && !uploading && (
              <div style={{ marginTop: "8px" }}>
                <img src={displayImage} alt="Preview" style={{ width: "120px", height: "120px", objectFit: "contain", borderRadius: "12px", border: "1px solid var(--ronin-line)", background: "#f8f8f8" }} />
              </div>
            )}
            {form.image && <small style={{ color: "var(--ronin-muted)", wordBreak: "break-all" }}>{form.image}</small>}
          </div>
          <label className="field">
            <span>Colors (comma separated)</span>
            <input value={form.colors.join(", ")} onChange={(e) => update("colors", e.target.value.split(",").map((c) => c.trim()).filter(Boolean))} placeholder="#000000, #ffffff" />
          </label>
          <label className="field">
            <span>Date Created</span>
            <input type="date" value={form.created} onChange={(e) => update("created", e.target.value)} />
          </label>
        </div>
        <div className="hero-actions" style={{ marginTop: "16px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 800 }}>
            <input type="checkbox" checked={form.featured} onChange={(e) => update("featured", e.target.checked)} /> Featured
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 800 }}>
            <input type="checkbox" checked={form.isNew} onChange={(e) => update("isNew", e.target.checked)} /> Mark as New
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 800 }}>
            <input type="checkbox" checked={form.isActive} onChange={(e) => update("isActive", e.target.checked)} /> Active
          </label>
        </div>
        <div className="hero-actions" style={{ marginTop: "20px" }}>
          <button className="btn btn-primary" type="submit" disabled={uploading}>{isNew ? "Create Product" : "Save Changes"}</button>
          <button className="btn btn-secondary" type="button" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

function ProductsPanel({ action, refreshCatalog }) {
  const { categories } = useCatalog();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState("");

  const loadProducts = async () => {
    try {
      const data = await api.adminGetProducts();
      setProducts(data);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProducts(); }, []);

  const handleSave = async (formData, isNew) => {
    setMessage("Saving...");
    try {
      if (isNew) {
        await api.adminCreateProduct(formData);
        setMessage("Product created successfully.");
      } else {
        await api.adminUpdateProduct(formData.id, formData);
        setMessage("Product updated successfully.");
      }
      setEditing(null);
      await loadProducts();
      refreshCatalog?.();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleDelete = async (product) => {
    if (!confirm(`Delete "${product.name}"? This is a soft delete.`)) return;
    try {
      await api.adminDeleteProduct(product.id);
      setMessage(`${product.name} deleted.`);
      await loadProducts();
      refreshCatalog?.();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(error.message);
    }
  };

  if (editing) {
    return (
      <ProductForm
        product={editing === "new" ? null : editing}
        categories={categories}
        onSave={handleSave}
        onCancel={() => setEditing(null)}
        message={message}
      />
    );
  }

  return (
    <div className="admin-panel is-active">
      <div className="admin-title">
        <div>
          <p className="eyebrow">Inventory</p>
          <h2>Products ({products.length})</h2>
        </div>
        <button className="btn btn-primary" type="button" onClick={() => setEditing("new")}>Add Product</button>
      </div>
      {message && <p className="form-message">{message}</p>}
      {loading ? <p style={{ color: "var(--ronin-muted)" }}>Loading products...</p> : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>{formatMoney(product.price)}</td>
                  <td>{product.stock}</td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn-secondary" type="button" onClick={() => setEditing(product)}>Edit</button>
                      <button className="btn btn-danger" type="button" onClick={() => handleDelete(product)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function OrdersPanel() {
  const [serverOrders, setServerOrders] = useState(null);
  const fallbackOrders = [
    ["#VX-1048", "Ayesha Khan", "Rs. 12,997", "Delivered", "success", "2026-05-12"],
    ["#VX-1047", "Bilal Ahmed", "Rs. 7,499", "Processing", "warning", "2026-05-11"],
    ["#VX-1046", "Sana Rafiq", "Rs. 21,490", "Shipped", "info", "2026-05-10"],
    ["#VX-1045", "Hamza Ali", "Rs. 4,999", "Cancelled", "danger", "2026-05-09"]
  ];
  const orders = serverOrders ? serverOrders.map((order) => [
    order.orderNumber,
    order.customer,
    formatMoney(order.total),
    titleCase(order.status),
    statusTone(order.status),
    formatDate(order.createdAt)
  ]) : fallbackOrders;

  useEffect(() => {
    let cancelled = false;
    api.adminOrders()
      .then((data) => {
        if (!cancelled) setServerOrders(data.orders || []);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="admin-panel is-active">
      <div className="admin-title"><div><p className="eyebrow">Sales</p><h2>Orders</h2></div></div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            {orders.map(([id, customer, total, status, tone, date]) => (
              <tr key={id}><td>{id}</td><td>{customer}</td><td>{total}</td><td><span className={`badge ${tone}`}>{status}</span></td><td>{date}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UsersPanel() {
  const [serverUsers, setServerUsers] = useState(null);
  const users = serverUsers ? serverUsers.map((user) => [
    user.name,
    user.email,
    `${user.orderCount} orders`
  ]) : [
    ["Ayesha Khan", "ayesha@example.com", "12 orders"],
    ["Bilal Ahmed", "bilal@example.com", "7 orders"],
    ["Sana Rafiq", "sana@example.com", "4 orders"],
    ["Hamza Ali", "hamza@example.com", "2 orders"]
  ];

  useEffect(() => {
    let cancelled = false;
    api.adminUsers()
      .then((data) => {
        if (!cancelled) setServerUsers(data.users || []);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="admin-panel is-active">
      <div className="admin-title"><div><p className="eyebrow">Customers</p><h2>Users</h2></div></div>
      <div className="user-list">
        {users.map(([name, email, orders]) => <article key={email}><strong>{name}</strong><span>{email}</span><small>{orders}</small></article>)}
      </div>
    </div>
  );
}

function ReviewsAdminPanel({ action }) {
  const [serverReviews, setServerReviews] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    api.adminReviews()
      .then((data) => {
        if (!cancelled) setServerReviews(data.reviews || []);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const handleApprove = async (id) => {
    try {
      await api.adminApproveReview(id);
      setServerReviews((prev) => prev.map((r) => r.id === id ? { ...r, status: "approved" } : r));
      setMessage("Review approved.");
      setTimeout(() => setMessage(""), 2000);
    } catch (e) { setMessage(e.message); }
  };

  const handleReject = async (id) => {
    try {
      await api.adminRejectReview(id);
      setServerReviews((prev) => prev.map((r) => r.id === id ? { ...r, status: "rejected" } : r));
      setMessage("Review rejected.");
      setTimeout(() => setMessage(""), 2000);
    } catch (e) { setMessage(e.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this review permanently?")) return;
    try {
      await api.adminDeleteReview(id);
      setServerReviews((prev) => prev.filter((r) => r.id !== id));
      setMessage("Review deleted.");
      setTimeout(() => setMessage(""), 2000);
    } catch (e) { setMessage(e.message); }
  };

  const reviews = serverReviews || [];

  return (
    <div className="admin-panel is-active">
      <div className="admin-title"><div><p className="eyebrow">Moderation</p><h2>Reviews</h2></div></div>
      {message && <p className="form-message">{message}</p>}
      <div className="review-admin-list">
        {reviews.length === 0 && <p style={{ color: "var(--ronin-muted)" }}>No reviews yet.</p>}
        {reviews.map((review) => (
          <article key={review.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong>{review.name} — {starString(review.rating)}</strong>
              <span className={`badge ${review.status === "approved" ? "success" : review.status === "rejected" ? "danger" : "warning"}`}>{titleCase(review.status)}</span>
            </div>
            <p>{review.comment}</p>
            <small style={{ color: "var(--ronin-muted)" }}>{review.date} · Product: {review.productId || "General"}</small>
            <div className="row-actions" style={{ marginTop: "8px" }}>
              {review.status !== "approved" && <button className="btn btn-secondary" type="button" onClick={() => handleApprove(review.id)}>Approve</button>}
              {review.status !== "rejected" && <button className="btn btn-danger" type="button" onClick={() => handleReject(review.id)}>Reject</button>}
              <button className="btn btn-danger" type="button" onClick={() => handleDelete(review.id)}>Delete</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function AccessDenied({ navigate }) {
  return (
    <main className="page-shell">
      <section className="auth-shell container">
        <div className="auth-copy">
          <p className="eyebrow">Restricted</p>
          <h1>Admin access only.</h1>
          <p>Your current account can browse and shop, but it cannot open the admin dashboard.</p>
          <div className="hero-actions">
            <button className="btn btn-primary" type="button" onClick={() => navigate("/")}>Go to Storefront</button>
            <button className="btn btn-secondary" type="button" onClick={() => navigate("/auth")}>Use Another Account</button>
          </div>
        </div>
      </section>
    </main>
  );
}

function AdminPanel({ setToast, refreshCatalog }) {
  const [tab, setTab] = useState("dashboard");
  const action = (name) => setToast(`${name} backend endpoint is ready; editor forms can use it next.`);

  return (
    <main className="page-shell admin-shell container">
      <aside className="admin-sidebar" aria-label="Admin navigation">
        <h1>Admin</h1>
        {["dashboard", "products", "orders", "users", "reviews"].map((item) => (
          <button className={tab === item ? "is-active" : ""} type="button" key={item} onClick={() => setTab(item)}>{titleCase(item)}</button>
        ))}
      </aside>

      <section className="admin-content">
        {tab === "dashboard" && <DashboardPanel />}
        {tab === "products" && <ProductsPanel action={action} refreshCatalog={refreshCatalog} />}
        {tab === "orders" && <OrdersPanel />}
        {tab === "users" && <UsersPanel />}
        {tab === "reviews" && <ReviewsAdminPanel action={action} />}
      </section>
    </main>
  );
}

export default function AdminGate({ session, navigate, onSessionChange, setToast, refreshCatalog }) {
  if (!session) {
    return (
      <AuthPage
        navigate={navigate}
        onSessionChange={onSessionChange}
        redirectTo="/admin"
        introTitle="Admin access requires login."
        introCopy="The storefront is public. Sign in with an admin account to open the dashboard."
      />
    );
  }

  if (session.user?.role !== "admin") {
    return <AccessDenied navigate={navigate} />;
  }

  return <AdminPanel setToast={setToast} refreshCatalog={refreshCatalog} />;
}
