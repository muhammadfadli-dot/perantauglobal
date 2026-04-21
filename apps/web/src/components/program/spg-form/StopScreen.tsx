"use client";

import type { StopReason } from "./types";
import {
  Accent,
  DisplayHeadline,
  EditorialButton,
  IllStamp,
} from "@/components/editorial";

interface StopScreenProps {
  reason: StopReason;
  t: (key: string) => string;
}

export default function StopScreen({ reason, t }: StopScreenProps) {
  return (
    <div className="py-4 text-center">
      <div className="flex justify-center">
        <IllStamp size={140} label="NEXT TIME" />
      </div>
      <DisplayHeadline size="sidebar" className="mt-8">
        {t(`stop.${reason}.title`)
          .split(" ")
          .slice(0, 2)
          .join(" ")}{" "}
        <Accent>
          {t(`stop.${reason}.title`)
            .split(" ")
            .slice(2)
            .join(" ") || "\u00A0"}
        </Accent>
      </DisplayHeadline>
      <p className="mx-auto mt-6 max-w-[40ch] text-[15px] leading-[1.55] opacity-80">
        {t(`stop.${reason}.message`)}
      </p>

      <div className="mt-8 flex flex-col items-center gap-3">
        <EditorialButton
          type="button"
          variant="outline"
          suffix="↗"
          onClick={() => {
            const url = window.location.href;
            if (navigator.share) {
              navigator.share({ title: "Sahabat Perantau Global", url });
            } else {
              navigator.clipboard.writeText(url);
            }
          }}
        >
          {t("stop.shareButton")}
        </EditorialButton>
        <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.1em] opacity-60">
          {t("stop.shareHint")}
        </p>
      </div>
    </div>
  );
}
