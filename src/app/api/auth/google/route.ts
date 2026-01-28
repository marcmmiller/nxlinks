import { Google } from "arctic";
import { cookies } from "next/headers";
import { SignJWT } from "jose";
import { db } from "@/drizzle/db";
import { Users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
  throw new Error(
    "Missing Google OAuth environment variables: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI"
  );
}

const google = new Google(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-secret-change-in-production"
);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const cookieStore = await cookies();
  const storedState = cookieStore.get("google_oauth_state")?.value;
  const codeVerifier = cookieStore.get("google_code_verifier")?.value;

  if (!code || !state || !storedState || state !== storedState || !codeVerifier) {
    return new Response("Invalid OAuth state", { status: 400 });
  }

  // Exchange code for tokens
  const tokens = await google.validateAuthorizationCode(code, codeVerifier);

  // Get user info from Google
  const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${tokens.accessToken()}` },
  });
  const googleUser = await response.json();

  // Find or create user
  let user = await db.select().from(Users).where(eq(Users.email, googleUser.email)).limit(1);

  if (user.length === 0) {
    const [newUser] = await db.insert(Users).values({ email: googleUser.email }).returning();
    user = [newUser];
  }

  // Issue JWT (same as current demo login)
  const token = await new SignJWT({ userId: user[0].id })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);

  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  // Clean up OAuth cookies
  cookieStore.delete("google_oauth_state");
  cookieStore.delete("google_code_verifier");

  redirect("/");
}
