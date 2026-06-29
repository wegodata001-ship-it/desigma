/**
 * REAL Apple AirPods catalog — Stage 2.
 * Specs based on Apple's official specifications. No demo / placeholder text.
 * Images: per color under public/products/apple/airpods/{key}/{slug}-{main|case|open|lifestyle}.png
 * (User supplies the image files; paths are wired here.)
 */

import type { Locale } from "../localized";
import type { ProductSpecItem } from "../product-specs";

export type AirpodsColor = {
  /** Official Apple color name (stored as variant value). */
  value: string;
  /** Image file slug under the model folder. */
  slug: string;
};

type EarphoneType = "inear" | "open" | "overear";

export type AirpodsSpecFields = {
  type: EarphoneType;
  bluetooth: string;
  chip: string;
  anc: boolean;
  transparency: boolean;
  spatialAudio: boolean;
  adaptiveAudio: boolean;
  conversationAwareness: boolean;
  wirelessCharging: boolean;
  magsafe: boolean;
  batteryBudsHours: string;
  batteryAncNote: boolean;
  /** Total with charging case; null for over-ear (no case). */
  batteryCaseHours: string | null;
  talkHours: string | null;
  water: string | null;
  weight: string;
  dimensions: string | null;
};

export type AirpodsSeed = {
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
  colors: AirpodsColor[];
  spec: AirpodsSpecFields;
};

export const APPLE_AUDIO_CATEGORY = {
  parent: {
    key: "audio",
    name_he: "שמע ואוזניות",
    name_ar: "الصوت والسماعات",
    name_en: "Audio",
    sortOrder: 20,
    imageUrl: "products/apple/airpods/airpods-pro-2/white-main.png",
  },
  airpods: {
    key: "airpods",
    name_he: "AirPods",
    name_ar: "AirPods",
    name_en: "AirPods",
    sortOrder: 21,
    imageUrl: "products/apple/airpods/airpods-pro-2/white-main.png",
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

const TYPE_LABEL: Record<EarphoneType, Record<Locale, string>> = {
  inear: { he: "תוך‑אוזן (In‑ear)", ar: "داخل الأذن (In‑ear)", en: "In‑ear" },
  open: { he: "פתוחות (Open‑ear)", ar: "مفتوحة (Open‑ear)", en: "Open‑ear" },
  overear: { he: "על‑אוזן (Over‑ear)", ar: "فوق الأذن (Over‑ear)", en: "Over‑ear" },
};

const T: Record<Locale, Record<string, string>> = {
  he: {
    type: "סוג אוזניות",
    bluetooth: "קישוריות Bluetooth",
    chip: "שבב Apple",
    anc: "ביטול רעשים אקטיבי",
    transparency: "מצב שקיפות",
    spatial: "Spatial Audio",
    adaptive: "Adaptive Audio",
    conversation: "Conversation Awareness",
    charging: "טעינה",
    wireless: "טעינה אלחוטית",
    magsafe: "MagSafe",
    battery: "זמן סוללה",
    talk: "זמן שיחה",
    water: "עמידות למים",
    weight: "משקל",
    dimensions: "מידות",
    warranty: "אחריות",
    availability: "זמינות",
  },
  ar: {
    type: "نوع السماعات",
    bluetooth: "اتصال Bluetooth",
    chip: "شريحة Apple",
    anc: "إلغاء الضوضاء النشط",
    transparency: "وضع الشفافية",
    spatial: "Spatial Audio",
    adaptive: "Adaptive Audio",
    conversation: "Conversation Awareness",
    charging: "الشحن",
    wireless: "الشحن اللاسلكي",
    magsafe: "MagSafe",
    battery: "عمر البطارية",
    talk: "وقت التحدث",
    water: "مقاومة الماء",
    weight: "الوزن",
    dimensions: "الأبعاد",
    warranty: "الضمان",
    availability: "التوفر",
  },
  en: {
    type: "Earphone type",
    bluetooth: "Bluetooth",
    chip: "Apple chip",
    anc: "Active Noise Cancellation",
    transparency: "Transparency mode",
    spatial: "Spatial Audio",
    adaptive: "Adaptive Audio",
    conversation: "Conversation Awareness",
    charging: "Charging",
    wireless: "Wireless charging",
    magsafe: "MagSafe",
    battery: "Battery life",
    talk: "Talk time",
    water: "Water resistance",
    weight: "Weight",
    dimensions: "Dimensions",
    warranty: "Warranty",
    availability: "Availability",
  },
};

const FEATURE_TEXT: Record<string, Record<Locale, string>> = {
  anc: {
    he: "ביטול רעשים אקטיבי (Active Noise Cancellation)",
    ar: "إلغاء الضوضاء النشط (Active Noise Cancellation)",
    en: "Active Noise Cancellation",
  },
  transparency: {
    he: "מצב שקיפות (Transparency)",
    ar: "وضع الشفافية (Transparency)",
    en: "Transparency mode",
  },
  spatial: {
    he: "Spatial Audio עם מעקב ראש דינמי",
    ar: "Spatial Audio مع تتبّع الرأس الديناميكي",
    en: "Spatial Audio with dynamic head tracking",
  },
  adaptive: {
    he: "Adaptive Audio — שילוב חכם של ביטול רעשים ושקיפות",
    ar: "Adaptive Audio — مزج ذكي بين إلغاء الضوضاء والشفافية",
    en: "Adaptive Audio — smart blend of ANC and Transparency",
  },
  conversation: {
    he: "Conversation Awareness — הנמכת ווליום אוטומטית בעת שיחה",
    ar: "Conversation Awareness — خفض الصوت تلقائيًا عند التحدث",
    en: "Conversation Awareness — automatically lowers volume when you speak",
  },
  wireless: {
    he: "טעינה אלחוטית בתקן Qi",
    ar: "شحن لاسلكي بمعيار Qi",
    en: "Qi wireless charging",
  },
  magsafe: { he: "תואם מטען MagSafe", ar: "متوافق مع MagSafe", en: "MagSafe compatible" },
};

function chargingText(lang: Locale, overear: boolean): string {
  if (overear) {
    if (lang === "he") return "טעינת USB‑C";
    if (lang === "ar") return "شحن USB‑C";
    return "USB‑C charging";
  }
  if (lang === "he") return "מארז טעינה USB‑C";
  if (lang === "ar") return "علبة شحن USB‑C";
  return "USB‑C charging case";
}

function batteryText(lang: Locale, f: AirpodsSpecFields): string {
  const anc = f.batteryAncNote;
  if (f.batteryCaseHours == null) {
    if (lang === "he") return `עד ${f.batteryBudsHours} שעות האזנה${anc ? " (עם ANC)" : ""}.`;
    if (lang === "ar") return `حتى ${f.batteryBudsHours} ساعة استماع${anc ? " (مع ANC)" : ""}.`;
    return `Up to ${f.batteryBudsHours} hours listening${anc ? " (ANC on)" : ""}.`;
  }
  if (lang === "he") {
    return `עד ${f.batteryBudsHours} שעות האזנה${anc ? " (עם ANC)" : ""}, ועד ${f.batteryCaseHours} שעות סך הכול עם מארז הטעינה.`;
  }
  if (lang === "ar") {
    return `حتى ${f.batteryBudsHours} ساعة استماع${anc ? " (مع ANC)" : ""}، وحتى ${f.batteryCaseHours} ساعة إجمالًا مع علبة الشحن.`;
  }
  return `Up to ${f.batteryBudsHours} hours listening${anc ? " (ANC on)" : ""}, up to ${f.batteryCaseHours} hours total with the charging case.`;
}

function talkText(lang: Locale, talk: string): string {
  if (lang === "he") return `עד ${talk} שעות שיחה.`;
  if (lang === "ar") return `حتى ${talk} ساعة تحدّث.`;
  return `Up to ${talk} hours talk time.`;
}

export function buildAirpodsSpecs(lang: Locale, name: string, f: AirpodsSpecFields): ProductSpecItem[] {
  const tt = T[lang];
  const rows: ProductSpecItem[] = [];
  const add = (title: string, content: string) => rows.push({ title, content });

  add(tt.type, TYPE_LABEL[f.type][lang]);
  add(tt.bluetooth, f.bluetooth);
  add(tt.chip, f.chip);
  if (f.anc) add(tt.anc, FEATURE_TEXT.anc[lang]);
  if (f.transparency) add(tt.transparency, FEATURE_TEXT.transparency[lang]);
  if (f.spatialAudio) add(tt.spatial, FEATURE_TEXT.spatial[lang]);
  if (f.adaptiveAudio) add(tt.adaptive, FEATURE_TEXT.adaptive[lang]);
  if (f.conversationAwareness) add(tt.conversation, FEATURE_TEXT.conversation[lang]);
  add(tt.charging, chargingText(lang, f.type === "overear"));
  if (f.wirelessCharging) add(tt.wireless, FEATURE_TEXT.wireless[lang]);
  if (f.magsafe) add(tt.magsafe, FEATURE_TEXT.magsafe[lang]);
  add(tt.battery, batteryText(lang, f));
  if (f.talkHours) add(tt.talk, talkText(lang, f.talkHours));
  if (f.water) add(tt.water, f.water);
  add(tt.weight, f.weight);
  if (f.dimensions) add(tt.dimensions, f.dimensions);
  add(tt.warranty, WARRANTY[lang]);
  add(tt.availability, AVAILABILITY[lang]);
  return rows;
}

export type AirpodsImageKind = "main" | "case" | "open" | "lifestyle";

export function airpodsImage(key: string, slug: string, kind: AirpodsImageKind): string {
  return `products/apple/airpods/${key}/${slug}-${kind}.png`;
}

export function airpodsGallery(key: string, slug: string) {
  const kinds: AirpodsImageKind[] = ["main", "case", "open", "lifestyle"];
  return kinds.map((kind, i) => ({
    url: airpodsImage(key, slug, kind),
    kind,
    isMain: i === 0,
    sortOrder: i,
  }));
}

export function airpodsDescription(p: AirpodsSeed): { he: string; ar: string; en: string } {
  return {
    he: AIRPODS_DESC_HE[p.key],
    ar: AIRPODS_DESC_AR[p.key],
    en: AIRPODS_DESC_EN[p.key],
  };
}

const AIRPODS_DESC_HE: Record<string, string> = {
  "airpods-pro-2":
    "AirPods Pro 2 בחיבור USB‑C מביאים ביטול רעשים אקטיבי חזק במיוחד, מצב שקיפות אדפטיבי ו‑Spatial Audio מותאם אישית עם מעקב ראש. שבב Apple H2 מפעיל Adaptive Audio ו‑Conversation Awareness לחוויה חכמה, עם עד 6 שעות האזנה ו‑30 שעות עם המארז. עמידות IP54 וטעינת USB‑C, אלחוטית ו‑MagSafe. אחריות יבואן רשמי ומשלוח מהיר.",
  "airpods-4":
    "AirPods 4 בעיצוב פתוח, קל ונוח לאורך כל היום, עם שבב Apple H2, Spatial Audio מותאם אישית וצליל עשיר ומדויק. מארז קומפקטי בטעינת USB‑C, עד 5 שעות האזנה ו‑30 שעות עם המארז. עמידות IP54. אחריות יבואן רשמי ומשלוח מהיר.",
  "airpods-4-anc":
    "AirPods 4 עם ביטול רעשים אקטיבי — כל היתרונות של AirPods 4 בתוספת Active Noise Cancellation, מצב שקיפות, Adaptive Audio ו‑Conversation Awareness. שבב Apple H2, מארז עם טעינה אלחוטית ו‑USB‑C, עד 5 שעות האזנה ו‑30 שעות עם המארז. עמידות IP54. אחריות יבואן רשמי ומשלוח מהיר.",
  "airpods-max":
    "AirPods Max בחיבור USB‑C — אוזניות על‑אוזן פרימיום עם שמע ברזולוציה גבוהה, ביטול רעשים אקטיבי מוביל, מצב שקיפות ו‑Spatial Audio עם מעקב ראש דינמי. גוף אלומיניום וכריות זיכרון נושמות, עד 20 שעות האזנה. זמינות ב‑5 צבעים. אחריות יבואן רשמי ומשלוח מהיר.",
};

const AIRPODS_DESC_AR: Record<string, string> = {
  "airpods-pro-2":
    "AirPods Pro 2 بمنفذ USB‑C مع إلغاء ضوضاء نشط قوي، وضع شفافية تكيّفي و‑Spatial Audio مخصص مع تتبّع الرأس. شريحة Apple H2 تشغّل Adaptive Audio و‑Conversation Awareness، حتى 6 ساعات استماع و‑30 ساعة مع العلبة. مقاومة IP54 وشحن USB‑C ولاسلكي و‑MagSafe. ضمان رسمي وشحن سريع.",
  "airpods-4":
    "AirPods 4 بتصميم مفتوح خفيف ومريح، شريحة Apple H2 و‑Spatial Audio مخصص وصوت غني ودقيق. علبة USB‑C مدمجة، حتى 5 ساعات استماع و‑30 ساعة مع العلبة. مقاومة IP54. ضمان رسمي وشحن سريع.",
  "airpods-4-anc":
    "AirPods 4 مع إلغاء الضوضاء النشط — كل مزايا AirPods 4 بالإضافة إلى ANC ووضع الشفافية و‑Adaptive Audio و‑Conversation Awareness. شريحة Apple H2، علبة بشحن لاسلكي و‑USB‑C، حتى 5 ساعات استماع و‑30 ساعة مع العلبة. مقاومة IP54. ضمان رسمي وشحن سريع.",
  "airpods-max":
    "AirPods Max بمنفذ USB‑C — سماعات فوق الأذن فاخرة بصوت عالي الدقة، إلغاء ضوضاء نشط رائد، وضع شفافية و‑Spatial Audio مع تتبّع الرأس. هيكل ألمنيوم ووسائد ناعمة، حتى 20 ساعة استماع. متوفرة بـ5 ألوان. ضمان رسمي وشحن سريع.",
};

const AIRPODS_DESC_EN: Record<string, string> = {
  "airpods-pro-2":
    "AirPods Pro 2 (USB‑C) deliver powerful Active Noise Cancellation, adaptive Transparency and personalized Spatial Audio with head tracking. The Apple H2 chip powers Adaptive Audio and Conversation Awareness, with up to 6 hours of listening and 30 hours with the case. IP54 rated, with USB‑C, wireless and MagSafe charging. Official importer warranty and fast delivery.",
  "airpods-4":
    "AirPods 4 feature a light, comfortable open design, the Apple H2 chip, personalized Spatial Audio and rich, precise sound. Compact USB‑C case, up to 5 hours listening and 30 hours with the case. IP54 rated. Official importer warranty and fast delivery.",
  "airpods-4-anc":
    "AirPods 4 with Active Noise Cancellation — everything in AirPods 4 plus ANC, Transparency, Adaptive Audio and Conversation Awareness. Apple H2 chip, wireless + USB‑C charging case, up to 5 hours listening and 30 hours with the case. IP54 rated. Official importer warranty and fast delivery.",
  "airpods-max":
    "AirPods Max (USB‑C) — premium over‑ear headphones with high‑fidelity audio, leading Active Noise Cancellation, Transparency and Spatial Audio with dynamic head tracking. Aluminum body and breathable memory‑foam cushions, up to 20 hours of listening. Available in 5 colors. Official importer warranty and fast delivery.",
};

export const APPLE_AIRPODS: AirpodsSeed[] = [
  {
    key: "airpods-pro-2",
    slug: "airpods-pro-2",
    model: "AirPods Pro 2 (USB‑C)",
    name_en: "AirPods Pro 2 (USB‑C)",
    name_he: "AirPods Pro 2 (USB‑C)",
    name_ar: "AirPods Pro 2 (USB‑C)",
    shortName: "AirPods Pro 2",
    basePrice: 999,
    featured: true,
    tags: ["BEST SELLER"],
    colors: [{ value: "White", slug: "white" }],
    spec: {
      type: "inear",
      bluetooth: "Bluetooth 5.3",
      chip: "Apple H2",
      anc: true,
      transparency: true,
      spatialAudio: true,
      adaptiveAudio: true,
      conversationAwareness: true,
      wirelessCharging: true,
      magsafe: true,
      batteryBudsHours: "6",
      batteryAncNote: true,
      batteryCaseHours: "30",
      talkHours: "4.5",
      water: "IP54 (אוזניות ומארז)",
      weight: "5.3 g × 2, 50.8 g (מארז)",
      dimensions: "מארז: 45.2 × 60.6 × 21.7 mm",
    },
  },
  {
    key: "airpods-4",
    slug: "airpods-4",
    model: "AirPods 4",
    name_en: "AirPods 4",
    name_he: "AirPods 4",
    name_ar: "AirPods 4",
    shortName: "AirPods 4",
    basePrice: 599,
    tags: [],
    colors: [{ value: "White", slug: "white" }],
    spec: {
      type: "open",
      bluetooth: "Bluetooth 5.3",
      chip: "Apple H2",
      anc: false,
      transparency: false,
      spatialAudio: true,
      adaptiveAudio: false,
      conversationAwareness: false,
      wirelessCharging: false,
      magsafe: false,
      batteryBudsHours: "5",
      batteryAncNote: false,
      batteryCaseHours: "30",
      talkHours: null,
      water: "IP54 (אוזניות ומארז)",
      weight: "4.3 g × 2, 32.3 g (מארז)",
      dimensions: "מארז: 46.2 × 50.1 × 21.2 mm",
    },
  },
  {
    key: "airpods-4-anc",
    slug: "airpods-4-anc",
    model: "AirPods 4 with Active Noise Cancellation",
    name_en: "AirPods 4 with Active Noise Cancellation",
    name_he: "AirPods 4 עם ביטול רעשים אקטיבי",
    name_ar: "AirPods 4 مع إلغاء الضوضاء النشط",
    shortName: "AirPods 4 ANC",
    basePrice: 799,
    featured: true,
    tags: ["NEW"],
    colors: [{ value: "White", slug: "white" }],
    spec: {
      type: "open",
      bluetooth: "Bluetooth 5.3",
      chip: "Apple H2",
      anc: true,
      transparency: true,
      spatialAudio: true,
      adaptiveAudio: true,
      conversationAwareness: true,
      wirelessCharging: true,
      magsafe: false,
      batteryBudsHours: "5",
      batteryAncNote: true,
      batteryCaseHours: "30",
      talkHours: null,
      water: "IP54 (אוזניות ומארז)",
      weight: "4.3 g × 2, 34.7 g (מארז)",
      dimensions: "מארז: 46.2 × 50.1 × 21.2 mm",
    },
  },
  {
    key: "airpods-max",
    slug: "airpods-max",
    model: "AirPods Max (USB‑C)",
    name_en: "AirPods Max (USB‑C)",
    name_he: "AirPods Max (USB‑C)",
    name_ar: "AirPods Max (USB‑C)",
    shortName: "AirPods Max",
    basePrice: 2399,
    tags: [],
    colors: [
      { value: "Midnight", slug: "midnight" },
      { value: "Starlight", slug: "starlight" },
      { value: "Blue", slug: "blue" },
      { value: "Purple", slug: "purple" },
      { value: "Orange", slug: "orange" },
    ],
    spec: {
      type: "overear",
      bluetooth: "Bluetooth 5.3",
      chip: "Apple H1",
      anc: true,
      transparency: true,
      spatialAudio: true,
      adaptiveAudio: false,
      conversationAwareness: false,
      wirelessCharging: false,
      magsafe: false,
      batteryBudsHours: "20",
      batteryAncNote: true,
      batteryCaseHours: null,
      talkHours: null,
      water: null,
      weight: "386.2 g",
      dimensions: null,
    },
  },
];
