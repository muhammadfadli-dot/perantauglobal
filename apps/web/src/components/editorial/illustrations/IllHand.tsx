type Props = { size?: number };

export function IllHand({ size = 120 }: Props) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} style={{ display: "block" }}>
      <rect x="0" y="0" width="120" height="120" fill="var(--color-dtg-cream)" />
      <circle cx="40" cy="50" r="20" fill="var(--color-dtg-red)" />
      <circle cx="80" cy="50" r="20" fill="var(--color-dtg-ink)" />
      <rect x="30" y="70" width="20" height="30" fill="var(--color-dtg-red)" />
      <rect x="70" y="70" width="20" height="30" fill="var(--color-dtg-ink)" />
      <path d="M50 82 L70 82" stroke="var(--color-dtg-cream)" strokeWidth="8" strokeLinecap="round" />
    </svg>
  );
}
