import "server-only";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "./db";
import { getSession } from "./session";
import type { UserRole } from "./constants";

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl: string | null;
  country: string | null;
  guideProfileId: string | null;
  guideStatus: string | null;
};

/** Returns null when signed out. Never throws. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatarUrl: true,
      country: true,
      guideProfile: { select: { id: true, status: true } },
    },
  });
  // The row can be gone while a valid cookie survives (deleted account, reset db).
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as UserRole,
    avatarUrl: user.avatarUrl,
    country: user.country,
    guideProfileId: user.guideProfile?.id ?? null,
    guideStatus: user.guideProfile?.status ?? null,
  };
}

/** Redirects to /login (with a return path) when signed out. */
export async function requireUser(returnTo = "/"): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  return user;
}

export async function requireRole(role: UserRole, returnTo = "/"): Promise<CurrentUser> {
  const user = await requireUser(returnTo);
  // Admins can reach every area; that keeps support work possible without
  // a second impersonation mechanism.
  if (user.role !== role && user.role !== "ADMIN") redirect("/");
  return user;
}
