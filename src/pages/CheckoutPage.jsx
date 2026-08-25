import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { api } from "../api/client.js";
import { useCatalog } from "../context/CatalogContext.jsx";
import { formatMoney, getCartTotals, validateForm } from "../utils/helpers.jsx";
import { OrderSummary } from "./CartPage.jsx";

// Load Stripe - publishable key comes from the API
let stripePromise = null;

function getStripePromise(publishableKey) {
  if (!stripePromise && publishableKey) {
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
}

function Field({ label, name, type = "text", error, autoComplete, wide = false }) {
  return (
    <label className={`field${wide ? " field-wide" : ""}${error ? " has-error" : ""}`}>
      <span>{label}</span>
      <input type={type} name={name} autoComplete={autoComplete} />
      <small>{error}</small>
    </label>
  );
}

function StripeCardForm({ clientSecret, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [cardError, setCardError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setCardError("");

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: elements.getElement(CardElement) }
    });

    if (error) {
      setCardError(error.message);
      setProcessing(false);
      onError?.(error.message);
    } else if (paymentIntent.status === "succeeded") {
      // Confirm with backend
      try {
        await api.confirmStripePayment(paymentIntent.id);
      } catch {
        // Non-critical — webhook will handle it
      }
      setProcessing(false);
      onSuccess?.();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ padding: "14px", border: "1px solid var(--ronin-line)", borderRadius: "12px", background: "#fff", marginBottom: "14px" }}>
        <CardElement options={{
          style: {
            base: {
              fontSize: "16px",
              color: "#282626",
              "::placeholder": { color: "#999" }
            },
            invalid: { color: "#ef5b5b" }
          }
        }} />
      </div>
      {cardError && <p style={{ color: "#ef5b5b", fontSize: "0.85rem", marginBottom: "12px" }}>{cardError}</p>}
      <button className="btn btn-primary btn-full" type="submit" disabled={!stripe || processing}>
        {processing ? "Processing payment..." : "Pay Now"}
      </button>
      <p style={{ color: "var(--ronin-muted)", fontSize: "0.78rem", marginTop: "8px", textAlign: "center" }}>
        Test card: 4242 4242 4242 4242 | Any future date | Any CVC
      </p>
    </form>
  );
}

export default function CheckoutPage({ cart, clearCart, navigate, setToast }) {
  const { products } = useCatalog();
  const totals = getCartTotals(cart, products);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("Cash on Delivery");
  const [stripeKey, setStripeKey] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Fetch payment methods to get Stripe publishable key
  useEffect(() => {
    api.getPaymentMethods().then((data) => {
      if (data?.stripePublishableKey) {
        setStripeKey(data.stripePublishableKey);
      }
    }).catch(() => {});
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const nextErrors = validateForm(form, ["name", "phone", "email", "address", "city", "postal"]);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) return;
    if (!totals.items.length) {
      setMessage("Add at least one item before placing an order.");
      return;
    }

    setMessage("Placing order...");
    try {
      const order = await api.createOrder({
        customer: {
          name: form.elements.name.value.trim(),
          phone: form.elements.phone.value.trim(),
          email: form.elements.email.value.trim(),
          address: form.elements.address.value.trim(),
          city: form.elements.city.value.trim(),
          postal: form.elements.postal.value.trim()
        },
        paymentMethod: selectedPayment,
        items: cart
      });

      setOrderId(order.id);
      setOrderPlaced(true);

      // If card payment, initiate Stripe
      if (selectedPayment === "Credit/Debit Card" && stripeKey) {
        setMessage("Initializing card payment...");
        const paymentData = await api.initiatePayment(order.id, "card");
        if (paymentData?.clientSecret) {
          setClientSecret(paymentData.clientSecret);
          setMessage("Enter your card details below.");
        } else {
          setMessage("Card payment setup failed. Please try another method.");
        }
      } else {
        // COD or bank transfer — order is done
        clearCart();
        setMessage(`Order ${order.orderNumber} placed successfully!`);
        setToast("Order placed successfully.");
      }
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handlePaymentSuccess = () => {
    clearCart();
    setClientSecret(null);
    setMessage("Payment successful! Your order is being processed.");
    setToast("Payment confirmed. Order is being processed.");
  };

  const handlePaymentError = (errorMsg) => {
    setMessage(`Payment failed: ${errorMsg}. You can try again or choose a different payment method.`);
  };

  // Show Stripe card form if waiting for card payment
  if (clientSecret && stripeKey) {
    return (
      <main className="page-shell">
        <section className="page-heading container">
          <p className="eyebrow">Payment</p>
          <h1>Complete Card Payment</h1>
          <p>Enter your card details to complete the order. Total: {formatMoney(totals.total)}</p>
        </section>
        <section className="checkout-layout container">
          <div className="form-panel">
            <h2>Card Details</h2>
            <Elements stripe={getStripePromise(stripeKey)} options={{ clientSecret }}>
              <StripeCardForm clientSecret={clientSecret} onSuccess={handlePaymentSuccess} onError={handlePaymentError} />
            </Elements>
            <p className="form-message" role="status">{message}</p>
          </div>
          <OrderSummary totals={totals} action={null} />
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="page-heading container">
        <p className="eyebrow">Final step</p>
        <h1>Checkout</h1>
        <p>Add shipping details and choose a payment method.</p>
      </section>

      <section className="checkout-layout container">
        <form className="form-panel" onSubmit={submit} noValidate>
          <h2>Shipping Address</h2>
          <div className="form-grid">
            <Field label="Full name" name="name" error={errors.name} autoComplete="name" />
            <Field label="Phone" name="phone" type="tel" error={errors.phone} autoComplete="tel" />
            <Field label="Email" name="email" type="email" error={errors.email} autoComplete="email" wide />
            <Field label="Street address" name="address" error={errors.address} autoComplete="street-address" wide />
            <Field label="City" name="city" error={errors.city} autoComplete="address-level2" />
            <Field label="Postal code" name="postal" error={errors.postal} autoComplete="postal-code" />
          </div>

          <h2>Payment Method</h2>
          <div className="payment-options">
            {[
              ["Cash on Delivery", "Pay when the order arrives."],
              ["Bank Transfer", "Transfer details shown after order placement."],
              ...(stripeKey ? [["Credit/Debit Card", "Pay securely with Visa, Mastercard, or other cards."]] : [])
            ].map(([name, copy], index) => (
              <label className="payment-card" key={name}>
                <input
                  type="radio"
                  name="payment"
                  value={name}
                  checked={selectedPayment === name}
                  onChange={() => setSelectedPayment(name)}
                />
                <span><strong>{name}</strong><small>{copy}</small></span>
              </label>
            ))}
          </div>

          <button className="btn btn-primary btn-full" type="submit">
            {selectedPayment === "Credit/Debit Card" ? "Continue to Payment" : "Place Order"}
          </button>
          <p className="form-message" role="status">{message}</p>
        </form>

        <OrderSummary totals={totals} action={<button className="btn btn-secondary btn-full" type="button" onClick={() => navigate("/cart")}>Edit Cart</button>} />
      </section>
    </main>
  );
}
