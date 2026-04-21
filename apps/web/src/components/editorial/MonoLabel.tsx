import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type Props = ComponentProps<"span"> & { size?: "xs" | "sm" | "md" };

const sizes = {
  xs: "text-[10px]",
  sm: "text-[11px]",
  md: "text-xs",
};

export function MonoLabel({ className, size = "sm", ...rest }: Props) {
  return (
    <span
      className={cn(
        "font-[family-name:var(--font-mono)] font-bold uppercase tracking-[0.14em] opacity-70",
        sizes[size],
        className,
      )}
      {...rest}
    />
  );
}
