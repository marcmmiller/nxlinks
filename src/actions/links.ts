"use server";

import { addLink as addLinkToDb, removeLink as removeLinkFromDb } from "@/data";
import { revalidatePath } from "next/cache";

export async function addLink(formData: FormData) {
  const url = formData.get("url") as string;
  const rawTitle = formData.get("title") as string | null;
  const title = rawTitle?.trim() || null;

  if (!url) {
    throw new Error("URL is required");
  }

  await addLinkToDb(url, title);

  revalidatePath("/");
}

export async function removeLink(formData: FormData) {
  const linkId = formData.get("linkId") as string;

  if (!linkId) {
    throw new Error("Link ID is required");
  }

  await removeLinkFromDb(parseInt(linkId));

  revalidatePath("/");
}
