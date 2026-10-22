type Market = "gcc" | "europe" | "japan";

const MARKET_CONTACT = {
  gcc: {
    label: "SAUDI ARABIA & GCC",
    title: "Start your Saudi Arabia & GCC workforce conversation.",
    description: "To prepare the next discussion, share the occupation, sector, number of roles, target start date, and current visa-slot status if known. Our team will then confirm the relevant route and responsibilities.",
    message: "Hello Daya Talenta Global, I would like to discuss a Saudi Arabia & GCC workforce requirement.\n\nOccupation / role:\nSector:\nNumber of hires:\nTarget start date:\nCurrent visa-slot status (if known):",
  },
  europe: {
    label: "EUROPE",
    title: "Start your Europe workforce conversation.",
    description: "Tell us the role, sector, and timing. Our team will guide the next discussion around your Europe workforce requirement.",
    message: "Hello Daya Talenta Global, I would like to discuss an Indonesian talent requirement for Europe.",
  },
  japan: {
    label: "JAPAN",
    title: "Start your Japan workforce conversation.",
    description: "Tell us the role, sector, and timing. Our team will guide the next discussion around your Japan workforce requirement.",
    message: "Hello Daya Talenta Global, I would like to discuss an Indonesian talent requirement for Japan.",
  },
} as const;

export function MarketContact({ market = "gcc" }: { market?: Market }) {
  const content = MARKET_CONTACT[market];
  const href = `https://wa.me/6285110555561?text=${encodeURIComponent(content.message)}`;

  return <section id="contact" className="market-contact">
    <p>{content.label} · EMPLOYER CONVERSATION</p>
    <h2>{content.title}</h2>
    <span>{content.description}</span>
    <a href={href} target="_blank" rel="noreferrer">WhatsApp 0851 1055 5561</a>
  </section>;
}
