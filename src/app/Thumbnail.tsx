"use client";

import { useState, useEffect } from "react";
import { fetchMetadata } from "@/lib/fetchMetadata";

interface ThumbnailProps {
  url: string;
  className?: string;
}

export function Thumbnail({ url, className }: ThumbnailProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(
    "loading",
  );
  const [thumbnailSrc, setThumbnailSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadThumbnail() {
      setStatus("loading");
      const src = `/api/thumbnail?url=${encodeURIComponent(url)}`;

      // First, try to fetch the thumbnail directly
      const response = await fetch(src);

      if (cancelled) return;

      if (response.ok) {
        // Thumbnail exists, display it
        setThumbnailSrc(src);
        setStatus("loaded");
        return;
      }

      if (response.status === 404) {
        // Thumbnail not cached, trigger metadata fetch
        try {
          const data = await fetchMetadata(url);

          if (cancelled) return;

          if (data.hasThumbnail) {
            // Now the thumbnail should be available
            setThumbnailSrc(src + "&t=" + Date.now()); // Cache bust
            setStatus("loaded");
            return;
          }
        } catch (error) {
          console.error("Failed to fetch metadata:", error);
        }
      }

      // No thumbnail available
      setStatus("error");
    }

    loadThumbnail();

    return () => {
      cancelled = true;
    };
  }, [url]);

  if (status === "error") {
    return null;
  }

  if (status === "loading") {
    return <div className={className} style={{ backgroundColor: "#e5e7eb" }} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={thumbnailSrc!}
      alt=""
      className={className}
      onError={() => setStatus("error")}
    />
  );
}
