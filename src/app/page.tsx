import styles from "./page.module.css";
import { getAllLinks } from "@/data";
import { logout } from "@/actions/auth";
import { addLink } from "@/actions/links";
import { AddLinkForm } from "./AddLinkForm";
import { RemoveButton } from "./RemoveButton";
import { Thumbnail } from "./Thumbnail";

export default async function Home() {
  const allLinks = await getAllLinks();

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <h1>NXLinks</h1>
            <form action={logout}>
              <button type="submit" className={styles.logoutButton}>
                Logout
              </button>
            </form>
          </div>
          <p className={styles.subtitle}>{allLinks.length} saved links</p>
        </header>

        <AddLinkForm addLink={addLink} />

        {allLinks.length === 0 ? (
          <div className={styles.empty}>
            <p>No links yet.</p>
          </div>
        ) : (
          <ul className={styles.linkList}>
            {allLinks.map((link) => (
              <li key={link.id} className={styles.linkItem}>
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
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
