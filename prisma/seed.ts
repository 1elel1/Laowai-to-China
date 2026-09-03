/**
 * Demo data so a fresh clone has something to look at.
 *
 *   npm run db:seed        (or `npm run db:reset` to wipe first)
 *
 * Everything here is fictional. Photos come from picsum.photos, which serves a
 * deterministic image per seed string, so the pages look populated without
 * committing binaries.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PASSWORD = "password123";

type SeedGuide = {
  name: string;
  email: string;
  city: string;
  headline: string;
  bio: string;
  guideType: "PROFESSIONAL" | "LOCAL_FRIEND";
  pricingMode: "PAID" | "FREE" | "DONATION";
  hourly: number;
  daily: number;
  years: number;
  licenseNo?: string;
  maxGroupSize: number;
  languages: [string, "NATIVE" | "FLUENT" | "CONVERSATIONAL"][];
  themes: string[];
  status?: "APPROVED" | "PENDING" | "REJECTED";
  featured?: boolean;
  wechat?: string;
  phone?: string;
};

const GUIDES: SeedGuide[] = [
  {
    name: "Li Wei",
    email: "liwei@example.com",
    city: "beijing",
    headline: "Hutong mornings, Peking duck evenings — 11 years of the same walk, never the same day",
    bio: `I grew up in a courtyard house two streets from Nanluoguxiang, back when it was still mostly bicycle repair shops. I have watched that neighbourhood turn into something else entirely, and I can show you both versions of it.

A normal day with me starts early — 7am, because that is when the old men bring their birds out and the breakfast stalls are still frying youtiao. We walk. I do not put people on tour buses. If your legs hold out we cover about eight kilometres, with a long sit-down lunch in the middle.

I have a licence and I have done the Forbidden City ten thousand times, so I am happy to do it properly with all the history. But if you would rather skip it and spend the day eating, that is genuinely fine with me.`,
    guideType: "PROFESSIONAL",
    pricingMode: "PAID",
    hourly: 18000,
    daily: 95000,
    years: 11,
    licenseNo: "D-11-2014-0038421",
    maxGroupSize: 6,
    languages: [
      ["en", "FLUENT"],
      ["ja", "CONVERSATIONAL"],
    ],
    themes: ["history", "food", "architecture", "photography"],
    featured: true,
    wechat: "liwei_bj_guide",
    phone: "+86 138 0013 8000",
  },
  {
    name: "Zhang Mei",
    email: "zhangmei@example.com",
    city: "chengdu",
    headline: "Teahouses, mahjong and the hotpot places with no English menu",
    bio: `I am a retired high school English teacher. My daughter set this up for me because she got tired of me adopting backpackers at the bus station.

I do not do pandas. Everyone does pandas, you can book that anywhere. What I do is the People's Park teahouse at 9am, the ear-cleaning man, the matchmaking corner where parents advertise their children on laminated sheets, and then lunch somewhere you would never walk into on your own.

I speak slowly and clearly, which people tell me is useful. I will also correct your Chinese tones if you want me to, and I will not if you do not.`,
    guideType: "LOCAL_FRIEND",
    pricingMode: "DONATION",
    hourly: 0,
    daily: 0,
    years: 4,
    maxGroupSize: 4,
    languages: [
      ["en", "FLUENT"],
      ["fr", "CONVERSATIONAL"],
    ],
    themes: ["tea", "food", "markets", "family"],
    featured: true,
    wechat: "teacher_zhang_cd",
  },
  {
    name: "Chen Hao",
    email: "chenhao@example.com",
    city: "shanghai",
    headline: "Art districts, speakeasies and the parts of the Bund nobody photographs",
    bio: `Architecture graduate, six years working in a gallery on West Bund, now doing this most days.

Shanghai gets sold as a skyline. That is the least interesting thing about it. The interesting thing is that you can walk from a 1920s Sassoon building into a Soviet-era workers' block into a converted slaughterhouse in about twenty minutes, and I know the route.

Evening tours are my speciality. I know which bars are worth the queue and which are Instagram traps. I will not take you to anywhere with a neon sign in English.`,
    guideType: "LOCAL_FRIEND",
    pricingMode: "PAID",
    hourly: 22000,
    daily: 120000,
    years: 6,
    maxGroupSize: 5,
    languages: [
      ["en", "NATIVE"],
      ["de", "CONVERSATIONAL"],
    ],
    themes: ["art", "architecture", "nightlife", "photography"],
    featured: true,
    wechat: "haochen_sh",
    phone: "+86 139 0021 4455",
  },
  {
    name: "Wang Jing",
    email: "wangjing@example.com",
    city: "xian",
    headline: "Licensed Terracotta Army guide who will also take you to the Muslim Quarter properly",
    bio: `Fifteen years, mostly at the Terracotta Warriors site. I can tell you which pit is worth your time and which one you can walk through in four minutes, which saves you about an hour of standing.

The other half of what I do is the Muslim Quarter. Most groups get walked down the main drag and fed the same three things. There are about nine lanes off that street and the food gets better the further you go.

I work with families a lot. I am patient with children and I know where every clean toilet in the old city is, which matters more than any of the history.`,
    guideType: "PROFESSIONAL",
    pricingMode: "PAID",
    hourly: 15000,
    daily: 78000,
    years: 15,
    licenseNo: "D-61-2010-0011203",
    maxGroupSize: 10,
    languages: [
      ["en", "FLUENT"],
      ["es", "CONVERSATIONAL"],
      ["ru", "CONVERSATIONAL"],
    ],
    themes: ["history", "food", "family", "temples"],
    wechat: "wangjing_xa",
    phone: "+86 137 0092 1188",
  },
  {
    name: "Sun Yu",
    email: "sunyu@example.com",
    city: "guilin",
    headline: "Karst hikes and river villages — free, I just like the walk",
    bio: `I work remotely as a translator and I hike every weekend anyway. If you want to come along you are welcome, I do not charge for it.

The Li River cruise is fine but it is a boat full of people looking at their phones. The better version is the Yangshuo-to-Xingping walk along the bank, which takes most of a day and passes through four villages where nobody is selling anything.

Bring proper shoes. I will not take you if you turn up in flip flops, I have learned that lesson.`,
    guideType: "LOCAL_FRIEND",
    pricingMode: "FREE",
    hourly: 0,
    daily: 0,
    years: 3,
    maxGroupSize: 3,
    languages: [
      ["en", "NATIVE"],
      ["ko", "CONVERSATIONAL"],
    ],
    themes: ["nature", "photography", "markets"],
    wechat: "sunyu_hikes",
  },
  {
    name: "Liu Fang",
    email: "liufang@example.com",
    city: "hangzhou",
    headline: "Tea farms in the hills above West Lake, with the farmers who actually grow it",
    bio: `My family has grown Longjing in Meijiawu for three generations. I do not run a tea shop and I am not going to sell you anything — my cousin will make you tea and you can buy some if you like it or not if you do not.

The lake is beautiful and completely overrun. I take people up into the hills behind it instead, where the terraces are, and we come down to the lake in the late afternoon when the day-trippers have gone.

I am happy to do a proper tasting and explain the grades, or we can just walk and drink tea without any of that.`,
    guideType: "LOCAL_FRIEND",
    pricingMode: "PAID",
    hourly: 12000,
    daily: 60000,
    years: 5,
    maxGroupSize: 6,
    languages: [["en", "FLUENT"]],
    themes: ["tea", "nature", "food"],
    wechat: "liufang_tea",
  },
  {
    name: "Zhao Lin",
    email: "zhaolin@example.com",
    city: "shanghai",
    headline: "Business interpreting and factory visits — Yangtze Delta, same-day travel",
    bio: `I do commercial work: trade fairs, supplier audits, factory floor walkthroughs, contract meetings. Ten years of it, mostly for European buyers in textiles and electronics.

This is not sightseeing. I will read the room, tell you afterwards what was actually said versus what was translated, and flag when a price is being tested on you. I have sat through enough of these to know the patterns.

I can travel to Suzhou, Ningbo, Yiwu and Wenzhou at a day's notice. Rates are per day including travel time.`,
    guideType: "PROFESSIONAL",
    pricingMode: "PAID",
    hourly: 45000,
    daily: 280000,
    years: 10,
    licenseNo: "D-31-2015-0044901",
    maxGroupSize: 4,
    languages: [
      ["en", "NATIVE"],
      ["it", "FLUENT"],
    ],
    themes: ["business", "logistics"],
    wechat: "zhaolin_interp",
    phone: "+86 136 8800 2211",
  },
  {
    name: "Yang Xiaoyu",
    email: "yangxiaoyu@example.com",
    city: "beijing",
    headline: "Hospital and clinic escort — appointments, paperwork, pharmacy, the whole day",
    bio: `I spent seven years as a nurse at a Beijing hospital and now I help foreign patients get through the system.

The Chinese hospital process is not hard, it is just completely unlike what you are used to: you register, you queue, you pay before every step, and the signage assumes you already know how it works. Alone it can eat a whole day. With someone who knows the building it is usually two hours.

I will book the appointment, come with you, translate with the doctor, explain the prescription properly, and check the pharmacy gave you what was written. I do not give medical advice — that is the doctor's job, not mine.`,
    guideType: "LOCAL_FRIEND",
    pricingMode: "PAID",
    hourly: 16000,
    daily: 88000,
    years: 7,
    maxGroupSize: 2,
    languages: [
      ["en", "FLUENT"],
      ["ja", "FLUENT"],
    ],
    themes: ["medical", "logistics"],
    wechat: "xiaoyu_care",
    phone: "+86 135 2200 7788",
  },
  {
    name: "Xu Peng",
    email: "xupeng@example.com",
    city: "chongqing",
    headline: "The vertical city — stairs, cable cars, and hotpot that will genuinely hurt",
    bio: `Chongqing does not make sense on a map. Streets stack on top of each other, a building's first floor and its twentieth floor can both be at ground level, and your navigation app will lie to you constantly.

I do a route that uses every kind of transport the city has: the monorail through the apartment block, the cable car over the river, the cliff lifts, and a lot of stairs. It is not accessible, I am sorry to say — there is no version of this that avoids stairs.

Hotpot at the end. I will order you the mild one if you ask, but I will look at you differently.`,
    guideType: "LOCAL_FRIEND",
    pricingMode: "PAID",
    hourly: 10000,
    daily: 52000,
    years: 2,
    maxGroupSize: 8,
    languages: [["en", "FLUENT"]],
    themes: ["food", "photography", "architecture", "logistics"],
    wechat: "xupeng_cq",
  },
  {
    name: "Gao Ning",
    email: "gaoning@example.com",
    city: "harbin",
    headline: "Ice festival, Russian quarter, and how to not be cold for twelve hours",
    bio: `Born here, never left, genuinely like the winter. December to February is my season.

The Ice and Snow World is worth it but almost everyone does it wrong — they arrive at dusk with the crowds and leave after ninety minutes because they are freezing. I will tell you exactly what to wear, when to arrive, and where the warm-up rooms are, and you will last the whole evening.

The rest of the year I do the Russian architecture on Zhongyang Street and the Songhua river, which nobody comes for and which is lovely.`,
    guideType: "PROFESSIONAL",
    pricingMode: "PAID",
    hourly: 13000,
    daily: 68000,
    years: 8,
    licenseNo: "D-23-2017-0007712",
    maxGroupSize: 8,
    languages: [
      ["en", "FLUENT"],
      ["ru", "FLUENT"],
    ],
    themes: ["photography", "architecture", "family", "history"],
    wechat: "gaoning_hrb",
  },
  {
    name: "Deng Xia",
    email: "dengxia@example.com",
    city: "kunming",
    headline: "Markets, mushrooms and day trips into Yunnan's villages",
    bio: `Kunming is a base, not a destination — I say that as someone who loves it. The city gets you a mild afternoon, a very good flower market, and the best mushrooms in the country during the summer.

What I actually do is the day trips: Shilin, Jianshui, the terraces at Yuanyang if you have two days. I drive, so you are not dealing with the bus stations.

I am a mushroom obsessive. If you come in July or August I will take you to the wild mushroom market at 6am and it will be the strangest and best thing you do in China.`,
    guideType: "LOCAL_FRIEND",
    pricingMode: "PAID",
    hourly: 11000,
    daily: 58000,
    years: 4,
    maxGroupSize: 4,
    languages: [
      ["en", "FLUENT"],
      ["th", "CONVERSATIONAL"],
    ],
    themes: ["food", "markets", "nature", "photography"],
    wechat: "dengxia_km",
  },
  {
    name: "Feng Lei",
    email: "fenglei@example.com",
    city: "suzhou",
    headline: "Classical gardens without the crowds, plus the silk workshops still operating",
    bio: `Landscape architecture background. The gardens are the reason people come to Suzhou and most visitors see them at exactly the wrong time of day, shoulder to shoulder.

There are nine on the UNESCO list. Two of them are almost always quiet. I will take you to those first thing, explain what you are actually looking at — the borrowed scenery, the sightlines, why a window is where it is — and then we do the canals in the afternoon.

I also know two silk workshops that still do things by hand and let people watch. No sales pressure, they are not set up for tourists.`,
    guideType: "PROFESSIONAL",
    pricingMode: "PAID",
    hourly: 14000,
    daily: 72000,
    years: 9,
    licenseNo: "D-32-2016-0025508",
    maxGroupSize: 6,
    languages: [
      ["en", "FLUENT"],
      ["ja", "CONVERSATIONAL"],
    ],
    themes: ["history", "art", "architecture", "photography"],
    wechat: "fenglei_sz",
  },
  {
    name: "Ma Tao",
    email: "matao@example.com",
    city: "xiamen",
    headline: "Gulangyu at dawn, seafood at midnight, Hakka roundhouses in between",
    bio: `Islander. I do Gulangyu properly, which means the first ferry at 7am before the day crowds land, when the piano museum is empty and the old villas are quiet.

The other thing I run is the Tulou trip — the Hakka earthen roundhouses inland. It is a long drive and worth every minute. We stay for lunch with a family who still live in one.

Seafood in the evening at the night market. Point at things in tanks. I will tell you what is good and what is expensive for no reason.`,
    guideType: "LOCAL_FRIEND",
    pricingMode: "PAID",
    hourly: 12000,
    daily: 62000,
    years: 3,
    maxGroupSize: 6,
    languages: [
      ["en", "FLUENT"],
      ["id", "CONVERSATIONAL"],
    ],
    themes: ["food", "architecture", "nature", "photography"],
    wechat: "matao_xm",
  },
  {
    name: "Guo Qian",
    email: "guoqian@example.com",
    city: "beijing",
    headline: "University campus visits and student life for prospective applicants",
    bio: `PhD student at Tsinghua. I do campus visits for families looking at Chinese universities — Tsinghua, Peking, Renmin, BFSU.

This is a practical service, not a tour. We walk the campus, I show you the dorms and the canteens, we talk to a couple of current international students, and I answer the questions the admissions office does not answer honestly: what the workload is really like, how much Chinese you need on day one, what it costs to live per month.

I am new to this platform but I have done maybe thirty of these for friends of friends.`,
    guideType: "LOCAL_FRIEND",
    pricingMode: "DONATION",
    hourly: 0,
    daily: 0,
    years: 1,
    maxGroupSize: 5,
    languages: [
      ["en", "FLUENT"],
      ["ko", "CONVERSATIONAL"],
    ],
    themes: ["campus", "logistics"],
    status: "PENDING",
    wechat: "guoqian_thu",
  },
  {
    name: "He Yan",
    email: "heyan@example.com",
    city: "zhangjiajie",
    headline: "Avatar mountains — the trails, not the elevator queue",
    bio: `Most people spend six hours in Zhangjiajie queueing: bus queue, elevator queue, cable car queue, viewing platform queue. Then they go home and say it was crowded.

There is a hiking route up the back that takes three hours and puts you at the same views with nobody else there. It is steep. You need to be reasonably fit and you need to start at 6am.

I am a licensed mountain guide and I carry a first aid kit. If the weather turns I will call it off — the fog here comes in fast and the drop-offs are real.`,
    guideType: "PROFESSIONAL",
    pricingMode: "PAID",
    hourly: 16000,
    daily: 82000,
    years: 6,
    licenseNo: "D-43-2019-0003390",
    maxGroupSize: 6,
    languages: [["en", "FLUENT"]],
    themes: ["nature", "photography"],
    wechat: "heyan_zjj",
    phone: "+86 133 4455 6677",
  },
];

const TRAVELERS = [
  { name: "Sofia Almeida", email: "sofia@example.com", country: "Portugal" },
  { name: "Daniel Okafor", email: "daniel@example.com", country: "United Kingdom" },
  { name: "Mika Tanaka", email: "mika@example.com", country: "Japan" },
];

async function main() {
  console.log("Clearing existing data…");
  // Order matters: children before parents, since SQLite enforces the FKs.
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.review.deleteMany();
  await prisma.bookingRequest.deleteMany();
  await prisma.guidePhoto.deleteMany();
  await prisma.guideTheme.deleteMany();
  await prisma.guideLanguage.deleteMany();
  await prisma.guideProfile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@travelingmate.test";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin12345";
  await prisma.user.create({
    data: {
      name: "Platform Admin",
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 10),
      role: "ADMIN",
    },
  });
  console.log(`Admin: ${adminEmail} / ${adminPassword}`);

  const travelers = await Promise.all(
    TRAVELERS.map((traveler) =>
      prisma.user.create({
        data: { ...traveler, passwordHash, role: "TRAVELER" },
      })
    )
  );

  const guideProfiles: { id: string; userId: string; name: string }[] = [];

  for (const guide of GUIDES) {
    const status = guide.status ?? "APPROVED";
    const user = await prisma.user.create({
      data: {
        name: guide.name,
        email: guide.email,
        passwordHash,
        role: "GUIDE",
        bio: guide.headline,
      },
    });

    const profile = await prisma.guideProfile.create({
      data: {
        userId: user.id,
        city: guide.city,
        headline: guide.headline,
        bio: guide.bio,
        guideType: guide.guideType,
        pricingMode: guide.pricingMode,
        hourlyRateCents: guide.hourly,
        dailyRateCents: guide.daily,
        currency: "CNY",
        yearsExperience: guide.years,
        licenseNo: guide.licenseNo ?? null,
        maxGroupSize: guide.maxGroupSize,
        contactWechat: guide.wechat ?? null,
        contactPhone: guide.phone ?? null,
        status,
        featured: guide.featured ?? false,
        submittedAt: new Date(Date.now() - Math.random() * 60 * 24 * 3600 * 1000),
        reviewedAt: status === "APPROVED" ? new Date() : null,
        languages: {
          create: guide.languages.map(([code, level]) => ({ code, level })),
        },
        themes: {
          // Dedupe defensively — a repeated slug would trip the unique index.
          create: [...new Set(guide.themes)].map((slug) => ({ slug })),
        },
        photos: {
          create: [0, 1, 2].map((i) => ({
            url: `https://picsum.photos/seed/${guide.city}-${user.id.slice(-6)}-${i}/900/600`,
            sort: i,
          })),
        },
      },
    });

    guideProfiles.push({ id: profile.id, userId: user.id, name: guide.name });
  }

  console.log(`Created ${guideProfiles.length} guides.`);

  // ---------------------------------------------------------------- bookings
  const REVIEW_TEXTS = [
    "Easily the best day of the trip. We ate things we could never have ordered on our own and never once felt like we were on a tour.",
    "Turned up on time, adjusted the whole plan when it rained, and knew a covered market five minutes away. Completely unflappable.",
    "Honest about what was worth seeing and what was not, which saved us a wasted afternoon. Would book again without thinking about it.",
    "We had our two kids with us and it never felt like a burden. Plenty of breaks, no forced marches, and they still talk about the noodles.",
    "Patient with our terrible Chinese and happy to just sit and talk for an hour when we got tired. Felt like being shown around by a friend.",
  ];

  /** One booking, its conversation, and optionally the review that closes it. */
  async function seedBooking(opts: {
    guide: { id: string; userId: string };
    travelerId: string;
    city: string;
    status: "PENDING" | "ACCEPTED" | "DECLINED" | "COMPLETED";
    daysFromNow: number;
    rating?: number;
    reviewText?: string;
  }) {
    const start = new Date(Date.now() + opts.daysFromNow * 24 * 3600 * 1000);
    const end = new Date(start.getTime() + 2 * 24 * 3600 * 1000);

    const guideReply =
      opts.status === "ACCEPTED" || opts.status === "COMPLETED"
        ? "Yes, that is most of what I do. Let us start late morning so you can sleep in."
        : opts.status === "DECLINED"
          ? "Sorry, I am away those dates. Try me the week after."
          : null;

    const booking = await prisma.bookingRequest.create({
      data: {
        travelerId: opts.travelerId,
        guideId: opts.guide.id,
        city: opts.city,
        startDate: start,
        endDate: end,
        partySize: 2,
        budgetCents: 150000,
        message:
          "Hi! We are two of us, first time in China, arriving in the morning and completely jet-lagged. We would love a slow first day — mostly food and walking, nothing that needs booking ahead. Is that something you do?",
        status: opts.status,
        guideReply,
        respondedAt: opts.status === "PENDING" ? null : new Date(),
      },
    });

    // Conversations are unique per traveller/guide pair, so reuse an existing one.
    const existing = await prisma.conversation.findUnique({
      where: {
        travelerId_guideProfileId: {
          travelerId: opts.travelerId,
          guideProfileId: opts.guide.id,
        },
      },
      select: { id: true },
    });

    const conversationId =
      existing?.id ??
      (
        await prisma.conversation.create({
          data: {
            travelerId: opts.travelerId,
            guideProfileId: opts.guide.id,
            guideUserId: opts.guide.userId,
            bookingId: booking.id,
            lastMessageAt: new Date(),
          },
          select: { id: true },
        })
      ).id;

    await prisma.message.createMany({
      data: [
        {
          conversationId,
          senderId: opts.travelerId,
          body: booking.message,
          readAt: new Date(),
        },
        ...(guideReply
          ? [{ conversationId, senderId: opts.guide.userId, body: guideReply }]
          : []),
      ],
    });

    if (opts.status === "COMPLETED" && opts.rating) {
      await prisma.review.create({
        data: {
          bookingId: booking.id,
          authorId: opts.travelerId,
          guideId: opts.guide.id,
          rating: opts.rating,
          comment: opts.reviewText ?? REVIEW_TEXTS[0],
        },
      });
    }
  }

  // Past trips with reviews, so the ratings on every card are real numbers
  // derived from the Review table rather than made-up aggregates.
  let reviewSeed = 0;
  for (const [i, guide] of guideProfiles.entries()) {
    if (GUIDES[i].status && GUIDES[i].status !== "APPROVED") continue;

    const howMany = 1 + (i % 3);
    for (let n = 0; n < howMany; n++) {
      await seedBooking({
        guide,
        travelerId: travelers[(i + n) % travelers.length].id,
        city: GUIDES[i].city,
        status: "COMPLETED",
        daysFromNow: -30 - i * 5 - n * 9,
        rating: [5, 5, 4, 5, 4][reviewSeed % 5],
        reviewText: REVIEW_TEXTS[reviewSeed % REVIEW_TEXTS.length],
      });
      reviewSeed++;
    }
  }

  // A few live requests so the two dashboards have something in every state.
  const openStates = ["PENDING", "ACCEPTED", "PENDING", "DECLINED"] as const;
  for (const [i, status] of openStates.entries()) {
    await seedBooking({
      guide: guideProfiles[i],
      travelerId: travelers[(i + 1) % travelers.length].id,
      city: GUIDES[i].city,
      status,
      daysFromNow: 12 + i * 6,
    });
  }

  // Ratings are always recomputed from the reviews that actually exist.
  for (const guide of guideProfiles) {
    const stats = await prisma.review.aggregate({
      where: { guideId: guide.id },
      _avg: { rating: true },
      _count: { _all: true },
    });
    await prisma.guideProfile.update({
      where: { id: guide.id },
      data: { ratingAvg: stats._avg.rating ?? 0, ratingCount: stats._count._all },
    });
  }

  console.log(`Seeded. Every demo account uses the password: ${PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
