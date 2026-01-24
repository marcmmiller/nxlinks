import { db } from "@/drizzle/db";
import { Links, UrlMetadata } from "@/drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireSession } from "@/auth";

export async function getAllLinks() {
  const session = await requireSession();
  return db
    .select({
      id: Links.id,
      url: Links.url,
      title: Links.title,
      created: Links.created,
      owner: Links.owner,
      metadataTitle: UrlMetadata.title,
    })
    .from(Links)
    .leftJoin(UrlMetadata, eq(Links.url, UrlMetadata.url))
    .where(eq(Links.owner, session.userId))
    .orderBy(desc(Links.created));
}

export async function addLink(url: string, title: string | null) {
  const session = await requireSession();
  await db.insert(Links).values({
    url,
    title,
    owner: session.userId,
  });
}

export async function removeLink(linkId: number) {
  const session = await requireSession();
  await db
    .delete(Links)
    .where(and(eq(Links.id, linkId), eq(Links.owner, session.userId)));
}
