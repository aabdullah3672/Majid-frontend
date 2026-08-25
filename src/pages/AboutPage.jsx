import { useState } from "react";
import { api } from "../api/client.js";
import { validateForm } from "../utils/helpers.jsx";

function Field({ label, name, type = "text", error, autoComplete, wide = false }) {
  return (
    <label className={`field${wide ? " field-wide" : ""}${error ? " has-error" : ""}`}>
      <span>{label}</span>
      <input type={type} name={name} autoComplete={autoComplete} />
      <small>{error}</small>
    </label>
  );
}

function ValueCard({ title, copy }) {
  return <article><h3>{title}</h3><p>{copy}</p></article>;
}

function TeamCard({ image, title, copy }) {
  return <article className="team-card"><img src={image} alt={`${title} placeholder`} /><h3>{title}</h3><p>{copy}</p></article>;
}

export default function AboutPage() {
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const nextErrors = validateForm(form, ["name", "email", "message"]);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setMessage("Sending message...");
    try {
      await api.sendContact({
        name: form.elements.name.value.trim(),
        email: form.elements.email.value.trim(),
        message: form.elements.message.value.trim()
      });
      form.reset();
      setMessage("Message sent successfully.");
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <main className="page-shell">
      <section className="about-hero">
        <img src="https://placehold.co/1600x620/111827/39d0aa?text=VoltXpress+Tech+Accessories" alt="VoltXpress electronics accessories display" />
        <div className="hero-overlay"></div>
        <div className="container about-hero-content">
          <p className="eyebrow">About us</p>
          <h1>Accessories that keep modern devices useful, organized, and ready.</h1>
        </div>
      </section>

      <section className="section container story-grid">
        <div>
          <p className="eyebrow">Brand story</p>
          <h2>Built around practical tech habits.</h2>
        </div>
        <p>VoltXpress is a concept electronics accessories store focused on clean desk setups, dependable charging, smart audio, and useful mobile gear. The storefront is designed to make category browsing fast while keeping the buying flow simple across mobile and desktop.</p>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">Mission and values</p>
            <h2>What guides the store</h2>
          </div>
          <div className="value-grid">
            <ValueCard title="Clarity" copy="Products are grouped by the way people actually shop for accessories." />
            <ValueCard title="Reliability" copy="Every interface choice supports a straightforward browse, cart, and checkout flow." />
            <ValueCard title="Speed" copy="Mobile-first layouts keep key actions close without crowding the screen." />
          </div>
        </div>
      </section>

      <section className="section container">
        <div className="section-heading">
          <p className="eyebrow">Team</p>
          <h2>People behind the counter</h2>
        </div>
        <div className="team-grid">
          <TeamCard image="https://placehold.co/360x360/17202b/f4f7fb?text=Store+Lead" title="Store Lead" copy="Operations and customer experience." />
          <TeamCard image="https://placehold.co/360x360/17202b/f4f7fb?text=Product+Buyer" title="Product Buyer" copy="Accessory selection and catalog planning." />
          <TeamCard image="https://placehold.co/360x360/17202b/f4f7fb?text=Support" title="Support Specialist" copy="Help, replacements, and product guidance." />
        </div>
      </section>

      <section className="section section-alt">
        <div className="container contact-grid">
          <div>
            <p className="eyebrow">Contact</p>
            <h2>Talk to us</h2>
            <p>Email support@voltxpress.test or call +92 300 0000000 for storefront questions.</p>
          </div>
          <form className="form-panel" onSubmit={submit} noValidate>
            <Field label="Name" name="name" error={errors.name} />
            <Field label="Email" name="email" type="email" error={errors.email} />
            <label className={`field${errors.message ? " has-error" : ""}`}>
              <span>Message</span>
              <textarea name="message" rows="4"></textarea>
              <small>{errors.message}</small>
            </label>
            <button className="btn btn-primary btn-full" type="submit">Send Message</button>
            <p className="form-message" role="status">{message}</p>
          </form>
        </div>
      </section>
    </main>
  );
}
