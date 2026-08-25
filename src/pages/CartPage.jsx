import { useCatalog } from "../context/CatalogContext.jsx";
import { formatMoney, resolveImage, getCategoryName, getCartTotals } from "../utils/helpers.jsx";

function OrderSummary({ totals, action }) {
  return (
    <aside className="summary-panel">
      <h2>Order Summary</h2>
      <div className="summary-row"><span>Subtotal</span><strong>{formatMoney(totals.subtotal)}</strong></div>
      <div className="summary-row"><span>Tax (5%)</span><strong>{formatMoney(totals.tax)}</strong></div>
      <div className="summary-row"><span>Delivery</span><strong>{totals.delivery === 0 ? "Free" : formatMoney(totals.delivery)}</strong></div>
      <div className="summary-row summary-total"><span>Total</span><strong>{formatMoney(totals.total)}</strong></div>
      {action}
    </aside>
  );
}

export default function CartPage({ cart, updateCartItem, navigate }) {
  const { categories, products } = useCatalog();
  const totals = getCartTotals(cart, products);

  return (
    <main className="page-shell">
      <section className="page-heading container">
        <p className="eyebrow">Your order</p>
        <h1>Cart</h1>
        <p>Adjust quantities, remove items, and continue to checkout when everything looks right.</p>
      </section>
      <section className="cart-layout container">
        <div className="cart-list">
          {totals.items.length ? totals.items.map((item) => (
            <article className="cart-item" key={item.id}>
              <img src={resolveImage(item.image)} alt={item.name} />
              <div className="cart-info">
                <h3>{item.name}</h3>
                <p>{getCategoryName(item.category, categories)} / {item.subcategory}</p>
                <strong>{formatMoney(item.price)}</strong>
                <div className="cart-controls">
                  <div className="quantity-control" aria-label={`Quantity for ${item.name}`}>
                    <button type="button" onClick={() => updateCartItem(item.id, "decrease")}>-</button>
                    <span>{item.quantity}</span>
                    <button type="button" onClick={() => updateCartItem(item.id, "increase")}>+</button>
                  </div>
                  <button className="btn btn-danger" type="button" onClick={() => updateCartItem(item.id, "remove")}>Remove</button>
                </div>
              </div>
            </article>
          )) : (
            <div className="empty-state">
              <h2>Your cart is empty</h2>
              <p>Add accessories from the product catalog and they will appear here.</p>
              <button className="btn btn-primary" type="button" onClick={() => navigate("/products")}>Start Shopping</button>
            </div>
          )}
        </div>
        <OrderSummary totals={totals} action={<button className="btn btn-primary btn-full" type="button" onClick={() => navigate("/checkout")}>Proceed to Checkout</button>} />
      </section>
    </main>
  );
}

export { OrderSummary };
