// Shared metadata fetching utility with request deduplication

export interface MetadataResult {
  title: string | null;
  hasThumbnail: boolean;
}

// Map of in-flight requests to prevent duplicate API calls
const inFlightRequests = new Map<string, Promise<MetadataResult>>();

export async function fetchMetadata(url: string): Promise<MetadataResult> {
  // Check if there's already an in-flight request for this URL
  const existing = inFlightRequests.get(url);
  if (existing) {
    return existing;
  }

  // Create new request
  const promise = doFetchMetadata(url);

  // Store it so concurrent calls can reuse it
  inFlightRequests.set(url, promise);

  try {
    return await promise;
  } finally {
    // Clean up after request completes (success or failure)
    inFlightRequests.delete(url);
  }
}

async function doFetchMetadata(url: string): Promise<MetadataResult> {
  const response = await fetch(
    `/api/fetch_metadata?url=${encodeURIComponent(url)}`,
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch metadata: ${response.status}`);
  }

  return response.json();
}
