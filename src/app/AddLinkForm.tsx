"use client";

import { useState, useRef } from "react";
import styles from "./page.module.css";
import { fetchMetadata } from "@/lib/fetchMetadata";

interface AddLinkFormProps {
  addLink: (formData: FormData) => Promise<void>;
}

export function AddLinkForm({ addLink }: AddLinkFormProps) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasThumbnail, setHasThumbnail] = useState(false);
  const [fetchedUrl, setFetchedUrl] = useState<string | null>(null);
  const userEditedTitle = useRef(false);
  const lastFetchedUrl = useRef<string | null>(null);
  const ignoreResultsRef = useRef(false);
  const isClickingSubmit = useRef(false);

  const handleUrlBlur = async () => {
    // Skip if user is clicking the submit button (blur fires before submit)
    if (isClickingSubmit.current) {
      isClickingSubmit.current = false;
      return;
    }

    const trimmedUrl = url.trim();

    // Don't fetch if empty or same as last fetched
    if (!trimmedUrl || trimmedUrl === lastFetchedUrl.current) {
      return;
    }

    // Basic URL validation
    try {
      new URL(trimmedUrl);
    } catch {
      return;
    }

    lastFetchedUrl.current = trimmedUrl;
    setIsLoading(true);
    setHasThumbnail(false);
    setFetchedUrl(null);

    // Reset flag so we'll use the results from this fetch
    ignoreResultsRef.current = false;

    try {
      const data = await fetchMetadata(trimmedUrl);

      // Check if we should ignore these results (form was submitted or URL changed)
      if (ignoreResultsRef.current) {
        return;
      }

      // Only set title if user hasn't manually edited it
      if (!userEditedTitle.current && data.title) {
        setTitle(data.title);
      }

      setHasThumbnail(data.hasThumbnail);
      setFetchedUrl(trimmedUrl);
    } catch (error) {
      if (ignoreResultsRef.current) {
        // Results should be ignored
        return;
      }
      console.error("Failed to fetch metadata:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);

    // Clear stale preview data when URL changes
    if (newUrl !== fetchedUrl) {
      setHasThumbnail(false);
      setFetchedUrl(null);
      if (!userEditedTitle.current) {
        setTitle("");
      }
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    userEditedTitle.current = true;
  };

  const handleSubmit = async (formData: FormData) => {
    // Tell any in-flight fetch to ignore its results
    ignoreResultsRef.current = true;

    await addLink(formData);

    // Reset form state after submission
    setUrl("");
    setTitle("");
    setIsLoading(false);
    setHasThumbnail(false);
    setFetchedUrl(null);
    userEditedTitle.current = false;
    lastFetchedUrl.current = null;
  };

  return (
    <form className={styles.addForm} action={handleSubmit}>
      <div className={styles.addFormInputs}>
        <input
          type="url"
          name="url"
          placeholder="Enter a URL..."
          className={styles.addInput}
          required
          value={url}
          onChange={handleUrlChange}
          onBlur={handleUrlBlur}
        />
        <div className={styles.titleInputWrapper}>
          <input
            type="text"
            name="title"
            placeholder={isLoading ? "Loading title..." : "Title (optional)"}
            className={styles.addInput}
            value={title}
            onChange={handleTitleChange}
          />
          {isLoading && <span className={styles.loadingSpinner} />}
        </div>
      </div>

      {hasThumbnail && fetchedUrl && (
        <div className={styles.thumbnailPreview}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/thumbnail?url=${encodeURIComponent(fetchedUrl)}`}
            alt="Preview"
            className={styles.previewImage}
          />
        </div>
      )}

      <button
        type="submit"
        className={styles.addButton}
        onMouseDown={() => {
          isClickingSubmit.current = true;
        }}
      >
        Add Link
      </button>
    </form>
  );
}
