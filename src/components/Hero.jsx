import { useEffect, useState } from "react";
import Icon from "./Icon.jsx";

const slides = [
  {
    image: "https://placehold.co/1600x720/10151c/39d0aa?text=Desk+Power+Essentials",
    alt: "Desk setup with cables, hubs, and chargers",
    eyebrow: "New collection",
    title: "Sharper gear for cleaner setups.",
    copy: "Shop fast charging, smart hubs, audio, gaming, and mobile accessories built for everyday tech routines.",
    primary: ["Shop Products", "/products"],
    secondary: ["Browse Laptop Gear", "/products?category=computer-laptop-accessories"]
  },
  {
    image: "https://placehold.co/1600x720/121923/ffb84d?text=Audio+Launch+Deals",
    alt: "Wireless earbuds and headphones on a dark background",
    eyebrow: "Audio deals",
    title: "Wireless sound without the clutter.",
    copy: "Discover earbuds, headphones, speakers, and hands-free kits with launch offers and quick cart checkout.",
    primary: ["Shop Audio", "/products?category=audio"],
    secondary: ["Read Reviews", "/reviews"]
  },
  {
    image: "https://placehold.co/1600x720/0f141a/72a7ff?text=Mobile+Charging+Station",
    alt: "Mobile chargers, power banks, and cables",
    eyebrow: "Fast power",
    title: "Charge every device from one shelf.",
    copy: "Power banks, wall chargers, car chargers, wireless pads, and durable cables for travel and desk use.",
    primary: ["Shop Mobile", "/products?category=mobile-accessories"],
    secondary: ["About VoltXpress", "/about"]
  }
];

export default function Hero({ navigate }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return undefined;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % slides.length), 5200);
    return () => window.clearInterval(timer);
  }, [paused]);

  const moveSlide = (direction) => {
    setActive((current) => (current + direction + slides.length) % slides.length);
    setPaused(true);
  };

  return (
    <section className="hero" aria-label="Featured store offers" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={() => setPaused(false)}>
      <div className="hero-slider">
        {slides.map((slide, index) => (
          <article className={`hero-slide${index === active ? " is-active" : ""}`} key={slide.title}>
            <img src={slide.image} alt={slide.alt} />
            <div className="hero-overlay"></div>
            <div className="hero-content container">
              <p className="eyebrow">{slide.eyebrow}</p>
              <h1>{slide.title}</h1>
              <p>{slide.copy}</p>
              <div className="hero-actions">
                <button className="btn btn-primary" type="button" onClick={() => navigate(slide.primary[1])}>{slide.primary[0]}</button>
                <button className="btn btn-ghost" type="button" onClick={() => navigate(slide.secondary[1])}>{slide.secondary[0]}</button>
              </div>
            </div>
          </article>
        ))}
        <button className="hero-arrow hero-arrow-left button-link" type="button" onClick={() => moveSlide(-1)} aria-label="Previous hero slide">
          <Icon name="arrowLeft" />
        </button>
        <button className="hero-arrow hero-arrow-right button-link" type="button" onClick={() => moveSlide(1)} aria-label="Next hero slide">
          <Icon name="arrowRight" />
        </button>
        <div className="hero-dots" aria-label="Hero slider controls">
          {slides.map((slide, index) => (
            <button className={`hero-dot${index === active ? " is-active" : ""}`} type="button" key={slide.title} onClick={() => { setActive(index); setPaused(true); }} aria-label={`Show slide ${index + 1}`}></button>
          ))}
        </div>
      </div>
    </section>
  );
}
