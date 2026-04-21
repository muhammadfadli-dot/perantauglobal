import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { SectionTag } from "./SectionTag";

type Props = {
  number: string;
  label: string;
  headline: ReactNode;
  body?: ReactNode;
  callout?: ReactNode;
  tone?: "ink" | "cream";
  className?: string;
};

export function AsymmetricSectionHeader({ number, label, headline, body, callout, tone = "ink", className }: Props) {
  const hasRight = body || callout;
  return (
    <div
      className={cn(
        "grid gap-10 lg:grid-cols-2 lg:items-end lg:gap-20",
        className,
      )}
    >
      <div>
        <SectionTag number={number} label={label} tone={tone} />
        <div className="mt-4">{headline}</div>
      </div>
      {hasRight && (
        <div className="lg:text-right">
          {body && (
            <p className="max-w-[42ch] text-lg leading-[1.55] opacity-75 lg:ml-auto">
              {body}
            </p>
          )}
          {callout}
        </div>
      )}
    </div>
  );
}
