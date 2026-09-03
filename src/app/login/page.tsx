import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getT } from "@/lib/i18n-server";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "@/components/AuthForms";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const user = await getCurrentUser();
  if (user) redirect(next && next.startsWith("/") ? next : "/");

  const { t } = await getT();

  return (
    <div className="section flex justify-center py-16">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold tracking-tight">{t.auth.loginTitle}</h1>
        <p className="mb-6 mt-1 text-sm" style={{ color: "var(--muted)" }}>
          {t.auth.loginSubtitle}
        </p>

        <div className="card p-6">
          <LoginForm t={t} next={next} />
        </div>

        <p className="mt-4 text-center text-sm" style={{ color: "var(--muted)" }}>
          {t.auth.noAccount}{" "}
          <Link
            href={next ? `/signup?next=${encodeURIComponent(next)}` : "/signup"}
            className="link"
          >
            {t.auth.signupCta}
          </Link>
        </p>
      </div>
    </div>
  );
}
