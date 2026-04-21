"use client";

import { useTranslations } from "next-intl";
import { Ticker } from "@/components/editorial";

interface Props {
  /** Role-level namespace, e.g. "lowongan.perawat-saudi-arabia". */
  namespace: string;
}

type TickerItem = { icon: string; text: string };

export default function LowonganTrustBar({ namespace }: Props) {
  const t = useTranslations(namespace);
  let items: TickerItem[] = [];
  try {
    items = (t.raw("editorial.ticker") as TickerItem[]) ?? [];
  } catch {
    items = [];
  }
  if (items.length === 0) return null;
  return <Ticker items={items} tone="ink" />;
}
