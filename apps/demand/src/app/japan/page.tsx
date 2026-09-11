import { Nav } from "@/components/sections/Nav";
import { Hero } from "@/components/sections/Hero";
import { Sectors } from "@/components/sections/Sectors";
import { MarketRoute } from "@/components/sections/MarketRoute";
import { Clients } from "@/components/sections/Clients";
import { MarketContact } from "@/components/sections/MarketContact";
import { Footer } from "@/components/sections/Footer";
import { StickyCta } from "@/components/StickyCta";
export default function JapanPage(){return <div className="gcc-page market-japan"><Nav/><main><Hero market="japan"/><MarketRoute market="japan"/><Sectors market="japan"/><Clients/><MarketContact market="japan"/></main><Footer market="japan"/><StickyCta/></div>}
