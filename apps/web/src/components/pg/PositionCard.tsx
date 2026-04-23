import Link from "next/link";
import { Icon } from "./Icon";
import { Badge, StatusDot } from "./primitives";
import type { Position } from "@/lib/positions";

export function PositionCard({ p }: { p: Position }) {
  return (
    <Link
      href={`/lowongan/${p.slug}`}
      className="block bg-pg-white border border-pg-ink-100 rounded-2xl overflow-hidden no-underline text-pg-ink-900 hover:border-pg-ink-200 transition-colors"
    >
      <div
        className="relative px-4 pt-4 pb-3.5 min-h-[108px] text-white"
        style={{
          background:
            "radial-gradient(ellipse at 80% 10%, rgba(255,255,255,.18), transparent 60%), var(--pg-red-600)",
        }}
      >
        <div className="absolute top-3 right-3 w-9 h-9 rounded-[10px] grid place-items-center text-white" style={{ background: "rgba(255,255,255,.14)" }}>
          <Icon name={p.icon} size={20} stroke={2} />
        </div>
        <div className="text-[11px] font-bold tracking-[0.14em] uppercase opacity-85">{p.country}</div>
        <div className="text-2xl font-extrabold leading-tight tracking-tight mt-1.5">{p.role}</div>
      </div>
      <div className="p-4">
        <div className="flex items-baseline gap-1.5">
          <div className="text-xl font-extrabold tracking-tight">{p.salary}</div>
          <div className="text-sm text-pg-ink-500">{p.salaryNote}</div>
        </div>
        <div className="flex gap-2.5 mt-2.5 flex-wrap">
          <div className="flex items-center gap-1 text-[13px] text-pg-ink-500">
            <Icon name="user" size={14} />
            {p.gender}
          </div>
          <div className="flex items-center gap-1 text-[13px] text-pg-ink-500">
            <Icon name="clock" size={14} />
            {p.age} th
          </div>
        </div>
        <div className="flex items-center justify-between mt-3.5">
          {p.status === "open" ? (
            <Badge variant="ok">
              <StatusDot tone="ok" /> Lagi buka
            </Badge>
          ) : (
            <Badge variant="mute">
              <StatusDot tone="mute" /> Daftar antrian
            </Badge>
          )}
          <div className="flex items-center gap-1 text-pg-red-600 font-bold text-sm">
            Detail <Icon name="chevron_right" size={16} />
          </div>
        </div>
      </div>
    </Link>
  );
}
