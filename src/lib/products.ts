export type Product={id:string;name:string;category:string;price:number;oldPrice?:number|null;description:string;featured:boolean;stock:number;image:string};
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
export const products:Product[]=[
 {id:"p001",name:"Terço de Madeira de Oliveira",category:"tercos",price:89.9,oldPrice:119.9,image:"https://placehold.co/600x600/d1bea0/803e24?text=Ter%C3%A7o",description:"Terço artesanal em madeira de oliveira legítima, vinda da Terra Santa. Contas torneadas à mão e crucifixo em metal envelhecido.",featured:true,stock:24},
 {id:"p002",name:"Terço de Cristal Ave-Maria",category:"tercos",price:64.9,image:"https://placehold.co/600x600/d1bea0/803e24?text=Ter%C3%A7o",description:"Contas facetadas em cristal transparente, medalha de Nossa Senhora e acabamento em metal dourado.",featured:false,stock:40},
 {id:"p003",name:"Imagem Sagrada Família 25cm",category:"imagens",price:149.9,oldPrice:189.9,image:"https://placehold.co/600x600/e7dac6/803e24?text=Imagem",description:"Imagem em resina de alta definição, pintura fosca artesanal e base em madeira.",featured:true,stock:12},
 {id:"p004",name:"Imagem Nossa Senhora Aparecida 40cm",category:"imagens",price:219.9,image:"https://placehold.co/600x600/e7dac6/803e24?text=Imagem",description:"Peça em resina especial resistente a rachaduras, acabamento manual em tons de azul e ouro.",featured:false,stock:8},
 {id:"p005",name:"Camiseta Pacis Princeps — Bom Pastor",category:"camisetas",price:79.9,oldPrice:99.9,image:"https://placehold.co/600x600/f7f0e4/803e24?text=Camiseta",description:"100% algodão penteado, estampa do Bom Pastor inspirada em nossa identidade visual.",featured:true,stock:60},
 {id:"p006",name:"Camiseta Fé em Movimento",category:"camisetas",price:74.9,image:"https://placehold.co/600x600/f7f0e4/803e24?text=Camiseta",description:"Corte unissex, tecido leve para o dia a dia, estampa em serigrafia de longa duração.",featured:false,stock:35},
 {id:"p007",name:"Colar Medalha Milagrosa em Prata",category:"joias",price:179.9,oldPrice:229.9,image:"https://placehold.co/600x600/d1bea0/351c11?text=Joia",description:"Prata 925 com banho antitarnish, corrente veneziana e medalha bicolor.",featured:true,stock:15},
 {id:"p008",name:"Brinco Cruz Minimalista Folheado a Ouro",category:"joias",price:99.9,image:"https://placehold.co/600x600/d1bea0/351c11?text=Joia",description:"Folheado a ouro 18k, hipoalergênico, design discreto para o dia a dia.",featured:false,stock:22}
];
export const money=(value:number)=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(value);
export const categoryName=(id:string)=>categories.find(category=>category.id===id)?.name??id;
