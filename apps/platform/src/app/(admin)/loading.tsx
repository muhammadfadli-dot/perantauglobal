import { Skeleton } from "@/components/pg/primitives";

/** Admin CRM loading skeleton — table-shaped placeholder while RSC data loads. */
export default function AdminLoading() {
  return (
    <div className="min-h-screen px-6 py-6" style={{ background: "var(--pg-paper)" }}>
      <Skeleton className="w-48 h-8 mb-6" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="w-full h-12 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
