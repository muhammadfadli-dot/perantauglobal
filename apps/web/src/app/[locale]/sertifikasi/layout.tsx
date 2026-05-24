import { TopBarWWW } from "@/components/pg/TopBarWWW";
import { Footer } from "@/components/pg/Footer";

export default function SertifikasiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TopBarWWW />
      {children}
      <Footer />
    </>
  );
}
