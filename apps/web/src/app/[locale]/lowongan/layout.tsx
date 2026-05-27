import { TopBarWWW } from "@/components/pg/TopBarWWW";
import { TrustStrip } from "@/components/pg/TrustStrip";
import { Footer } from "@/components/pg/Footer";

export default function LowonganLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TopBarWWW />
      <TrustStrip />
      {children}
      <Footer />
    </>
  );
}
