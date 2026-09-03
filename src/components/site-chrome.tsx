"use client";
import {usePathname} from "next/navigation";
import {Header} from "./header";
import {Footer} from "./footer";
import {WhatsApp} from "./whatsapp";
import {GlobalScrollAnimations} from "./global-scroll-animations";
import {AboutFaithNetwork} from "./about-faith-network";

export function SiteChrome({children}:{children:React.ReactNode}){
  const pathname=usePathname();
  if(pathname==="/login")return <><GlobalScrollAnimations/>{children}<WhatsApp/></>;
  if(pathname.startsWith("/admin"))return <><GlobalScrollAnimations/>{children}</>;
  const routeClass=pathname.startsWith("/produto")||pathname==="/carrinho"?"products-route":pathname==="/sobre"?"about-route":pathname==="/conexao"?"connection-route":pathname==="/contato"?"contact-route":"";
  const usesSharedPattern=pathname!=="/sobre";
  const mainClass=[routeClass,usesSharedPattern?"site-faith-pattern":""].filter(Boolean).join(" ");
  return <><GlobalScrollAnimations/><Header/><main className={mainClass}>{usesSharedPattern?<AboutFaithNetwork/>:null}{children}</main><Footer/><WhatsApp/></>;
}
