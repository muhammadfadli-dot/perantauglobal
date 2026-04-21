type Props = { size?: number };

export function IllPlane({ size = 120 }: Props) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} style={{ display: "block" }}>
      <circle cx="60" cy="60" r="50" fill="var(--color-dtg-cream)" stroke="var(--color-dtg-ink)" strokeWidth="2" />
      <path
        d="M25 65 L55 50 L65 30 L75 35 L72 55 L95 65 L95 72 L70 70 L60 90 L52 88 L55 72 L30 72 Z"
        fill="var(--color-dtg-red)"
        stroke="var(--color-dtg-ink)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M20 90 Q50 80 100 92" stroke="var(--color-dtg-ink)" strokeWidth="1.5" fill="none" strokeDasharray="3 3" />
    </svg>
  );
}
