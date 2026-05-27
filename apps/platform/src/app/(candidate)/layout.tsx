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
 */
export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="md:pl-[240px]">
      <div className="md:max-w-[760px] md:mx-auto">{children}</div>
    </div>
  );
}
