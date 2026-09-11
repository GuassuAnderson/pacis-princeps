const common={viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:1.4,strokeLinecap:"round" as const,strokeLinejoin:"round" as const,"aria-hidden":true};

export function CategoryIcon({category}:{category:string}){
  switch(category){
    case "tercos": return <svg {...common}><path d="M8.2 15.8C4.9 14.4 3 11.6 3 8.7 3 5.6 5.5 3 8.5 3c1.3 0 2.5.5 3.5 1.3C13 3.5 14.2 3 15.5 3c3 0 5.5 2.6 5.5 5.7 0 2.9-1.9 5.7-5.2 7.1"/><circle cx="5.1" cy="5.5" r=".8"/><circle cx="3.8" cy="9" r=".8"/><circle cx="5.5" cy="12.6" r=".8"/><circle cx="8.6" cy="15" r=".8"/><circle cx="18.9" cy="5.5" r=".8"/><circle cx="20.2" cy="9" r=".8"/><circle cx="18.5" cy="12.6" r=".8"/><circle cx="15.4" cy="15" r=".8"/><circle cx="12" cy="16.2" r="1.25"/><path d="M12 17.5V22M9.8 19.6h4.4"/></svg>;
    case "imagens": return <svg {...common}><circle cx="12" cy="7" r="2.25"/><path d="M8.2 6.3A4.2 4.2 0 0 1 12 2a4.2 4.2 0 0 1 3.8 4.3M9.8 9c-2.5 2-3.7 5.4-4.1 9h12.6c-.4-3.6-1.6-7-4.1-9M9.5 12.5 12 15l2.5-2.5M4 21h16M6 18h12v3H6z"/></svg>;
    case "camisetas": return <svg {...common}><path d="M6 4 2 8l3 3 2-2v11h10V9l2 2 3-3-4-4-3 2h-4L6 4Z"/></svg>;
    case "joias": return <svg {...common}><path d="M12 2v20M6 6l6-4 6 4M4 10h16l-8 12-8-12Z"/></svg>;
    case "kids": return <svg {...common}><path d="M8.3 6.2C8.8 3.7 11 2.5 13 3.2c1.1.4 1.8 1.3 2.2 2.4M8 7.2a4.1 4.1 0 0 0 8 0M8 8H7a1.5 1.5 0 0 0 0 3h1.5M16 8h1a1.5 1.5 0 0 1 0 3h-1.5"/><circle cx="10.3" cy="8.2" r=".55" fill="currentColor" stroke="none"/><circle cx="13.7" cy="8.2" r=".55" fill="currentColor" stroke="none"/><path d="M10.4 10.3c1 .8 2.2.8 3.2 0M5 21v-2.2c0-3 2.5-5.3 5.5-5.3h3c3 0 5.5 2.3 5.5 5.3V21M9 14l3 3 3-3"/></svg>;
    case "livros": return <svg {...common}><path d="M4 4.5c3-1 5.8-.5 8 1.5v14c-2.2-2-5-2.5-8-1.5v-14ZM20 4.5c-3-1-5.8-.5-8 1.5v14c2.2-2 5-2.5 8-1.5v-14Z"/><path d="M7 8h2M15 8h2M7 11h2M15 11h2"/></svg>;
    case "biblias": return <svg {...common}><path d="M5 3h12a2 2 0 0 1 2 2v16H7a2 2 0 0 1-2-2V3Z"/><path d="M5 18c0-1.1.9-2 2-2h12M12 6v7M9.5 8.5h5"/></svg>;
    case "mandalas": return <svg {...common}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4"/></svg>;
    case "crucifixos": return <svg {...common}><path d="M10 2h4v6h5v4h-5v10h-4V12H5V8h5V2Z"/></svg>;
    case "velas": return <svg {...common}><path d="M9 9h6v12H9zM12 9c-2-2-1-5 1-7 2 3 2 5-1 7ZM7 21h10"/></svg>;
    case "incensos": return <svg {...common}><path d="M6 20h12M8 17h8l2 3H6l2-3ZM12 17V8"/><path d="M12 8c-3-2 3-4 0-6M15 11c3-2-2-4 1-6"/></svg>;
    case "chas": return <svg {...common}><path d="M5 8h12v6a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8ZM17 10h1a3 3 0 0 1 0 6h-2M8 4c0 1 1 1.5 1 2M12 3c0 1 1 1.5 1 3"/></svg>;
    case "oficial-pacis": return <svg {...common}><path d="M12 2 15 8l7 .9-5 4.8 1.5 7-6.5-3.5-6.5 3.5 1.5-7-5-4.8L9 8l3-6Z"/></svg>;
    default: return <svg {...common}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
  }
}
