type Props = { size?: number; label?: string };

export function IllStamp({ size = 120, label = "APPROVED" }: Props) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} style={{ display: "block" }}>
      <g transform="rotate(-8 60 60)">
        <circle cx="60" cy="60" r="42" fill="none" stroke="var(--color-dtg-red)" strokeWidth="3" />
        <circle cx="60" cy="60" r="36" fill="none" stroke="var(--color-dtg-red)" strokeWidth="1" />
        <text x="60" y="50" fontSize="8" fill="var(--color-dtg-red)" textAnchor="middle" fontWeight="800" letterSpacing="2">P3MI</text>
        <text x="60" y="66" fontSize="14" fill="var(--color-dtg-red)" textAnchor="middle" fontWeight="800" letterSpacing="1">{label}</text>
        <text x="60" y="78" fontSize="6" fill="var(--color-dtg-red)" textAnchor="middle" fontWeight="700" letterSpacing="3">LICENSED</text>
        <path d="M30 60 H40 M80 60 H90" stroke="var(--color-dtg-red)" strokeWidth="2" />
      </g>
    </svg>
  );
}
