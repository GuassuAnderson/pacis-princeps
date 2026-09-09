import type { ProductImage } from './products';
export type Connection = { id:string;title:string;theme:string;preacher:string;role:string;preacherInstagram:string;editionInstagram:string;date:string;summary:string;content:string;photos:string[];images:ProductImage[];published:boolean;featured:boolean;updatedAt:string };
export type ConnectionList = {items:Connection[];total:number;page:number;limit:number};
export const formatConnectionDate=(date:string)=>new Date(date+'T00:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'});
