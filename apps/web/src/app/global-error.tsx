"use client";

/**
 * Last-resort boundary: fires when the root layout itself throws, which is the
 * one case a route-level error.tsx cannot catch.
 *
 * It replaces the root layout, so globals.css is NOT loaded here and Tailwind
 * classes would render unstyled. Everything below is inline-styled on purpose —
 * a fallback that depends on the thing that just failed is not a fallback.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          textAlign: "center",
          background: "#fff",
          color: "#141414",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            display: "grid",
            placeItems: "center",
            background: "#d7262f",
            color: "#fff",
            fontWeight: 800,
            fontSize: 22,
            marginBottom: 20,
          }}
        >
          P
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>
          Situs sedang bermasalah
        </h1>
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.6,
            color: "#6b6b6b",
            maxWidth: 440,
            marginTop: 8,
          }}
        >
          Kami lagi benerin. Coba muat ulang halaman ini sebentar lagi.
        </p>
        {error.digest && (
          <p style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, color: "#9b9b9b" }}>
            ref: {error.digest}
          </p>
        )}
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: 28,
            minHeight: 48,
            padding: "0 24px",
            borderRadius: 12,
            border: "none",
            background: "#d7262f",
            color: "#fff",
            fontWeight: 700,
            fontSize: 15,
            cursor: "pointer",
          }}
        >
          Coba lagi
        </button>
      </body>
    </html>
  );
}
