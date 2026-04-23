"use client";

import Link from "next/link";
import { Icon } from "@/components/pg/Icon";

interface Props {
  positionSlug: string;
  hardPass: boolean;
}

export default function ApplyButton({ positionSlug, hardPass }: Props) {
  const baseClasses =
    "mt-3 inline-flex items-center justify-center gap-2 w-full min-h-[52px] px-[22px] text-base font-semibold rounded-xl no-underline transition-colors";
  const variant = hardPass
    ? "bg-pg-red-600 text-white hover:bg-pg-red-700"
    : "bg-transparent text-pg-ink-900 border-[1.5px] border-pg-ink-200 hover:bg-pg-ink-50";

  return (
    <Link href={`/applications/new?position=${positionSlug}`} className={`${baseClasses} ${variant}`}>
      {hardPass ? (
        <>
          Lamar posisi ini <Icon name="arrow_right" size={18} />
        </>
      ) : (
        <>
          Cek syarat & lamar <Icon name="arrow_right" size={18} />
        </>
      )}
    </Link>
  );
}
