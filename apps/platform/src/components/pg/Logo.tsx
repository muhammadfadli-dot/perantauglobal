// Perantau Global paper-plane mark. Inlined as React component so we can
// color it via currentColor (white inside a red badge, red on light bg, etc.)
// and avoid HTTP requests for what is essentially a single SVG path.
//
// Source-of-truth file lives at apps/web/public/images/logos/logo-icon.svg
// and the same SVG is duplicated to apps/platform/public/images/logos for
// any caller that wants the full red-gradient file via <Image>.

export function LogoMark({
  size = 24,
  className,
  style,
}: {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 250 250"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path d="m240.1 35.7c-1.78-1.51-3.83-1.52-5.97-0.59l-223 82.46c-2.34 0.92-3.46 2.74-3.3 5.27 0.15 2.52 1.53 3.8 3.82 4.67l62.75 22.11 10.78 60.19c0.4 2.34 1.97 4.31 4.61 4.34 1.5 0.02 2.8-0.54 3.9-1.63l39.37-33.16 43.75 25.82c2.54 1.5 6.04 0.37 7.15-2.57l57.29-160.7c1.01-2.59 0.91-4.43-1.12-6.18zm-211.8 85.82 169.6-62.8-118.9 81.12-50.65-18.32zm77.79 36.44-13.78 32.87-7.25-42.55 102.7-69.78-81.7 79.46zm-2.38 33.27 8.85-23.31 10.83 6.47-19.68 16.84zm72.25 2.17-57.31-33.49 106.1-101.5-48.8 135z" />
    </svg>
  );
}
