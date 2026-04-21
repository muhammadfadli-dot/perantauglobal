type Props = {
  size?: number;
  routeCode?: string;
  routeLabel?: string;
  gate?: string;
  seat?: string;
};

export function IllTicket({
  size = 140,
  routeCode = "CGK → RUH",
  routeLabel = "JAKARTA · RIYADH",
  gate = "B7",
  seat = "SEAT 12A",
}: Props) {
  return (
    <svg viewBox="0 0 200 90" width={size} height={(size * 90) / 200} style={{ display: "block" }}>
      <path d="M4 8 H150 V72 H4 Z" fill="var(--color-dtg-cream)" stroke="var(--color-dtg-ink)" strokeWidth="2" />
      <path d="M160 8 H196 V72 H160 Z" fill="var(--color-dtg-cream)" stroke="var(--color-dtg-ink)" strokeWidth="2" />
      <path d="M155 10 V70" stroke="var(--color-dtg-ink)" strokeWidth="1" strokeDasharray="3 3" />
      <text x="14" y="22" fontSize="6" fill="var(--color-dtg-ink)" fontWeight="700" letterSpacing="1.5">BOARDING PASS</text>
      <text x="14" y="48" fontSize="18" fill="var(--color-dtg-red)" fontWeight="800" letterSpacing="2">{routeCode}</text>
      <text x="14" y="62" fontSize="5" fill="var(--color-dtg-ink)" fontWeight="500" letterSpacing="1.2">{routeLabel}</text>
      <text x="178" y="26" fontSize="6" fill="var(--color-dtg-ink)" fontWeight="700" textAnchor="middle" letterSpacing="1">GATE</text>
      <text x="178" y="44" fontSize="16" fill="var(--color-dtg-red)" fontWeight="800" textAnchor="middle">{gate}</text>
      <text x="178" y="60" fontSize="6" fill="var(--color-dtg-ink)" fontWeight="500" textAnchor="middle">{seat}</text>
    </svg>
  );
}
