import { Skeleton } from "@/components/pg/primitives";

/**
 * Candidate-portal loading skeleton — shown while an RSC fetch resolves on slow
 * Indonesian mobile networks, instead of a blank screen (which reads as broken
 * for a scam-fearful audience).
 */
export default function CandidateLoading() {
  return (
    <div
      className="min-h-screen px-5 pt-4 pb-8"
      style={{ background: "var(--pg-paper)" }}
    >
      <div className="flex items-center justify-between mb-5">
        <Skeleton className="w-9 h-9 rounded-[11px]" />
        <Skeleton className="w-24 h-7 rounded-[11px]" />
      </div>
      <Skeleton className="w-2/3 h-7 mb-2" />
      <Skeleton className="w-1/3 h-4 mb-6" />
      <Skeleton className="w-full rounded-[18px] mb-4" style={{ height: 220 }} />
      <div className="flex flex-col gap-2.5">
        <Skeleton className="w-full h-16 rounded-[14px]" />
        <Skeleton className="w-full h-16 rounded-[14px]" />
        <Skeleton className="w-full h-16 rounded-[14px]" />
      </div>
    </div>
  );
}
