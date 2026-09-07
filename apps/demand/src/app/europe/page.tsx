import { Nav } from "@/components/sections/Nav";
import { Hero } from "@/components/sections/Hero";
import { ValueProps } from "@/components/sections/ValueProps";
import { TalentPoolCounter } from "@/components/sections/TalentPoolCounter";
import { Sectors } from "@/components/sections/Sectors";
import { Clients } from "@/components/sections/Clients";
import { Process } from "@/components/sections/Process";
import { Guarantee } from "@/components/sections/Guarantee";
import { Credentials } from "@/components/sections/Credentials";
import { Faq } from "@/components/sections/Faq";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";
import { StickyCta } from "@/components/StickyCta";
export default function EuropePage(){return <div className="gcc-page market-europe"><Nav/><main><Hero market="europe"/><ValueProps/><TalentPoolCounter/><Sectors market="europe"/><Clients/><Process/><Guarantee/><Credentials/><Faq/><Contact/></main><Footer/><StickyCta/></div>}
