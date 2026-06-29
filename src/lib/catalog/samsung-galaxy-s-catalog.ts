/**
 * REAL Samsung Galaxy S catalog — Samsung Master Catalog Part 1.
 * Specs based on Samsung's official specifications (S23/S24/S25). The S26 series is
 * built on the latest credible specs and must be verified against Samsung's final
 * official sheet once published. No demo / placeholder copy.
 * Images: per color under public/products/samsung/galaxy-s/{key}/{slug}-{main|back|side|angle|lifestyle}.png
 */

import type { Locale } from "../localized";
import type { ProductSpecItem } from "../product-specs";

export type GalaxyColor = { value: string; slug: string };
export type GalaxyStorage = { value: string; priceAdd: number };

type Tier = "s" | "plus" | "ultra";

export type GalaxySpecFields = {
  displaySize: string;
  displayType: string;
  refresh: string;
  resolution: string;
  brightness: string;
  chip: string;
  ram: string;
  storageLabel: string;
  rearCamera: string;
  frontCamera: string;
  video: string;
  battery: string;
  charging: string;
  wirelessCharging: string;
  powerShare: boolean;
  bluetooth: string;
  wifi: string;
  nfc: boolean;
  gps: string;
  usbc: string;
  fiveG: boolean;
  dualSim: boolean;
  esim: boolean;
  galaxyAi: boolean;
  knox: boolean;
  oneUi: string;
  android: string;
  water: string;
  weight: string;
  dimensions: string;
  sPen: boolean;
};

export type GalaxySeed = {
  key: string;
  slug: string;
  series: string;
  tier: Tier;
  model: string;
  name_en: string;
  name_he: string;
  name_ar: string;
  basePrice: number;
  salePercent?: number;
  featured?: boolean;
  tags: string[];
  colors: GalaxyColor[];
  storage: GalaxyStorage[];
  spec: GalaxySpecFields;
};

export const SAMSUNG_GALAXY_S_CATEGORY = {
  parent: {
    key: "smartphones",
    name_he: "סמארטפונים",
    name_ar: "الهواتف الذكية",
    name_en: "Smartphones",
    sortOrder: 10,
    imageUrl: "products/samsung/galaxy-s/samsung-galaxy-s25-ultra/titanium-black-main.png",
  },
  galaxyS: {
    key: "galaxy-s",
    name_he: "Galaxy S",
    name_ar: "Galaxy S",
    name_en: "Galaxy S",
    sortOrder: 12,
    imageUrl: "products/samsung/galaxy-s/samsung-galaxy-s25-ultra/titanium-black-main.png",
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
  he: "מכשיר Galaxy, כבל USB‑C ל‑USB‑C, מחט הוצאת SIM, מדריך הפעלה מהירה. (ללא מטען וללא אוזניות, בהתאם לאריזה הרשמית של Samsung).",
  ar: "جهاز Galaxy، كابل USB‑C إلى USB‑C، أداة إخراج SIM، دليل البدء السريع. (بدون شاحن وبدون سماعات، حسب العبوة الرسمية من Samsung).",
  en: "Galaxy device, USB‑C to USB‑C cable, SIM ejector pin, quick start guide. (No charger or earphones, per Samsung's official box contents).",
};

const T: Record<Locale, Record<string, string>> = {
  he: {
    displaySize: "גודל מסך",
    displayType: "סוג מסך",
    refresh: "קצב רענון",
    resolution: "רזולוציה",
    brightness: "בהירות שיא",
    chip: "מעבד",
    ram: "זיכרון RAM",
    storage: "נפח אחסון",
    rear: "מצלמות אחוריות",
    front: "מצלמה קדמית",
    video: "צילום וידאו",
    battery: "סוללה",
    charging: "טעינה",
    wireless: "טעינה אלחוטית",
    powerShare: "Wireless PowerShare",
    bluetooth: "Bluetooth",
    wifi: "Wi‑Fi",
    nfc: "NFC",
    gps: "GPS",
    usbc: "USB‑C",
    fiveg: "5G",
    dualsim: "Dual SIM",
    esim: "eSIM",
    ai: "Galaxy AI",
    knox: "Samsung Knox",
    oneui: "One UI",
    android: "גרסת Android",
    water: "עמידות למים ואבק",
    weight: "משקל",
    dimensions: "מידות",
    spen: "S Pen",
    warranty: "אחריות",
    inbox: "מה באריזה",
    availability: "זמינות",
    yes: "כן",
  },
  ar: {
    displaySize: "حجم الشاشة",
    displayType: "نوع الشاشة",
    refresh: "معدل التحديث",
    resolution: "الدقة",
    brightness: "ذروة السطوع",
    chip: "المعالج",
    ram: "ذاكرة RAM",
    storage: "سعة التخزين",
    rear: "الكاميرات الخلفية",
    front: "الكاميرا الأمامية",
    video: "تصوير الفيديو",
    battery: "البطارية",
    charging: "الشحن",
    wireless: "الشحن اللاسلكي",
    powerShare: "Wireless PowerShare",
    bluetooth: "Bluetooth",
    wifi: "Wi‑Fi",
    nfc: "NFC",
    gps: "GPS",
    usbc: "USB‑C",
    fiveg: "5G",
    dualsim: "Dual SIM",
    esim: "eSIM",
    ai: "Galaxy AI",
    knox: "Samsung Knox",
    oneui: "One UI",
    android: "إصدار Android",
    water: "مقاومة الماء والغبار",
    weight: "الوزن",
    dimensions: "الأبعاد",
    spen: "S Pen",
    warranty: "الضمان",
    inbox: "محتويات العلبة",
    availability: "التوفر",
    yes: "نعم",
  },
  en: {
    displaySize: "Display size",
    displayType: "Display type",
    refresh: "Refresh rate",
    resolution: "Resolution",
    brightness: "Peak brightness",
    chip: "Processor",
    ram: "RAM",
    storage: "Storage",
    rear: "Rear cameras",
    front: "Front camera",
    video: "Video recording",
    battery: "Battery",
    charging: "Charging",
    wireless: "Wireless charging",
    powerShare: "Wireless PowerShare",
    bluetooth: "Bluetooth",
    wifi: "Wi‑Fi",
    nfc: "NFC",
    gps: "GPS",
    usbc: "USB‑C",
    fiveg: "5G",
    dualsim: "Dual SIM",
    esim: "eSIM",
    ai: "Galaxy AI",
    knox: "Samsung Knox",
    oneui: "One UI",
    android: "Android version",
    water: "Water & dust resistance",
    weight: "Weight",
    dimensions: "Dimensions",
    spen: "S Pen",
    warranty: "Warranty",
    inbox: "In the box",
    availability: "Availability",
    yes: "Yes",
  },
};

export function buildGalaxySpecs(lang: Locale, p: GalaxySeed): ProductSpecItem[] {
  const tt = T[lang];
  const f = p.spec;
  const rows: ProductSpecItem[] = [];
  const add = (title: string, content: string) => rows.push({ title, content });

  add(tt.displaySize, f.displaySize);
  add(tt.displayType, f.displayType);
  add(tt.refresh, f.refresh);
  add(tt.resolution, f.resolution);
  add(tt.brightness, f.brightness);
  add(tt.chip, f.chip);
  add(tt.ram, f.ram);
  add(tt.storage, f.storageLabel);
  add(tt.rear, f.rearCamera);
  add(tt.front, f.frontCamera);
  add(tt.video, f.video);
  add(tt.battery, f.battery);
  add(tt.charging, f.charging);
  add(tt.wireless, f.wirelessCharging);
  if (f.powerShare) add(tt.powerShare, tt.yes);
  add(tt.bluetooth, f.bluetooth);
  add(tt.wifi, f.wifi);
  if (f.nfc) add(tt.nfc, tt.yes);
  add(tt.gps, f.gps);
  add(tt.usbc, f.usbc);
  if (f.fiveG) add(tt.fiveg, tt.yes);
  if (f.dualSim) add(tt.dualsim, tt.yes);
  if (f.esim) add(tt.esim, tt.yes);
  if (f.galaxyAi) add(tt.ai, tt.yes);
  if (f.knox) add(tt.knox, tt.yes);
  add(tt.oneui, f.oneUi);
  add(tt.android, f.android);
  add(tt.water, f.water);
  if (f.sPen) add(tt.spen, tt.yes);
  add(tt.weight, f.weight);
  add(tt.dimensions, f.dimensions);
  add(tt.warranty, WARRANTY[lang]);
  add(tt.inbox, IN_BOX[lang]);
  add(tt.availability, AVAILABILITY[lang]);
  return rows;
}

export function galaxyFeatures(p: GalaxySeed): string[] {
  const f = p.spec;
  const out: string[] = [];
  if (f.galaxyAi) out.push("Galaxy AI", "Circle to Search");
  out.push("Nightography", "Dynamic AMOLED 2X");
  if (p.tier === "ultra") out.push("200MP Camera", "S Pen");
  out.push("Samsung Knox", "IP68", "Fast Charging");
  out.push("Wireless Charging & PowerShare", "5G");
  return out;
}

/** Short marketing summary (2–3 lines). */
export function galaxyShortDescription(lang: Locale, p: GalaxySeed): string {
  const f = p.spec;
  if (lang === "he") {
    return `${p.name_he} — מסך Dynamic AMOLED 2X בגודל ${f.displaySize} ובקצב ${f.refresh}, מעבד ${f.chip} ומערכת מצלמות מתקדמת לצילום יום ולילה. ${f.galaxyAi ? "כולל Galaxy AI, " : ""}עמידות ${f.water} וטעינה מהירה. אחריות יבואן רשמי.`;
  }
  if (lang === "ar") {
    return `${p.name_ar} — شاشة Dynamic AMOLED 2X مقاس ${f.displaySize} بمعدل ${f.refresh}، معالج ${f.chip} ونظام كاميرات متقدم للتصوير نهارًا وليلًا. ${f.galaxyAi ? "مع Galaxy AI، " : ""}مقاومة ${f.water} وشحن سريع. ضمان رسمي.`;
  }
  return `${p.name_en} — ${f.displaySize} Dynamic AMOLED 2X at ${f.refresh}, ${f.chip} processor and an advanced day-and-night camera system. ${f.galaxyAi ? "With Galaxy AI, " : ""}${f.water} rated with fast charging. Official importer warranty.`;
}

/** Full Hebrew-first product description (>= 300 words for he). */
export function galaxyDescription(lang: Locale, p: GalaxySeed): string {
  const f = p.spec;
  const feats = galaxyFeatures(p).map((x) => `✓ ${x}`).join("   ");

  if (lang === "he") {
    const tierLine =
      p.tier === "ultra"
        ? "הדגם המוביל של הסדרה, שנבנה עבור משתמשים שדורשים את המקסימום: מצלמת על ברזולוציה גבוהה, עט S Pen מובנה, מסך ענק וביצועים ללא פשרות."
        : p.tier === "plus"
          ? "מסך גדול יותר וסוללה גדולה יותר עם טעינה מהירה — איזון מושלם בין גודל, ביצועים וניידות."
          : "הקומפקטי והנוח של הסדרה, שמכניס ביצועי דגל וצילום מתקדם לכף היד.";

    return [
      `${p.name_he} הוא סמארטפון דגל מבית Samsung, המשלב עיצוב פרימיום, מסך מרהיב, ביצועים גבוהים ומערכת מצלמות חכמה. ${tierLine}`,
      `המסך הוא Dynamic AMOLED 2X בגודל ${f.displaySize}, ברזולוציית ${f.resolution} ובקצב רענון אדפטיבי של ${f.refresh}, עם בהירות שיא של ${f.brightness} שמבטיחה קריאוּת מצוינת גם תחת שמש ישירה. הצבעים עשירים, השחורים עמוקים והגלילה חלקה במיוחד — בין אם בגלישה, בצפייה בתוכן או במשחקים.`,
      `בלב המכשיר פועל מעבד ${f.chip} יחד עם ${f.ram} זיכרון RAM, שמספקים ביצועים מהירים, ריבוי משימות חלק ומשחקים ברמה גבוהה. נפח האחסון הזמין: ${f.storageLabel}, כך שיש מקום לכל האפליקציות, התמונות והווידאו.`,
      `מערכת המצלמות כוללת ${f.rearCamera}, עם טכנולוגיית Nightography לצילומי לילה בהירים ונקיים, וייצוב מתקדם. המצלמה הקדמית בנפח ${f.frontCamera} מצוינת לסלפי ולשיחות וידאו, וצילום הווידאו תומך ב‑${f.video}.`,
      `הסוללה בקיבולת ${f.battery} מספקת יום שימוש מלא, עם ${f.charging}, ${f.wirelessCharging}${f.powerShare ? " ותמיכה ב‑Wireless PowerShare לטעינת אביזרים" : ""}. כך תמיד יש אנרגיה להמשיך.`,
      `${f.galaxyAi ? "המכשיר כולל את Galaxy AI — סט יכולות בינה מלאכותית חכמות הכוללות Circle to Search, תרגום שיחות בזמן אמת, עריכת תמונות חכמה וכלי כתיבה מתקדמים. " : ""}המכשיר מאובטח באמצעות פלטפורמת ${f.knox ? "Samsung Knox" : "האבטחה של Samsung"} ומריץ את ${f.oneUi} מבוסס ${f.android}, עם עדכוני אבטחה ותוכנה לאורך שנים.`,
      `מבחינת קישוריות: ${f.bluetooth}, ${f.wifi}, ${f.nfc ? "NFC, " : ""}${f.gps}, ${f.usbc}, ${f.fiveG ? "תמיכת 5G, " : ""}${f.dualSim ? "Dual SIM " : ""}${f.esim ? "ו‑eSIM" : ""}. הגוף עומד בתקן ${f.water}, שוקל ${f.weight} ומידותיו ${f.dimensions}${f.sPen ? ", וכולל עט S Pen מובנה לכתיבה, רישום ושליטה מדויקת" : ""}.`,
      `כל מכשיר מגיע עם אחריות יבואן רשמי לשנה ומשלוח מהיר עד הבית. זהו השילוב המושלם בין טכנולוגיה מתקדמת, עיצוב יוקרתי ושימושיות יומיומית.`,
      `יתרונות עיקריים:   ${feats}`,
    ].join("\n\n");
  }

  if (lang === "ar") {
    return [
      `${p.name_ar} هاتف رائد من Samsung يجمع بين تصميم فاخر وشاشة مذهلة وأداء عالٍ ونظام كاميرات ذكي.`,
      `شاشة Dynamic AMOLED 2X مقاس ${f.displaySize} بدقة ${f.resolution} ومعدل تحديث ${f.refresh} وسطوع ذروة ${f.brightness}.`,
      `معالج ${f.chip} مع ${f.ram} و سعات تخزين: ${f.storageLabel}. كاميرات: ${f.rearCamera}، وكاميرا أمامية ${f.frontCamera}، وتصوير ${f.video}.`,
      `بطارية ${f.battery} مع ${f.charging} و${f.wirelessCharging}. ${f.galaxyAi ? "يدعم Galaxy AI. " : ""}يعمل بنظام ${f.oneUi} المبني على ${f.android}، مع ${f.knox ? "Samsung Knox" : "حماية Samsung"}.`,
      `الاتصال: ${f.bluetooth}، ${f.wifi}، ${f.gps}، ${f.usbc}. مقاومة ${f.water}، الوزن ${f.weight}، الأبعاد ${f.dimensions}. ضمان رسمي وشحن سريع.`,
      `أبرز المزايا:   ${feats}`,
    ].join("\n\n");
  }

  return [
    `${p.name_en} is a flagship Samsung smartphone that combines premium design, a stunning display, high performance and a smart camera system.`,
    `A ${f.displaySize} Dynamic AMOLED 2X display at ${f.resolution}, ${f.refresh} adaptive refresh and ${f.brightness} peak brightness.`,
    `Powered by the ${f.chip} with ${f.ram}. Storage options: ${f.storageLabel}. Cameras: ${f.rearCamera}; front ${f.frontCamera}; video ${f.video}.`,
    `A ${f.battery} battery with ${f.charging} and ${f.wirelessCharging}. ${f.galaxyAi ? "Includes Galaxy AI. " : ""}Runs ${f.oneUi} on ${f.android} with ${f.knox ? "Samsung Knox" : "Samsung security"}.`,
    `Connectivity: ${f.bluetooth}, ${f.wifi}, ${f.gps}, ${f.usbc}. ${f.water} rated, ${f.weight}, ${f.dimensions}. Official importer warranty and fast delivery.`,
    `Key highlights:   ${feats}`,
  ].join("\n\n");
}

export type GalaxyImageKind = "main" | "back" | "side" | "angle" | "lifestyle";

export function galaxyImage(key: string, slug: string, kind: GalaxyImageKind): string {
  return `products/samsung/galaxy-s/${key}/${slug}-${kind}.png`;
}

export function galaxyGallery(key: string, slug: string) {
  const kinds: GalaxyImageKind[] = ["main", "back", "side", "angle", "lifestyle"];
  return kinds.map((kind, i) => ({
    url: galaxyImage(key, slug, kind),
    kind,
    isMain: i === 0,
    sortOrder: i,
  }));
}

const COMMON = {
  powerShare: true,
  nfc: true,
  gps: "GPS, GLONASS, BeiDou, Galileo",
  fiveG: true,
  dualSim: true,
  esim: true,
  knox: true,
  water: "IP68",
  wireless15: "טעינה אלחוטית מהירה 15W (Qi)",
};

export const SAMSUNG_GALAXY_S: GalaxySeed[] = [
  // ---------------- Galaxy S26 (projected — verify vs official) ----------------
  {
    key: "samsung-galaxy-s26-ultra",
    slug: "samsung-galaxy-s26-ultra",
    series: "Galaxy S26",
    tier: "ultra",
    model: "Galaxy S26 Ultra",
    name_en: "Samsung Galaxy S26 Ultra",
    name_he: "Samsung Galaxy S26 Ultra",
    name_ar: "Samsung Galaxy S26 Ultra",
    basePrice: 5599,
    featured: true,
    tags: ["NEW", "Samsung", "Galaxy", "Android", "5G", "AI", "Premium", "Camera", "Gaming"],
    colors: [
      { value: "Titanium Black", slug: "titanium-black" },
      { value: "Titanium Silver", slug: "titanium-silver" },
      { value: "Titanium Blue", slug: "titanium-blue" },
      { value: "Titanium Green", slug: "titanium-green" },
    ],
    storage: [
      { value: "256GB", priceAdd: 0 },
      { value: "512GB", priceAdd: 500 },
      { value: "1TB", priceAdd: 1100 },
    ],
    spec: {
      displaySize: "6.9\"",
      displayType: "Dynamic AMOLED 2X",
      refresh: "1–120Hz LTPO",
      resolution: "QHD+ 3120 × 1440",
      brightness: "2600 nits",
      chip: "Snapdragon 8 Elite Gen 2 for Galaxy",
      ram: "12GB",
      storageLabel: "256GB / 512GB / 1TB",
      rearCamera: "200MP רחבה + 50MP אולטרה‑רחבה + 50MP טלה (5x) + 10MP טלה (3x)",
      frontCamera: "12MP",
      video: "8K @ 30fps",
      battery: "5200mAh",
      charging: "טעינה מהירה 45W",
      wirelessCharging: COMMON.wireless15,
      powerShare: COMMON.powerShare,
      bluetooth: "Bluetooth 5.4",
      wifi: "Wi‑Fi 7",
      nfc: COMMON.nfc,
      gps: COMMON.gps,
      usbc: "USB‑C 3.2",
      fiveG: COMMON.fiveG,
      dualSim: COMMON.dualSim,
      esim: COMMON.esim,
      galaxyAi: true,
      knox: COMMON.knox,
      oneUi: "One UI 8",
      android: "Android 16",
      water: COMMON.water,
      weight: "218 g",
      dimensions: "163.0 × 78.0 × 8.2 mm",
      sPen: true,
    },
  },
  {
    key: "samsung-galaxy-s26-plus",
    slug: "samsung-galaxy-s26-plus",
    series: "Galaxy S26",
    tier: "plus",
    model: "Galaxy S26+",
    name_en: "Samsung Galaxy S26+",
    name_he: "Samsung Galaxy S26+",
    name_ar: "Samsung Galaxy S26+",
    basePrice: 4199,
    featured: true,
    tags: ["NEW", "Samsung", "Galaxy", "Android", "5G", "AI", "Premium", "Camera"],
    colors: [
      { value: "Phantom Black", slug: "phantom-black" },
      { value: "Silver", slug: "silver" },
      { value: "Blue", slug: "blue" },
      { value: "Mint", slug: "mint" },
    ],
    storage: [
      { value: "256GB", priceAdd: 0 },
      { value: "512GB", priceAdd: 400 },
    ],
    spec: {
      displaySize: "6.7\"",
      displayType: "Dynamic AMOLED 2X",
      refresh: "1–120Hz LTPO",
      resolution: "QHD+ 3120 × 1440",
      brightness: "2600 nits",
      chip: "Snapdragon 8 Elite Gen 2 for Galaxy",
      ram: "12GB",
      storageLabel: "256GB / 512GB",
      rearCamera: "50MP רחבה + 12MP אולטרה‑רחבה + 10MP טלה (3x)",
      frontCamera: "12MP",
      video: "8K @ 30fps",
      battery: "4900mAh",
      charging: "טעינה מהירה 45W",
      wirelessCharging: COMMON.wireless15,
      powerShare: COMMON.powerShare,
      bluetooth: "Bluetooth 5.4",
      wifi: "Wi‑Fi 7",
      nfc: COMMON.nfc,
      gps: COMMON.gps,
      usbc: "USB‑C 3.2",
      fiveG: COMMON.fiveG,
      dualSim: COMMON.dualSim,
      esim: COMMON.esim,
      galaxyAi: true,
      knox: COMMON.knox,
      oneUi: "One UI 8",
      android: "Android 16",
      water: COMMON.water,
      weight: "190 g",
      dimensions: "158.4 × 75.8 × 7.3 mm",
      sPen: false,
    },
  },
  {
    key: "samsung-galaxy-s26",
    slug: "samsung-galaxy-s26",
    series: "Galaxy S26",
    tier: "s",
    model: "Galaxy S26",
    name_en: "Samsung Galaxy S26",
    name_he: "Samsung Galaxy S26",
    name_ar: "Samsung Galaxy S26",
    basePrice: 3499,
    featured: true,
    tags: ["NEW", "Samsung", "Galaxy", "Android", "5G", "AI", "Camera"],
    colors: [
      { value: "Phantom Black", slug: "phantom-black" },
      { value: "Silver", slug: "silver" },
      { value: "Blue", slug: "blue" },
      { value: "Mint", slug: "mint" },
    ],
    storage: [
      { value: "256GB", priceAdd: 0 },
      { value: "512GB", priceAdd: 400 },
    ],
    spec: {
      displaySize: "6.3\"",
      displayType: "Dynamic AMOLED 2X",
      refresh: "1–120Hz LTPO",
      resolution: "FHD+ 2340 × 1080",
      brightness: "2600 nits",
      chip: "Snapdragon 8 Elite Gen 2 for Galaxy",
      ram: "12GB",
      storageLabel: "256GB / 512GB",
      rearCamera: "50MP רחבה + 12MP אולטרה‑רחבה + 10MP טלה (3x)",
      frontCamera: "12MP",
      video: "8K @ 30fps",
      battery: "4300mAh",
      charging: "טעינה מהירה 25W",
      wirelessCharging: COMMON.wireless15,
      powerShare: COMMON.powerShare,
      bluetooth: "Bluetooth 5.4",
      wifi: "Wi‑Fi 7",
      nfc: COMMON.nfc,
      gps: COMMON.gps,
      usbc: "USB‑C 3.2",
      fiveG: COMMON.fiveG,
      dualSim: COMMON.dualSim,
      esim: COMMON.esim,
      galaxyAi: true,
      knox: COMMON.knox,
      oneUi: "One UI 8",
      android: "Android 16",
      water: COMMON.water,
      weight: "162 g",
      dimensions: "147.0 × 70.5 × 7.2 mm",
      sPen: false,
    },
  },

  // ---------------- Galaxy S25 ----------------
  {
    key: "samsung-galaxy-s25-ultra",
    slug: "samsung-galaxy-s25-ultra",
    series: "Galaxy S25",
    tier: "ultra",
    model: "Galaxy S25 Ultra",
    name_en: "Samsung Galaxy S25 Ultra",
    name_he: "Samsung Galaxy S25 Ultra",
    name_ar: "Samsung Galaxy S25 Ultra",
    basePrice: 5299,
    featured: true,
    tags: ["BEST SELLER", "Samsung", "Galaxy", "Android", "5G", "AI", "Premium", "Camera", "Gaming"],
    colors: [
      { value: "Titanium Silverblue", slug: "titanium-silverblue" },
      { value: "Titanium Black", slug: "titanium-black" },
      { value: "Titanium Whitesilver", slug: "titanium-whitesilver" },
      { value: "Titanium Gray", slug: "titanium-gray" },
    ],
    storage: [
      { value: "256GB", priceAdd: 0 },
      { value: "512GB", priceAdd: 500 },
      { value: "1TB", priceAdd: 1100 },
    ],
    spec: {
      displaySize: "6.9\"",
      displayType: "Dynamic AMOLED 2X",
      refresh: "1–120Hz LTPO",
      resolution: "QHD+ 3120 × 1440",
      brightness: "2600 nits",
      chip: "Snapdragon 8 Elite for Galaxy",
      ram: "12GB",
      storageLabel: "256GB / 512GB / 1TB",
      rearCamera: "200MP רחבה + 50MP אולטרה‑רחבה + 50MP טלה (5x) + 10MP טלה (3x)",
      frontCamera: "12MP",
      video: "8K @ 30fps",
      battery: "5000mAh",
      charging: "טעינה מהירה 45W",
      wirelessCharging: COMMON.wireless15,
      powerShare: COMMON.powerShare,
      bluetooth: "Bluetooth 5.4",
      wifi: "Wi‑Fi 7",
      nfc: COMMON.nfc,
      gps: COMMON.gps,
      usbc: "USB‑C 3.2",
      fiveG: COMMON.fiveG,
      dualSim: COMMON.dualSim,
      esim: COMMON.esim,
      galaxyAi: true,
      knox: COMMON.knox,
      oneUi: "One UI 7",
      android: "Android 15",
      water: COMMON.water,
      weight: "218 g",
      dimensions: "162.8 × 77.6 × 8.2 mm",
      sPen: true,
    },
  },
  {
    key: "samsung-galaxy-s25-plus",
    slug: "samsung-galaxy-s25-plus",
    series: "Galaxy S25",
    tier: "plus",
    model: "Galaxy S25+",
    name_en: "Samsung Galaxy S25+",
    name_he: "Samsung Galaxy S25+",
    name_ar: "Samsung Galaxy S25+",
    basePrice: 3999,
    featured: true,
    tags: ["Samsung", "Galaxy", "Android", "5G", "AI", "Premium", "Camera"],
    colors: [
      { value: "Navy", slug: "navy" },
      { value: "Icy Blue", slug: "icy-blue" },
      { value: "Mint", slug: "mint" },
      { value: "Silver Shadow", slug: "silver-shadow" },
    ],
    storage: [
      { value: "256GB", priceAdd: 0 },
      { value: "512GB", priceAdd: 400 },
    ],
    spec: {
      displaySize: "6.7\"",
      displayType: "Dynamic AMOLED 2X",
      refresh: "1–120Hz LTPO",
      resolution: "QHD+ 3120 × 1440",
      brightness: "2600 nits",
      chip: "Snapdragon 8 Elite for Galaxy",
      ram: "12GB",
      storageLabel: "256GB / 512GB",
      rearCamera: "50MP רחבה + 12MP אולטרה‑רחבה + 10MP טלה (3x)",
      frontCamera: "12MP",
      video: "8K @ 30fps",
      battery: "4900mAh",
      charging: "טעינה מהירה 45W",
      wirelessCharging: COMMON.wireless15,
      powerShare: COMMON.powerShare,
      bluetooth: "Bluetooth 5.4",
      wifi: "Wi‑Fi 7",
      nfc: COMMON.nfc,
      gps: COMMON.gps,
      usbc: "USB‑C 3.2",
      fiveG: COMMON.fiveG,
      dualSim: COMMON.dualSim,
      esim: COMMON.esim,
      galaxyAi: true,
      knox: COMMON.knox,
      oneUi: "One UI 7",
      android: "Android 15",
      water: COMMON.water,
      weight: "190 g",
      dimensions: "158.4 × 75.8 × 7.3 mm",
      sPen: false,
    },
  },
  {
    key: "samsung-galaxy-s25",
    slug: "samsung-galaxy-s25",
    series: "Galaxy S25",
    tier: "s",
    model: "Galaxy S25",
    name_en: "Samsung Galaxy S25",
    name_he: "Samsung Galaxy S25",
    name_ar: "Samsung Galaxy S25",
    basePrice: 3299,
    tags: ["Samsung", "Galaxy", "Android", "5G", "AI", "Camera"],
    colors: [
      { value: "Navy", slug: "navy" },
      { value: "Icy Blue", slug: "icy-blue" },
      { value: "Mint", slug: "mint" },
      { value: "Silver Shadow", slug: "silver-shadow" },
    ],
    storage: [
      { value: "128GB", priceAdd: 0 },
      { value: "256GB", priceAdd: 200 },
      { value: "512GB", priceAdd: 500 },
    ],
    spec: {
      displaySize: "6.2\"",
      displayType: "Dynamic AMOLED 2X",
      refresh: "1–120Hz LTPO",
      resolution: "FHD+ 2340 × 1080",
      brightness: "2600 nits",
      chip: "Snapdragon 8 Elite for Galaxy",
      ram: "12GB",
      storageLabel: "128GB / 256GB / 512GB",
      rearCamera: "50MP רחבה + 12MP אולטרה‑רחבה + 10MP טלה (3x)",
      frontCamera: "12MP",
      video: "8K @ 30fps",
      battery: "4000mAh",
      charging: "טעינה מהירה 25W",
      wirelessCharging: COMMON.wireless15,
      powerShare: COMMON.powerShare,
      bluetooth: "Bluetooth 5.4",
      wifi: "Wi‑Fi 7",
      nfc: COMMON.nfc,
      gps: COMMON.gps,
      usbc: "USB‑C 3.2",
      fiveG: COMMON.fiveG,
      dualSim: COMMON.dualSim,
      esim: COMMON.esim,
      galaxyAi: true,
      knox: COMMON.knox,
      oneUi: "One UI 7",
      android: "Android 15",
      water: COMMON.water,
      weight: "162 g",
      dimensions: "146.9 × 70.5 × 7.2 mm",
      sPen: false,
    },
  },

  // ---------------- Galaxy S24 ----------------
  {
    key: "samsung-galaxy-s24-ultra",
    slug: "samsung-galaxy-s24-ultra",
    series: "Galaxy S24",
    tier: "ultra",
    model: "Galaxy S24 Ultra",
    name_en: "Samsung Galaxy S24 Ultra",
    name_he: "Samsung Galaxy S24 Ultra",
    name_ar: "Samsung Galaxy S24 Ultra",
    basePrice: 4999,
    featured: true,
    tags: ["Samsung", "Galaxy", "Android", "5G", "AI", "Premium", "Camera", "Gaming"],
    colors: [
      { value: "Titanium Black", slug: "titanium-black" },
      { value: "Titanium Gray", slug: "titanium-gray" },
      { value: "Titanium Violet", slug: "titanium-violet" },
      { value: "Titanium Yellow", slug: "titanium-yellow" },
    ],
    storage: [
      { value: "256GB", priceAdd: 0 },
      { value: "512GB", priceAdd: 500 },
      { value: "1TB", priceAdd: 1100 },
    ],
    spec: {
      displaySize: "6.8\"",
      displayType: "Dynamic AMOLED 2X",
      refresh: "1–120Hz LTPO",
      resolution: "QHD+ 3120 × 1440",
      brightness: "2600 nits",
      chip: "Snapdragon 8 Gen 3 for Galaxy",
      ram: "12GB",
      storageLabel: "256GB / 512GB / 1TB",
      rearCamera: "200MP רחבה + 12MP אולטרה‑רחבה + 50MP טלה (5x) + 10MP טלה (3x)",
      frontCamera: "12MP",
      video: "8K @ 30fps",
      battery: "5000mAh",
      charging: "טעינה מהירה 45W",
      wirelessCharging: COMMON.wireless15,
      powerShare: COMMON.powerShare,
      bluetooth: "Bluetooth 5.3",
      wifi: "Wi‑Fi 7",
      nfc: COMMON.nfc,
      gps: COMMON.gps,
      usbc: "USB‑C 3.2",
      fiveG: COMMON.fiveG,
      dualSim: COMMON.dualSim,
      esim: COMMON.esim,
      galaxyAi: true,
      knox: COMMON.knox,
      oneUi: "One UI 7",
      android: "Android 15",
      water: COMMON.water,
      weight: "232 g",
      dimensions: "162.3 × 79.0 × 8.6 mm",
      sPen: true,
    },
  },
  {
    key: "samsung-galaxy-s24-plus",
    slug: "samsung-galaxy-s24-plus",
    series: "Galaxy S24",
    tier: "plus",
    model: "Galaxy S24+",
    name_en: "Samsung Galaxy S24+",
    name_he: "Samsung Galaxy S24+",
    name_ar: "Samsung Galaxy S24+",
    basePrice: 3699,
    tags: ["Samsung", "Galaxy", "Android", "5G", "AI", "Premium", "Camera"],
    colors: [
      { value: "Onyx Black", slug: "onyx-black" },
      { value: "Marble Gray", slug: "marble-gray" },
      { value: "Cobalt Violet", slug: "cobalt-violet" },
      { value: "Amber Yellow", slug: "amber-yellow" },
    ],
    storage: [
      { value: "256GB", priceAdd: 0 },
      { value: "512GB", priceAdd: 400 },
    ],
    spec: {
      displaySize: "6.7\"",
      displayType: "Dynamic AMOLED 2X",
      refresh: "1–120Hz LTPO",
      resolution: "QHD+ 3120 × 1440",
      brightness: "2600 nits",
      chip: "Samsung Exynos 2400",
      ram: "12GB",
      storageLabel: "256GB / 512GB",
      rearCamera: "50MP רחבה + 12MP אולטרה‑רחבה + 10MP טלה (3x)",
      frontCamera: "12MP",
      video: "8K @ 30fps",
      battery: "4900mAh",
      charging: "טעינה מהירה 45W",
      wirelessCharging: COMMON.wireless15,
      powerShare: COMMON.powerShare,
      bluetooth: "Bluetooth 5.3",
      wifi: "Wi‑Fi 6E",
      nfc: COMMON.nfc,
      gps: COMMON.gps,
      usbc: "USB‑C 3.2",
      fiveG: COMMON.fiveG,
      dualSim: COMMON.dualSim,
      esim: COMMON.esim,
      galaxyAi: true,
      knox: COMMON.knox,
      oneUi: "One UI 7",
      android: "Android 15",
      water: COMMON.water,
      weight: "196 g",
      dimensions: "158.5 × 75.9 × 7.7 mm",
      sPen: false,
    },
  },
  {
    key: "samsung-galaxy-s24",
    slug: "samsung-galaxy-s24",
    series: "Galaxy S24",
    tier: "s",
    model: "Galaxy S24",
    name_en: "Samsung Galaxy S24",
    name_he: "Samsung Galaxy S24",
    name_ar: "Samsung Galaxy S24",
    basePrice: 2999,
    tags: ["Samsung", "Galaxy", "Android", "5G", "AI", "Camera"],
    colors: [
      { value: "Onyx Black", slug: "onyx-black" },
      { value: "Marble Gray", slug: "marble-gray" },
      { value: "Cobalt Violet", slug: "cobalt-violet" },
      { value: "Amber Yellow", slug: "amber-yellow" },
    ],
    storage: [
      { value: "128GB", priceAdd: 0 },
      { value: "256GB", priceAdd: 200 },
      { value: "512GB", priceAdd: 500 },
    ],
    spec: {
      displaySize: "6.2\"",
      displayType: "Dynamic AMOLED 2X",
      refresh: "1–120Hz LTPO",
      resolution: "FHD+ 2340 × 1080",
      brightness: "2600 nits",
      chip: "Samsung Exynos 2400",
      ram: "8GB",
      storageLabel: "128GB / 256GB / 512GB",
      rearCamera: "50MP רחבה + 12MP אולטרה‑רחבה + 10MP טלה (3x)",
      frontCamera: "12MP",
      video: "8K @ 30fps",
      battery: "4000mAh",
      charging: "טעינה מהירה 25W",
      wirelessCharging: COMMON.wireless15,
      powerShare: COMMON.powerShare,
      bluetooth: "Bluetooth 5.3",
      wifi: "Wi‑Fi 6E",
      nfc: COMMON.nfc,
      gps: COMMON.gps,
      usbc: "USB‑C 3.2",
      fiveG: COMMON.fiveG,
      dualSim: COMMON.dualSim,
      esim: COMMON.esim,
      galaxyAi: true,
      knox: COMMON.knox,
      oneUi: "One UI 7",
      android: "Android 15",
      water: COMMON.water,
      weight: "167 g",
      dimensions: "147.0 × 70.6 × 7.6 mm",
      sPen: false,
    },
  },

  // ---------------- Galaxy S23 ----------------
  {
    key: "samsung-galaxy-s23-ultra",
    slug: "samsung-galaxy-s23-ultra",
    series: "Galaxy S23",
    tier: "ultra",
    model: "Galaxy S23 Ultra",
    name_en: "Samsung Galaxy S23 Ultra",
    name_he: "Samsung Galaxy S23 Ultra",
    name_ar: "Samsung Galaxy S23 Ultra",
    basePrice: 3999,
    tags: ["Samsung", "Galaxy", "Android", "5G", "AI", "Premium", "Camera"],
    colors: [
      { value: "Phantom Black", slug: "phantom-black" },
      { value: "Cream", slug: "cream" },
      { value: "Green", slug: "green" },
      { value: "Lavender", slug: "lavender" },
    ],
    storage: [
      { value: "256GB", priceAdd: 0 },
      { value: "512GB", priceAdd: 400 },
      { value: "1TB", priceAdd: 900 },
    ],
    spec: {
      displaySize: "6.8\"",
      displayType: "Dynamic AMOLED 2X",
      refresh: "1–120Hz LTPO",
      resolution: "QHD+ 3088 × 1440",
      brightness: "1750 nits",
      chip: "Snapdragon 8 Gen 2 for Galaxy",
      ram: "12GB",
      storageLabel: "256GB / 512GB / 1TB",
      rearCamera: "200MP רחבה + 12MP אולטרה‑רחבה + 10MP טלה (3x) + 10MP טלה (10x)",
      frontCamera: "12MP",
      video: "8K @ 30fps",
      battery: "5000mAh",
      charging: "טעינה מהירה 45W",
      wirelessCharging: COMMON.wireless15,
      powerShare: COMMON.powerShare,
      bluetooth: "Bluetooth 5.3",
      wifi: "Wi‑Fi 6E",
      nfc: COMMON.nfc,
      gps: COMMON.gps,
      usbc: "USB‑C 3.2",
      fiveG: COMMON.fiveG,
      dualSim: COMMON.dualSim,
      esim: COMMON.esim,
      galaxyAi: true,
      knox: COMMON.knox,
      oneUi: "One UI 7",
      android: "Android 15",
      water: COMMON.water,
      weight: "234 g",
      dimensions: "163.4 × 78.1 × 8.9 mm",
      sPen: true,
    },
  },
  {
    key: "samsung-galaxy-s23-plus",
    slug: "samsung-galaxy-s23-plus",
    series: "Galaxy S23",
    tier: "plus",
    model: "Galaxy S23+",
    name_en: "Samsung Galaxy S23+",
    name_he: "Samsung Galaxy S23+",
    name_ar: "Samsung Galaxy S23+",
    basePrice: 2999,
    tags: ["Samsung", "Galaxy", "Android", "5G", "AI", "Camera"],
    colors: [
      { value: "Phantom Black", slug: "phantom-black" },
      { value: "Cream", slug: "cream" },
      { value: "Green", slug: "green" },
      { value: "Lavender", slug: "lavender" },
    ],
    storage: [
      { value: "256GB", priceAdd: 0 },
      { value: "512GB", priceAdd: 300 },
    ],
    spec: {
      displaySize: "6.6\"",
      displayType: "Dynamic AMOLED 2X",
      refresh: "48–120Hz",
      resolution: "FHD+ 2340 × 1080",
      brightness: "1750 nits",
      chip: "Snapdragon 8 Gen 2 for Galaxy",
      ram: "8GB",
      storageLabel: "256GB / 512GB",
      rearCamera: "50MP רחבה + 12MP אולטרה‑רחבה + 10MP טלה (3x)",
      frontCamera: "12MP",
      video: "8K @ 30fps",
      battery: "4700mAh",
      charging: "טעינה מהירה 45W",
      wirelessCharging: COMMON.wireless15,
      powerShare: COMMON.powerShare,
      bluetooth: "Bluetooth 5.3",
      wifi: "Wi‑Fi 6E",
      nfc: COMMON.nfc,
      gps: COMMON.gps,
      usbc: "USB‑C 3.2",
      fiveG: COMMON.fiveG,
      dualSim: COMMON.dualSim,
      esim: COMMON.esim,
      galaxyAi: true,
      knox: COMMON.knox,
      oneUi: "One UI 7",
      android: "Android 15",
      water: COMMON.water,
      weight: "196 g",
      dimensions: "157.8 × 76.2 × 7.6 mm",
      sPen: false,
    },
  },
  {
    key: "samsung-galaxy-s23",
    slug: "samsung-galaxy-s23",
    series: "Galaxy S23",
    tier: "s",
    model: "Galaxy S23",
    name_en: "Samsung Galaxy S23",
    name_he: "Samsung Galaxy S23",
    name_ar: "Samsung Galaxy S23",
    basePrice: 2499,
    tags: ["Samsung", "Galaxy", "Android", "5G", "AI", "Camera"],
    colors: [
      { value: "Phantom Black", slug: "phantom-black" },
      { value: "Cream", slug: "cream" },
      { value: "Green", slug: "green" },
      { value: "Lavender", slug: "lavender" },
    ],
    storage: [
      { value: "128GB", priceAdd: 0 },
      { value: "256GB", priceAdd: 200 },
    ],
    spec: {
      displaySize: "6.1\"",
      displayType: "Dynamic AMOLED 2X",
      refresh: "48–120Hz",
      resolution: "FHD+ 2340 × 1080",
      brightness: "1750 nits",
      chip: "Snapdragon 8 Gen 2 for Galaxy",
      ram: "8GB",
      storageLabel: "128GB / 256GB",
      rearCamera: "50MP רחבה + 12MP אולטרה‑רחבה + 10MP טלה (3x)",
      frontCamera: "12MP",
      video: "8K @ 30fps",
      battery: "3900mAh",
      charging: "טעינה מהירה 25W",
      wirelessCharging: COMMON.wireless15,
      powerShare: COMMON.powerShare,
      bluetooth: "Bluetooth 5.3",
      wifi: "Wi‑Fi 6E",
      nfc: COMMON.nfc,
      gps: COMMON.gps,
      usbc: "USB‑C 3.2",
      fiveG: COMMON.fiveG,
      dualSim: COMMON.dualSim,
      esim: COMMON.esim,
      galaxyAi: true,
      knox: COMMON.knox,
      oneUi: "One UI 7",
      android: "Android 15",
      water: COMMON.water,
      weight: "168 g",
      dimensions: "146.3 × 70.9 × 7.6 mm",
      sPen: false,
    },
  },
];
