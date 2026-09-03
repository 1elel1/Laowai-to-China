// Single source of truth for the string-typed "enums" in the Prisma schema.
// The schema stays portable (SQLite has no enums), the app stays type-safe.

export const USER_ROLES = ["TRAVELER", "GUIDE", "ADMIN"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const GUIDE_STATUSES = [
  "DRAFT",
  "PENDING",
  "APPROVED",
  "REJECTED",
  "SUSPENDED",
] as const;
export type GuideStatus = (typeof GUIDE_STATUSES)[number];

export const GUIDE_TYPES = ["PROFESSIONAL", "LOCAL_FRIEND"] as const;
export type GuideType = (typeof GUIDE_TYPES)[number];

export const PRICING_MODES = ["PAID", "FREE", "DONATION"] as const;
export type PricingMode = (typeof PRICING_MODES)[number];

export const LANGUAGE_LEVELS = ["NATIVE", "FLUENT", "CONVERSATIONAL"] as const;
export type LanguageLevel = (typeof LANGUAGE_LEVELS)[number];

export const BOOKING_STATUSES = [
  "PENDING",
  "ACCEPTED",
  "DECLINED",
  "CANCELLED",
  "COMPLETED",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

// ---------------------------------------------------------------------------
// Reference data
// ---------------------------------------------------------------------------

export type City = { slug: string; en: string; zh: string; province: string };

export const CITIES: City[] = [
  { slug: "beijing", en: "Beijing", zh: "北京", province: "Beijing" },
  { slug: "shanghai", en: "Shanghai", zh: "上海", province: "Shanghai" },
  { slug: "xian", en: "Xi'an", zh: "西安", province: "Shaanxi" },
  { slug: "chengdu", en: "Chengdu", zh: "成都", province: "Sichuan" },
  { slug: "chongqing", en: "Chongqing", zh: "重庆", province: "Chongqing" },
  { slug: "guilin", en: "Guilin", zh: "桂林", province: "Guangxi" },
  { slug: "hangzhou", en: "Hangzhou", zh: "杭州", province: "Zhejiang" },
  { slug: "suzhou", en: "Suzhou", zh: "苏州", province: "Jiangsu" },
  { slug: "nanjing", en: "Nanjing", zh: "南京", province: "Jiangsu" },
  { slug: "guangzhou", en: "Guangzhou", zh: "广州", province: "Guangdong" },
  { slug: "shenzhen", en: "Shenzhen", zh: "深圳", province: "Guangdong" },
  { slug: "xiamen", en: "Xiamen", zh: "厦门", province: "Fujian" },
  { slug: "qingdao", en: "Qingdao", zh: "青岛", province: "Shandong" },
  { slug: "kunming", en: "Kunming", zh: "昆明", province: "Yunnan" },
  { slug: "lijiang", en: "Lijiang", zh: "丽江", province: "Yunnan" },
  { slug: "zhangjiajie", en: "Zhangjiajie", zh: "张家界", province: "Hunan" },
  { slug: "harbin", en: "Harbin", zh: "哈尔滨", province: "Heilongjiang" },
  { slug: "lhasa", en: "Lhasa", zh: "拉萨", province: "Tibet" },
  { slug: "sanya", en: "Sanya", zh: "三亚", province: "Hainan" },
  { slug: "datong", en: "Datong", zh: "大同", province: "Shanxi" },
];

export const CITY_BY_SLUG = new Map(CITIES.map((c) => [c.slug, c]));

export type Language = { code: string; en: string; zh: string };

export const LANGUAGES: Language[] = [
  { code: "en", en: "English", zh: "英语" },
  { code: "ja", en: "Japanese", zh: "日语" },
  { code: "ko", en: "Korean", zh: "韩语" },
  { code: "fr", en: "French", zh: "法语" },
  { code: "de", en: "German", zh: "德语" },
  { code: "es", en: "Spanish", zh: "西班牙语" },
  { code: "ru", en: "Russian", zh: "俄语" },
  { code: "it", en: "Italian", zh: "意大利语" },
  { code: "pt", en: "Portuguese", zh: "葡萄牙语" },
  { code: "ar", en: "Arabic", zh: "阿拉伯语" },
  { code: "th", en: "Thai", zh: "泰语" },
  { code: "vi", en: "Vietnamese", zh: "越南语" },
  { code: "id", en: "Indonesian", zh: "印尼语" },
  { code: "hi", en: "Hindi", zh: "印地语" },
];

export const LANGUAGE_BY_CODE = new Map(LANGUAGES.map((l) => [l.code, l]));

export type Theme = { slug: string; en: string; zh: string; emoji: string };

export const THEMES: Theme[] = [
  { slug: "food", en: "Food & street eats", zh: "美食小吃", emoji: "🍜" },
  { slug: "history", en: "History & heritage", zh: "历史古迹", emoji: "🏛️" },
  { slug: "nightlife", en: "Nightlife & bars", zh: "夜生活", emoji: "🌃" },
  { slug: "nature", en: "Nature & hiking", zh: "自然徒步", emoji: "⛰️" },
  { slug: "art", en: "Art & museums", zh: "艺术博物馆", emoji: "🎨" },
  { slug: "photography", en: "Photography spots", zh: "摄影打卡", emoji: "📷" },
  { slug: "tea", en: "Tea culture", zh: "茶文化", emoji: "🍵" },
  { slug: "markets", en: "Markets & shopping", zh: "市集购物", emoji: "🛍️" },
  { slug: "temples", en: "Temples & religion", zh: "寺庙宗教", emoji: "🛕" },
  { slug: "architecture", en: "Architecture", zh: "建筑", emoji: "🏙️" },
  { slug: "family", en: "Family & kids", zh: "亲子出行", emoji: "🧸" },
  { slug: "business", en: "Business interpreting", zh: "商务陪同翻译", emoji: "💼" },
  { slug: "medical", en: "Hospital & clinic help", zh: "就医陪同", emoji: "🏥" },
  { slug: "campus", en: "University visits", zh: "高校参观", emoji: "🎓" },
  { slug: "martial-arts", en: "Kung fu & martial arts", zh: "武术", emoji: "🥋" },
  { slug: "logistics", en: "Getting around & SIM/apps setup", zh: "落地生活帮助", emoji: "🚇" },
];

export const THEME_BY_SLUG = new Map(THEMES.map((t) => [t.slug, t]));

export const CURRENCIES = ["CNY", "USD", "EUR"] as const;
export type Currency = (typeof CURRENCIES)[number];

export const PAGE_SIZE = 12;
