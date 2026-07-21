import { redirect } from "next/navigation";
import { getSessionAndRole } from "@/lib/supabase-server";

/**
 * Candidate-portal layout shell (Phase 5h).
 *
 * - Mobile (<md, default): renders children as-is. Each page provides its own
 *   BerandaTopBar + BottomNav (mobile bottom-pinned variant inside AppChrome).
 * - Desktop (>=md): adds a left padding of 240px to make room for the fixed
 *   DesktopSidebar variant of BottomNav (also lives inside AppChrome).
 *
 * The actual sidebar/bottom-nav swap is handled inside `BottomNav` via
 * `md:hidden` / `hidden md:flex` classes, so we don't need viewport JS here.
 *
 * The auth guard lives HERE, not only inside the pages, and that placement is
 * the whole point: `loading.tsx` in this segment wraps every page in Suspense,
 * so a `redirect()` raised inside a page streams out after the response has
 * already committed a 200. Monitoring then reads dead or unauthorized portal
 * URLs as healthy. Guarding in the layout runs outside that boundary and yields
 * a real 307, which is exactly why (admin) still returns 307 despite also
 * having a loading.tsx. Same defect class as commit 43394c1 in apps/web.
 * Audit 2026-07-21, finding K6.
 *
 * Deliberately uses getSessionAndRole (read-only) rather than requireCandidate,
 * which performs candidate-row writes and must stay a per-page concern.
 */
export default async function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, role } = await getSessionAndRole();
  if (!session) redirect("/auth/sign-in");
  if (role === "admin") redirect("/admin");

  return (
    <div className="md:pl-[240px]">
      <div className="md:max-w-[760px] md:mx-auto">{children}</div>
    </div>
  );
}
