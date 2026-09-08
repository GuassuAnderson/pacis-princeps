import Image from "next/image";
import styles from "./history-brand-photo.module.css";

export function HistoryBrandPhoto() {
  return (
    <div className={styles.composition}>
      <span className={styles.ornament} aria-hidden="true">✦</span>
      <div className={styles.frame}>
        <Image
          className={styles.logo}
          src="/images/nossa-historia/identidade-pacis.webp"
          alt="Pacis Princeps — Artigos Religiosos"
          width={700}
          height={427}
          sizes="(max-width: 900px) 90vw, 490px"
        />
        <span className={styles.flourish} aria-hidden="true">✦</span>
      </div>
    </div>
  );
}
