import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import type { UserRole } from "./constants";

// Edge-safe on purpose: middleware.ts imports from this file, so nothing here
// may touch Prisma, bcrypt, or any Node-only API.

export const SESSION_COOKIE = "tm_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

export type SessionPayload = {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
};

function secretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "AUTH_SECRET is missing or too short. Set it in .env (openssl rand -base64 32)."
    );
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(secretKey());
}

export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    const { userId, email, name, role } = payload as Record<string, unknown>;
    if (typeof userId !== "string" || typeof email !== "string") return null;
    return {
      userId,
      email,
      name: typeof name === "string" ? name : "",
      role: (role as UserRole) ?? "TRAVELER",
    };
  } catch {
    // Expired, tampered with, or signed by an older AUTH_SECRET.
    return null;
  }
}

/** Read + verify the session from the request cookies. */
export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  return verifySession(jar.get(SESSION_COOKIE)?.value);
}

/** Only callable from a Server Action or Route Handler. */
export async function setSessionCookie(payload: SessionPayload): Promise<void> {
  const token = await signSession(payload);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}
