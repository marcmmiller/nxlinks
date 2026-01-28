import { login, loginWithGoogle } from "@/actions/auth";
import styles from "./page.module.css";

export default function LoginPage() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Login</h1>
        <div className={styles.buttons}>
          <form action={loginWithGoogle}>
            <button type="submit" className={styles.googleButton}>
              Log in with Google
            </button>
          </form>
          <form action={login}>
            <button type="submit" className={styles.button}>
              Login as Demo User
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
