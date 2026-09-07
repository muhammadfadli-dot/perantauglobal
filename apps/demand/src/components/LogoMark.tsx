import Image from "next/image";

/** Official DTG icon used in the GCC navigation, footer, and legal shell. */
export function LogoMark({ size = 34, className }: { size?: number; className?: string }) {
  return (
    <Image
      src="/images/icon-dtg.webp"
      alt=""
      width={size}
      height={size}
      className={className}
      aria-hidden
      style={{ display: "block", flex: "none", width: size, height: size, objectFit: "contain" }}
    />
  );
}
