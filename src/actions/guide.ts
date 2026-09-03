"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { fieldErrors, guideProfileSchema } from "@/lib/validation";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { CITY_BY_SLUG, LANGUAGES } from "@/lib/constants";
import { failure, success, type ActionState } from "./types";

/**
 * Handles both "save draft" and "submit for review" — the only difference is
 * the status transition at the end, so splitting them would duplicate the
 * whole parse-and-upsert body.
 */
export async function saveGuideProfileAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const locale = await getLocale();
  const t = getDictionary(locale);

  const user = await getCurrentUser();
  if (!user) return failure(t.errors.forbidden);

  // Languages arrive as one select per language code; "" means "not spoken".
  const languages = LANGUAGES.map((l) => ({
    code: l.code,
    level: String(formData.get(`lang_${l.code}`) ?? ""),
  })).filter((l) => l.level !== "");

  const photos = String(formData.get("photos") ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const parsed = guideProfileSchema.safeParse({
    city: formData.get("city"),
    headline: formData.get("headline"),
    bio: formData.get("bio"),
    guideType: formData.get("guideType"),
    pricingMode: formData.get("pricingMode"),
    currency: formData.get("currency"),
    hourlyRateCents: formData.get("hourlyRate") ?? "",
    dailyRateCents: formData.get("dailyRate") ?? "",
    yearsExperience: formData.get("yearsExperience") ?? "0",
    maxGroupSize: formData.get("maxGroupSize") ?? "4",
    licenseNo: formData.get("licenseNo") ?? "",
    contactWechat: formData.get("contactWechat") ?? "",
    contactPhone: formData.get("contactPhone") ?? "",
    languages,
    themes: formData.getAll("themes").map(String),
    photos,
  });

  if (!parsed.success) return failure(t.errors.invalidInput, fieldErrors(parsed.error));
  const data = parsed.data;

  const submitting = formData.get("intent") === "submit";
  const existing = await prisma.guideProfile.findUnique({
    where: { userId: user.id },
    select: { id: true, status: true },
  });

  // An approved profile stays live through small edits; anything else that is
  // being submitted goes back into the review queue.
  const nextStatus = submitting
    ? existing?.status === "APPROVED"
      ? "APPROVED"
      : "PENDING"
    : (existing?.status ?? "DRAFT");

  const common = {
    city: data.city,
    cityZh: CITY_BY_SLUG.get(data.city)?.zh ?? null,
    headline: data.headline,
    bio: data.bio,
    guideType: data.guideType,
    pricingMode: data.pricingMode,
    currency: data.currency,
    // FREE guides should never carry a stale rate from an earlier draft.
    hourlyRateCents: data.pricingMode === "PAID" ? data.hourlyRateCents : 0,
    dailyRateCents: data.pricingMode === "PAID" ? data.dailyRateCents : 0,
    yearsExperience: data.yearsExperience,
    maxGroupSize: data.maxGroupSize,
    licenseNo: data.licenseNo || null,
    contactWechat: data.contactWechat || null,
    contactPhone: data.contactPhone || null,
    status: nextStatus,
    submittedAt: submitting ? new Date() : undefined,
    reviewNote: submitting && nextStatus === "PENDING" ? null : undefined,
  };

  await prisma.$transaction(async (tx) => {
    const profile = await tx.guideProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...common },
      update: common,
      select: { id: true },
    });

    // The child rows are small and always rewritten wholesale — diffing them
    // would cost more code than it saves queries.
    await tx.guideLanguage.deleteMany({ where: { guideId: profile.id } });
    await tx.guideTheme.deleteMany({ where: { guideId: profile.id } });
    await tx.guidePhoto.deleteMany({ where: { guideId: profile.id } });

    await tx.guideLanguage.createMany({
      data: data.languages.map((l) => ({ guideId: profile.id, code: l.code, level: l.level })),
    });
    await tx.guideTheme.createMany({
      data: data.themes.map((slug) => ({ guideId: profile.id, slug })),
    });
    if (data.photos.length) {
      await tx.guidePhoto.createMany({
        data: data.photos.map((url, i) => ({ guideId: profile.id, url, sort: i })),
      });
    }

    if (user.role === "TRAVELER") {
      await tx.user.update({ where: { id: user.id }, data: { role: "GUIDE" } });
    }
  });

  revalidatePath("/become-a-guide");
  revalidatePath("/guide/dashboard");
  revalidatePath("/guides");

  // An already-live profile was edited, not resubmitted — say so.
  return success(
    submitting && nextStatus === "PENDING" ? t.apply.successSubmitted : t.apply.successSaved
  );
}
