import { TopBarWWW } from "@/components/pg/TopBarWWW";
import { Footer } from "@/components/pg/Footer";

export default function TalentHubLayout({
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
