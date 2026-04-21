"use client";

import type { ScoreStatus } from "./types";
import {
  Accent,
  DisplayHeadline,
  EditorialButton,
  IllStamp,
} from "@/components/editorial";

interface SuccessScreenProps {
  status: ScoreStatus;
  t: (key: string) => string;
}

export default function SuccessScreen({ status, t }: SuccessScreenProps) {
  const isRed = status === "red";
  const stampLabel = isRed ? "WAITLIST" : status === "green" ? "APPROVED" : "RECEIVED";

  return (
    <div className="py-4 text-center">
      <div className="flex justify-center">
        <IllStamp size={160} label={stampLabel} />
      </div>
      <DisplayHeadline size="sidebar" className="mt-8">
        {t(`result.${status}.title`)
          .split(" ")
          .slice(0, -1)
          .join(" ")}{" "}
        <Accent>{t(`result.${status}.title`).split(" ").slice(-1).join(" ")}</Accent>
      </DisplayHeadline>
      <p className="mx-auto mt-6 max-w-[42ch] text-[15px] leading-[1.55] opacity-80">
        {t(`result.${status}.message`)}
      </p>

      <div className="mt-8 flex justify-center">
        {isRed ? (
          <EditorialButton
            href="https://instagram.com/perantauglobal"
            variant="outline"
            suffix="↗"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("result.red.followUs")}
          </EditorialButton>
        ) : (
          <EditorialButton
            href="https://wa.me/6285211415104"
            variant="ink"
            suffix="→"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t(`result.${status}.whatsappButton`)}
          </EditorialButton>
        )}
      </div>
    </div>
  );
}
