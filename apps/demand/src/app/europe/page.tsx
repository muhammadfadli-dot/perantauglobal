import { Nav } from "@/components/sections/Nav";
import { Hero } from "@/components/sections/Hero";
import { Sectors } from "@/components/sections/Sectors";
import { MarketRoute } from "@/components/sections/MarketRoute";
import { Clients } from "@/components/sections/Clients";
import { MarketContact } from "@/components/sections/MarketContact";
import { Footer } from "@/components/sections/Footer";
import { StickyCta } from "@/components/StickyCta";
export default function EuropePage(){return <div className="gcc-page market-europe"><Nav/><main><Hero market="europe"/><MarketRoute market="europe"/><Sectors market="europe"/><Clients/><MarketContact market="europe"/></main><Footer market="europe"/><StickyCta/></div>}
