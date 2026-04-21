type Props = { size?: number };

export function IllPassport({ size = 120 }: Props) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} style={{ display: "block" }}>
      <rect x="20" y="14" width="80" height="100" rx="4" fill="var(--color-dtg-red)" />
      <rect x="20" y="14" width="80" height="100" rx="4" fill="none" stroke="var(--color-dtg-ink)" strokeWidth="2" />
      <circle cx="60" cy="54" r="14" fill="none" stroke="#fff" strokeWidth="2" />
      <path d="M46 54 H74 M60 40 V68 M48 45 Q60 50 72 45 M48 63 Q60 58 72 63" stroke="#fff" strokeWidth="1" fill="none" />
      <rect x="34" y="80" width="52" height="2" fill="#fff" opacity="0.7" />
      <rect x="34" y="88" width="36" height="2" fill="#fff" opacity="0.7" />
      <rect x="34" y="96" width="44" height="2" fill="#fff" opacity="0.7" />
      <text x="60" y="28" fontSize="6" fill="#fff" textAnchor="middle" fontWeight="700" letterSpacing="2">REPUBLIK INDONESIA</text>
    </svg>
  );
}
