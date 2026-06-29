/**
 * REAL Apple Watch catalog — Stage 3.
 * Specs based on Apple's official specifications. No demo / placeholder text.
 * Variants: Size, Color (case finish), Band. Price updates via per-option priceAdd.
 * Images: per color under public/products/apple/watch/{key}/{slug}-{main|front|side|back|lifestyle}.png
 */

import type { Locale } from "../localized";
import type { ProductSpecItem } from "../product-specs";

export type WatchOption = {
  value: string;
  slug: string;
  priceAdd?: number;
};

export type WatchSpecFields = {
  sizesLabel: string;
  displayType: string;
  brightness: string;
  alwaysOn: boolean;
  processor: string;
  storage: string;
  cellular: boolean;
  bluetooth: string;
  wifi: string;
  nfc: boolean;
  applePay: boolean;
  heartRate: boolean;
  ecg: boolean;
  bloodOxygen: boolean;
  temperature: boolean;
  fallDetection: boolean;
  crashDetection: boolean;
  water: string;
  depthGauge: string | null;
  batteryNormal: string;
  batteryLowPower: string | null;
  fastCharge: boolean;
  os: string;
  weight: string;
  dimensions: string;
};

export type WatchSeed = {
  key: string;
  slug: string;
  model: string;
  name_en: string;
  name_he: string;
  name_ar: string;
  shortName: string;
  basePrice: number;
  salePercent?: number;
  featured?: boolean;
  tags: string[];
  sizes: WatchOption[];
  colors: WatchOption[];
  bands: WatchOption[];
  spec: WatchSpecFields;
};

export const APPLE_WATCH_CATEGORY = {
  parent: {
    key: "smartwatches",
    name_he: "שעונים חכמים",
    name_ar: "الساعات الذكية",
    name_en: "Smart Watches",
    sortOrder: 30,
    imageUrl: "products/apple/watch/apple-watch-series-10/jet-black-main.png",
  },
  watch: {
    key: "apple-watch",
    name_he: "Apple Watch",
    name_ar: "Apple Watch",
    name_en: "Apple Watch",
    sortOrder: 31,
    imageUrl: "products/apple/watch/apple-watch-series-10/jet-black-main.png",
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

const T: Record<Locale, Record<string, string>> = {
  he: {
    screenSize: "גודל מסך",
    displayType: "סוג מסך",
    brightness: "בהירות",
    processor: "מעבד",
    storage: "נפח אחסון",
    connectivity: "קישוריות (GPS / Cellular)",
    bluetooth: "Bluetooth",
    wifi: "Wi‑Fi",
    nfc: "NFC",
    applePay: "Apple Pay",
    heartRate: "חיישן דופק",
    ecg: "אק\"ג (ECG)",
    bloodOxygen: "מד חמצן בדם",
    temperature: "חיישן טמפרטורה",
    fall: "זיהוי נפילה",
    crash: "זיהוי תאונה",
    water: "עמידות למים",
    depth: "עומק צלילה",
    battery: "זמן סוללה",
    fastCharge: "טעינה מהירה",
    os: "מערכת הפעלה",
    weight: "משקל",
    dimensions: "מידות",
    warranty: "אחריות",
    availability: "זמינות",
    yes: "כן",
  },
  ar: {
    screenSize: "حجم الشاشة",
    displayType: "نوع الشاشة",
    brightness: "السطوع",
    processor: "المعالج",
    storage: "سعة التخزين",
    connectivity: "الاتصال (GPS / Cellular)",
    bluetooth: "Bluetooth",
    wifi: "Wi‑Fi",
    nfc: "NFC",
    applePay: "Apple Pay",
    heartRate: "مستشعر نبض القلب",
    ecg: "تخطيط القلب (ECG)",
    bloodOxygen: "قياس الأكسجين في الدم",
    temperature: "مستشعر الحرارة",
    fall: "اكتشاف السقوط",
    crash: "اكتشاف الحوادث",
    water: "مقاومة الماء",
    depth: "عمق الغوص",
    battery: "عمر البطارية",
    fastCharge: "الشحن السريع",
    os: "نظام التشغيل",
    weight: "الوزن",
    dimensions: "الأبعاد",
    warranty: "الضمان",
    availability: "التوفر",
    yes: "نعم",
  },
  en: {
    screenSize: "Screen size",
    displayType: "Display type",
    brightness: "Brightness",
    processor: "Processor",
    storage: "Storage",
    connectivity: "Connectivity (GPS / Cellular)",
    bluetooth: "Bluetooth",
    wifi: "Wi‑Fi",
    nfc: "NFC",
    applePay: "Apple Pay",
    heartRate: "Heart rate sensor",
    ecg: "ECG",
    bloodOxygen: "Blood Oxygen",
    temperature: "Temperature sensor",
    fall: "Fall Detection",
    crash: "Crash Detection",
    water: "Water resistance",
    depth: "Dive depth",
    battery: "Battery life",
    fastCharge: "Fast charging",
    os: "Operating system",
    weight: "Weight",
    dimensions: "Dimensions",
    warranty: "Warranty",
    availability: "Availability",
    yes: "Yes",
  },
};

function connectivityText(lang: Locale, cellular: boolean): string {
  if (!cellular) return "GPS";
  if (lang === "he") return "GPS וגם GPS + Cellular";
  if (lang === "ar") return "GPS و‑GPS + Cellular";
  return "GPS and GPS + Cellular";
}

function batteryText(lang: Locale, f: WatchSpecFields): string {
  const low = f.batteryLowPower;
  if (lang === "he") {
    return `עד ${f.batteryNormal} שעות${low ? `, עד ${low} שעות במצב צריכת חשמל נמוכה` : ""}.`;
  }
  if (lang === "ar") {
    return `حتى ${f.batteryNormal} ساعة${low ? `، حتى ${low} ساعة في وضع الطاقة المنخفضة` : ""}.`;
  }
  return `Up to ${f.batteryNormal} hours${low ? `, up to ${low} hours in Low Power Mode` : ""}.`;
}

function fastChargeText(lang: Locale): string {
  if (lang === "he") return "כן — טעינה מהירה דרך USB‑C";
  if (lang === "ar") return "نعم — شحن سريع عبر USB‑C";
  return "Yes — fast charging via USB‑C";
}

function displayTypeText(lang: Locale, f: WatchSpecFields): string {
  const ao =
    lang === "he" ? " עם תצוגה תמידית (Always‑On)" : lang === "ar" ? " مع عرض دائم (Always‑On)" : " with Always‑On";
  return f.alwaysOn ? `${f.displayType}${ao}` : f.displayType;
}

export function buildWatchSpecs(lang: Locale, f: WatchSpecFields): ProductSpecItem[] {
  const tt = T[lang];
  const rows: ProductSpecItem[] = [];
  const add = (title: string, content: string) => rows.push({ title, content });

  add(tt.screenSize, f.sizesLabel);
  add(tt.displayType, displayTypeText(lang, f));
  add(tt.brightness, f.brightness);
  add(tt.processor, f.processor);
  add(tt.storage, f.storage);
  add(tt.connectivity, connectivityText(lang, f.cellular));
  add(tt.bluetooth, f.bluetooth);
  add(tt.wifi, f.wifi);
  if (f.nfc) add(tt.nfc, tt.yes);
  if (f.applePay) add(tt.applePay, tt.yes);
  if (f.heartRate) add(tt.heartRate, tt.yes);
  if (f.ecg) add(tt.ecg, tt.yes);
  if (f.bloodOxygen) add(tt.bloodOxygen, tt.yes);
  if (f.temperature) add(tt.temperature, tt.yes);
  if (f.fallDetection) add(tt.fall, tt.yes);
  if (f.crashDetection) add(tt.crash, tt.yes);
  add(tt.water, f.water);
  if (f.depthGauge) add(tt.depth, f.depthGauge);
  add(tt.battery, batteryText(lang, f));
  if (f.fastCharge) add(tt.fastCharge, fastChargeText(lang));
  add(tt.os, f.os);
  add(tt.weight, f.weight);
  add(tt.dimensions, f.dimensions);
  add(tt.warranty, WARRANTY[lang]);
  add(tt.availability, AVAILABILITY[lang]);
  return rows;
}

export type WatchImageKind = "main" | "front" | "side" | "back" | "lifestyle";

export function watchImage(key: string, slug: string, kind: WatchImageKind): string {
  return `products/apple/watch/${key}/${slug}-${kind}.png`;
}

export function watchGallery(key: string, slug: string) {
  const kinds: WatchImageKind[] = ["main", "front", "side", "back", "lifestyle"];
  return kinds.map((kind, i) => ({
    url: watchImage(key, slug, kind),
    kind,
    isMain: i === 0,
    sortOrder: i,
  }));
}

export function watchDescription(p: WatchSeed): { he: string; ar: string; en: string } {
  return { he: WATCH_DESC_HE[p.key], ar: WATCH_DESC_AR[p.key], en: WATCH_DESC_EN[p.key] };
}

const WATCH_DESC_HE: Record<string, string> = {
  "apple-watch-ultra-2":
    "Apple Watch Ultra 2 הוא השעון החכם המתקדם ביותר של Apple, המיועד לספורטאים, מטיילים ומשתמשים הדורשים עמידות גבוהה, חיי סוללה ארוכים וביצועים מתקדמים. מארז טיטניום 49mm עם מסך Always‑On Retina בבהירות 3000 ניטים, שבב S9, GPS מדויק דו‑תדרי, עמידות מים 100 מטר ומד עומק לצלילה. עד 36 שעות סוללה (ו‑72 שעות במצב חיסכון), ECG, מד חמצן בדם, חיישן טמפרטורה וזיהוי תאונות. אחריות יבואן רשמי ומשלוח מהיר.",
  "apple-watch-series-10":
    "Apple Watch Series 10 — העיצוב הדק והקליל ביותר עד כה, עם מסך Always‑On רחב‑זווית גדול ובהיר במיוחד (3000 ניטים), שבב S10 מהיר וטעינה מהירה. מדידות בריאות מתקדמות הכוללות ECG, מד חמצן בדם, חיישן טמפרטורה וזיהוי תאונות, לצד עמידות מים 50 מטר. זמין במארזי אלומיניום וטיטניום, במגוון צבעים ורצועות. אחריות יבואן רשמי ומשלוח מהיר.",
  "apple-watch-se":
    "Apple Watch SE — כל היכולות החיוניות של Apple Watch במחיר נגיש: שבב S8 מהיר, מסך Retina, GPS, זיהוי נפילה וזיהוי תאונות, מעקב פעילות ובריאות, התראות חכמות ו‑Apple Pay. עמידות מים 50 מטר ועד 18 שעות סוללה. זמין בשני גדלים ובמגוון צבעים ורצועות. אחריות יבואן רשמי ומשלוח מהיר.",
};

const WATCH_DESC_AR: Record<string, string> = {
  "apple-watch-ultra-2":
    "Apple Watch Ultra 2 هي أكثر ساعة Apple تطورًا، مصممة للرياضيين والمغامرين ومن يحتاجون متانة عالية وبطارية تدوم طويلًا وأداءً متقدمًا. هيكل تيتانيوم 49mm وشاشة Always‑On Retina بسطوع 3000 شمعة، شريحة S9، GPS دقيق ثنائي التردد، مقاومة ماء 100 متر ومقياس عمق للغوص. حتى 36 ساعة بطارية (و‑72 ساعة في وضع الطاقة المنخفضة)، ECG وقياس الأكسجين ومستشعر الحرارة واكتشاف الحوادث. ضمان رسمي وشحن سريع.",
  "apple-watch-series-10":
    "Apple Watch Series 10 — أنحف وأخف تصميم حتى الآن، بشاشة Always‑On واسعة الزاوية وكبيرة وساطعة (3000 شمعة)، شريحة S10 سريعة وشحن سريع. قياسات صحية متقدمة تشمل ECG وقياس الأكسجين ومستشعر الحرارة واكتشاف الحوادث، مع مقاومة ماء 50 مترًا. متوفرة بهياكل ألمنيوم وتيتانيوم وبألوان وأساور متعددة. ضمان رسمي وشحن سريع.",
  "apple-watch-se":
    "Apple Watch SE — كل الإمكانات الأساسية لساعة Apple بسعر مناسب: شريحة S8 سريعة وشاشة Retina وGPS واكتشاف السقوط والحوادث وتتبع النشاط والصحة وإشعارات ذكية و‑Apple Pay. مقاومة ماء 50 مترًا وحتى 18 ساعة بطارية. متوفرة بحجمين وبألوان وأساور متعددة. ضمان رسمي وشحن سريع.",
};

const WATCH_DESC_EN: Record<string, string> = {
  "apple-watch-ultra-2":
    "Apple Watch Ultra 2 is Apple's most advanced smartwatch, built for athletes, adventurers and anyone who needs rugged durability, long battery life and advanced performance. A 49mm titanium case with a 3000-nit Always-On Retina display, S9 chip, precision dual-frequency GPS, 100m water resistance and a depth gauge. Up to 36 hours of battery (72 in Low Power Mode), ECG, Blood Oxygen, temperature sensing and Crash Detection. Official importer warranty and fast delivery.",
  "apple-watch-series-10":
    "Apple Watch Series 10 — the thinnest, lightest design yet, with a large, bright wide-angle Always-On display (3000 nits), a fast S10 chip and fast charging. Advanced health features including ECG, Blood Oxygen, temperature sensing and Crash Detection, plus 50m water resistance. Available in aluminum and titanium cases with many colors and bands. Official importer warranty and fast delivery.",
  "apple-watch-se":
    "Apple Watch SE — all the essential Apple Watch capabilities at an accessible price: a fast S8 chip, Retina display, GPS, Fall and Crash Detection, activity and health tracking, smart notifications and Apple Pay. 50m water resistance and up to 18 hours of battery. Available in two sizes with multiple colors and bands. Official importer warranty and fast delivery.",
};

export const APPLE_WATCHES: WatchSeed[] = [
  {
    key: "apple-watch-ultra-2",
    slug: "apple-watch-ultra-2",
    model: "Ultra 2",
    name_en: "Apple Watch Ultra 2",
    name_he: "Apple Watch Ultra 2",
    name_ar: "Apple Watch Ultra 2",
    shortName: "Watch Ultra 2",
    basePrice: 3499,
    featured: true,
    tags: ["BEST SELLER"],
    sizes: [{ value: "49mm", slug: "49mm" }],
    colors: [
      { value: "Natural Titanium", slug: "natural-titanium" },
      { value: "Black Titanium", slug: "black-titanium" },
    ],
    bands: [
      { value: "Ocean Band", slug: "ocean-band", priceAdd: 0 },
      { value: "Trail Loop", slug: "trail-loop", priceAdd: 0 },
      { value: "Alpine Loop", slug: "alpine-loop", priceAdd: 150 },
    ],
    spec: {
      sizesLabel: "49mm",
      displayType: "Retina LTPO OLED",
      brightness: "3000 nits",
      alwaysOn: true,
      processor: "Apple S9 SiP",
      storage: "64GB",
      cellular: true,
      bluetooth: "Bluetooth 5.3",
      wifi: "Wi‑Fi 4 (802.11 b/g/n, 2.4GHz & 5GHz)",
      nfc: true,
      applePay: true,
      heartRate: true,
      ecg: true,
      bloodOxygen: true,
      temperature: true,
      fallDetection: true,
      crashDetection: true,
      water: "100m (ISO 22810), עמיד WR100",
      depthGauge: "עד 40 מטר (תקן EN13319) — מתאים לצלילה חופשית וספורט מים",
      batteryNormal: "36",
      batteryLowPower: "72",
      fastCharge: true,
      os: "watchOS 11",
      weight: "61.4 g (טיטניום)",
      dimensions: "49 × 44 × 14.4 mm",
    },
  },
  {
    key: "apple-watch-series-10",
    slug: "apple-watch-series-10",
    model: "Series 10",
    name_en: "Apple Watch Series 10",
    name_he: "Apple Watch Series 10",
    name_ar: "Apple Watch Series 10",
    shortName: "Watch Series 10",
    basePrice: 1699,
    featured: true,
    tags: ["NEW"],
    sizes: [
      { value: "42mm", slug: "42mm", priceAdd: 0 },
      { value: "46mm", slug: "46mm", priceAdd: 120 },
    ],
    colors: [
      { value: "Jet Black", slug: "jet-black", priceAdd: 0 },
      { value: "Rose Gold", slug: "rose-gold", priceAdd: 0 },
      { value: "Silver", slug: "silver", priceAdd: 0 },
      { value: "Natural Titanium", slug: "titanium-natural", priceAdd: 900 },
      { value: "Gold Titanium", slug: "titanium-gold", priceAdd: 900 },
      { value: "Slate Titanium", slug: "titanium-slate", priceAdd: 900 },
    ],
    bands: [
      { value: "Sport Band", slug: "sport-band", priceAdd: 0 },
      { value: "Sport Loop", slug: "sport-loop", priceAdd: 0 },
      { value: "Milanese Loop", slug: "milanese-loop", priceAdd: 400 },
    ],
    spec: {
      sizesLabel: "42mm / 46mm",
      displayType: "Wide‑angle LTPO3 OLED",
      brightness: "3000 nits",
      alwaysOn: true,
      processor: "Apple S10 SiP",
      storage: "64GB",
      cellular: true,
      bluetooth: "Bluetooth 5.3",
      wifi: "Wi‑Fi 4 (802.11 b/g/n, 2.4GHz & 5GHz)",
      nfc: true,
      applePay: true,
      heartRate: true,
      ecg: true,
      bloodOxygen: true,
      temperature: true,
      fallDetection: true,
      crashDetection: true,
      water: "50m (ISO 22810), עמיד WR50",
      depthGauge: null,
      batteryNormal: "18",
      batteryLowPower: "36",
      fastCharge: true,
      os: "watchOS 11",
      weight: "אלומיניום — 42mm: 30 g · 46mm: 36 g | טיטניום — 42mm: 34.4 g · 46mm: 41.7 g",
      dimensions: "42mm: 42 × 36 × 9.7 mm · 46mm: 46 × 39 × 9.7 mm",
    },
  },
  {
    key: "apple-watch-se",
    slug: "apple-watch-se",
    model: "SE",
    name_en: "Apple Watch SE",
    name_he: "Apple Watch SE",
    name_ar: "Apple Watch SE",
    shortName: "Watch SE",
    basePrice: 999,
    tags: [],
    sizes: [
      { value: "40mm", slug: "40mm", priceAdd: 0 },
      { value: "44mm", slug: "44mm", priceAdd: 80 },
    ],
    colors: [
      { value: "Midnight", slug: "midnight", priceAdd: 0 },
      { value: "Starlight", slug: "starlight", priceAdd: 0 },
      { value: "Silver", slug: "silver", priceAdd: 0 },
    ],
    bands: [
      { value: "Sport Band", slug: "sport-band", priceAdd: 0 },
      { value: "Sport Loop", slug: "sport-loop", priceAdd: 0 },
    ],
    spec: {
      sizesLabel: "40mm / 44mm",
      displayType: "Retina LTPO OLED",
      brightness: "1000 nits",
      alwaysOn: false,
      processor: "Apple S8 SiP",
      storage: "32GB",
      cellular: true,
      bluetooth: "Bluetooth 5.3",
      wifi: "Wi‑Fi 4 (802.11 b/g/n, 2.4GHz)",
      nfc: true,
      applePay: true,
      heartRate: true,
      ecg: false,
      bloodOxygen: false,
      temperature: false,
      fallDetection: true,
      crashDetection: true,
      water: "50m (ISO 22810), עמיד WR50",
      depthGauge: null,
      batteryNormal: "18",
      batteryLowPower: null,
      fastCharge: true,
      os: "watchOS 11",
      weight: "אלומיניום — 40mm: 26.4 g · 44mm: 32.9 g",
      dimensions: "40mm: 40 × 34 × 10.7 mm · 44mm: 44 × 38 × 10.7 mm",
    },
  },
];
