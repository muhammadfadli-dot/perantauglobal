import { Icon, type IconName } from "./Icon";

type Meta = { icon: IconName; label: string };

export function RedHero({
  role,
  country,
  meta,
  size = "lg",
}: {
  role: string;
  country: string;
  meta?: Meta[];
  size?: "sm" | "md" | "lg";
}) {
  const padding = size === "sm" ? "px-4 pt-4 pb-4" : size === "md" ? "px-5 pt-5 pb-4" : "px-5 pt-8 pb-7";
  const minH = size === "sm" ? "min-h-[108px]" : size === "md" ? "min-h-[160px]" : "min-h-[200px]";
  const titleSize = size === "sm" ? "text-2xl" : size === "md" ? "text-3xl" : "text-[38px]";
  return (
    <div
      className={`relative flex flex-col justify-end text-white ${padding} ${minH}`}
      style={{
        background:
          "radial-gradient(ellipse at 80% 10%, var(--pg-overlay-white-strong), transparent 60%), var(--pg-red-600)",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, var(--pg-overlay-white-soft) 0 1px, transparent 1px 100px)",
        }}
      />
      <div className="relative">
        <div className="text-[11px] font-bold tracking-[0.14em] uppercase opacity-85">{country}</div>
        <div
          className={`${titleSize} font-extrabold leading-[1.05] tracking-tight mt-2 text-balance`}
        >
          {role}.
        </div>
        {meta && meta.length > 0 && (
          <div className="flex gap-4 mt-4 flex-wrap">
            {meta.map((m, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[13px] font-semibold opacity-95">
                <Icon name={m.icon} size={14} stroke={2} />
                {m.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
