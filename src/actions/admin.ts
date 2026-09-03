"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { adminDecisionSchema } from "@/lib/validation";

export async function decideGuideAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return;

  const parsed = adminDecisionSchema.safeParse({
    guideId: formData.get("guideId"),
    decision: formData.get("decision"),
    note: formData.get("note") ?? "",
  });
  if (!parsed.success) return;

  const { guideId, decision, note } = parsed.data;

  await prisma.guideProfile.update({
    where: { id: guideId },
    data: {
      status: decision,
      reviewNote: note || null,
      reviewedAt: new Date(),
    },
  });

  revalidatePath("/admin");
  revalidatePath("/guides");
  revalidatePath(`/guides/${guideId}`);
}

/** Puts a suspended or rejected guide back into the review queue. */
export async function reinstateGuideAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return;

  const guideId = String(formData.get("guideId") ?? "");
  if (!guideId) return;

  await prisma.guideProfile.update({
    where: { id: guideId },
    data: { status: "APPROVED", reviewNote: null, reviewedAt: new Date() },
  });

  revalidatePath("/admin");
  revalidatePath("/guides");
}
