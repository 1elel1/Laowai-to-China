import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { getT } from "@/lib/i18n-server";
import { relativeTime } from "@/lib/format";
import { Avatar, EmptyState, SectionHeading } from "@/components/ui";

export const metadata: Metadata = { title: "Messages" };

export default async function MessagesPage() {
  const user = await requireUser("/messages");
  const { locale, t } = await getT();

  const conversations = await prisma.conversation.findMany({
    where: { OR: [{ travelerId: user.id }, { guideUserId: user.id }] },
    orderBy: { lastMessageAt: "desc" },
    include: {
      traveler: { select: { id: true, name: true, avatarUrl: true } },
      guideUser: { select: { id: true, name: true, avatarUrl: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: {
        select: { messages: { where: { readAt: null, senderId: { not: user.id } } } },
      },
    },
  });

  return (
    <div className="section max-w-3xl py-12">
      <SectionHeading title={t.messages.title} />

      {conversations.length === 0 ? (
        <EmptyState
          title={t.messages.empty}
          hint={t.messages.emptyHint}
          action={
            <Link href="/guides" className="btn-primary btn-sm">
              {t.nav.findGuides}
            </Link>
          }
        />
      ) : (
        <ul className="space-y-2">
          {conversations.map((conversation) => {
            const other =
              conversation.travelerId === user.id ? conversation.guideUser : conversation.traveler;
            const last = conversation.messages[0];
            const unread = conversation._count.messages;

            return (
              <li key={conversation.id}>
                <Link
                  href={`/messages/${conversation.id}`}
                  className="card flex items-center gap-3 p-4 transition-colors hover:bg-surface-2"
                >
                  <Avatar name={other.name} src={other.avatarUrl} size={42} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="truncate font-medium">{other.name}</p>
                      <span className="shrink-0 text-xs" style={{ color: "var(--muted)" }}>
                        {relativeTime(conversation.lastMessageAt, locale)}
                      </span>
                    </div>
                    <p className="truncate text-sm" style={{ color: "var(--muted)" }}>
                      {last?.body ?? t.messages.noMessages}
                    </p>
                  </div>
                  {unread > 0 && (
                    <span
                      className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full px-1.5 text-xs font-bold text-white"
                      style={{ backgroundColor: "var(--accent)" }}
                    >
                      {unread}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
