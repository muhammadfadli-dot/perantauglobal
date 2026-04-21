import { Ticker } from "@/components/editorial";

type Item = { icon: string; text: string };

export default function ProgramTicker({ items }: { items: Item[] }) {
  if (!items || items.length === 0) return null;
  return <Ticker items={items} tone="ink" />;
}
