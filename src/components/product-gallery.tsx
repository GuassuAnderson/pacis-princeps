"use client";
import Image from "next/image";
import { useState } from "react";
import { PRODUCT_PLACEHOLDER, type ProductImage } from "@/lib/products";
import styles from "./product-gallery.module.css";

export function ProductGallery({ images, name, cover }: { images:ProductImage[]; name:string; cover:string }) {
  const [selected,setSelected] = useState(0);
  const [failed,setFailed] = useState<string[]>([]);
  const gallery = images.length ? images : [{id:"cover",url:cover,alt:name,width:1000,height:1000}];
  const current = gallery[selected] || gallery[0];
  const source = failed.includes(current.url) ? PRODUCT_PLACEHOLDER : current.url;
  return <div className={styles.gallery}>
    <div className={`produto-detalhe-imagem ${styles.main}`}><Image key={source} src={source} alt={current.alt || name} fill sizes="(max-width: 900px) 90vw, 600px" preload onError={()=>setFailed(values=>values.includes(current.url)?values:[...values,current.url])}/></div>
    {gallery.length>1 && <div className={styles.thumbnails} aria-label="Fotos do produto">{gallery.map((image,index)=><button type="button" key={image.id} className={index===selected ? styles.selected : ""} onClick={()=>setSelected(index)} aria-label={`Ver foto ${index+1} de ${name}`} aria-pressed={index===selected}><Image src={failed.includes(image.url)?PRODUCT_PLACEHOLDER:image.url} alt="" width={90} height={90}/></button>)}</div>}
    <p className={styles.caption} aria-live="polite">Foto {selected+1} de {gallery.length}</p>
  </div>;
}
