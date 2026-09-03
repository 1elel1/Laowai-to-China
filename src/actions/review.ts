"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { fieldErrors, reviewSchema } from "@/lib/validation";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { failure, success, type ActionState } from "./types";

export async function createReviewAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const t = getDictionary(await getLocale());

  const user = await getCurrentUser();
  if (!user) return failure(t.errors.forbidden);

  const parsed = reviewSchema.safeParse({
    bookingId: formData.get("bookingId"),
    rating: formData.get("rating"),
    comment: formData.get("comment"),
  });
  if (!parsed.success) return failure(t.errors.invalidInput, fieldErrors(parsed.error));

  const booking = await prisma.bookingRequest.findUnique({
    where: { id: parsed.data.bookingId },
    select: { id: true, travelerId: true, guideId: true, status: true, review: { select: { id: true } } },
  });

  // Only the traveller, only once, and only after the trip actually happened.
  if (!booking || booking.travelerId !== user.id) return failure(t.errors.forbidden);
  if (booking.status !== "COMPLETED") return failure(t.errors.forbidden);
  if (booking.review) return failure(t.errors.forbidden);

  await prisma.$transaction(async (tx) => {
    await tx.review.create({
      data: {
        bookingId: booking.id,
        authorId: user.id,
        guideId: booking.guideId,
        rating: parsed.data.rating,
        comment: parsed.data.comment,
      },
    });

    // Recompute from scratch rather than folding into the running average, so a
    // deleted review can never leave the aggregate wrong.
    const stats = await tx.review.aggregate({
      where: { guideId: booking.guideId },
      _avg: { rating: true },
      _count: { _all: true },
    });
    await tx.guideProfile.update({
      where: { id: booking.guideId },
      data: {
        ratingAvg: stats._avg.rating ?? 0,
        ratingCount: stats._count._all,
      },
    });
  });

  revalidatePath("/dashboard");
  revalidatePath(`/guides/${booking.guideId}`);
  return success();
}
