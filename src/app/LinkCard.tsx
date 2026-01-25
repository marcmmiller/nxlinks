import styles from "./page.module.css";
import { RemoveButton } from "./RemoveButton";
import { Thumbnail } from "./Thumbnail";

interface LinkCardProps {
  link: {
    id: number;
    url: string;
    title: string | null;
    created: Date | null;
    metadataTitle: string | null;
  };
}

export function LinkCard({ link }: LinkCardProps) {
  return (
    <li className={styles.linkItem}>
      <Thumbnail url={link.url} className={styles.thumbnail} />
      <div className={styles.linkContent}>
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.linkUrl}
        >
          {link.title ??
            link.metadataTitle ??
            link.url.replace(/^https?:\/\//, "")}
        </a>
        {link.created && (
          <span className={styles.linkDate}>
            {link.created.toLocaleDateString()}
          </span>
        )}
      </div>
      <RemoveButton linkId={link.id} />
    </li>
  );
}
