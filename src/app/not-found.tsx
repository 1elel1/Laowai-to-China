import Link from "next/link";
import { getT } from "@/lib/i18n-server";

export default async function NotFound() {
  const { t } = await getT();

  return (
    <div className="section flex flex-col items-center justify-center gap-4 py-32 text-center">
      <p className="text-5xl" aria-hidden>
        🧭
      </p>
      <h1 className="text-2xl font-semibold">{t.errors.notFound}</h1>
      <Link href="/" className="btn-primary btn-sm">
        {t.common.back}
      </Link>
    </div>
  );
}
