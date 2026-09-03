"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { ensureConversation, postMessage } from "@/lib/conversations";
import { fieldErrors, messageSchema } from "@/lib/validation";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { failure, success, type ActionState } from "./types";

export async function sendMessageAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const t = getDictionary(await getLocale());

  const user = await getCurrentUser();
  if (!user) return failure(t.errors.forbidden);

  const parsed = messageSchema.safeParse({
    conversationId: formData.get("conversationId"),
    body: formData.get("body"),
  });
  if (!parsed.success) return failure(t.errors.invalidInput, fieldErrors(parsed.error));

  const conversation = await prisma.conversation.findUnique({
    where: { id: parsed.data.conversationId },
    select: { id: true, travelerId: true, guideUserId: true },
  });
  if (!conversation) return failure(t.errors.notFound);
  if (conversation.travelerId !== user.id && conversation.guideUserId !== user.id) {
    return failure(t.errors.forbidden);
  }

  await postMessage(prisma, {
    conversationId: conversation.id,
    senderId: user.id,
    body: parsed.data.body,
  });

  revalidatePath(`/messages/${conversation.id}`);
  revalidatePath("/messages");
  return success();
}

/** Opens (or reuses) the thread with a guide and sends the traveller there. */
export async function startConversationAction(formData: FormData): Promise<void> {
  const guideProfileId = String(formData.get("guideProfileId") ?? "");
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/guides/${guideProfileId}`)}`);

  const guide = await prisma.guideProfile.findUnique({
    where: { id: guideProfileId },
    select: { id: true, userId: true, status: true },
  });
  if (!guide || guide.status !== "APPROVED" || guide.userId === user.id) {
    redirect(`/guides/${guideProfileId}`);
  }

  const conversationId = await ensureConversation(prisma, {
    travelerId: user.id,
    guideProfileId: guide.id,
    guideUserId: guide.userId,
  });

  redirect(`/messages/${conversationId}`);
}
