const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:4000/api").replace(/\/$/, "");
const SESSION_KEY = "voltxpress-session";

export const getSession = () => {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
};

export const saveSession = (session) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
};

const request = async (path, options = {}) => {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const session = getSession();

  if (options.auth && session?.token) {
    headers.Authorization = `Bearer ${session.token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.message || `Request failed with status ${response.status}.`);
  }

  return data;
};

/**
 * Upload a file via multipart/form-data.
 */
const uploadRequest = async (path, file, fieldName = "image") => {
  const session = getSession();
  const formData = new FormData();
  formData.append(fieldName, file);

  const headers = {};
  if (session?.token) {
    headers.Authorization = `Bearer ${session.token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: formData
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.message || `Upload failed with status ${response.status}.`);
  }

  return data;
};

/**
 * Unwrap the { success, data, ... } envelope if present.
 * The backend wraps responses in { success, message, data, errors }.
 * Frontend components expect the inner data directly.
 */
function unwrap(response) {
  if (response && response.success === true && response.data !== undefined) {
    return response.data;
  }
  return response;
}

/**
 * Normalize auth response to { user, token } format the frontend expects.
 */
function normalizeSession(response) {
  // New format: { success, data: { user, accessToken, refreshToken } }
  if (response?.data?.user && response?.data?.accessToken) {
    return {
      user: response.data.user,
      token: response.data.accessToken,
      refreshToken: response.data.refreshToken
    };
  }
  // Legacy format: { user, token }
  if (response?.user && response?.token) {
    return response;
  }
  return response;
}

export const api = {
  getCatalog: () => request("/catalog").then(unwrap),
  getProduct: (id) => request(`/catalog/products/${id}`).then(unwrap),
  getProducts: (params = {}) => {
    const query = new URLSearchParams();
    if (params.category) query.set("category", params.category);
    if (params.subcategory) query.set("subcategory", params.subcategory);
    if (params.q) query.set("q", params.q);
    if (params.sort) query.set("sort", params.sort);
    if (params.page) query.set("page", params.page);
    if (params.pageSize) query.set("pageSize", params.pageSize);
    const qs = query.toString();
    return request(`/catalog/products${qs ? `?${qs}` : ""}`).then(unwrap);
  },
  getReviews: () => request("/reviews").then((res) => {
    const d = unwrap(res);
    return d.reviews || d || [];
  }),
  createReview: (review) => request("/reviews", { method: "POST", body: review }).then((res) => {
    const d = unwrap(res);
    return d.review || d;
  }),
  createOrder: (order) => request("/orders", { method: "POST", body: order }).then((res) => {
    const d = unwrap(res);
    return d.order || d;
  }),
  sendContact: (message) => request("/contact", { method: "POST", body: message }),
  login: (credentials) => request("/auth/login", { method: "POST", body: credentials }).then(normalizeSession),
  register: (details) => request("/auth/register", { method: "POST", body: details }).then(normalizeSession),
  adminSummary: () => request("/admin/summary", { auth: true }).then(unwrap),
  adminOrders: () => request("/admin/orders", { auth: true }).then(unwrap),
  adminUsers: () => request("/admin/users", { auth: true }).then(unwrap),
  adminReviews: () => request("/admin/reviews", { auth: true }).then(unwrap),
  adminCreateProduct: (product) => request("/admin/products", { method: "POST", body: product, auth: true }).then(unwrap),
  adminUpdateProduct: (id, product) => request(`/admin/products/${id}`, { method: "PUT", body: product, auth: true }).then(unwrap),
  adminDeleteProduct: (id) => request(`/admin/products/${id}`, { method: "DELETE", auth: true }),
  adminGetProducts: () => request("/catalog/products?pageSize=100", { auth: true }).then((res) => {
    const d = unwrap(res);
    return d.products || d || [];
  }),
  adminApproveReview: (id) => request(`/admin/reviews/${id}/approve`, { method: "PUT", auth: true }),
  adminRejectReview: (id) => request(`/admin/reviews/${id}/reject`, { method: "PUT", auth: true }),
  adminDeleteReview: (id) => request(`/admin/reviews/${id}`, { method: "DELETE", auth: true }),
  adminUpdateOrderStatus: (id, status, note) => request(`/admin/orders/${id}/status`, { method: "PUT", body: { status, note }, auth: true }),
  adminBanUser: (id, banned) => request(`/admin/users/${id}/ban`, { method: "PUT", body: { banned }, auth: true }),
  uploadImage: (file) => uploadRequest("/v1/upload", file).then(unwrap),
  getPaymentMethods: () => request("/v1/payments/methods").then(unwrap),
  initiatePayment: (orderId, method) => request("/v1/payments/initiate", { method: "POST", body: { orderId, method }, auth: true }).then(unwrap),
  confirmStripePayment: (paymentIntentId) => request("/v1/payments/stripe/confirm", { method: "POST", body: { paymentIntentId }, auth: true }).then(unwrap)
};
