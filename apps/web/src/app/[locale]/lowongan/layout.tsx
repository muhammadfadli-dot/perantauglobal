export default function LowonganLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Editorial chrome (Nav, Footer, MobileStickyCTA) is rendered per-page
  // by each role's content component because anchors/copy are role-specific.
  return <>{children}</>;
}
