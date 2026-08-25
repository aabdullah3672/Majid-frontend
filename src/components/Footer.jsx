import Icon from "./Icon.jsx";
import { Brand } from "./Header.jsx";

function FooterColumn({ title, links, navigate }) {
  return (
    <div>
      <h3>{title}</h3>
      <div className="footer-links">
        {links.map(([label, to]) => (
          <button className="button-link" key={to} type="button" onClick={() => navigate(to)}>{label}</button>
        ))}
      </div>
    </div>
  );
}

export default function Footer({ navigate }) {
  const footerGroups = [
    {
      title: "Shop",
      links: [
        ["Laptop Accessories", "/products?category=computer-laptop-accessories"],
        ["Mobile Accessories", "/products?category=mobile-accessories"],
        ["Audio", "/products?category=audio"],
        ["Smart Watches", "/products?category=smart-watches"]
      ]
    },
    {
      title: "Company",
      links: [
        ["About Us", "/about"],
        ["Reviews", "/reviews"],
        ["New Arrivals", "/products?sort=newest"],
        ["Admin", "/admin"]
      ]
    },
    {
      title: "Care",
      links: [
        ["Track Order", "/cart"],
        ["Checkout", "/checkout"],
        ["Contact", "/about"],
        ["Login", "/auth"]
      ]
    }
  ];

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <Brand navigate={navigate} />
            <p>Practical electronics accessories for cleaner desks, faster charging, everyday audio, and mobile workflows.</p>
            <div className="socials" aria-label="Social links">
              {["Facebook", "Instagram", "YouTube", "LinkedIn"].map((label) => (
                <a href="https://example.com" aria-label={label} key={label}>{label.slice(0, 2)}</a>
              ))}
            </div>
          </div>
          <div className="footer-help">
            <h3>We're here to help</h3>
            <a href="tel:+923000000000"><Icon name="phone" />+92 300 0000000</a>
            <a href="mailto:support@voltxpress.test"><Icon name="mail" />support@voltxpress.test</a>
          </div>
          <form className="newsletter-form" onSubmit={(event) => event.preventDefault()}>
            <h3>Newsletter</h3>
            <p>Launch offers, setup ideas, and new accessory drops.</p>
            <label>
              <span className="is-hidden">Email address</span>
              <input type="email" placeholder="Email address" />
              <button type="submit" aria-label="Subscribe"><Icon name="arrowRight" /></button>
            </label>
          </form>
        </div>
        <div className="footer-grid">
          {footerGroups.map((group) => <FooterColumn title={group.title} links={group.links} navigate={navigate} key={group.title} />)}
        </div>
        <div className="payment-row" aria-label="Supported payment methods">
          {["Cash on Delivery", "Bank Transfer", "Visa", "Mastercard", "JazzCash", "Easypaisa"].map((method) => <span key={method}>{method}</span>)}
        </div>
        <div className="footer-bottom">Copyright 2026 VoltXpress. All rights reserved.</div>
      </div>
    </footer>
  );
}
