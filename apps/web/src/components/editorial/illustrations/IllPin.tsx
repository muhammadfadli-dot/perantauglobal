type Props = { size?: number };

export function IllPin({ size = 120 }: Props) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} style={{ display: "block" }}>
      <path
        d="M60 18 C42 18 30 32 30 48 C30 68 60 102 60 102 C60 102 90 68 90 48 C90 32 78 18 60 18 Z"
        fill="var(--color-dtg-red)"
        stroke="var(--color-dtg-ink)"
        strokeWidth="2"
      />
      <circle cx="60" cy="48" r="12" fill="var(--color-dtg-cream)" />
    </svg>
  );
}
