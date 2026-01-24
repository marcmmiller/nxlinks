import { login } from "@/actions/auth";
import styles from "./page.module.css";

export default function LoginPage() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Login</h1>
        <form action={login}>
          <button type="submit" className={styles.button}>
            Login as Demo User
          </button>
        </form>
      </main>
    </div>
  );
}
