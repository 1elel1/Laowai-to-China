import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getT } from "@/lib/i18n-server";
import { getCurrentUser } from "@/lib/auth";
import { SignupForm } from "@/components/AuthForms";

export const metadata: Metadata = { title: "Sign up" };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; role?: string }>;
}) {
  const { next, role } = await searchParams;
  const user = await getCurrentUser();
  if (user) redirect(next && next.startsWith("/") ? next : "/");

  const { t } = await getT();

  return (
    <div className="section flex justify-center py-16">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-semibold tracking-tight">{t.auth.signupTitle}</h1>
        <p className="mb-6 mt-1 text-sm" style={{ color: "var(--muted)" }}>
          {t.auth.signupSubtitle}
        </p>

        <div className="card p-6">
          <SignupForm t={t} next={next} defaultRole={role === "GUIDE" ? "GUIDE" : "TRAVELER"} />
        </div>

        <p className="mt-4 text-center text-sm" style={{ color: "var(--muted)" }}>
          {t.auth.haveAccount}{" "}
          <Link href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"} className="link">
            {t.auth.loginCta}
          </Link>
        </p>
      </div>
    </div>
  );
}
