/**
 * Daya Talenta Global logo mark: a paper plane inside a geometric ring
 * (a clean, scalable SVG take on the chosen emblem, gold on transparent).
 * Reads at every size from the 34px nav lockup down to a favicon.
 */
export function LogoMark({ size = 34, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      aria-hidden
      style={{ display: "block", flex: "none" }}
    >
      <circle cx="24" cy="24" r="22.2" fill="none" stroke="#B28A48" strokeWidth="1.5" />
      <circle cx="24" cy="24" r="18.4" fill="none" stroke="#B28A48" strokeWidth="1.1" strokeDasharray="0.5 2.7" strokeLinecap="round" />
      <g transform="translate(10 12) scale(1.06)">
        <path d="M21.8 3.1 3.4 10.2c-.7.27-.66 1.28.06 1.49l5.2 1.52 1.52 5.2c.2.72 1.22.76 1.49.06L21.9 3.1Z" fill="#C79A4B" />
        <path d="M21.8 3.1 9.8 13.2" fill="none" stroke="#20301F" strokeWidth="0.9" strokeLinecap="round" opacity="0.4" />
      </g>
    </svg>
  );
}
