/**
 * REAL Samsung Galaxy A catalog — Samsung Master Catalog Part 3.
 * Specs based on Samsung's official specifications. No demo / Lorem Ipsum / placeholder copy.
 * Variants: Color + RAM + Storage. Images: per color under
 * public/products/samsung/galaxy-a/{key}/{slug}-{front|back|side|angle|lifestyle|packaging}.png
 */

import type { Locale } from "../localized";
import type { ProductSpecItem } from "../product-specs";

export type AColor = { value: string; slug: string };
export type AOption = { value: string; priceAdd: number };

type Panel = "Super AMOLED" | "PLS LCD";

export type ASpecFields = {
  displaySize: string;
  panel: Panel;
  refresh: string;
  resolution: string;
  brightness: string;
  chip: string;
  gpu: string;
  ramLabel: string;
  storageLabel: string;
  microSD: boolean;
  rearCamera: string;
  ultraWide: string;
  macro: string | null;
  depth: string | null;
  frontCamera: string;
  video: string;
  battery: string;
  fastCharge: string;
  bluetooth: string;
  wifi: string;
  nfc: boolean;
  gps: string;
  usbc: string;
  fiveG: boolean;
  dualSim: boolean;
  esim: boolean;
  knox: boolean;
  android: string;
  oneUi: string;
  fingerprint: string;
  stereo: boolean;
  alwaysOn: boolean;
  ip: string | null;
  weight: string;
  dimensions: string;
};

export type ASeed = {
  key: string;
  slug: string;
  series: string;
  segment: "budget" | "mid" | "premium-mid";
  model: string;
  name_en: string;
  name_he: string;
  name_ar: string;
  basePrice: number;
  salePercent?: number;
  featured?: boolean;
  tags: string[];
  colors: AColor[];
  ram: AOption[];
  storage: AOption[];
  spec: ASpecFields;
};

export const SAMSUNG_GALAXY_A_CATEGORY = {
  parent: {
    key: "smartphones",
    name_he: "סמארטפונים",
    name_ar: "الهواتف الذكية",
    name_en: "Smartphones",
    sortOrder: 10,
    imageUrl: "products/samsung/galaxy-a/samsung-galaxy-a56/graphite-front.png",
  },
  galaxyA: {
    key: "galaxy-a",
    name_he: "Galaxy A",
    name_ar: "Galaxy A",
    name_en: "Galaxy A",
    sortOrder: 14,
    imageUrl: "products/samsung/galaxy-a/samsung-galaxy-a56/graphite-front.png",
  },
} as const;

const WARRANTY: Record<Locale, string> = {
  he: "אחריות יבואן רשמי לשנה (12 חודשים), כולל תמיכה מלאה ושירות מעבדה מורשה.",
  ar: "ضمان المستورد الرسمي لمدة سنة (12 شهرًا)، يشمل الدعم الكامل وخدمة الصيانة المعتمدة.",
  en: "1-year official importer warranty (12 months) with full support and authorized service.",
};

const AVAILABILITY: Record<Locale, string> = {
  he: "במלאי — נשלח תוך 1–3 ימי עסקים.",
  ar: "متوفر — يُشحن خلال 1–3 أيام عمل.",
  en: "In stock — ships within 1–3 business days.",
};

const IN_BOX: Record<Locale, string> = {
  he: "מכשיר Galaxy, כבל USB‑C, מחט הוצאת SIM, מדריך הפעלה מהירה ותעודת אחריות. (ללא מטען, בהתאם לאריזה הרשמית של Samsung).",
  ar: "جهاز Galaxy، كابل USB‑C، أداة إخراج SIM، دليل البدء السريع وبطاقة الضمان. (بدون شاحن، حسب العبوة الرسمية من Samsung).",
  en: "Galaxy device, USB‑C cable, SIM ejector pin, quick start guide and warranty card. (No charger, per Samsung's official box contents).",
};

const T: Record<Locale, Record<string, string>> = {
  he: {
    displaySize: "גודל מסך",
    panel: "סוג מסך",
    refresh: "קצב רענון",
    resolution: "רזולוציה",
    brightness: "בהירות שיא",
    chip: "מעבד",
    gpu: "מעבד גרפי (GPU)",
    ram: "זיכרון RAM",
    storage: "נפח אחסון",
    microsd: "כרטיס זיכרון microSD",
    rear: "מצלמה ראשית",
    uw: "מצלמה אולטרה‑רחבה",
    macro: "מצלמת מאקרו",
    depth: "חיישן עומק",
    front: "מצלמה קדמית",
    video: "צילום וידאו",
    battery: "סוללה",
    fast: "טעינה מהירה",
    bluetooth: "Bluetooth",
    wifi: "Wi‑Fi",
    nfc: "NFC",
    gps: "GPS",
    usbc: "USB‑C",
    fiveg: "5G",
    dualsim: "Dual SIM",
    esim: "eSIM",
    knox: "Samsung Knox",
    oneui: "One UI",
    android: "גרסת Android",
    finger: "חיישן טביעת אצבע",
    stereo: "רמקולים סטריאו",
    aod: "Always On Display",
    ip: "עמידות (IP)",
    weight: "משקל",
    dimensions: "מידות",
    warranty: "אחריות",
    inbox: "מה כלול באריזה",
    availability: "זמינות",
    yes: "כן",
  },
  ar: {
    displaySize: "حجم الشاشة",
    panel: "نوع الشاشة",
    refresh: "معدل التحديث",
    resolution: "الدقة",
    brightness: "ذروة السطوع",
    chip: "المعالج",
    gpu: "معالج الرسومات (GPU)",
    ram: "ذاكرة RAM",
    storage: "سعة التخزين",
    microsd: "بطاقة microSD",
    rear: "الكاميرا الرئيسية",
    uw: "الكاميرا فائقة الاتساع",
    macro: "كاميرا ماكرو",
    depth: "مستشعر العمق",
    front: "الكاميرا الأمامية",
    video: "تصوير الفيديو",
    battery: "البطارية",
    fast: "الشحن السريع",
    bluetooth: "Bluetooth",
    wifi: "Wi‑Fi",
    nfc: "NFC",
    gps: "GPS",
    usbc: "USB‑C",
    fiveg: "5G",
    dualsim: "Dual SIM",
    esim: "eSIM",
    knox: "Samsung Knox",
    oneui: "One UI",
    android: "إصدار Android",
    finger: "مستشعر بصمة الإصبع",
    stereo: "سماعات ستيريو",
    aod: "Always On Display",
    ip: "المتانة (IP)",
    weight: "الوزن",
    dimensions: "الأبعاد",
    warranty: "الضمان",
    inbox: "محتويات العلبة",
    availability: "التوفر",
    yes: "نعم",
  },
  en: {
    displaySize: "Display size",
    panel: "Display type",
    refresh: "Refresh rate",
    resolution: "Resolution",
    brightness: "Peak brightness",
    chip: "Processor",
    gpu: "GPU",
    ram: "RAM",
    storage: "Storage",
    microsd: "microSD card",
    rear: "Main camera",
    uw: "Ultra Wide camera",
    macro: "Macro camera",
    depth: "Depth sensor",
    front: "Front camera",
    video: "Video recording",
    battery: "Battery",
    fast: "Fast charging",
    bluetooth: "Bluetooth",
    wifi: "Wi‑Fi",
    nfc: "NFC",
    gps: "GPS",
    usbc: "USB‑C",
    fiveg: "5G",
    dualsim: "Dual SIM",
    esim: "eSIM",
    knox: "Samsung Knox",
    oneui: "One UI",
    android: "Android version",
    finger: "Fingerprint sensor",
    stereo: "Stereo speakers",
    aod: "Always On Display",
    ip: "Durability (IP)",
    weight: "Weight",
    dimensions: "Dimensions",
    warranty: "Warranty",
    inbox: "In the box",
    availability: "Availability",
    yes: "Yes",
  },
};

export function buildASpecs(lang: Locale, p: ASeed): ProductSpecItem[] {
  const tt = T[lang];
  const f = p.spec;
  const rows: ProductSpecItem[] = [];
  const add = (title: string, content: string) => rows.push({ title, content });

  add(tt.displaySize, f.displaySize);
  add(tt.panel, f.panel);
  add(tt.refresh, f.refresh);
  add(tt.resolution, f.resolution);
  add(tt.brightness, f.brightness);
  add(tt.chip, f.chip);
  add(tt.gpu, f.gpu);
  add(tt.ram, f.ramLabel);
  add(tt.storage, f.storageLabel);
  if (f.microSD) add(tt.microsd, lang === "he" ? "נתמך (עד 1TB)" : lang === "ar" ? "مدعوم (حتى 1TB)" : "Supported (up to 1TB)");
  add(tt.rear, f.rearCamera);
  add(tt.uw, f.ultraWide);
  if (f.macro) add(tt.macro, f.macro);
  if (f.depth) add(tt.depth, f.depth);
  add(tt.front, f.frontCamera);
  add(tt.video, f.video);
  add(tt.battery, f.battery);
  add(tt.fast, f.fastCharge);
  add(tt.bluetooth, f.bluetooth);
  add(tt.wifi, f.wifi);
  if (f.nfc) add(tt.nfc, tt.yes);
  add(tt.gps, f.gps);
  add(tt.usbc, f.usbc);
  if (f.fiveG) add(tt.fiveg, tt.yes);
  if (f.dualSim) add(tt.dualsim, tt.yes);
  if (f.esim) add(tt.esim, tt.yes);
  if (f.knox) add(tt.knox, tt.yes);
  add(tt.oneui, f.oneUi);
  add(tt.android, f.android);
  add(tt.finger, f.fingerprint);
  if (f.stereo) add(tt.stereo, lang === "he" ? "כן, עם Dolby Atmos" : lang === "ar" ? "نعم، مع Dolby Atmos" : "Yes, with Dolby Atmos");
  if (f.alwaysOn) add(tt.aod, tt.yes);
  if (f.ip) add(tt.ip, f.ip);
  add(tt.weight, f.weight);
  add(tt.dimensions, f.dimensions);
  add(tt.warranty, WARRANTY[lang]);
  add(tt.inbox, IN_BOX[lang]);
  add(tt.availability, AVAILABILITY[lang]);
  return rows;
}

export function aFeatures(p: ASeed): string[] {
  const f = p.spec;
  const out: string[] = [];
  if (f.panel === "Super AMOLED") out.push("Super AMOLED", "Vision Booster");
  out.push("Samsung Knox");
  if (f.stereo) out.push("Dolby Atmos");
  out.push("Fast Charging", "Samsung Wallet", "Samsung Smart Switch", "Samsung Health", "Game Booster", "Eye Comfort Shield");
  if (f.alwaysOn) out.push("Always On Display");
  return out;
}

export function aShortDescription(lang: Locale, p: ASeed): string {
  const f = p.spec;
  if (lang === "he") {
    return `${p.name_he} — מסך ${f.panel} בגודל ${f.displaySize} בקצב ${f.refresh}, מעבד ${f.chip}, מצלמה ראשית ${f.rearCamera} וסוללת ${f.battery} עם ${f.fastCharge}. ${f.fiveG ? "תומך 5G, " : ""}עיצוב מודרני ושימוש יומיומי חכם. אחריות יבואן רשמי.`;
  }
  if (lang === "ar") {
    return `${p.name_ar} — شاشة ${f.panel} مقاس ${f.displaySize} بمعدل ${f.refresh}، معالج ${f.chip}، كاميرا ${f.rearCamera} وبطارية ${f.battery} مع ${f.fastCharge}. ${f.fiveG ? "يدعم 5G. " : ""}ضمان رسمي.`;
  }
  return `${p.name_en} — a ${f.displaySize} ${f.panel} display at ${f.refresh}, ${f.chip}, a ${f.rearCamera} main camera and a ${f.battery} battery with ${f.fastCharge}. ${f.fiveG ? "5G supported. " : ""}Official importer warranty.`;
}

/** Full Hebrew-first description (300–600 words for he). */
export function aDescription(lang: Locale, p: ASeed): string {
  const f = p.spec;
  const feats = aFeatures(p).map((x) => `✓ ${x}`).join("   ");
  const segHe =
    p.segment === "premium-mid"
      ? "מכשיר הדגל של סדרת A — חוויה כמעט פרימיום במחיר שפוי, לכל מי שרוצה את המיטב מבלי לשלם על מכשיר דגל מלא."
      : p.segment === "mid"
        ? "מכשיר ביניים מאוזן שמספק את כל מה שצריך ליומיום — מסך איכותי, מצלמות טובות וסוללה גדולה — במחיר אטרקטיבי."
        : "מכשיר משתלם במיוחד שמכניס מסך גדול, סוללת ענק וחוויית Samsung מלאה לכל כיס.";

  if (lang === "he") {
    return [
      `${p.name_he} הוא סמארטפון אנדרואיד מבית Samsung מסדרת Galaxy A, המשלב עיצוב מודרני, מסך איכותי, מצלמות טובות וסוללה גדולה. ${segHe}`,
      `למי המכשיר מתאים: ${p.name_he} מתאים למשתמשים שמחפשים מכשיר אמין לשימוש יומיומי — תלמידים, סטודנטים, אנשי עבודה וכל מי שרוצה חוויית Samsung מלאה במחיר משתלם. הוא מצוין לגלישה, רשתות חברתיות, צפייה בסרטונים, ניווט והודעות.`,
      `שימוש יומיומי ומסך: המסך הוא ${f.panel} בגודל ${f.displaySize}, ברזולוציית ${f.resolution} ובקצב רענון של ${f.refresh}, עם בהירות שיא של ${f.brightness}${f.panel === "Super AMOLED" ? " וטכנולוגיית Vision Booster לקריאוּת מצוינת גם בשמש" : ""}. ${f.alwaysOn ? "תצוגת Always On Display מציגה שעה והתראות גם כשהמסך כבוי, ו‑" : ""}פיצ'ר Eye Comfort Shield מפחית אור כחול ומגן על העיניים.`,
      `צילום: מערכת המצלמות כוללת מצלמה ראשית ${f.rearCamera}, ${f.ultraWide} אולטרה‑רחבה${f.macro ? `, ${f.macro}` : ""}${f.depth ? ` ו‑${f.depth}` : ""}, ומצלמה קדמית ${f.frontCamera}. צילום וידאו עד ${f.video}, עם מצב לילה ומגוון מצבי צילום חכמים לתמונות חדות וצבעוניות.`,
      `ביצועים וגיימינג: בלב המכשיר פועל מעבד ${f.chip} עם מעבד גרפי ${f.gpu}, בשילוב ${f.ramLabel} זיכרון RAM ונפחי אחסון ${f.storageLabel}${f.microSD ? " עם אפשרות הרחבה בכרטיס microSD" : ""}. ${f.stereo ? "רמקולים סטריאו עם Dolby Atmos ו‑" : ""}מצב Game Booster מבטיחים חוויית משחק וצריכת מדיה חלקה.`,
      `סוללה: סוללה גדולה בקיבולת ${f.battery} מספקת יום שימוש מלא ואף יותר, עם ${f.fastCharge} לחזרה מהירה לפעילות. אידיאלי לימי לימודים ארוכים, עבודה וטיולים.`,
      `עבודה ולימודים: המכשיר מאובטח עם ${f.knox ? "Samsung Knox" : "אבטחת Samsung"}, תומך ב‑Samsung Wallet לתשלומים, ב‑Samsung Health למעקב בריאותי וב‑Smart Switch להעברת נתונים קלה ממכשיר קודם. הוא מריץ ${f.oneUi} מבוסס ${f.android} ומקבל עדכונים לאורך שנים.`,
      `קישוריות ויתרונות: ${f.bluetooth}, ${f.wifi}, ${f.nfc ? "NFC, " : ""}${f.gps}, ${f.usbc}${f.fiveG ? ", תמיכת 5G" : ""}, ${f.dualSim ? "Dual SIM" : ""}${f.esim ? " ו‑eSIM" : ""}. ${f.ip ? `עמידות ${f.ip} מפני אבק ומים, ` : ""}חיישן ${f.fingerprint}. משקל ${f.weight}, מידות ${f.dimensions}.`,
      `יתרון על פני הדור הקודם: ${p.name_he} מביא שיפורים בביצועים, במצלמות, בעדכוני התוכנה ובבהירות המסך לעומת הדור הקודם — מה שהופך אותו לבחירה החכמה בקטגוריה. כל מכשיר מגיע עם אחריות יבואן רשמי לשנה ומשלוח מהיר.`,
      `יתרונות עיקריים:   ${feats}`,
    ].join("\n\n");
  }

  if (lang === "ar") {
    return [
      `${p.name_ar} هاتف أندرويد من Samsung ضمن سلسلة Galaxy A، يجمع بين تصميم عصري وشاشة جيدة وكاميرات وبطارية كبيرة.`,
      `شاشة ${f.panel} مقاس ${f.displaySize} بدقة ${f.resolution} ومعدل ${f.refresh} وسطوع ${f.brightness}. مناسب للطلاب والعمل والاستخدام اليومي.`,
      `الكاميرا الرئيسية ${f.rearCamera}، ${f.ultraWide}${f.macro ? `، ${f.macro}` : ""}${f.depth ? `، ${f.depth}` : ""}، أمامية ${f.frontCamera}. فيديو حتى ${f.video}.`,
      `معالج ${f.chip} مع ${f.gpu}، ${f.ramLabel} وتخزين ${f.storageLabel}${f.microSD ? " قابل للتوسعة عبر microSD" : ""}. بطارية ${f.battery} مع ${f.fastCharge}.`,
      `${f.bluetooth}، ${f.wifi}، ${f.gps}، ${f.usbc}${f.fiveG ? "، 5G" : ""}. ${f.ip ? `مقاومة ${f.ip}. ` : ""}يعمل بنظام ${f.oneUi} على ${f.android}. ضمان رسمي وشحن سريع.`,
      `أبرز المزايا:   ${feats}`,
    ].join("\n\n");
  }

  return [
    `${p.name_en} is a Samsung Galaxy A Android smartphone that blends a modern design, a quality display, capable cameras and a large battery.`,
    `A ${f.displaySize} ${f.panel} display at ${f.resolution}, ${f.refresh} and ${f.brightness} peak brightness. Great for students, work and everyday use.`,
    `Main camera ${f.rearCamera}, ${f.ultraWide}${f.macro ? `, ${f.macro}` : ""}${f.depth ? `, ${f.depth}` : ""}, ${f.frontCamera} front. Video up to ${f.video}.`,
    `Powered by ${f.chip} with ${f.gpu}, ${f.ramLabel} and ${f.storageLabel} storage${f.microSD ? ", expandable via microSD" : ""}. A ${f.battery} battery with ${f.fastCharge}.`,
    `${f.bluetooth}, ${f.wifi}, ${f.gps}, ${f.usbc}${f.fiveG ? ", 5G" : ""}. ${f.ip ? `${f.ip} rated. ` : ""}Runs ${f.oneUi} on ${f.android}. Official importer warranty and fast delivery.`,
    `Key highlights:   ${feats}`,
  ].join("\n\n");
}

export type AImageKind = "front" | "back" | "side" | "angle" | "lifestyle" | "packaging";

export function aImage(key: string, slug: string, kind: AImageKind): string {
  return `products/samsung/galaxy-a/${key}/${slug}-${kind}.png`;
}

export function aGallery(key: string, slug: string) {
  const kinds: AImageKind[] = ["front", "back", "side", "angle", "lifestyle", "packaging"];
  return kinds.map((kind, i) => ({
    url: aImage(key, slug, kind),
    kind,
    isMain: i === 0,
    sortOrder: i,
  }));
}

const GPS = "GPS, GLONASS, BeiDou, Galileo";
const FP_UDC = "אופטי מתחת למסך";
const FP_SIDE = "בצד המכשיר";

export const SAMSUNG_GALAXY_A: ASeed[] = [
  // ---------------- A56 / A36 / A26 (2025) ----------------
  {
    key: "samsung-galaxy-a56",
    slug: "samsung-galaxy-a56",
    series: "Galaxy A",
    segment: "premium-mid",
    model: "Galaxy A56 5G",
    name_en: "Samsung Galaxy A56 5G",
    name_he: "Samsung Galaxy A56 5G",
    name_ar: "Samsung Galaxy A56 5G",
    basePrice: 1799,
    featured: true,
    tags: ["NEW", "Samsung", "Galaxy A", "Android", "5G", "Camera", "Gaming", "Premium Midrange"],
    colors: [
      { value: "Awesome Graphite", slug: "graphite" },
      { value: "Awesome Olive", slug: "olive" },
      { value: "Awesome Lightgray", slug: "lightgray" },
      { value: "Awesome Pink", slug: "pink" },
    ],
    ram: [{ value: "8GB", priceAdd: 0 }, { value: "12GB", priceAdd: 150 }],
    storage: [{ value: "128GB", priceAdd: 0 }, { value: "256GB", priceAdd: 250 }],
    spec: {
      displaySize: "6.7\"", panel: "Super AMOLED", refresh: "120Hz", resolution: "FHD+ 1080 × 2340", brightness: "1200 nits",
      chip: "Samsung Exynos 1580", gpu: "Xclipse 540", ramLabel: "8GB / 12GB", storageLabel: "128GB / 256GB", microSD: false,
      rearCamera: "50MP OIS", ultraWide: "12MP אולטרה‑רחבה", macro: "5MP מאקרו", depth: null, frontCamera: "12MP", video: "4K @ 30fps",
      battery: "5000mAh", fastCharge: "טעינה מהירה 45W", bluetooth: "Bluetooth 5.3", wifi: "Wi‑Fi 6", nfc: true, gps: GPS, usbc: "USB‑C 2.0",
      fiveG: true, dualSim: true, esim: true, knox: true, android: "Android 15", oneUi: "One UI 7", fingerprint: FP_UDC,
      stereo: true, alwaysOn: true, ip: "IP67", weight: "198 g", dimensions: "162.2 × 77.5 × 7.4 mm",
    },
  },
  {
    key: "samsung-galaxy-a36",
    slug: "samsung-galaxy-a36",
    series: "Galaxy A",
    segment: "mid",
    model: "Galaxy A36 5G",
    name_en: "Samsung Galaxy A36 5G",
    name_he: "Samsung Galaxy A36 5G",
    name_ar: "Samsung Galaxy A36 5G",
    basePrice: 1299,
    featured: true,
    tags: ["NEW", "Samsung", "Galaxy A", "Android", "5G", "Camera", "Mid Range"],
    colors: [
      { value: "Awesome Black", slug: "black" },
      { value: "Awesome White", slug: "white" },
      { value: "Awesome Lavender", slug: "lavender" },
      { value: "Awesome Lime", slug: "lime" },
    ],
    ram: [{ value: "6GB", priceAdd: 0 }, { value: "8GB", priceAdd: 120 }],
    storage: [{ value: "128GB", priceAdd: 0 }, { value: "256GB", priceAdd: 200 }],
    spec: {
      displaySize: "6.7\"", panel: "Super AMOLED", refresh: "120Hz", resolution: "FHD+ 1080 × 2340", brightness: "1200 nits",
      chip: "Snapdragon 6 Gen 3", gpu: "Adreno 710", ramLabel: "6GB / 8GB", storageLabel: "128GB / 256GB", microSD: true,
      rearCamera: "50MP OIS", ultraWide: "8MP אולטרה‑רחבה", macro: "5MP מאקרו", depth: null, frontCamera: "12MP", video: "4K @ 30fps",
      battery: "5000mAh", fastCharge: "טעינה מהירה 45W", bluetooth: "Bluetooth 5.3", wifi: "Wi‑Fi 5", nfc: true, gps: GPS, usbc: "USB‑C 2.0",
      fiveG: true, dualSim: true, esim: true, knox: true, android: "Android 15", oneUi: "One UI 7", fingerprint: FP_UDC,
      stereo: true, alwaysOn: true, ip: "IP67", weight: "195 g", dimensions: "162.9 × 78.2 × 7.4 mm",
    },
  },
  {
    key: "samsung-galaxy-a26",
    slug: "samsung-galaxy-a26",
    series: "Galaxy A",
    segment: "budget",
    model: "Galaxy A26 5G",
    name_en: "Samsung Galaxy A26 5G",
    name_he: "Samsung Galaxy A26 5G",
    name_ar: "Samsung Galaxy A26 5G",
    basePrice: 999,
    tags: ["NEW", "Samsung", "Galaxy A", "Android", "5G", "Battery", "Budget", "Student"],
    colors: [
      { value: "Black", slug: "black" },
      { value: "White", slug: "white" },
      { value: "Mint", slug: "mint" },
      { value: "Peachpink", slug: "peachpink" },
    ],
    ram: [{ value: "6GB", priceAdd: 0 }, { value: "8GB", priceAdd: 120 }],
    storage: [{ value: "128GB", priceAdd: 0 }, { value: "256GB", priceAdd: 200 }],
    spec: {
      displaySize: "6.7\"", panel: "Super AMOLED", refresh: "120Hz", resolution: "FHD+ 1080 × 2340", brightness: "1000 nits",
      chip: "Samsung Exynos 1380", gpu: "Mali‑G68", ramLabel: "6GB / 8GB", storageLabel: "128GB / 256GB", microSD: true,
      rearCamera: "50MP OIS", ultraWide: "8MP אולטרה‑רחבה", macro: "2MP מאקרו", depth: null, frontCamera: "13MP", video: "4K @ 30fps",
      battery: "5000mAh", fastCharge: "טעינה מהירה 25W", bluetooth: "Bluetooth 5.3", wifi: "Wi‑Fi 5", nfc: true, gps: GPS, usbc: "USB‑C 2.0",
      fiveG: true, dualSim: true, esim: true, knox: true, android: "Android 15", oneUi: "One UI 7", fingerprint: FP_UDC,
      stereo: true, alwaysOn: true, ip: "IP67", weight: "200 g", dimensions: "164.0 × 77.5 × 7.7 mm",
    },
  },

  // ---------------- A55 / A35 / A25 (2024) ----------------
  {
    key: "samsung-galaxy-a55",
    slug: "samsung-galaxy-a55",
    series: "Galaxy A",
    segment: "premium-mid",
    model: "Galaxy A55 5G",
    name_en: "Samsung Galaxy A55 5G",
    name_he: "Samsung Galaxy A55 5G",
    name_ar: "Samsung Galaxy A55 5G",
    basePrice: 1499,
    featured: true,
    tags: ["Samsung", "Galaxy A", "Android", "5G", "Camera", "Gaming", "Premium Midrange"],
    colors: [
      { value: "Awesome Iceblue", slug: "iceblue" },
      { value: "Awesome Lilac", slug: "lilac" },
      { value: "Awesome Navy", slug: "navy" },
      { value: "Awesome Lemon", slug: "lemon" },
    ],
    ram: [{ value: "8GB", priceAdd: 0 }, { value: "12GB", priceAdd: 150 }],
    storage: [{ value: "128GB", priceAdd: 0 }, { value: "256GB", priceAdd: 250 }],
    spec: {
      displaySize: "6.6\"", panel: "Super AMOLED", refresh: "120Hz", resolution: "FHD+ 1080 × 2340", brightness: "1000 nits",
      chip: "Samsung Exynos 1480", gpu: "Xclipse 530", ramLabel: "8GB / 12GB", storageLabel: "128GB / 256GB", microSD: true,
      rearCamera: "50MP OIS", ultraWide: "12MP אולטרה‑רחבה", macro: "5MP מאקרו", depth: null, frontCamera: "32MP", video: "4K @ 30fps",
      battery: "5000mAh", fastCharge: "טעינה מהירה 25W", bluetooth: "Bluetooth 5.3", wifi: "Wi‑Fi 6E", nfc: true, gps: GPS, usbc: "USB‑C 2.0",
      fiveG: true, dualSim: true, esim: true, knox: true, android: "Android 15", oneUi: "One UI 7", fingerprint: FP_UDC,
      stereo: true, alwaysOn: true, ip: "IP67", weight: "213 g", dimensions: "161.1 × 77.4 × 8.2 mm",
    },
  },
  {
    key: "samsung-galaxy-a35",
    slug: "samsung-galaxy-a35",
    series: "Galaxy A",
    segment: "mid",
    model: "Galaxy A35 5G",
    name_en: "Samsung Galaxy A35 5G",
    name_he: "Samsung Galaxy A35 5G",
    name_ar: "Samsung Galaxy A35 5G",
    basePrice: 1099,
    tags: ["Samsung", "Galaxy A", "Android", "5G", "Camera", "Mid Range"],
    colors: [
      { value: "Awesome Iceblue", slug: "iceblue" },
      { value: "Awesome Lilac", slug: "lilac" },
      { value: "Awesome Navy", slug: "navy" },
      { value: "Awesome Lemon", slug: "lemon" },
    ],
    ram: [{ value: "6GB", priceAdd: 0 }, { value: "8GB", priceAdd: 120 }],
    storage: [{ value: "128GB", priceAdd: 0 }, { value: "256GB", priceAdd: 200 }],
    spec: {
      displaySize: "6.6\"", panel: "Super AMOLED", refresh: "120Hz", resolution: "FHD+ 1080 × 2340", brightness: "1000 nits",
      chip: "Samsung Exynos 1380", gpu: "Mali‑G68", ramLabel: "6GB / 8GB", storageLabel: "128GB / 256GB", microSD: true,
      rearCamera: "50MP OIS", ultraWide: "8MP אולטרה‑רחבה", macro: "5MP מאקרו", depth: null, frontCamera: "13MP", video: "4K @ 30fps",
      battery: "5000mAh", fastCharge: "טעינה מהירה 25W", bluetooth: "Bluetooth 5.3", wifi: "Wi‑Fi 5", nfc: true, gps: GPS, usbc: "USB‑C 2.0",
      fiveG: true, dualSim: true, esim: true, knox: true, android: "Android 15", oneUi: "One UI 7", fingerprint: FP_UDC,
      stereo: true, alwaysOn: true, ip: "IP67", weight: "209 g", dimensions: "161.7 × 78.0 × 8.2 mm",
    },
  },
  {
    key: "samsung-galaxy-a25",
    slug: "samsung-galaxy-a25",
    series: "Galaxy A",
    segment: "budget",
    model: "Galaxy A25 5G",
    name_en: "Samsung Galaxy A25 5G",
    name_he: "Samsung Galaxy A25 5G",
    name_ar: "Samsung Galaxy A25 5G",
    basePrice: 899,
    tags: ["Samsung", "Galaxy A", "Android", "5G", "Battery", "Budget", "Student"],
    colors: [
      { value: "Blue Black", slug: "blue-black" },
      { value: "Blue", slug: "blue" },
      { value: "Yellow", slug: "yellow" },
      { value: "Light Blue", slug: "light-blue" },
    ],
    ram: [{ value: "6GB", priceAdd: 0 }, { value: "8GB", priceAdd: 120 }],
    storage: [{ value: "128GB", priceAdd: 0 }, { value: "256GB", priceAdd: 200 }],
    spec: {
      displaySize: "6.5\"", panel: "Super AMOLED", refresh: "120Hz", resolution: "FHD+ 1080 × 2340", brightness: "1000 nits",
      chip: "Samsung Exynos 1280", gpu: "Mali‑G68", ramLabel: "6GB / 8GB", storageLabel: "128GB / 256GB", microSD: true,
      rearCamera: "50MP OIS", ultraWide: "8MP אולטרה‑רחבה", macro: "2MP מאקרו", depth: null, frontCamera: "13MP", video: "4K @ 30fps",
      battery: "5000mAh", fastCharge: "טעינה מהירה 25W", bluetooth: "Bluetooth 5.3", wifi: "Wi‑Fi 5", nfc: true, gps: GPS, usbc: "USB‑C 2.0",
      fiveG: true, dualSim: true, esim: true, knox: true, android: "Android 15", oneUi: "One UI 7", fingerprint: FP_UDC,
      stereo: true, alwaysOn: true, ip: null, weight: "197 g", dimensions: "161.0 × 76.5 × 8.3 mm",
    },
  },

  // ---------------- A54 / A34 / A24 (2023) ----------------
  {
    key: "samsung-galaxy-a54",
    slug: "samsung-galaxy-a54",
    series: "Galaxy A",
    segment: "premium-mid",
    model: "Galaxy A54 5G",
    name_en: "Samsung Galaxy A54 5G",
    name_he: "Samsung Galaxy A54 5G",
    name_ar: "Samsung Galaxy A54 5G",
    basePrice: 1299,
    tags: ["Samsung", "Galaxy A", "Android", "5G", "Camera", "Gaming", "Premium Midrange"],
    colors: [
      { value: "Awesome Graphite", slug: "graphite" },
      { value: "Awesome Lime", slug: "lime" },
      { value: "Awesome Violet", slug: "violet" },
      { value: "Awesome White", slug: "white" },
    ],
    ram: [{ value: "8GB", priceAdd: 0 }],
    storage: [{ value: "128GB", priceAdd: 0 }, { value: "256GB", priceAdd: 250 }],
    spec: {
      displaySize: "6.4\"", panel: "Super AMOLED", refresh: "120Hz", resolution: "FHD+ 1080 × 2340", brightness: "1000 nits",
      chip: "Samsung Exynos 1380", gpu: "Mali‑G68", ramLabel: "8GB", storageLabel: "128GB / 256GB", microSD: true,
      rearCamera: "50MP OIS", ultraWide: "12MP אולטרה‑רחבה", macro: "5MP מאקרו", depth: null, frontCamera: "32MP", video: "4K @ 30fps",
      battery: "5000mAh", fastCharge: "טעינה מהירה 25W", bluetooth: "Bluetooth 5.3", wifi: "Wi‑Fi 6", nfc: true, gps: GPS, usbc: "USB‑C 2.0",
      fiveG: true, dualSim: true, esim: true, knox: true, android: "Android 15", oneUi: "One UI 7", fingerprint: FP_UDC,
      stereo: true, alwaysOn: true, ip: "IP67", weight: "202 g", dimensions: "158.2 × 76.7 × 8.2 mm",
    },
  },
  {
    key: "samsung-galaxy-a34",
    slug: "samsung-galaxy-a34",
    series: "Galaxy A",
    segment: "mid",
    model: "Galaxy A34 5G",
    name_en: "Samsung Galaxy A34 5G",
    name_he: "Samsung Galaxy A34 5G",
    name_ar: "Samsung Galaxy A34 5G",
    basePrice: 999,
    tags: ["Samsung", "Galaxy A", "Android", "5G", "Camera", "Mid Range"],
    colors: [
      { value: "Awesome Graphite", slug: "graphite" },
      { value: "Awesome Lime", slug: "lime" },
      { value: "Awesome Violet", slug: "violet" },
      { value: "Awesome Silver", slug: "silver" },
    ],
    ram: [{ value: "6GB", priceAdd: 0 }, { value: "8GB", priceAdd: 120 }],
    storage: [{ value: "128GB", priceAdd: 0 }, { value: "256GB", priceAdd: 200 }],
    spec: {
      displaySize: "6.6\"", panel: "Super AMOLED", refresh: "120Hz", resolution: "FHD+ 1080 × 2340", brightness: "1000 nits",
      chip: "MediaTek Dimensity 1080", gpu: "Mali‑G68", ramLabel: "6GB / 8GB", storageLabel: "128GB / 256GB", microSD: true,
      rearCamera: "48MP OIS", ultraWide: "8MP אולטרה‑רחבה", macro: "5MP מאקרו", depth: null, frontCamera: "13MP", video: "4K @ 30fps",
      battery: "5000mAh", fastCharge: "טעינה מהירה 25W", bluetooth: "Bluetooth 5.3", wifi: "Wi‑Fi 5", nfc: true, gps: GPS, usbc: "USB‑C 2.0",
      fiveG: true, dualSim: true, esim: false, knox: true, android: "Android 15", oneUi: "One UI 7", fingerprint: FP_UDC,
      stereo: true, alwaysOn: true, ip: "IP67", weight: "199 g", dimensions: "161.3 × 78.1 × 8.2 mm",
    },
  },
  {
    key: "samsung-galaxy-a24",
    slug: "samsung-galaxy-a24",
    series: "Galaxy A",
    segment: "budget",
    model: "Galaxy A24",
    name_en: "Samsung Galaxy A24",
    name_he: "Samsung Galaxy A24",
    name_ar: "Samsung Galaxy A24",
    basePrice: 799,
    tags: ["Samsung", "Galaxy A", "Android", "Battery", "Budget", "Student"],
    colors: [
      { value: "Black", slug: "black" },
      { value: "Silver", slug: "silver" },
      { value: "Gold", slug: "gold" },
      { value: "Light Green", slug: "light-green" },
    ],
    ram: [{ value: "6GB", priceAdd: 0 }, { value: "8GB", priceAdd: 120 }],
    storage: [{ value: "128GB", priceAdd: 0 }],
    spec: {
      displaySize: "6.5\"", panel: "Super AMOLED", refresh: "90Hz", resolution: "FHD+ 1080 × 2340", brightness: "1000 nits",
      chip: "MediaTek Helio G99", gpu: "Mali‑G57", ramLabel: "6GB / 8GB", storageLabel: "128GB", microSD: true,
      rearCamera: "50MP OIS", ultraWide: "5MP אולטרה‑רחבה", macro: "2MP מאקרו", depth: null, frontCamera: "13MP", video: "1080p @ 30fps",
      battery: "5000mAh", fastCharge: "טעינה מהירה 25W", bluetooth: "Bluetooth 5.3", wifi: "Wi‑Fi 5", nfc: true, gps: GPS, usbc: "USB‑C 2.0",
      fiveG: false, dualSim: true, esim: false, knox: true, android: "Android 14", oneUi: "One UI 6.1", fingerprint: FP_SIDE,
      stereo: false, alwaysOn: true, ip: null, weight: "195 g", dimensions: "162.1 × 77.6 × 8.3 mm",
    },
  },

  // ---------------- A53 / A33 / A23 (2022) ----------------
  {
    key: "samsung-galaxy-a53",
    slug: "samsung-galaxy-a53",
    series: "Galaxy A",
    segment: "premium-mid",
    model: "Galaxy A53 5G",
    name_en: "Samsung Galaxy A53 5G",
    name_he: "Samsung Galaxy A53 5G",
    name_ar: "Samsung Galaxy A53 5G",
    basePrice: 999,
    tags: ["Samsung", "Galaxy A", "Android", "5G", "Camera", "Premium Midrange"],
    colors: [
      { value: "Awesome Black", slug: "black" },
      { value: "Awesome White", slug: "white" },
      { value: "Awesome Blue", slug: "blue" },
      { value: "Awesome Peach", slug: "peach" },
    ],
    ram: [{ value: "6GB", priceAdd: 0 }, { value: "8GB", priceAdd: 120 }],
    storage: [{ value: "128GB", priceAdd: 0 }, { value: "256GB", priceAdd: 250 }],
    spec: {
      displaySize: "6.5\"", panel: "Super AMOLED", refresh: "120Hz", resolution: "FHD+ 1080 × 2400", brightness: "800 nits",
      chip: "Samsung Exynos 1280", gpu: "Mali‑G68", ramLabel: "6GB / 8GB", storageLabel: "128GB / 256GB", microSD: true,
      rearCamera: "64MP OIS", ultraWide: "12MP אולטרה‑רחבה", macro: "5MP מאקרו", depth: "5MP חיישן עומק", frontCamera: "32MP", video: "4K @ 30fps",
      battery: "5000mAh", fastCharge: "טעינה מהירה 25W", bluetooth: "Bluetooth 5.1", wifi: "Wi‑Fi 6", nfc: true, gps: GPS, usbc: "USB‑C 2.0",
      fiveG: true, dualSim: true, esim: false, knox: true, android: "Android 15", oneUi: "One UI 7", fingerprint: FP_UDC,
      stereo: true, alwaysOn: true, ip: "IP67", weight: "189 g", dimensions: "159.6 × 74.8 × 8.1 mm",
    },
  },
  {
    key: "samsung-galaxy-a33",
    slug: "samsung-galaxy-a33",
    series: "Galaxy A",
    segment: "mid",
    model: "Galaxy A33 5G",
    name_en: "Samsung Galaxy A33 5G",
    name_he: "Samsung Galaxy A33 5G",
    name_ar: "Samsung Galaxy A33 5G",
    basePrice: 849,
    tags: ["Samsung", "Galaxy A", "Android", "5G", "Camera", "Mid Range"],
    colors: [
      { value: "Awesome Black", slug: "black" },
      { value: "Awesome White", slug: "white" },
      { value: "Awesome Blue", slug: "blue" },
      { value: "Awesome Peach", slug: "peach" },
    ],
    ram: [{ value: "6GB", priceAdd: 0 }, { value: "8GB", priceAdd: 120 }],
    storage: [{ value: "128GB", priceAdd: 0 }],
    spec: {
      displaySize: "6.4\"", panel: "Super AMOLED", refresh: "90Hz", resolution: "FHD+ 1080 × 2400", brightness: "800 nits",
      chip: "Samsung Exynos 1280", gpu: "Mali‑G68", ramLabel: "6GB / 8GB", storageLabel: "128GB", microSD: true,
      rearCamera: "48MP OIS", ultraWide: "8MP אולטרה‑רחבה", macro: "5MP מאקרו", depth: "2MP חיישן עומק", frontCamera: "13MP", video: "4K @ 30fps",
      battery: "5000mAh", fastCharge: "טעינה מהירה 25W", bluetooth: "Bluetooth 5.1", wifi: "Wi‑Fi 5", nfc: true, gps: GPS, usbc: "USB‑C 2.0",
      fiveG: true, dualSim: true, esim: false, knox: true, android: "Android 15", oneUi: "One UI 7", fingerprint: FP_UDC,
      stereo: true, alwaysOn: true, ip: "IP67", weight: "186 g", dimensions: "159.7 × 74.0 × 8.1 mm",
    },
  },
  {
    key: "samsung-galaxy-a23",
    slug: "samsung-galaxy-a23",
    series: "Galaxy A",
    segment: "budget",
    model: "Galaxy A23 5G",
    name_en: "Samsung Galaxy A23 5G",
    name_he: "Samsung Galaxy A23 5G",
    name_ar: "Samsung Galaxy A23 5G",
    basePrice: 749,
    tags: ["Samsung", "Galaxy A", "Android", "5G", "Battery", "Budget", "Student"],
    colors: [
      { value: "Black", slug: "black" },
      { value: "White", slug: "white" },
      { value: "Blue", slug: "blue" },
      { value: "Peach", slug: "peach" },
    ],
    ram: [{ value: "4GB", priceAdd: 0 }, { value: "6GB", priceAdd: 80 }, { value: "8GB", priceAdd: 160 }],
    storage: [{ value: "64GB", priceAdd: 0 }, { value: "128GB", priceAdd: 150 }],
    spec: {
      displaySize: "6.6\"", panel: "PLS LCD", refresh: "120Hz", resolution: "FHD+ 1080 × 2408", brightness: "600 nits",
      chip: "Snapdragon 695 5G", gpu: "Adreno 619", ramLabel: "4GB / 6GB / 8GB", storageLabel: "64GB / 128GB", microSD: true,
      rearCamera: "50MP", ultraWide: "5MP אולטרה‑רחבה", macro: "2MP מאקרו", depth: "2MP חיישן עומק", frontCamera: "8MP", video: "1080p @ 30fps",
      battery: "5000mAh", fastCharge: "טעינה מהירה 25W", bluetooth: "Bluetooth 5.1", wifi: "Wi‑Fi 5", nfc: true, gps: GPS, usbc: "USB‑C 2.0",
      fiveG: true, dualSim: true, esim: false, knox: true, android: "Android 14", oneUi: "One UI 6.1", fingerprint: FP_SIDE,
      stereo: false, alwaysOn: false, ip: null, weight: "197 g", dimensions: "165.4 × 76.9 × 8.4 mm",
    },
  },
];
