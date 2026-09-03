import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getT } from "@/lib/i18n-server";
import { unreadCount } from "@/lib/conversations";
import { logoutAction } from "@/actions/auth";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { Avatar, Logo } from "./ui";

export async function SiteHeader() {
  const { locale, t } = await getT();
  const user = await getCurrentUser();
  const unread = user ? await unreadCount(user.id) : 0;

  const primaryLinks = [
    { href: "/guides", label: t.nav.findGuides },
    { href: "/#how-it-works", label: t.nav.howItWorks },
    { href: "/become-a-guide", label: t.nav.becomeGuide },
  ];

  return (
    <header
      className="sticky top-0 z-40 border-b backdrop-blur"
      style={{ backgroundColor: "color-mix(in oklab, var(--bg) 88%, transparent)" }}
    >
      <div className="section flex h-16 items-center gap-3 sm:gap-6">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          {primaryLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm transition-colors hover:bg-surface-2"
              style={{ color: "var(--ink-soft)" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <LocaleSwitcher locale={locale} />

          {user ? (
            <>
              <Link href="/messages" className="btn-ghost btn-sm relative" aria-label={t.nav.messages}>
                <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4L3 21l1.1-3.7A8.4 8.4 0 1 1 21 11.5Z" />
                </svg>
                <span className="hidden sm:inline">{t.nav.messages}</span>
                {unread > 0 && (
                  <span
                    className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] font-bold text-white"
                    style={{ backgroundColor: "var(--accent)" }}
                  >
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </Link>

              {/* <details> keeps the account menu working without client JS. */}
              <details className="relative">
                <summary className="btn-ghost btn-sm cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                  <Avatar name={user.name} src={user.avatarUrl} size={26} />
                  <span className="hidden max-w-28 truncate sm:inline">{user.name}</span>
                </summary>
                <div
                  className="card absolute right-0 mt-2 w-56 overflow-hidden p-1 shadow-lg"
                  style={{ backgroundColor: "var(--surface)" }}
                >
                  <MenuLink href="/dashboard">{t.nav.dashboard}</MenuLink>
                  {(user.role === "GUIDE" || user.guideProfileId) && (
                    <MenuLink href="/guide/dashboard">{t.nav.guideDashboard}</MenuLink>
                  )}
                  {user.role === "ADMIN" && <MenuLink href="/admin">{t.nav.admin}</MenuLink>}
                  <div className="my-1 border-t" />
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className="w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-surface-2"
                      style={{ color: "var(--danger)" }}
                    >
                      {t.nav.logout}
                    </button>
                  </form>
                </div>
              </details>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost btn-sm">
                {t.nav.login}
              </Link>
              <Link href="/signup" className="btn-primary btn-sm">
                {t.nav.signup}
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Primary nav collapses to a scrollable strip rather than a hamburger. */}
      <div className="no-scrollbar flex gap-1 overflow-x-auto border-t px-4 py-2 md:hidden">
        {primaryLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="shrink-0 rounded-lg px-3 py-1.5 text-sm"
            style={{ color: "var(--ink-soft)" }}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </header>
  );
}

function MenuLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block rounded-md px-3 py-2 text-sm transition-colors hover:bg-surface-2"
    >
      {children}
    </Link>
  );
}
