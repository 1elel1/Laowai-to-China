import Link from "next/link";
import { initials } from "@/lib/format";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2 font-semibold ${className}`}>
      <span
        aria-hidden
        className="grid h-8 w-8 place-items-center rounded-lg text-white"
        style={{ backgroundColor: "var(--brand)" }}
      >
        <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 21s-6.5-5.6-6.5-10a6.5 6.5 0 1 1 13 0c0 4.4-6.5 10-6.5 10Z" />
          <circle cx="12" cy="11" r="2.2" />
        </svg>
      </span>
      <span className="text-base tracking-tight sm:text-lg">TravelingMate</span>
    </Link>
  );
}

export function Avatar({
  name,
  src,
  size = 40,
}: {
  name: string;
  src?: string | null;
  size?: number;
}) {
  if (src) {
    return (
      // Guide avatars come from arbitrary user-supplied hosts, so a plain <img>
      // avoids having to whitelist every one of them in next.config.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      aria-hidden
      className="grid shrink-0 place-items-center rounded-full font-semibold"
      style={{
        width: size,
        height: size,
        backgroundColor: "var(--brand-soft)",
        color: "var(--brand-ink)",
        fontSize: size * 0.36,
      }}
    >
      {initials(name) || "?"}
    </span>
  );
}

export function Stars({
  value,
  count,
  size = 14,
  label,
}: {
  value: number;
  count?: number;
  size?: number;
  label?: string;
}) {
  const rounded = Math.round(value * 2) / 2;
  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <span className="inline-flex" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => (
          <svg
            key={i}
            width={size}
            height={size}
            viewBox="0 0 20 20"
            style={{ color: i <= rounded ? "var(--accent)" : "var(--line)" }}
            fill="currentColor"
          >
            <path d="M10 1.6l2.5 5.3 5.7.8-4.1 4 1 5.7-5.1-2.7-5.1 2.7 1-5.7-4.1-4 5.7-.8z" />
          </svg>
        ))}
      </span>
      {count !== undefined && (
        <span style={{ color: "var(--muted)" }}>
          {value > 0 ? value.toFixed(1) : "—"}
          {count > 0 && ` (${count}${label ? ` ${label}` : ""})`}
        </span>
      )}
    </span>
  );
}

type Tone = "brand" | "ok" | "warn" | "danger" | "muted" | "accent";

const TONE_STYLE: Record<Tone, { backgroundColor: string; color: string }> = {
  brand: { backgroundColor: "var(--brand-soft)", color: "var(--brand-ink)" },
  ok: { backgroundColor: "var(--ok-soft)", color: "var(--ok)" },
  warn: { backgroundColor: "var(--warn-soft)", color: "var(--warn)" },
  danger: { backgroundColor: "var(--danger-soft)", color: "var(--danger)" },
  muted: { backgroundColor: "var(--surface-2)", color: "var(--ink-soft)" },
  accent: { backgroundColor: "var(--accent-soft)", color: "var(--accent)" },
};

export function Badge({
  children,
  tone = "muted",
}: {
  children: React.ReactNode;
  tone?: Tone;
}) {
  return (
    <span className="badge" style={TONE_STYLE[tone]}>
      {children}
    </span>
  );
}

export const BOOKING_TONE: Record<string, Tone> = {
  PENDING: "warn",
  ACCEPTED: "ok",
  DECLINED: "muted",
  CANCELLED: "muted",
  COMPLETED: "brand",
};

export const GUIDE_STATUS_TONE: Record<string, Tone> = {
  DRAFT: "muted",
  PENDING: "warn",
  APPROVED: "ok",
  REJECTED: "danger",
  SUSPENDED: "danger",
};

export function EmptyState({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-14 text-center">
      <p className="text-sm font-medium">{title}</p>
      {hint && (
        <p className="max-w-sm text-sm" style={{ color: "var(--muted)" }}>
          {hint}
        </p>
      )}
      {action}
    </div>
  );
}

export function FormBanner({ ok, message }: { ok: boolean; message: string }) {
  return (
    <div
      role="status"
      className="rounded-lg px-3 py-2.5 text-sm"
      style={
        ok
          ? { backgroundColor: "var(--ok-soft)", color: "var(--ok)" }
          : { backgroundColor: "var(--danger-soft)", color: "var(--danger)" }
      }
    >
      {message}
    </div>
  );
}

export function SectionHeading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
