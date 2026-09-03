import { z } from "zod";
import {
  CITIES,
  CURRENCIES,
  GUIDE_TYPES,
  LANGUAGE_LEVELS,
  LANGUAGES,
  PRICING_MODES,
  THEMES,
} from "./constants";

const citySlugs = CITIES.map((c) => c.slug) as [string, ...string[]];
const languageCodes = LANGUAGES.map((l) => l.code) as [string, ...string[]];
const themeSlugs = THEMES.map((t) => t.slug) as [string, ...string[]];

export const signupSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters").max(200),
  role: z.enum(["TRAVELER", "GUIDE"]),
  country: z.string().trim().max(60).optional().or(z.literal("")),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

/** Money arrives from the form as a decimal string; store minor units. */
const moneyToCents = z
  .string()
  .trim()
  .transform((v) => (v === "" ? 0 : Math.round(Number(v) * 100)))
  .refine((v) => Number.isFinite(v) && v >= 0 && v <= 100_000_000, "Enter a valid amount");

export const guideProfileSchema = z
  .object({
    city: z.enum(citySlugs, { errorMap: () => ({ message: "Pick a city" }) }),
    headline: z.string().trim().min(10, "A bit longer, please").max(120),
    bio: z.string().trim().min(80, "At least 80 characters").max(4000),
    guideType: z.enum(GUIDE_TYPES),
    pricingMode: z.enum(PRICING_MODES),
    currency: z.enum(CURRENCIES),
    hourlyRateCents: moneyToCents,
    dailyRateCents: moneyToCents,
    yearsExperience: z.coerce.number().int().min(0).max(60),
    maxGroupSize: z.coerce.number().int().min(1).max(50),
    licenseNo: z.string().trim().max(40).optional().or(z.literal("")),
    contactWechat: z.string().trim().max(60).optional().or(z.literal("")),
    contactPhone: z.string().trim().max(40).optional().or(z.literal("")),
    languages: z
      .array(
        z.object({
          code: z.enum(languageCodes),
          level: z.enum(LANGUAGE_LEVELS),
        })
      )
      .min(1, "Add at least one language")
      .max(LANGUAGES.length),
    themes: z.array(z.enum(themeSlugs)).min(1, "Pick at least one").max(THEMES.length),
    photos: z.array(z.string().trim().url("Photo links must be full URLs")).max(8),
  })
  .superRefine((value, ctx) => {
    if (value.guideType === "PROFESSIONAL" && !value.licenseNo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["licenseNo"],
        message: "Licence number is required for professional guides",
      });
    }
    if (value.pricingMode === "PAID" && value.hourlyRateCents === 0 && value.dailyRateCents === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["dailyRateCents"],
        message: "Set an hourly or a day rate",
      });
    }
  });

export type GuideProfileInput = z.infer<typeof guideProfileSchema>;

const dateString = z
  .string()
  .trim()
  .min(1, "Pick a date")
  // <input type="date"> gives YYYY-MM-DD; parse as UTC noon so a timezone shift
  // can never push the booking onto the previous day.
  .transform((v) => new Date(`${v}T12:00:00.000Z`))
  .refine((d) => !Number.isNaN(d.getTime()), "Pick a valid date");

export const bookingSchema = z
  .object({
    guideId: z.string().min(1),
    startDate: dateString,
    endDate: dateString,
    partySize: z.coerce.number().int().min(1).max(50),
    budgetCents: moneyToCents.optional(),
    message: z.string().trim().min(20, "Tell them a little more").max(4000),
  })
  .refine((v) => v.endDate >= v.startDate, {
    path: ["endDate"],
    message: "Departure cannot be before arrival",
  });

export const messageSchema = z.object({
  conversationId: z.string().min(1),
  body: z.string().trim().min(1).max(4000),
});

export const reviewSchema = z.object({
  bookingId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(10, "A sentence or two, please").max(2000),
});

export const adminDecisionSchema = z.object({
  guideId: z.string().min(1),
  decision: z.enum(["APPROVED", "REJECTED", "SUSPENDED"]),
  note: z.string().trim().max(1000).optional().or(z.literal("")),
});

export const bookingDecisionSchema = z.object({
  bookingId: z.string().min(1),
  decision: z.enum(["ACCEPTED", "DECLINED", "CANCELLED", "COMPLETED"]),
  reply: z.string().trim().max(1000).optional().or(z.literal("")),
});

/** Flatten a ZodError into `{ fieldName: firstMessage }` for form rendering. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form";
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}
