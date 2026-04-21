type Props = { size?: number };

export function IllCompass({ size = 120 }: Props) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} style={{ display: "block" }}>
      <circle cx="60" cy="60" r="48" fill="var(--color-dtg-ink)" />
      <circle cx="60" cy="60" r="48" fill="none" stroke="var(--color-dtg-red)" strokeWidth="2" />
      <circle cx="60" cy="60" r="38" fill="none" stroke="#fff" strokeWidth="1" opacity="0.5" />
      <path d="M60 16 L65 60 L60 104 L55 60 Z" fill="var(--color-dtg-red)" />
      <path d="M60 16 L65 60 L55 60 Z" fill="var(--color-dtg-cream)" />
      <circle cx="60" cy="60" r="4" fill="#fff" />
      <text x="60" y="14" fontSize="6" fill="#fff" textAnchor="middle" fontWeight="700">N</text>
      <text x="60" y="114" fontSize="6" fill="#fff" textAnchor="middle" fontWeight="700">S</text>
    </svg>
  );
}
