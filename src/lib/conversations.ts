import "server-only";
import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "./db";

type Db = PrismaClient | Prisma.TransactionClient;

/**
 * One conversation per traveller/guide pair, reused across bookings — a
 * traveller who books the same guide twice should not lose the earlier thread.
 */
export async function ensureConversation(
  db: Db,
  params: { travelerId: string; guideProfileId: string; guideUserId: string; bookingId?: string }
): Promise<string> {
  const existing = await db.conversation.findUnique({
    where: {
      travelerId_guideProfileId: {
        travelerId: params.travelerId,
        guideProfileId: params.guideProfileId,
      },
    },
    select: { id: true, bookingId: true },
  });

  if (existing) {
    // Point the thread at the most recent booking so the chat header can show it.
    if (params.bookingId && existing.bookingId !== params.bookingId) {
      await db.conversation.update({
        where: { id: existing.id },
        data: { bookingId: params.bookingId, lastMessageAt: new Date() },
      });
    }
    return existing.id;
  }

  const created = await db.conversation.create({
    data: {
      travelerId: params.travelerId,
      guideProfileId: params.guideProfileId,
      guideUserId: params.guideUserId,
      bookingId: params.bookingId ?? null,
    },
    select: { id: true },
  });
  return created.id;
}

export async function postMessage(
  db: Db,
  params: { conversationId: string; senderId: string; body: string }
): Promise<void> {
  await db.message.create({
    data: {
      conversationId: params.conversationId,
      senderId: params.senderId,
      body: params.body,
    },
  });
  await db.conversation.update({
    where: { id: params.conversationId },
    data: { lastMessageAt: new Date() },
  });
}

/** Number of messages addressed to `userId` that they have not opened yet. */
export async function unreadCount(userId: string): Promise<number> {
  return prisma.message.count({
    where: {
      readAt: null,
      senderId: { not: userId },
      conversation: {
        OR: [{ travelerId: userId }, { guideUserId: userId }],
      },
    },
  });
}
