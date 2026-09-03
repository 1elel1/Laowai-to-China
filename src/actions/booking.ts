"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { bookingDecisionSchema, bookingSchema, fieldErrors } from "@/lib/validation";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { ensureConversation, postMessage } from "@/lib/conversations";
import { failure, success, type ActionState } from "./types";

export async function createBookingAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const t = getDictionary(await getLocale());

  const user = await getCurrentUser();
  if (!user) return failure(t.booking.loginRequired);

  const parsed = bookingSchema.safeParse({
    guideId: formData.get("guideId"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    partySize: formData.get("partySize") ?? "1",
    budgetCents: formData.get("budget") ?? "",
    message: formData.get("message"),
  });
  if (!parsed.success) return failure(t.errors.invalidInput, fieldErrors(parsed.error));
  const data = parsed.data;

  const guide = await prisma.guideProfile.findUnique({
    where: { id: data.guideId },
    select: { id: true, userId: true, status: true, city: true, maxGroupSize: true },
  });
  if (!guide) return failure(t.errors.notFound);
  if (guide.status !== "APPROVED") return failure(t.errors.guideNotApproved);
  if (guide.userId === user.id) return failure(t.booking.ownProfile);

  if (data.partySize > guide.maxGroupSize) {
    return failure(t.errors.invalidInput, {
      partySize: `This guide takes up to ${guide.maxGroupSize} people`,
    });
  }

  const duplicate = await prisma.bookingRequest.findFirst({
    where: { travelerId: user.id, guideId: guide.id, status: "PENDING" },
    select: { id: true },
  });
  if (duplicate) return failure(t.booking.alreadyPending);

  await prisma.$transaction(async (tx) => {
    const booking = await tx.bookingRequest.create({
      data: {
        travelerId: user.id,
        guideId: guide.id,
        city: guide.city,
        startDate: data.startDate,
        endDate: data.endDate,
        partySize: data.partySize,
        budgetCents: data.budgetCents || null,
        message: data.message,
      },
      select: { id: true },
    });

    // The request itself becomes the first message, so the guide replies in one
    // place instead of juggling a request inbox and a separate chat.
    const conversationId = await ensureConversation(tx, {
      travelerId: user.id,
      guideProfileId: guide.id,
      guideUserId: guide.userId,
      bookingId: booking.id,
    });
    await postMessage(tx, {
      conversationId,
      senderId: user.id,
      body: data.message,
    });
  });

  revalidatePath("/dashboard");
  revalidatePath("/guide/dashboard");
  revalidatePath("/messages");
  return success(t.booking.success);
}

export async function decideBookingAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = bookingDecisionSchema.safeParse({
    bookingId: formData.get("bookingId"),
    decision: formData.get("decision"),
    reply: formData.get("reply") ?? "",
  });
  if (!parsed.success) return;
  const { bookingId, decision, reply } = parsed.data;

  const booking = await prisma.bookingRequest.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      status: true,
      travelerId: true,
      guide: { select: { id: true, userId: true } },
    },
  });
  if (!booking) return;

  const isGuide = booking.guide.userId === user.id;
  const isTraveler = booking.travelerId === user.id;
  if (!isGuide && !isTraveler && user.role !== "ADMIN") return;

  // Who is allowed to move the request where.
  const allowed =
    (decision === "ACCEPTED" && isGuide && booking.status === "PENDING") ||
    (decision === "DECLINED" && isGuide && booking.status === "PENDING") ||
    (decision === "CANCELLED" && isTraveler && booking.status === "PENDING") ||
    (decision === "COMPLETED" && booking.status === "ACCEPTED");
  if (!allowed) return;

  await prisma.$transaction(async (tx) => {
    await tx.bookingRequest.update({
      where: { id: booking.id },
      data: {
        status: decision,
        guideReply: reply || undefined,
        respondedAt: new Date(),
      },
    });

    if (reply) {
      const conversationId = await ensureConversation(tx, {
        travelerId: booking.travelerId,
        guideProfileId: booking.guide.id,
        guideUserId: booking.guide.userId,
        bookingId: booking.id,
      });
      await postMessage(tx, { conversationId, senderId: user.id, body: reply });
    }
  });

  revalidatePath("/dashboard");
  revalidatePath("/guide/dashboard");
  revalidatePath("/messages");
}
