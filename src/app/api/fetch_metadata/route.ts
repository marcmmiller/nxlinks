import { db } from "@/drizzle/db";
import { UrlMetadata } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

const APIFLASH_ACCESS_KEY = process.env.APIFLASH_ACCESS_KEY;
if (!APIFLASH_ACCESS_KEY) {
  throw new Error("APIFLASH_ACCESS_KEY environment variable is not set");
}

async function fetchTitleFromHtmlUrl(url: string): Promise<string | null> {
  console.log(`[apiflash] Fetching HTML from: ${url}`);
  const response = await fetch(url);

  if (!response.ok || !response.body) {
    return null;
  }

  const maxBytes = 16 * 1024; // 16KB should be plenty for <head>
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let html = "";
  let bytesRead = 0;

  while (bytesRead < maxBytes) {
    const { done, value } = await reader.read();
    if (done) break;

    bytesRead += value.length;
    html += decoder.decode(value, { stream: true });

    // Check if we've found the closing title tag
    if (html.includes("</title>") || html.includes("</TITLE>")) {
      break;
    }
  }

  // Cancel the rest of the response
  reader.cancel();

  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) {
    return titleMatch[1].trim();
  }

  return null;
}

async function fetchMetadataFromUrl(
  url: string,
): Promise<{ title: string | null; thumbnail: Buffer | null }> {
  // Call apiflash API to get thumbnail and HTML URLs
  const apiUrl = new URL("https://api.apiflash.com/v1/urltoimage");
  apiUrl.searchParams.set("access_key", APIFLASH_ACCESS_KEY);
  apiUrl.searchParams.set("url", url);
  apiUrl.searchParams.set("response_type", "json");
  apiUrl.searchParams.set("extract_html", "true");
  apiUrl.searchParams.set("thumbnail_width", "500");

  console.log(`[apiflash] Fetching metadata for: ${url}`);
  const response = await fetch(apiUrl.toString());
  const quotaRemaining = response.headers.get("x-quota-remaining");
  console.log(
    `[apiflash] Response status: ${response.status}, x-quota-remaining: ${quotaRemaining}`,
  );
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  const data = await response.json();

  // Fetch the thumbnail image
  console.log(`[apiflash] Fetching thumbnail from: ${data.url}`);
  const thumbnailResponse = await fetch(data.url);
  if (!thumbnailResponse.ok) {
    throw new Error(`Thumbnail fetch failed: ${thumbnailResponse.status}`);
  }
  const thumbnailArrayBuffer = await thumbnailResponse.arrayBuffer();
  const thumbnail = Buffer.from(thumbnailArrayBuffer);

  // Fetch the HTML and extract title
  const title = await fetchTitleFromHtmlUrl(data.extracted_html);

  return { title, thumbnail };
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { error: "url parameter is required" },
      { status: 400 },
    );
  }

  // Check cache first
  const cached = await db
    .select()
    .from(UrlMetadata)
    .where(eq(UrlMetadata.url, url))
    .limit(1);

  if (cached.length > 0) {
    // Cache hit
    return NextResponse.json({
      title: cached[0].title,
      hasThumbnail: cached[0].thumbnail !== null,
    });
  }

  // Cache miss - fetch from external service
  let metadata;
  try {
    metadata = await fetchMetadataFromUrl(url);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch metadata" },
      { status: 502 },
    );
  }

  // Store in database
  await db.insert(UrlMetadata).values({
    url,
    title: metadata.title,
    thumbnail: metadata.thumbnail,
  });

  return NextResponse.json({
    title: metadata.title,
    hasThumbnail: metadata.thumbnail !== null,
  });
}
