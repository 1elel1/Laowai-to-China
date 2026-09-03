import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { getT } from "@/lib/i18n-server";
import { cityLabel, formatDateTime } from "@/lib/format";
import { Avatar, Badge, BOOKING_TONE } from "@/components/ui";
import { MessageComposer } from "@/components/MessageComposer";

export const metadata: Metadata = { title: "Conversation" };

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser(`/messages/${id}`);
  const { locale, t } = await getT();

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      traveler: { select: { id: true, name: true, avatarUrl: true } },
      guideUser: { select: { id: true, name: true, avatarUrl: true } },
      guideProfile: { select: { id: true, city: true } },
      booking: { select: { id: true, status: true } },
      messages: { orderBy: { createdAt: "asc" }, take: 200 },
    },
  });

  if (!conversation) notFound();
  if (conversation.travelerId !== user.id && conversation.guideUserId !== user.id) notFound();

  // Opening the thread is what marks it read.
  await prisma.message.updateMany({
    where: { conversationId: conversation.id, senderId: { not: user.id }, readAt: null },
    data: { readAt: new Date() },
  });

  const other =
    conversation.travelerId === user.id ? conversation.guideUser : conversation.traveler;

  return (
    <div className="section max-w-3xl py-8">
      <Link href="/messages" className="link mb-4 inline-block text-sm">
        ← {t.messages.title}
      </Link>

      <div className="card flex flex-col overflow-hidden">
        <header className="flex items-center gap-3 border-b p-4">
          <Avatar name={other.name} src={other.avatarUrl} size={40} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{other.name}</p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              {cityLabel(conversation.guideProfile.city, locale)}
            </p>
          </div>
          {conversation.booking && (
            <Badge tone={BOOKING_TONE[conversation.booking.status] ?? "muted"}>
              {t.booking[`status${conversation.booking.status as "PENDING"}`] ??
                conversation.booking.status}
            </Badge>
          )}
          <Link href={`/guides/${conversation.guideProfileId}`} className="btn-ghost btn-sm">
            {t.guideDesk.viewPublic}
          </Link>
        </header>

        <div className="flex max-h-[60vh] min-h-64 flex-col gap-3 overflow-y-auto p-4">
          {conversation.messages.length === 0 ? (
            <p className="m-auto text-sm" style={{ color: "var(--muted)" }}>
              {t.messages.noMessages}
            </p>
          ) : (
            conversation.messages.map((message) => {
              const mine = message.senderId === user.id;
              return (
                <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className="max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm"
                    style={
                      mine
                        ? { backgroundColor: "var(--brand)", color: "#fff" }
                        : { backgroundColor: "var(--surface-2)", color: "var(--ink)" }
                    }
                  >
                    <p className="whitespace-pre-line">{message.body}</p>
                    <p
                      className="mt-1 text-[10px]"
                      style={{ color: mine ? "rgba(255,255,255,0.7)" : "var(--muted)" }}
                    >
                      {formatDateTime(message.createdAt, locale)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <MessageComposer conversationId={conversation.id} t={t} />
      </div>
    </div>
  );
}
