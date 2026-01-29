"use client";

import { useState, useEffect } from "react";
import { fetchMetadata } from "@/lib/fetchMetadata";
import styles from "./page.module.css";
import { RemoveButton } from "./RemoveButton";

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
  const [thumbnailStatus, setThumbnailStatus] = useState<
    "loading" | "loaded" | "error"
  >("loading");
  const [thumbnailSrc, setThumbnailSrc] = useState<string | null>(null);
  const [metadataTitle, setMetadataTitle] = useState<string | null>(
    link.metadataTitle,
  );

  useEffect(() => {
    let cancelled = false;

    async function loadThumbnail() {
      setThumbnailStatus("loading");
      const src = `/api/thumbnail?url=${encodeURIComponent(link.url)}`;

      // First, check if the thumbnail exists (HEAD request to avoid double-fetching)
      const response = await fetch(src, { method: "HEAD" });

      if (cancelled) return;

      if (response.ok) {
        // Thumbnail exists, display it
        setThumbnailSrc(src);
        setThumbnailStatus("loaded");
        return;
      }

      if (response.status === 404) {
        // Thumbnail not cached, trigger metadata fetch
        try {
          const data = await fetchMetadata(link.url);

          if (cancelled) return;

          // Update title if we got one and don't have a user-provided title
          if (data.title && !link.title) {
            setMetadataTitle(data.title);
          }

          if (data.hasThumbnail) {
            // Now the thumbnail should be available
            setThumbnailSrc(src + "&t=" + Date.now()); // Cache bust
            setThumbnailStatus("loaded");
            return;
          }
        } catch (error) {
          console.error("Failed to fetch metadata:", error);
        }
      }

      // No thumbnail available
      setThumbnailStatus("error");
    }

    loadThumbnail();

    return () => {
      cancelled = true;
    };
  }, [link.url, link.title]);

  const displayTitle =
    link.title ?? metadataTitle ?? link.url.replace(/^https?:\/\//, "");

  return (
    <li className={styles.linkItem}>
      {thumbnailStatus === "loading" && (
        <div
          className={styles.thumbnail}
          style={{ backgroundColor: "#e5e7eb" }}
        />
      )}
      {thumbnailStatus === "loaded" && thumbnailSrc && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumbnailSrc}
          alt=""
          className={styles.thumbnail}
          onError={() => setThumbnailStatus("error")}
        />
      )}
      <div className={styles.linkContent}>
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.linkUrl}
        >
          {displayTitle}
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
