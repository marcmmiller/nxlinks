import styles from "./page.module.css";
import { getAllLinks } from "@/data";
import { logout } from "@/actions/auth";
import { addLink } from "@/actions/links";
import { AddLinkForm } from "./AddLinkForm";
import { LinkCard } from "./LinkCard";

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
              <LinkCard key={link.id} link={link} />
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
