/**
 * REAL Apple iPhone catalog — Stage 1.
 * Specs based on Apple's official specifications. No demo / placeholder text.
 * Images: real per-color renders in public/products/apple/{model}/{slug}.png
 */

import type { Locale } from "../localized";
import type { ProductSpecItem } from "../product-specs";

export type IphoneColor = {
  /** Variant value stored on the option (official Apple color name). */
  value: string;
  /** Image file slug under public/products/apple/{key}/{slug}.png */
  slug: string;
};

export type IphoneStorage = {
  value: string;
  priceAdd: number;
};

type Material = "aluminum" | "titanium";

export type IphoneSpecFields = {
  chip: string;
  displaySize: string;
  displayTech: string;
  refresh: string;
  brightness: string;
  rear: string;
  front: string;
  batteryVideoHours: string;
  connectivity: string;
  material: Material;
  ceramic: string;
  ip: string;
  ios: string;
  dimensions: string;
  weight: string;
};

export type IphoneSeed = {
  /** Matches image folder under public/products/apple/{key}. */
  key: string;
  slug: string;
  series: string;
  model: string;
  name_en: string;
  name_he: string;
  name_ar: string;
  tier: "standard" | "pro" | "promax";
  basePrice: number;
  /** % off used to compute oldPrice when tagged SALE. */
  salePercent?: number;
  featured?: boolean;
  tags: string[];
  colors: IphoneColor[];
  storage: IphoneStorage[];
  spec: IphoneSpecFields;
};

export const APPLE_IPHONE_CATEGORY = {
  parent: {
    key: "smartphones",
    name_he: "סמארטפונים",
    name_ar: "الهواتف الذكية",
    name_en: "Smartphones",
    sortOrder: 10,
    imageUrl: "products/apple/smartphones/black.png",
  },
  iphone: {
    key: "iphone",
    name_he: "iPhone",
    name_ar: "iPhone",
    name_en: "iPhone",
    sortOrder: 11,
    imageUrl: "products/apple/iphone-17-pro/natural.png",
  },
} as const;

const WARRANTY = {
  he: "אחריות יבואן רשמי לשנה (12 חודשים), כולל תמיכה מלאה ושירות מעבדה מורשה.",
  ar: "ضمان المستورد الرسمي لمدة سنة (12 شهرًا)، يشمل الدعم الكامل وخدمة الصيانة المعتمدة.",
  en: "1-year official importer warranty (12 months) with full support and authorized service.",
};

const AVAILABILITY = {
  he: "במלאי — נשלח תוך 1–3 ימי עסקים.",
  ar: "متوفر — يُشحن خلال 1–3 أيام عمل.",
  en: "In stock — ships within 1–3 business days.",
};

const MATERIAL_LABEL: Record<Material, Record<Locale, string>> = {
  aluminum: { he: "אלומיניום", ar: "ألمنيوم", en: "Aluminum" },
  titanium: { he: "טיטניום", ar: "تيتانيوم", en: "Titanium" },
};

const SECTION_TITLES: Record<Locale, string[]> = {
  he: [
    "מעבד",
    "מסך",
    "מצלמה אחורית",
    "מצלמה קדמית",
    "סוללה וטעינה",
    "קישוריות",
    "חומרים ועמידות",
    "מערכת הפעלה",
    "מידות ומשקל",
    "תכולת האריזה",
    "אחריות",
    "זמינות",
  ],
  ar: [
    "المعالج",
    "الشاشة",
    "الكاميرا الخلفية",
    "الكاميرا الأمامية",
    "البطارية والشحن",
    "الاتصال",
    "المواد والمتانة",
    "نظام التشغيل",
    "الأبعاد والوزن",
    "محتويات العلبة",
    "الضمان",
    "التوفر",
  ],
  en: [
    "Chip",
    "Display",
    "Rear camera",
    "Front camera",
    "Battery & charging",
    "Connectivity",
    "Materials & durability",
    "Operating system",
    "Size & weight",
    "In the box",
    "Warranty",
    "Availability",
  ],
};

const IN_BOX: Record<Locale, (name: string) => string> = {
  he: (n) => `${n}, כבל USB‑C ל‑USB‑C, מדריך משתמש ופרטי אחריות.`,
  ar: (n) => `${n}، كابل USB‑C إلى USB‑C، دليل المستخدم وتفاصيل الضمان.`,
  en: (n) => `${n}, USB‑C to USB‑C cable, documentation and warranty card.`,
};

function batteryLine(lang: Locale, hours: string): string {
  if (lang === "he") {
    return `עד ${hours} שעות ניגון וידאו. טעינת USB‑C, טעינה מהירה וטעינת MagSafe אלחוטית.`;
  }
  if (lang === "ar") {
    return `حتى ${hours} ساعة تشغيل فيديو. شحن USB‑C، شحن سريع وشحن MagSafe اللاسلكي.`;
  }
  return `Up to ${hours} hours video playback. USB‑C charging, fast charge and MagSafe wireless charging.`;
}

function displayLine(lang: Locale, f: IphoneSpecFields): string {
  if (lang === "he") {
    return `${f.displaySize}″ ${f.displayTech}, קצב רענון ${f.refresh}, בהירות שיא ${f.brightness}.`;
  }
  if (lang === "ar") {
    return `${f.displaySize}″ ${f.displayTech}، معدل تحديث ${f.refresh}، سطوع ذروة ${f.brightness}.`;
  }
  return `${f.displaySize}″ ${f.displayTech}, ${f.refresh} refresh rate, ${f.brightness} peak brightness.`;
}

function materialsLine(lang: Locale, f: IphoneSpecFields): string {
  const mat = MATERIAL_LABEL[f.material][lang];
  if (lang === "he") {
    return `מסגרת ${mat}, חזית ${f.ceramic}, עמידות בפני מים ואבק בתקן ${f.ip}.`;
  }
  if (lang === "ar") {
    return `إطار ${mat}، واجهة ${f.ceramic}، مقاومة للماء والغبار بمعيار ${f.ip}.`;
  }
  return `${mat} frame, ${f.ceramic} front, ${f.ip} water and dust resistance.`;
}

function sizeLine(lang: Locale, f: IphoneSpecFields): string {
  if (lang === "he") return `${f.dimensions}, משקל ${f.weight}.`;
  if (lang === "ar") return `${f.dimensions}، الوزن ${f.weight}.`;
  return `${f.dimensions}, weight ${f.weight}.`;
}

export function buildIphoneSpecs(lang: Locale, name: string, f: IphoneSpecFields): ProductSpecItem[] {
  const titles = SECTION_TITLES[lang];
  const contents = [
    f.chip,
    displayLine(lang, f),
    f.rear,
    f.front,
    batteryLine(lang, f.batteryVideoHours),
    f.connectivity,
    materialsLine(lang, f),
    f.ios,
    sizeLine(lang, f),
    IN_BOX[lang](name),
    WARRANTY[lang],
    AVAILABILITY[lang],
  ];
  return titles.map((title, i) => ({ title, content: contents[i] }));
}

export function iphoneDescription(lang: Locale, p: IphoneSeed): string {
  const chip = p.spec.chip.split(",")[0];
  const mat = MATERIAL_LABEL[p.spec.material][lang];
  if (lang === "he") {
    if (p.tier === "standard") {
      return `${p.name_he} משלב ביצועים חכמים עם שבב ${chip}, מסך Super Retina XDR בגודל ${p.spec.displaySize}″ ומערכת מצלמות מתקדמת לצילום יומיומי מרהיב. גוף ${mat} קל ועמיד, חיבור USB‑C וטעינת MagSafe. אחריות יבואן רשמי ומשלוח מהיר.`;
    }
    return `${p.name_he} ברמת ה‑Pro: שבב ${chip}, מסך ProMotion 120Hz בגודל ${p.spec.displaySize}″, מערכת מצלמות מקצועית עם זום אופטי וצילום ProRAW. גוף ${mat} יוקרתי, USB‑C מהיר וטעינת MagSafe. אחריות יבואן רשמי ומשלוח מהיר.`;
  }
  if (lang === "ar") {
    if (p.tier === "standard") {
      return `${p.name_ar} يجمع بين الأداء الذكي مع شريحة ${chip}، شاشة Super Retina XDR بحجم ${p.spec.displaySize}″ ونظام كاميرات متطور للتصوير اليومي المذهل. هيكل ${mat} خفيف ومتين، منفذ USB‑C وشحن MagSafe. ضمان المستورد الرسمي وشحن سريع.`;
    }
    return `${p.name_ar} بمستوى Pro: شريحة ${chip}، شاشة ProMotion 120Hz بحجم ${p.spec.displaySize}″، نظام كاميرات احترافي مع زوم بصري وتصوير ProRAW. هيكل ${mat} فاخر، USB‑C سريع وشحن MagSafe. ضمان المستورد الرسمي وشحن سريع.`;
  }
  if (p.tier === "standard") {
    return `${p.name_en} pairs intelligent performance from the ${chip} chip with a ${p.spec.displaySize}″ Super Retina XDR display and an advanced camera system for stunning everyday photos. Lightweight, durable ${mat.toLowerCase()} body, USB‑C and MagSafe charging. Official importer warranty and fast delivery.`;
  }
  return `${p.name_en} at Pro level: ${chip} chip, ${p.spec.displaySize}″ ProMotion 120Hz display, and a pro camera system with optical zoom and ProRAW. Premium ${mat.toLowerCase()} body, fast USB‑C and MagSafe charging. Official importer warranty and fast delivery.`;
}

const img = (key: string, slug: string) => `products/apple/${key}/${slug}.png`;

export function iphoneColorImage(key: string, slug: string): string {
  return img(key, slug);
}

export const APPLE_IPHONES: IphoneSeed[] = [
  {
    key: "iphone-17-pro-max",
    slug: "iphone-17-pro-max",
    series: "iPhone 17",
    model: "iPhone 17 Pro Max",
    name_en: "iPhone 17 Pro Max",
    name_he: "iPhone 17 Pro Max",
    name_ar: "iPhone 17 Pro Max",
    tier: "promax",
    basePrice: 5999,
    featured: true,
    tags: ["NEW", "BEST SELLER"],
    colors: [
      { value: "Deep Blue", slug: "blue" },
      { value: "Natural Titanium", slug: "natural" },
      { value: "Black", slug: "black" },
      { value: "White", slug: "white" },
    ],
    storage: [
      { value: "256GB", priceAdd: 0 },
      { value: "512GB", priceAdd: 800 },
      { value: "1TB", priceAdd: 1600 },
      { value: "2TB", priceAdd: 3200 },
    ],
    spec: {
      chip: "Apple A19 Pro, 6‑core CPU, 6‑core GPU, 16‑core Neural Engine",
      displaySize: "6.9",
      displayTech: "Super Retina XDR OLED",
      refresh: "120Hz ProMotion",
      brightness: "3000 nits",
      rear: "48MP Fusion Main + 48MP Ultra Wide + 48MP Telephoto (up to 8x optical zoom)",
      front: "18MP Center Stage TrueDepth",
      batteryVideoHours: "37",
      connectivity: "5G, Wi‑Fi 7, Bluetooth 5.3, USB‑C (USB 3)",
      material: "aluminum",
      ceramic: "Ceramic Shield 2",
      ip: "IP68",
      ios: "iOS 26",
      dimensions: "163.4 × 78.0 × 8.7 mm",
      weight: "233 g",
    },
  },
  {
    key: "iphone-17-pro",
    slug: "iphone-17-pro",
    series: "iPhone 17",
    model: "iPhone 17 Pro",
    name_en: "iPhone 17 Pro",
    name_he: "iPhone 17 Pro",
    name_ar: "iPhone 17 Pro",
    tier: "pro",
    basePrice: 5199,
    featured: true,
    tags: ["NEW", "BEST SELLER"],
    colors: [
      { value: "Deep Blue", slug: "blue" },
      { value: "Natural Titanium", slug: "natural" },
      { value: "Black", slug: "black" },
      { value: "White", slug: "white" },
    ],
    storage: [
      { value: "256GB", priceAdd: 0 },
      { value: "512GB", priceAdd: 800 },
      { value: "1TB", priceAdd: 1600 },
    ],
    spec: {
      chip: "Apple A19 Pro, 6‑core CPU, 6‑core GPU, 16‑core Neural Engine",
      displaySize: "6.3",
      displayTech: "Super Retina XDR OLED",
      refresh: "120Hz ProMotion",
      brightness: "3000 nits",
      rear: "48MP Fusion Main + 48MP Ultra Wide + 48MP Telephoto (up to 8x optical zoom)",
      front: "18MP Center Stage TrueDepth",
      batteryVideoHours: "31",
      connectivity: "5G, Wi‑Fi 7, Bluetooth 5.3, USB‑C (USB 3)",
      material: "aluminum",
      ceramic: "Ceramic Shield 2",
      ip: "IP68",
      ios: "iOS 26",
      dimensions: "149.6 × 71.5 × 8.7 mm",
      weight: "206 g",
    },
  },
  {
    key: "iphone-17",
    slug: "iphone-17",
    series: "iPhone 17",
    model: "iPhone 17",
    name_en: "iPhone 17",
    name_he: "iPhone 17",
    name_ar: "iPhone 17",
    tier: "standard",
    basePrice: 3999,
    featured: true,
    tags: ["NEW"],
    colors: [
      { value: "Mist Blue", slug: "blue" },
      { value: "Silver", slug: "silver" },
      { value: "Black", slug: "black" },
      { value: "White", slug: "white" },
    ],
    storage: [
      { value: "256GB", priceAdd: 0 },
      { value: "512GB", priceAdd: 800 },
    ],
    spec: {
      chip: "Apple A19, 6‑core CPU, 5‑core GPU, 16‑core Neural Engine",
      displaySize: "6.3",
      displayTech: "Super Retina XDR OLED",
      refresh: "120Hz ProMotion",
      brightness: "3000 nits",
      rear: "Dual 48MP Fusion (Main + Ultra Wide), 2x optical‑quality zoom",
      front: "18MP Center Stage TrueDepth",
      batteryVideoHours: "30",
      connectivity: "5G, Wi‑Fi 7, Bluetooth 5.3, USB‑C",
      material: "aluminum",
      ceramic: "Ceramic Shield 2",
      ip: "IP68",
      ios: "iOS 26",
      dimensions: "149.6 × 71.5 × 7.95 mm",
      weight: "177 g",
    },
  },
  {
    key: "iphone-16-pro-max",
    slug: "iphone-16-pro-max",
    series: "iPhone 16",
    model: "iPhone 16 Pro Max",
    name_en: "iPhone 16 Pro Max",
    name_he: "iPhone 16 Pro Max",
    name_ar: "iPhone 16 Pro Max",
    tier: "promax",
    basePrice: 5699,
    featured: true,
    tags: ["BEST SELLER"],
    colors: [
      { value: "Desert Titanium", slug: "desert" },
      { value: "Natural Titanium", slug: "natural" },
      { value: "Black Titanium", slug: "black" },
      { value: "White Titanium", slug: "white" },
    ],
    storage: [
      { value: "256GB", priceAdd: 0 },
      { value: "512GB", priceAdd: 900 },
      { value: "1TB", priceAdd: 1800 },
    ],
    spec: {
      chip: "Apple A18 Pro, 6‑core CPU, 6‑core GPU, 16‑core Neural Engine",
      displaySize: "6.9",
      displayTech: "Super Retina XDR OLED",
      refresh: "120Hz ProMotion",
      brightness: "2000 nits",
      rear: "48MP Fusion + 48MP Ultra Wide + 12MP Telephoto 5x",
      front: "12MP TrueDepth",
      batteryVideoHours: "33",
      connectivity: "5G, Wi‑Fi 7, Bluetooth 5.3, USB‑C (USB 3)",
      material: "titanium",
      ceramic: "Ceramic Shield",
      ip: "IP68",
      ios: "iOS 26",
      dimensions: "163.0 × 77.6 × 8.25 mm",
      weight: "227 g",
    },
  },
  {
    key: "iphone-16-pro",
    slug: "iphone-16-pro",
    series: "iPhone 16",
    model: "iPhone 16 Pro",
    name_en: "iPhone 16 Pro",
    name_he: "iPhone 16 Pro",
    name_ar: "iPhone 16 Pro",
    tier: "pro",
    basePrice: 4899,
    featured: true,
    tags: ["BEST SELLER"],
    colors: [
      { value: "Desert Titanium", slug: "desert" },
      { value: "Natural Titanium", slug: "natural" },
      { value: "Black Titanium", slug: "black" },
      { value: "White Titanium", slug: "white" },
    ],
    storage: [
      { value: "128GB", priceAdd: 0 },
      { value: "256GB", priceAdd: 450 },
      { value: "512GB", priceAdd: 1350 },
      { value: "1TB", priceAdd: 2250 },
    ],
    spec: {
      chip: "Apple A18 Pro, 6‑core CPU, 6‑core GPU, 16‑core Neural Engine",
      displaySize: "6.3",
      displayTech: "Super Retina XDR OLED",
      refresh: "120Hz ProMotion",
      brightness: "2000 nits",
      rear: "48MP Fusion + 48MP Ultra Wide + 12MP Telephoto 5x",
      front: "12MP TrueDepth",
      batteryVideoHours: "27",
      connectivity: "5G, Wi‑Fi 7, Bluetooth 5.3, USB‑C (USB 3)",
      material: "titanium",
      ceramic: "Ceramic Shield",
      ip: "IP68",
      ios: "iOS 26",
      dimensions: "149.6 × 71.5 × 8.25 mm",
      weight: "199 g",
    },
  },
  {
    key: "iphone-16",
    slug: "iphone-16",
    series: "iPhone 16",
    model: "iPhone 16",
    name_en: "iPhone 16",
    name_he: "iPhone 16",
    name_ar: "iPhone 16",
    tier: "standard",
    basePrice: 3799,
    tags: [],
    colors: [
      { value: "Ultramarine", slug: "blue" },
      { value: "Teal", slug: "green" },
      { value: "Black", slug: "black" },
      { value: "White", slug: "white" },
    ],
    storage: [
      { value: "128GB", priceAdd: 0 },
      { value: "256GB", priceAdd: 450 },
      { value: "512GB", priceAdd: 1350 },
    ],
    spec: {
      chip: "Apple A18, 6‑core CPU, 5‑core GPU, 16‑core Neural Engine",
      displaySize: "6.1",
      displayTech: "Super Retina XDR OLED",
      refresh: "60Hz",
      brightness: "2000 nits",
      rear: "48MP Fusion + 12MP Ultra Wide (macro)",
      front: "12MP TrueDepth",
      batteryVideoHours: "22",
      connectivity: "5G, Wi‑Fi 7, Bluetooth 5.3, USB‑C",
      material: "aluminum",
      ceramic: "Ceramic Shield",
      ip: "IP68",
      ios: "iOS 26",
      dimensions: "147.6 × 71.6 × 7.8 mm",
      weight: "170 g",
    },
  },
  {
    key: "iphone-15-pro-max",
    slug: "iphone-15-pro-max",
    series: "iPhone 15",
    model: "iPhone 15 Pro Max",
    name_en: "iPhone 15 Pro Max",
    name_he: "iPhone 15 Pro Max",
    name_ar: "iPhone 15 Pro Max",
    tier: "promax",
    basePrice: 5299,
    salePercent: 10,
    tags: ["SALE"],
    colors: [
      { value: "Blue Titanium", slug: "blue" },
      { value: "Natural Titanium", slug: "natural" },
      { value: "Black Titanium", slug: "black" },
      { value: "White Titanium", slug: "white" },
    ],
    storage: [
      { value: "256GB", priceAdd: 0 },
      { value: "512GB", priceAdd: 900 },
      { value: "1TB", priceAdd: 1800 },
    ],
    spec: {
      chip: "Apple A17 Pro, 6‑core CPU, 6‑core GPU, 16‑core Neural Engine",
      displaySize: "6.7",
      displayTech: "Super Retina XDR OLED",
      refresh: "120Hz ProMotion",
      brightness: "2000 nits",
      rear: "48MP Main + 12MP Ultra Wide + 12MP Telephoto 5x",
      front: "12MP TrueDepth",
      batteryVideoHours: "29",
      connectivity: "5G, Wi‑Fi 6E, Bluetooth 5.3, USB‑C (USB 3)",
      material: "titanium",
      ceramic: "Ceramic Shield",
      ip: "IP68",
      ios: "iOS 26",
      dimensions: "159.9 × 76.7 × 8.25 mm",
      weight: "221 g",
    },
  },
  {
    key: "iphone-15-pro",
    slug: "iphone-15-pro",
    series: "iPhone 15",
    model: "iPhone 15 Pro",
    name_en: "iPhone 15 Pro",
    name_he: "iPhone 15 Pro",
    name_ar: "iPhone 15 Pro",
    tier: "pro",
    basePrice: 4499,
    salePercent: 10,
    tags: ["SALE"],
    colors: [
      { value: "Blue Titanium", slug: "blue" },
      { value: "Natural Titanium", slug: "natural" },
      { value: "Black Titanium", slug: "black" },
      { value: "White Titanium", slug: "white" },
    ],
    storage: [
      { value: "128GB", priceAdd: 0 },
      { value: "256GB", priceAdd: 450 },
      { value: "512GB", priceAdd: 1350 },
      { value: "1TB", priceAdd: 2250 },
    ],
    spec: {
      chip: "Apple A17 Pro, 6‑core CPU, 6‑core GPU, 16‑core Neural Engine",
      displaySize: "6.1",
      displayTech: "Super Retina XDR OLED",
      refresh: "120Hz ProMotion",
      brightness: "2000 nits",
      rear: "48MP Main + 12MP Ultra Wide + 12MP Telephoto 3x",
      front: "12MP TrueDepth",
      batteryVideoHours: "23",
      connectivity: "5G, Wi‑Fi 6E, Bluetooth 5.3, USB‑C (USB 3)",
      material: "titanium",
      ceramic: "Ceramic Shield",
      ip: "IP68",
      ios: "iOS 26",
      dimensions: "146.6 × 70.6 × 8.25 mm",
      weight: "187 g",
    },
  },
  {
    key: "iphone-15",
    slug: "iphone-15",
    series: "iPhone 15",
    model: "iPhone 15",
    name_en: "iPhone 15",
    name_he: "iPhone 15",
    name_ar: "iPhone 15",
    tier: "standard",
    basePrice: 3299,
    salePercent: 12,
    tags: ["SALE"],
    colors: [
      { value: "Blue", slug: "blue" },
      { value: "Pink", slug: "pink" },
      { value: "Black", slug: "black" },
      { value: "White", slug: "white" },
    ],
    storage: [
      { value: "128GB", priceAdd: 0 },
      { value: "256GB", priceAdd: 450 },
      { value: "512GB", priceAdd: 1350 },
    ],
    spec: {
      chip: "Apple A16 Bionic, 6‑core CPU, 5‑core GPU, 16‑core Neural Engine",
      displaySize: "6.1",
      displayTech: "Super Retina XDR OLED",
      refresh: "60Hz",
      brightness: "2000 nits",
      rear: "48MP Main + 12MP Ultra Wide",
      front: "12MP TrueDepth",
      batteryVideoHours: "20",
      connectivity: "5G, Wi‑Fi 6, Bluetooth 5.3, USB‑C",
      material: "aluminum",
      ceramic: "Ceramic Shield",
      ip: "IP68",
      ios: "iOS 26",
      dimensions: "147.6 × 71.6 × 7.8 mm",
      weight: "171 g",
    },
  },
];
