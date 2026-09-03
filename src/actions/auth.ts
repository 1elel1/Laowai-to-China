"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { clearSessionCookie, setSessionCookie } from "@/lib/session";
import { fieldErrors, loginSchema, signupSchema } from "@/lib/validation";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { failure, type ActionState } from "./types";
import type { UserRole } from "@/lib/constants";

/** Only allow same-origin relative paths through the `next` query param. */
function safeNext(value: FormDataEntryValue | null, fallback: string): string {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}

export async function signupAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const t = getDictionary(await getLocale());

  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
    country: formData.get("country") ?? "",
  });
  if (!parsed.success) return failure(t.errors.invalidInput, fieldErrors(parsed.error));

  const { name, email, password, role, country } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) return failure(t.errors.emailTaken, { email: t.errors.emailTaken });

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(password),
      role,
      country: country || null,
    },
    select: { id: true, email: true, name: true, role: true },
  });

  await setSessionCookie({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role as UserRole,
  });

  // Guides land on the application form; travellers on search.
  redirect(safeNext(formData.get("next"), role === "GUIDE" ? "/become-a-guide" : "/guides"));
}

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const t = getDictionary(await getLocale());

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return failure(t.errors.invalidInput, fieldErrors(parsed.error));

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, email: true, name: true, role: true, passwordHash: true },
  });

  // Same message either way so the form cannot be used to enumerate accounts.
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return failure(t.errors.invalidCredentials);
  }

  await setSessionCookie({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role as UserRole,
  });

  const fallback =
    user.role === "ADMIN" ? "/admin" : user.role === "GUIDE" ? "/guide/dashboard" : "/dashboard";
  redirect(safeNext(formData.get("next"), fallback));
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect("/");
}
