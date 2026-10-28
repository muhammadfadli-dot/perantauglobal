import type { Metadata } from "next";
import { Nav } from "@/components/sections/Nav";
import { Hero } from "@/components/sections/Hero";
import { ValueProps } from "@/components/sections/ValueProps";
import { Sectors } from "@/components/sections/Sectors";
import { Process } from "@/components/sections/Process";
import { Guarantee } from "@/components/sections/Guarantee";
import { Credentials } from "@/components/sections/Credentials";
import { Faq } from "@/components/sections/Faq";
import { MarketContact } from "@/components/sections/MarketContact";
import { Footer } from "@/components/sections/Footer";
import { StickyCta } from "@/components/StickyCta";

export const metadata: Metadata = {
  title: "Hire Indonesian Talent for Saudi Arabia & GCC",
  description: "Employer-first workforce solutions for Saudi Arabia and GCC, connecting businesses with Indonesian talent through a documented recruitment route and written post-joining protection.",
  alternates: {
    canonical: "/en/saudi-gcc",
    languages: { en: "/en/saudi-gcc", id: "/id/saudi-gcc", ar: "/ar/saudi-gcc" },
  },
  openGraph: {
    title: "Hire Indonesian Talent for Saudi Arabia & GCC | DTG",
    description: "A clear recruitment route for Saudi and GCC employers hiring Indonesian talent.",
    url: "/en/saudi-gcc",
    locale: "en_US",
  },
};

export default function SaudiGccPage() {
  return <div className="gcc-page"><Nav market="gcc" /><main><Hero /><ValueProps /><Sectors /><Process /><Guarantee /><Credentials /><Faq /><MarketContact /></main><Footer market="gcc" /><StickyCta /></div>;
}
