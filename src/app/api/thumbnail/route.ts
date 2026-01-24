import { db } from "@/drizzle/db";
import { UrlMetadata } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { error: "Missing url parameter" },
      { status: 400 },
    );
  }

  const result = await db
    .select({ thumbnail: UrlMetadata.thumbnail })
    .from(UrlMetadata)
    .where(eq(UrlMetadata.url, url))
    .limit(1);

  const metadata = result[0];

  if (!metadata || !metadata.thumbnail) {
    return new NextResponse(null, { status: 404 });
  }

  return new NextResponse(new Uint8Array(metadata.thumbnail), {
    headers: {
      "Content-Type": "image/jpeg",
    },
  });
}
