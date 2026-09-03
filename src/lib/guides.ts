import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "./db";
import { PAGE_SIZE } from "./constants";

export type GuideSearchParams = {
  q?: string;
  city?: string;
  lang?: string;
  themes?: string[];
  type?: string;
  pricing?: string;
  maxDaily?: number;
  minRating?: number;
  sort?: string;
  page?: number;
};

/** The projection every guide card needs — kept in one place so list and
 *  featured queries cannot drift apart. */
export const guideCardSelect = {
  id: true,
  city: true,
  headline: true,
  guideType: true,
  pricingMode: true,
  hourlyRateCents: true,
  dailyRateCents: true,
  currency: true,
  yearsExperience: true,
  ratingAvg: true,
  ratingCount: true,
  maxGroupSize: true,
  user: { select: { name: true, avatarUrl: true } },
  languages: { select: { code: true, level: true } },
  themes: { select: { slug: true } },
  photos: { select: { url: true }, orderBy: { sort: "asc" }, take: 1 },
} satisfies Prisma.GuideProfileSelect;

export type GuideCardData = Prisma.GuideProfileGetPayload<{ select: typeof guideCardSelect }>;

function orderFor(sort: string | undefined): Prisma.GuideProfileOrderByWithRelationInput[] {
  switch (sort) {
    case "rating":
      return [{ ratingAvg: "desc" }, { ratingCount: "desc" }];
    case "price_asc":
      return [{ dailyRateCents: "asc" }, { ratingAvg: "desc" }];
    case "price_desc":
      return [{ dailyRateCents: "desc" }, { ratingAvg: "desc" }];
    case "newest":
      return [{ createdAt: "desc" }];
    default:
      // "Recommended": hand-picked first, then well-reviewed.
      return [{ featured: "desc" }, { ratingAvg: "desc" }, { ratingCount: "desc" }];
  }
}

export function buildGuideWhere(params: GuideSearchParams): Prisma.GuideProfileWhereInput {
  const where: Prisma.GuideProfileWhereInput = { status: "APPROVED" };

  if (params.city) where.city = params.city;
  if (params.type) where.guideType = params.type;
  if (params.pricing) where.pricingMode = params.pricing;
  if (params.lang) where.languages = { some: { code: params.lang } };
  if (params.minRating) where.ratingAvg = { gte: params.minRating };

  // A day-rate ceiling should not hide the free and donation-based guides.
  if (params.maxDaily) {
    where.OR = [
      { dailyRateCents: { lte: params.maxDaily, gt: 0 } },
      { pricingMode: { in: ["FREE", "DONATION"] } },
    ];
  }

  // Every selected theme must match, so the filters narrow rather than widen.
  if (params.themes?.length) {
    where.AND = params.themes.map((slug) => ({ themes: { some: { slug } } }));
  }

  if (params.q) {
    const q = params.q.trim();
    if (q) {
      where.AND = [
        ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
        {
          OR: [
            { headline: { contains: q } },
            { bio: { contains: q } },
            { user: { is: { name: { contains: q } } } },
          ],
        },
      ];
    }
  }

  return where;
}

export async function searchGuides(params: GuideSearchParams) {
  const page = Math.max(1, params.page ?? 1);
  const where = buildGuideWhere(params);

  const [items, total] = await Promise.all([
    prisma.guideProfile.findMany({
      where,
      select: guideCardSelect,
      orderBy: orderFor(params.sort),
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.guideProfile.count({ where }),
  ]);

  return { items, total, page, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function featuredGuides(take = 6): Promise<GuideCardData[]> {
  return prisma.guideProfile.findMany({
    where: { status: "APPROVED" },
    select: guideCardSelect,
    orderBy: [{ featured: "desc" }, { ratingAvg: "desc" }, { ratingCount: "desc" }],
    take,
  });
}

/** Cities that actually have live guides, with counts, for the home page. */
export async function cityCounts(): Promise<Map<string, number>> {
  const rows = await prisma.guideProfile.groupBy({
    by: ["city"],
    where: { status: "APPROVED" },
    _count: { _all: true },
  });
  return new Map(rows.map((r) => [r.city, r._count._all]));
}
