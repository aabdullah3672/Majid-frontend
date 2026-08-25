# VoltXpress React Frontend

React JS storefront for an electronics accessories e-commerce demo.

## Run locally

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173`.

To connect the backend API, create `frontend/.env`:

```bash
VITE_API_BASE_URL=http://127.0.0.1:4000/api
```

Then run the backend from `../backend`:

```bash
npm install
npm run db:setup
npm run dev
```

## Build

```bash
npm run build
```

The catalog, checkout, auth, reviews, contact form, and admin summary can use the Express/MySQL API. Cart contents stay in `localStorage` until checkout creates an order.
