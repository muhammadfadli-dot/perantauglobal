import { Nav } from "@/components/sections/Nav";
import { Hero } from "@/components/sections/Hero";
import { ValueProps } from "@/components/sections/ValueProps";
import { TalentPoolCounter } from "@/components/sections/TalentPoolCounter";
import { Sectors } from "@/components/sections/Sectors";
import { Process } from "@/components/sections/Process";
import { Guarantee } from "@/components/sections/Guarantee";
import { Credentials } from "@/components/sections/Credentials";
import { Faq } from "@/components/sections/Faq";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <ValueProps />
        <TalentPoolCounter />
        <Sectors />
        <Process />
        <Guarantee />
        <Credentials />
        <Faq />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
