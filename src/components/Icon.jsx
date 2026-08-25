export default function Icon({ name }) {
  const common = {
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
    focusable: "false"
  };

  const paths = {
    search: <><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.2-3.2"></path></>,
    user: <><path d="M20 21a8 8 0 0 0-16 0"></path><circle cx="12" cy="7" r="4"></circle></>,
    cart: <><path d="M6 6h15l-1.5 9h-12z"></path><path d="M6 6 5 2H2"></path><circle cx="9" cy="20" r="1"></circle><circle cx="18" cy="20" r="1"></circle></>,
    menu: <><path d="M4 7h16"></path><path d="M4 12h16"></path><path d="M4 17h16"></path></>,
    close: <><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></>,
    arrowLeft: <><path d="m15 18-6-6 6-6"></path></>,
    arrowRight: <><path d="m9 18 6-6-6-6"></path></>,
    chevronDown: <><path d="m6 9 6 6 6-6"></path></>,
    earbuds: <><path d="M7 11v4a3 3 0 0 1-3 3"></path><path d="M7 11a3 3 0 1 0-3-3v7"></path><path d="M17 11v4a3 3 0 0 0 3 3"></path><path d="M17 11a3 3 0 1 1 3-3v7"></path></>,
    headphones: <><path d="M4 14v-2a8 8 0 0 1 16 0v2"></path><path d="M4 14h3v6H4z"></path><path d="M17 14h3v6h-3z"></path></>,
    speaker: <><rect x="5" y="3" width="14" height="18" rx="2"></rect><circle cx="12" cy="15" r="3"></circle><circle cx="12" cy="8" r="1"></circle></>,
    battery: <><rect x="3" y="7" width="16" height="10" rx="2"></rect><path d="M21 11v2"></path><path d="M7 11h5"></path></>,
    charger: <><path d="M7 2v6"></path><path d="M17 2v6"></path><path d="M6 8h12v3a6 6 0 0 1-6 6v5"></path></>,
    watch: <><circle cx="12" cy="12" r="5"></circle><path d="M9 2h6l1 5H8z"></path><path d="M8 17h8l-1 5H9z"></path></>,
    phone: <><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6.4 6.4l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6A2 2 0 0 1 22 16.9z"></path></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="m3 7 9 6 9-6"></path></>,
    whatsapp: <><path d="M20.5 11.7a8.5 8.5 0 0 1-12.6 7.4L4 20l1-3.8a8.5 8.5 0 1 1 15.5-4.5z"></path><path d="M9.5 8.7c.2-.5.4-.5.7-.5h.5c.2 0 .4.1.5.4l.7 1.6c.1.3.1.4-.1.6l-.4.5c-.1.2-.2.3-.1.5.4.7.8 1.2 1.4 1.7.6.5 1.2.8 1.8 1 .2.1.4 0 .5-.1l.7-.8c.2-.2.4-.2.6-.1l1.6.8c.3.1.4.3.4.5 0 .4-.2 1.2-.8 1.6-.5.4-1.4.4-2.3.1-2.3-.7-4.1-2.2-5.5-4.3-.7-1.1-1.1-2.2-.7-3.5z"></path></>,
    filter: <><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"></path></>,
    grid: <><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect></>,
    laptop: <><path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9"></path><path d="M2 16h20l-1.5 3H3.5z"></path></>,
    smartphone: <><rect x="5" y="2" width="14" height="20" rx="2"></rect><path d="M12 18h.01"></path></>,
    gamepad: <><path d="M6 12h4"></path><path d="M8 10v4"></path><path d="M15 13h.01"></path><path d="M18 11h.01"></path><rect x="2" y="6" width="20" height="12" rx="2"></rect></>,
    camera: <><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></>,
    tv: <><rect x="2" y="7" width="20" height="15" rx="2"></rect><path d="M17 2 12 7 7 2"></path></>,
    briefcase: <><rect x="2" y="7" width="20" height="14" rx="2"></rect><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"></path></>,
    box: <><path d="M21 8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><path d="m3.3 7 8.7 5 8.7-5"></path><path d="M12 22V12"></path></>
  };

  return (
    <svg className="icon" {...common}>
      {paths[name] || paths.grid}
    </svg>
  );
}
