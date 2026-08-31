const common={viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:1.4,strokeLinecap:"round" as const,strokeLinejoin:"round" as const,"aria-hidden":true};

export function CategoryIcon({category}:{category:string}){
  switch(category){
    case "tercos": return <svg {...common}><circle cx="12" cy="12" r="3"/><circle cx="5" cy="6" r="1.6"/><circle cx="5" cy="18" r="1.6"/><circle cx="19" cy="6" r="1.6"/><circle cx="19" cy="18" r="1.6"/><path d="M12 9V4M12 15v5M9.5 10.3 6 6.6M14.5 10.3 18 6.6M9.5 13.7 6 17.4M14.5 13.7 18 17.4"/></svg>;
    case "imagens": return <svg {...common}><path d="M12 2v5M8 21h8l-1-9H9l-1 9Z"/><circle cx="12" cy="10" r="3.2"/></svg>;
    case "camisetas": return <svg {...common}><path d="M6 4 2 8l3 3 2-2v11h10V9l2 2 3-3-4-4-3 2h-4L6 4Z"/></svg>;
    case "joias": return <svg {...common}><path d="M12 2v20M6 6l6-4 6 4M4 10h16l-8 12-8-12Z"/></svg>;
    case "mandalas": return <svg {...common}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4"/></svg>;
    case "crucifixos": return <svg {...common}><path d="M10 2h4v6h5v4h-5v10h-4V12H5V8h5V2Z"/></svg>;
    case "velas": return <svg {...common}><path d="M9 9h6v12H9zM12 9c-2-2-1-5 1-7 2 3 2 5-1 7ZM7 21h10"/></svg>;
    case "oficial-pacis": return <svg {...common}><path d="M12 2 15 8l7 .9-5 4.8 1.5 7-6.5-3.5-6.5 3.5 1.5-7-5-4.8L9 8l3-6Z"/></svg>;
    default: return <svg {...common}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
  }
}
