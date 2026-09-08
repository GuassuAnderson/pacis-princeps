export type ProductImage = { id: string; url: string; alt: string; width: number; height: number };
export type Product = { id: string; name: string; category: string; price: number; oldPrice?: number | null; description: string; featured: boolean; inHero: boolean; stock: number; image: string; images: ProductImage[]; active: boolean; updatedAt: string };
export type ProductList = { items: Product[]; total: number; page: number; limit: number };
export const PRODUCT_PLACEHOLDER = "/images/product-placeholder.svg";
export const categories=[
 {id:"tercos",name:"Terços",description:"Madeira, cristal e prata"},
 {id:"imagens",name:"Imagens Sacras",description:"Santos e devoções"},
 {id:"camisetas",name:"Camisetas",description:"Estampas autorais"},
 {id:"joias",name:"Joias",description:"Prata e folheados"},
 {id:"kids",name:"Kids",description:"A fé para os pequenos"},
 {id:"livros",name:"Livros",description:"Leituras que inspiram"},
 {id:"biblias",name:"Bíblias",description:"Palavra e contemplação"},
 {id:"mandalas",name:"Mandalas",description:"Arte e espiritualidade"},
 {id:"crucifixos",name:"Crucifixos",description:"Para o lar e para presentear"},
 {id:"velas",name:"Velas",description:"Luz para seus momentos de oração"},
 {id:"incensos",name:"Incensos",description:"Aromas para oração"},
 {id:"chas",name:"Chás",description:"Pausa, cuidado e acolhimento"},
 {id:"oficial-pacis",name:"Oficial PACIS",description:"Exclusivos da marca"},
 {id:"diversos",name:"Diversos",description:"Artigos e presentes"}
];
export const money=(value:number)=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(value);
export const categoryName=(id:string)=>categories.find(category=>category.id===id)?.name??id;
