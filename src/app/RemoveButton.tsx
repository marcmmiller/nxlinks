"use client";

import styles from "./page.module.css";
import { removeLink } from "@/actions/links";

interface RemoveButtonProps {
  linkId: number;
}

export function RemoveButton({ linkId }: RemoveButtonProps) {
  return (
    <form action={removeLink}>
      <input type="hidden" name="linkId" value={linkId} />
      <button type="submit" className={styles.deleteButton}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 6h18" />
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        </svg>
      </button>
    </form>
  );
}
