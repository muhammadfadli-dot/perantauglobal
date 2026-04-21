import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  as?: "h1" | "h2" | "h3";
  size?: "hero" | "section" | "sidebar" | "poster";
  children: ReactNode;
  className?: string;
};

const sizes = {
  hero: "text-[clamp(48px,8.5vw,112px)] leading-[1.02] tracking-[-0.04em]",
  section: "text-[clamp(40px,7vw,96px)] leading-[0.9] tracking-[-0.05em]",
  sidebar: "text-[clamp(36px,5.5vw,72px)] leading-[0.92] tracking-[-0.04em]",
  poster: "text-[clamp(56px,10vw,144px)] leading-[0.88] tracking-[-0.05em]",
};

export function DisplayHeadline({ as: Tag = "h2", size = "section", children, className }: Props) {
  return (
    <Tag className={cn("font-[family-name:var(--font-display)] font-extrabold text-balance", sizes[size], className)}>
      {children}
    </Tag>
  );
}

/** Inline italic-emphasis span: "tanpa potongan" → italic 500-weight. */
export function Italic({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("italic font-medium", className)}>{children}</span>;
}

/** Inline red-accent span. */
export function Accent({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("text-[var(--color-dtg-red)]", className)}>{children}</span>;
}
