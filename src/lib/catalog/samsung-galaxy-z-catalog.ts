/**
 * REAL Samsung Galaxy Z (Fold + Flip) catalog — Samsung Master Catalog Part 2.
 * Specs based on Samsung's official specifications (Fold4-6 / Flip4-6). The Fold7/Flip7
 * are built on the latest credible specs and should be verified against Samsung's final
 * official sheet. No demo / Lorem Ipsum / placeholder copy.
 * Images: per color under public/products/samsung/galaxy-z/{key}/{slug}-{kind}.png
 */

import type { Locale } from "../localized";
import type { ProductSpecItem } from "../product-specs";

export type ZColor = { value: string; slug: string };
export type ZStorage = { value: string; priceAdd: number };

type ZForm = "fold" | "flip";

export type ZSpecFields = {
  coverDisplay: string;
  mainDisplay: string;
  brightness: string;
  visionBooster: boolean;
  chip: string;
  gpu: string;
  ram: string;
  storageLabel: string;
  rearCamera: string;
  ultraWide: string;
  telephoto: string | null;
  frontCamera: string;
  underDisplayCamera: string | null;
  video: string;
  battery: string;
  fastCharge: string;
  wirelessCharging: string;
  reverseCharging: string;
  bluetooth: string;
  wifi: string;
  nfc: boolean;
  gps: string;
  usbc: string;
  fiveG: boolean;
  dualSim: boolean;
  esim: boolean;
  knox: boolean;
  galaxyAi: boolean;
  android: string;
  oneUi: string;
  fingerprint: string;
  ip: string;
  weight: string;
  foldedDim: string;
  unfoldedDim: string;
};

export type ZSeed = {
  key: string;
  slug: string;
  series: string; // "Galaxy Z Fold" | "Galaxy Z Flip"
  form: ZForm;
  model: string;
  name_en: string;
  name_he: string;
  name_ar: string;
  basePrice: number;
  salePercent?: number;
  featured?: boolean;
  tags: string[];
  colors: ZColor[];
  storage: ZStorage[];
  spec: ZSpecFields;
};

export const SAMSUNG_GALAXY_Z_CATEGORY = {
  parent: {
    key: "smartphones",
    name_he: "סמארטפונים",
    name_ar: "الهواتف الذكية",
    name_en: "Smartphones",
    sortOrder: 10,
    imageUrl: "products/samsung/galaxy-z/samsung-galaxy-z-fold7/silver-shadow-main.png",
  },
  galaxyZ: {
    key: "galaxy-z",
    name_he: "Galaxy Z",
    name_ar: "Galaxy Z",
    name_en: "Galaxy Z",
    sortOrder: 13,
    imageUrl: "products/samsung/galaxy-z/samsung-galaxy-z-fold7/silver-shadow-main.png",
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
  he: "מכשיר Galaxy Z, כבל USB‑C ל‑USB‑C, מחט הוצאת SIM, מדריך הפעלה מהירה ותעודת אחריות. (ללא מטען, בהתאם לאריזה הרשמית של Samsung).",
  ar: "جهاز Galaxy Z، كابل USB‑C إلى USB‑C، أداة إخراج SIM، دليل البدء السريع وبطاقة الضمان. (بدون شاحن، حسب العبوة الرسمية من Samsung).",
  en: "Galaxy Z device, USB‑C to USB‑C cable, SIM ejector pin, quick start guide and warranty card. (No charger, per Samsung's official box contents).",
};

const T: Record<Locale, Record<string, string>> = {
  he: {
    cover: "מסך חיצוני",
    main: "מסך פנימי",
    brightness: "בהירות שיא",
    visionBooster: "Vision Booster",
    chip: "מעבד",
    gpu: "מעבד גרפי (GPU)",
    ram: "זיכרון RAM",
    storage: "נפח אחסון",
    rear: "מצלמה ראשית",
    uw: "מצלמה אולטרה‑רחבה",
    tele: "מצלמת טלפוטו",
    front: "מצלמה קדמית",
    udc: "מצלמה מתחת למסך (Fold)",
    video: "צילום וידאו",
    battery: "סוללה",
    fast: "טעינה מהירה",
    wireless: "טעינה אלחוטית",
    reverse: "טעינה אלחוטית הפוכה",
    bluetooth: "Bluetooth",
    wifi: "Wi‑Fi",
    nfc: "NFC",
    gps: "GPS",
    usbc: "USB‑C",
    fiveg: "5G",
    dualsim: "Dual SIM",
    esim: "eSIM",
    knox: "Samsung Knox",
    ai: "Galaxy AI",
    android: "גרסת Android",
    oneui: "One UI",
    finger: "חיישן טביעת אצבע",
    ip: "עמידות (IP)",
    weight: "משקל",
    folded: "מידות מקופל",
    unfolded: "מידות פתוח",
    warranty: "אחריות",
    inbox: "מה כלול באריזה",
    availability: "זמינות",
    yes: "כן",
  },
  ar: {
    cover: "الشاشة الخارجية",
    main: "الشاشة الداخلية",
    brightness: "ذروة السطوع",
    visionBooster: "Vision Booster",
    chip: "المعالج",
    gpu: "معالج الرسومات (GPU)",
    ram: "ذاكرة RAM",
    storage: "سعة التخزين",
    rear: "الكاميرا الرئيسية",
    uw: "الكاميرا فائقة الاتساع",
    tele: "كاميرا تليفوتو",
    front: "الكاميرا الأمامية",
    udc: "كاميرا تحت الشاشة (Fold)",
    video: "تصوير الفيديو",
    battery: "البطارية",
    fast: "الشحن السريع",
    wireless: "الشحن اللاسلكي",
    reverse: "الشحن اللاسلكي العكسي",
    bluetooth: "Bluetooth",
    wifi: "Wi‑Fi",
    nfc: "NFC",
    gps: "GPS",
    usbc: "USB‑C",
    fiveg: "5G",
    dualsim: "Dual SIM",
    esim: "eSIM",
    knox: "Samsung Knox",
    ai: "Galaxy AI",
    android: "إصدار Android",
    oneui: "One UI",
    finger: "مستشعر بصمة الإصبع",
    ip: "المتانة (IP)",
    weight: "الوزن",
    folded: "الأبعاد مطوية",
    unfolded: "الأبعاد مفتوحة",
    warranty: "الضمان",
    inbox: "محتويات العلبة",
    availability: "التوفر",
    yes: "نعم",
  },
  en: {
    cover: "Cover display",
    main: "Main display",
    brightness: "Peak brightness",
    visionBooster: "Vision Booster",
    chip: "Processor",
    gpu: "GPU",
    ram: "RAM",
    storage: "Storage",
    rear: "Main camera",
    uw: "Ultra Wide camera",
    tele: "Telephoto camera",
    front: "Front camera",
    udc: "Under Display Camera (Fold)",
    video: "Video recording",
    battery: "Battery",
    fast: "Fast charging",
    wireless: "Wireless charging",
    reverse: "Wireless PowerShare",
    bluetooth: "Bluetooth",
    wifi: "Wi‑Fi",
    nfc: "NFC",
    gps: "GPS",
    usbc: "USB‑C",
    fiveg: "5G",
    dualsim: "Dual SIM",
    esim: "eSIM",
    knox: "Samsung Knox",
    ai: "Galaxy AI",
    android: "Android version",
    oneui: "One UI",
    finger: "Fingerprint sensor",
    ip: "Durability (IP)",
    weight: "Weight",
    folded: "Folded dimensions",
    unfolded: "Unfolded dimensions",
    warranty: "Warranty",
    inbox: "In the box",
    availability: "Availability",
    yes: "Yes",
  },
};

export function buildZSpecs(lang: Locale, p: ZSeed): ProductSpecItem[] {
  const tt = T[lang];
  const f = p.spec;
  const rows: ProductSpecItem[] = [];
  const add = (title: string, content: string) => rows.push({ title, content });

  add(tt.cover, f.coverDisplay);
  add(tt.main, f.mainDisplay);
  add(tt.brightness, f.brightness);
  if (f.visionBooster) add(tt.visionBooster, tt.yes);
  add(tt.chip, f.chip);
  add(tt.gpu, f.gpu);
  add(tt.ram, f.ram);
  add(tt.storage, f.storageLabel);
  add(tt.rear, f.rearCamera);
  add(tt.uw, f.ultraWide);
  if (f.telephoto) add(tt.tele, f.telephoto);
  add(tt.front, f.frontCamera);
  if (f.underDisplayCamera) add(tt.udc, f.underDisplayCamera);
  add(tt.video, f.video);
  add(tt.battery, f.battery);
  add(tt.fast, f.fastCharge);
  add(tt.wireless, f.wirelessCharging);
  add(tt.reverse, f.reverseCharging);
  add(tt.bluetooth, f.bluetooth);
  add(tt.wifi, f.wifi);
  if (f.nfc) add(tt.nfc, tt.yes);
  add(tt.gps, f.gps);
  add(tt.usbc, f.usbc);
  if (f.fiveG) add(tt.fiveg, tt.yes);
  if (f.dualSim) add(tt.dualsim, tt.yes);
  if (f.esim) add(tt.esim, tt.yes);
  if (f.knox) add(tt.knox, tt.yes);
  if (f.galaxyAi) add(tt.ai, tt.yes);
  add(tt.oneui, f.oneUi);
  add(tt.android, f.android);
  add(tt.finger, f.fingerprint);
  add(tt.ip, f.ip);
  add(tt.weight, f.weight);
  add(tt.folded, f.foldedDim);
  add(tt.unfolded, f.unfoldedDim);
  add(tt.warranty, WARRANTY[lang]);
  add(tt.inbox, IN_BOX[lang]);
  add(tt.availability, AVAILABILITY[lang]);
  return rows;
}

export function zFeatures(p: ZSeed): string[] {
  const f = p.spec;
  const out: string[] = [];
  if (f.galaxyAi) {
    out.push("Galaxy AI", "Circle to Search", "Live Translate", "Interpreter", "Note Assist", "Photo Assist", "Generative Edit");
  }
  out.push("Multi Window", "Flex Mode");
  if (p.form === "fold") out.push("Samsung DeX");
  out.push("Wireless PowerShare", f.ip, "Gorilla Glass Victus 2", "Armor Aluminum");
  return out;
}

export function zShortDescription(lang: Locale, p: ZSeed): string {
  const f = p.spec;
  if (lang === "he") {
    return p.form === "fold"
      ? `${p.name_he} — סמארטפון מתקפל עם מסך פנימי ${f.mainDisplay.split(",")[0]} שהופך לטאבלט מלא, מעבד ${f.chip}, מולטיטאסקינג אמיתי ו‑Galaxy AI. מכשיר הדגל לפרודוקטיביות ולעבודה.`
      : `${p.name_he} — מתקפל קומפקטי שנכנס לכל כיס, מסך חיצוני חכם, מצלמות איכותיות ו‑Flex Mode. עיצוב אופנתי עם ביצועי דגל.`;
  }
  if (lang === "ar") {
    return p.form === "fold"
      ? `${p.name_ar} — هاتف قابل للطي بشاشة داخلية تتحول إلى جهاز لوحي، معالج ${f.chip}، تعدد مهام حقيقي و‑Galaxy AI. جهاز الإنتاجية الرائد.`
      : `${p.name_ar} — هاتف قابل للطي مدمج يدخل كل جيب، شاشة خارجية ذكية، كاميرات ممتازة و‑Flex Mode بأداء رائد.`;
  }
  return p.form === "fold"
    ? `${p.name_en} — a foldable that opens into a tablet-sized screen, ${f.chip}, true multitasking and Galaxy AI. The flagship for productivity.`
    : `${p.name_en} — a compact foldable that fits any pocket, a smart cover display, great cameras and Flex Mode with flagship performance.`;
}

/** Full Hebrew-first description (400–700 words for he). */
export function zDescription(lang: Locale, p: ZSeed): string {
  const f = p.spec;
  const feats = zFeatures(p).map((x) => `✓ ${x}`).join("   ");
  const isFold = p.form === "fold";

  if (lang === "he") {
    return [
      `${p.name_he} הוא סמארטפון מתקפל מבית Samsung, שמשלב חדשנות הנדסית, מסך מתקפל עמיד ועיצוב פרימיום. ${isFold ? "זהו מכשיר שנבנה עבור אנשי עסקים, יוצרים ומשתמשים תובעניים שרוצים מסך גדול לעבודה, לקריאה ולמולטיטאסקינג — בלי לוותר על ניידות." : "זהו מכשיר שנבנה עבור מי שמחפש מכשיר אופנתי, קומפקטי ונוח לנשיאה, שמתקפל לגודל כיס אך נפתח למסך מלא של דגל."}`,
      `למי המכשיר מתאים: ${isFold ? "למשתמשים מקצועיים, מנהלים ועצמאים שזקוקים למסך גדול לאימייל, מסמכים, מצגות וצפייה — וכן לכל מי שאוהב לקרוא, לגלוש ולעבוד על מספר אפליקציות בו‑זמנית." : "לכל מי שאוהב עיצוב ייחודי וקומפקטי, צילום סלפי יצירתי מהמסך החיצוני, ושימוש נוח ביד אחת — בלי לוותר על ביצועי דגל."}`,
      `יתרון המסך המתקפל: המסך הפנימי (${f.mainDisplay}) נפתח ל${isFold ? "שטח עבודה בגודל טאבלט" : "מסך מלא וגדול"}, עם טכנולוגיית Dynamic AMOLED 2X, קצב רענון של 120Hz, ${f.brightness} בהירות שיא ו‑Vision Booster לקריאוּת מצוינת בכל תאורה. המסך החיצוני (${f.coverDisplay}) מאפשר גישה מהירה להתראות, מצלמה ווידג'טים גם כשהמכשיר סגור.`,
      `יתרונות לעבודה ולמולטיטאסקינג: ${isFold ? "המכשיר תומך ב‑Multi Window להפעלת שלוש אפליקציות במקביל, ב‑Samsung DeX לחוויית מחשב שולחני, וב‑Flex Mode שמנצל את הקיפול לחצי. גרירה ושחרור בין אפליקציות, שורת משימות וריבוי חלונות הופכים אותו למשרד נייד אמיתי." : "Flex Mode מאפשר להעמיד את המכשיר בזווית לצילום ללא חצובה, לשיחות וידאו ולצפייה נוחה, ו‑Multi Window מאפשר עבודה על שתי אפליקציות במקביל."}`,
      `Galaxy AI: ${f.galaxyAi ? "המכשיר כולל את חבילת Galaxy AI המלאה — Circle to Search לחיפוש מיידי, Live Translate ו‑Interpreter לתרגום שיחות בזמן אמת, Note Assist לסיכום הערות, ו‑Photo Assist עם Generative Edit לעריכת תמונות חכמה. ה‑AI פועל בצורה חלקה ומותאם במיוחד למסך המתקפל." : "המכשיר מקבל עדכוני תוכנה שוטפים מבית Samsung ותומך בחוויית One UI עשירה ויציבה."}`,
      `צילום: מערכת המצלמות כוללת ${f.rearCamera} כמצלמה ראשית, ${f.ultraWide} אולטרה‑רחבה${f.telephoto ? `, ו‑${f.telephoto}` : ""}, עם טכנולוגיית Nightography לצילומי לילה. המצלמה הקדמית ${f.frontCamera}${f.underDisplayCamera ? ` ובנוסף מצלמה מתחת למסך (${f.underDisplayCamera}) במסך הפנימי` : ""}. צילום וידאו עד ${f.video}. ${isFold ? "הקיפול מאפשר שימוש במצלמה הראשית האיכותית גם לסלפי, באמצעות המסך החיצוני כתצוגה מקדימה." : "המסך החיצוני משמש כתצוגה מקדימה לסלפי באיכות גבוהה עם המצלמה הראשית."}`,
      `ביצועים: בלב המכשיר פועל מעבד ${f.chip} עם מעבד גרפי ${f.gpu} ו‑${f.ram} זיכרון RAM, לביצועים מהירים, גרפיקה חזקה ומשחקים חלקים. נפחי האחסון: ${f.storageLabel}.`,
      `סוללה ופרודוקטיביות: סוללה בקיבולת ${f.battery}, עם ${f.fastCharge}, ${f.wirelessCharging} ו‑${f.reverseCharging} לטעינת אביזרים כמו אוזניות ושעון. המכשיר עומד בתקן ${f.ip}, מאובטח עם ${f.knox ? "Samsung Knox" : "אבטחת Samsung"}, מריץ ${f.oneUi} מבוסס ${f.android}, וכולל ${f.fingerprint}. משקל ${f.weight}, מידות מקופל ${f.foldedDim} ופתוח ${f.unfoldedDim}.`,
      `עיצוב ועמידות: המכשיר בנוי ממסגרת Armor Aluminum חזקה וקלה, עם זכוכית Gorilla Glass Victus המגינה מפני שריטות ונפילות, ומנגנון ציר (Hinge) משוכלל שנבדק לעשרות אלפי קיפולים ומאפשר עמידה בכל זווית. הגימור הפרימיום, האיכות הגבוהה של החומרים ותחושת היוקרה ביד הופכים אותו למכשיר שנעים להחזיק ולהשתמש בו לאורך זמן — בבית, בעבודה ובדרכים.`,
      `אקוסיסטם Samsung: ${p.name_he} משתלב בצורה חלקה עם מגוון אביזרים מקוריים — אוזניות Galaxy Buds, שעוני Galaxy Watch, עט (בדגמים תומכים), כיסויים מקוריים, מטענים מהירים, מטמני SmartTag ומגני מסך — לחוויית שימוש שלמה ומחוברת. סנכרון בין מכשירי Galaxy, שיתוף קבצים מהיר והמשכיות בין מסכים הופכים את היומיום לפשוט ויעיל יותר.`,
      `כל מכשיר מגיע עם אחריות יבואן רשמי לשנה ומשלוח מהיר. ${p.name_he} הוא הבחירה האידיאלית למי שרוצה את עתיד הסמארטפונים — כבר היום.`,
      `יתרונות עיקריים:   ${feats}`,
    ].join("\n\n");
  }

  if (lang === "ar") {
    return [
      `${p.name_ar} هاتف قابل للطي من Samsung يجمع بين الابتكار الهندسي والشاشة المرنة المتينة والتصميم الفاخر.`,
      `الشاشة الداخلية (${f.mainDisplay}) بتقنية Dynamic AMOLED 2X و120Hz وسطوع ${f.brightness} مع Vision Booster، والشاشة الخارجية (${f.coverDisplay}).`,
      `${f.galaxyAi ? "يدعم حزمة Galaxy AI كاملة: Circle to Search وLive Translate وInterpreter وNote Assist وPhoto Assist مع Generative Edit. " : ""}${isFold ? "Multi Window وSamsung DeX وFlex Mode للإنتاجية وتعدد المهام." : "Flex Mode وMulti Window لاستخدام مريح."}`,
      `الكاميرا: ${f.rearCamera} رئيسية، ${f.ultraWide}${f.telephoto ? `، ${f.telephoto}` : ""}، أمامية ${f.frontCamera}. فيديو حتى ${f.video}.`,
      `المعالج ${f.chip} مع ${f.gpu} و${f.ram}. التخزين: ${f.storageLabel}. بطارية ${f.battery} مع ${f.fastCharge} و${f.wirelessCharging}. مقاومة ${f.ip}. ضمان رسمي وشحن سريع.`,
      `أبرز المزايا:   ${feats}`,
    ].join("\n\n");
  }

  return [
    `${p.name_en} is a Samsung foldable that combines engineering innovation, a durable folding display and a premium design.`,
    `The main display (${f.mainDisplay}) uses Dynamic AMOLED 2X at 120Hz with ${f.brightness} peak brightness and Vision Booster; the cover display is ${f.coverDisplay}.`,
    `${f.galaxyAi ? "Includes the full Galaxy AI suite: Circle to Search, Live Translate, Interpreter, Note Assist and Photo Assist with Generative Edit. " : ""}${isFold ? "Multi Window, Samsung DeX and Flex Mode deliver true productivity and multitasking." : "Flex Mode and Multi Window enable comfortable hands-free use."}`,
    `Cameras: ${f.rearCamera} main, ${f.ultraWide}${f.telephoto ? `, ${f.telephoto}` : ""}, ${f.frontCamera} front. Video up to ${f.video}.`,
    `Powered by ${f.chip} with ${f.gpu} and ${f.ram}. Storage: ${f.storageLabel}. ${f.battery} battery with ${f.fastCharge} and ${f.wirelessCharging}. ${f.ip} rated. Official importer warranty and fast delivery.`,
    `Key highlights:   ${feats}`,
  ].join("\n\n");
}

export type ZImageKind = "front" | "back" | "folded" | "unfolded" | "side" | "lifestyle" | "open-display" | "closed-display";

export function zImage(key: string, slug: string, kind: ZImageKind): string {
  return `products/samsung/galaxy-z/${key}/${slug}-${kind}.png`;
}

export function zGallery(key: string, slug: string) {
  const kinds: ZImageKind[] = ["front", "back", "folded", "unfolded", "side", "lifestyle", "open-display", "closed-display"];
  return kinds.map((kind, i) => ({
    url: zImage(key, slug, kind),
    kind,
    isMain: i === 0,
    sortOrder: i,
  }));
}

const C = {
  visionBooster: true,
  nfc: true,
  gps: "GPS, GLONASS, BeiDou, Galileo",
  fiveG: true,
  dualSim: true,
  esim: true,
  knox: true,
  finger: "צד המכשיר (קיבולי)",
  wireless: "טעינה אלחוטית מהירה 15W",
  reverse: "Wireless PowerShare 4.5W",
};

export const SAMSUNG_GALAXY_Z: ZSeed[] = [
  // ---------------- Galaxy Z Fold ----------------
  {
    key: "samsung-galaxy-z-fold7",
    slug: "samsung-galaxy-z-fold7",
    series: "Galaxy Z Fold",
    form: "fold",
    model: "Galaxy Z Fold7",
    name_en: "Samsung Galaxy Z Fold7",
    name_he: "Samsung Galaxy Z Fold7",
    name_ar: "Samsung Galaxy Z Fold7",
    basePrice: 8999,
    featured: true,
    tags: ["NEW", "Samsung", "Galaxy Z", "Fold", "Foldable", "Android", "5G", "Galaxy AI", "Premium", "Business", "Productivity"],
    colors: [
      { value: "Blue Shadow", slug: "blue-shadow" },
      { value: "Silver Shadow", slug: "silver-shadow" },
      { value: "Jet Black", slug: "jet-black" },
    ],
    storage: [
      { value: "256GB", priceAdd: 0 },
      { value: "512GB", priceAdd: 500 },
      { value: "1TB", priceAdd: 1100 },
    ],
    spec: {
      coverDisplay: "6.5\" Dynamic AMOLED 2X, 120Hz",
      mainDisplay: "8.0\" QXGA+ Dynamic AMOLED 2X, 120Hz",
      brightness: "2600 nits",
      visionBooster: C.visionBooster,
      chip: "Snapdragon 8 Elite for Galaxy",
      gpu: "Adreno 830",
      ram: "12GB / 16GB",
      storageLabel: "256GB / 512GB / 1TB",
      rearCamera: "200MP רחבה",
      ultraWide: "12MP אולטרה‑רחבה",
      telephoto: "10MP טלפוטו (3x אופטי)",
      frontCamera: "10MP (מסך חיצוני) + 10MP (מסך פנימי)",
      underDisplayCamera: null,
      video: "8K @ 30fps",
      battery: "4400mAh",
      fastCharge: "טעינה מהירה 25W",
      wirelessCharging: C.wireless,
      reverseCharging: C.reverse,
      bluetooth: "Bluetooth 5.4",
      wifi: "Wi‑Fi 7",
      nfc: C.nfc,
      gps: C.gps,
      usbc: "USB‑C 3.2",
      fiveG: C.fiveG,
      dualSim: C.dualSim,
      esim: C.esim,
      knox: C.knox,
      galaxyAi: true,
      android: "Android 16",
      oneUi: "One UI 8",
      fingerprint: C.finger,
      ip: "IP48",
      weight: "215 g",
      foldedDim: "158.4 × 72.8 × 8.9 mm",
      unfoldedDim: "158.4 × 143.2 × 4.2 mm",
    },
  },
  {
    key: "samsung-galaxy-z-fold6",
    slug: "samsung-galaxy-z-fold6",
    series: "Galaxy Z Fold",
    form: "fold",
    model: "Galaxy Z Fold6",
    name_en: "Samsung Galaxy Z Fold6",
    name_he: "Samsung Galaxy Z Fold6",
    name_ar: "Samsung Galaxy Z Fold6",
    basePrice: 7999,
    featured: true,
    tags: ["Samsung", "Galaxy Z", "Fold", "Foldable", "Android", "5G", "Galaxy AI", "Premium", "Business", "Productivity"],
    colors: [
      { value: "Silver Shadow", slug: "silver-shadow" },
      { value: "Pink", slug: "pink" },
      { value: "Navy", slug: "navy" },
    ],
    storage: [
      { value: "256GB", priceAdd: 0 },
      { value: "512GB", priceAdd: 500 },
      { value: "1TB", priceAdd: 1100 },
    ],
    spec: {
      coverDisplay: "6.3\" Dynamic AMOLED 2X, 120Hz, 2376 × 968",
      mainDisplay: "7.6\" QXGA+ Dynamic AMOLED 2X, 120Hz, 2160 × 1856",
      brightness: "2600 nits",
      visionBooster: C.visionBooster,
      chip: "Snapdragon 8 Gen 3 for Galaxy",
      gpu: "Adreno 750",
      ram: "12GB",
      storageLabel: "256GB / 512GB / 1TB",
      rearCamera: "50MP רחבה",
      ultraWide: "12MP אולטרה‑רחבה",
      telephoto: "10MP טלפוטו (3x אופטי)",
      frontCamera: "10MP (מסך חיצוני)",
      underDisplayCamera: "4MP (מתחת למסך הפנימי)",
      video: "8K @ 30fps",
      battery: "4400mAh",
      fastCharge: "טעינה מהירה 25W",
      wirelessCharging: C.wireless,
      reverseCharging: C.reverse,
      bluetooth: "Bluetooth 5.3",
      wifi: "Wi‑Fi 6E",
      nfc: C.nfc,
      gps: C.gps,
      usbc: "USB‑C 3.2",
      fiveG: C.fiveG,
      dualSim: C.dualSim,
      esim: C.esim,
      knox: C.knox,
      galaxyAi: true,
      android: "Android 15",
      oneUi: "One UI 7",
      fingerprint: C.finger,
      ip: "IP48",
      weight: "239 g",
      foldedDim: "153.5 × 68.1 × 12.1 mm",
      unfoldedDim: "153.5 × 132.6 × 5.6 mm",
    },
  },
  {
    key: "samsung-galaxy-z-fold5",
    slug: "samsung-galaxy-z-fold5",
    series: "Galaxy Z Fold",
    form: "fold",
    model: "Galaxy Z Fold5",
    name_en: "Samsung Galaxy Z Fold5",
    name_he: "Samsung Galaxy Z Fold5",
    name_ar: "Samsung Galaxy Z Fold5",
    basePrice: 6499,
    tags: ["Samsung", "Galaxy Z", "Fold", "Foldable", "Android", "5G", "Galaxy AI", "Premium", "Business", "Productivity"],
    colors: [
      { value: "Icy Blue", slug: "icy-blue" },
      { value: "Phantom Black", slug: "phantom-black" },
      { value: "Cream", slug: "cream" },
    ],
    storage: [
      { value: "256GB", priceAdd: 0 },
      { value: "512GB", priceAdd: 500 },
      { value: "1TB", priceAdd: 1100 },
    ],
    spec: {
      coverDisplay: "6.2\" Dynamic AMOLED 2X, 120Hz, 2316 × 904",
      mainDisplay: "7.6\" QXGA+ Dynamic AMOLED 2X, 120Hz, 2176 × 1812",
      brightness: "1750 nits",
      visionBooster: C.visionBooster,
      chip: "Snapdragon 8 Gen 2 for Galaxy",
      gpu: "Adreno 740",
      ram: "12GB",
      storageLabel: "256GB / 512GB / 1TB",
      rearCamera: "50MP רחבה",
      ultraWide: "12MP אולטרה‑רחבה",
      telephoto: "10MP טלפוטו (3x אופטי)",
      frontCamera: "10MP (מסך חיצוני)",
      underDisplayCamera: "4MP (מתחת למסך הפנימי)",
      video: "8K @ 30fps",
      battery: "4400mAh",
      fastCharge: "טעינה מהירה 25W",
      wirelessCharging: C.wireless,
      reverseCharging: C.reverse,
      bluetooth: "Bluetooth 5.3",
      wifi: "Wi‑Fi 6E",
      nfc: C.nfc,
      gps: C.gps,
      usbc: "USB‑C 3.2",
      fiveG: C.fiveG,
      dualSim: C.dualSim,
      esim: C.esim,
      knox: C.knox,
      galaxyAi: true,
      android: "Android 15",
      oneUi: "One UI 7",
      fingerprint: C.finger,
      ip: "IPX8",
      weight: "253 g",
      foldedDim: "154.9 × 67.1 × 13.4 mm",
      unfoldedDim: "154.9 × 129.9 × 6.1 mm",
    },
  },
  {
    key: "samsung-galaxy-z-fold4",
    slug: "samsung-galaxy-z-fold4",
    series: "Galaxy Z Fold",
    form: "fold",
    model: "Galaxy Z Fold4",
    name_en: "Samsung Galaxy Z Fold4",
    name_he: "Samsung Galaxy Z Fold4",
    name_ar: "Samsung Galaxy Z Fold4",
    basePrice: 5499,
    tags: ["Samsung", "Galaxy Z", "Fold", "Foldable", "Android", "5G", "Premium", "Business", "Productivity"],
    colors: [
      { value: "Graygreen", slug: "graygreen" },
      { value: "Phantom Black", slug: "phantom-black" },
      { value: "Beige", slug: "beige" },
    ],
    storage: [
      { value: "256GB", priceAdd: 0 },
      { value: "512GB", priceAdd: 500 },
      { value: "1TB", priceAdd: 1100 },
    ],
    spec: {
      coverDisplay: "6.2\" Dynamic AMOLED 2X, 120Hz, 2316 × 904",
      mainDisplay: "7.6\" QXGA+ Dynamic AMOLED 2X, 120Hz, 2176 × 1812",
      brightness: "1000 nits",
      visionBooster: C.visionBooster,
      chip: "Snapdragon 8+ Gen 1",
      gpu: "Adreno 730",
      ram: "12GB",
      storageLabel: "256GB / 512GB / 1TB",
      rearCamera: "50MP רחבה",
      ultraWide: "12MP אולטרה‑רחבה",
      telephoto: "10MP טלפוטו (3x אופטי)",
      frontCamera: "10MP (מסך חיצוני)",
      underDisplayCamera: "4MP (מתחת למסך הפנימי)",
      video: "8K @ 24fps",
      battery: "4400mAh",
      fastCharge: "טעינה מהירה 25W",
      wirelessCharging: C.wireless,
      reverseCharging: C.reverse,
      bluetooth: "Bluetooth 5.2",
      wifi: "Wi‑Fi 6E",
      nfc: C.nfc,
      gps: C.gps,
      usbc: "USB‑C 3.2",
      fiveG: C.fiveG,
      dualSim: C.dualSim,
      esim: C.esim,
      knox: C.knox,
      galaxyAi: false,
      android: "Android 15",
      oneUi: "One UI 7",
      fingerprint: C.finger,
      ip: "IPX8",
      weight: "263 g",
      foldedDim: "155.1 × 67.1 × 15.8 mm",
      unfoldedDim: "155.1 × 130.1 × 6.3 mm",
    },
  },

  // ---------------- Galaxy Z Flip ----------------
  {
    key: "samsung-galaxy-z-flip7",
    slug: "samsung-galaxy-z-flip7",
    series: "Galaxy Z Flip",
    form: "flip",
    model: "Galaxy Z Flip7",
    name_en: "Samsung Galaxy Z Flip7",
    name_he: "Samsung Galaxy Z Flip7",
    name_ar: "Samsung Galaxy Z Flip7",
    basePrice: 4999,
    featured: true,
    tags: ["NEW", "Samsung", "Galaxy Z", "Flip", "Foldable", "Android", "5G", "Galaxy AI", "Premium", "Camera"],
    colors: [
      { value: "Blue Shadow", slug: "blue-shadow" },
      { value: "Jet Black", slug: "jet-black" },
      { value: "Coral Red", slug: "coral-red" },
    ],
    storage: [
      { value: "256GB", priceAdd: 0 },
      { value: "512GB", priceAdd: 400 },
    ],
    spec: {
      coverDisplay: "4.1\" Super AMOLED, FlexWindow",
      mainDisplay: "6.9\" FHD+ Dynamic AMOLED 2X, 120Hz",
      brightness: "2600 nits",
      visionBooster: C.visionBooster,
      chip: "Samsung Exynos 2500",
      gpu: "Xclipse 950",
      ram: "12GB",
      storageLabel: "256GB / 512GB",
      rearCamera: "50MP רחבה",
      ultraWide: "12MP אולטרה‑רחבה",
      telephoto: null,
      frontCamera: "10MP",
      underDisplayCamera: null,
      video: "4K @ 60fps",
      battery: "4300mAh",
      fastCharge: "טעינה מהירה 25W",
      wirelessCharging: C.wireless,
      reverseCharging: C.reverse,
      bluetooth: "Bluetooth 5.4",
      wifi: "Wi‑Fi 7",
      nfc: C.nfc,
      gps: C.gps,
      usbc: "USB‑C 2.0",
      fiveG: C.fiveG,
      dualSim: C.dualSim,
      esim: C.esim,
      knox: C.knox,
      galaxyAi: true,
      android: "Android 16",
      oneUi: "One UI 8",
      fingerprint: C.finger,
      ip: "IP48",
      weight: "188 g",
      foldedDim: "85.5 × 75.2 × 13.7 mm",
      unfoldedDim: "166.7 × 75.2 × 6.5 mm",
    },
  },
  {
    key: "samsung-galaxy-z-flip6",
    slug: "samsung-galaxy-z-flip6",
    series: "Galaxy Z Flip",
    form: "flip",
    model: "Galaxy Z Flip6",
    name_en: "Samsung Galaxy Z Flip6",
    name_he: "Samsung Galaxy Z Flip6",
    name_ar: "Samsung Galaxy Z Flip6",
    basePrice: 4799,
    featured: true,
    tags: ["Samsung", "Galaxy Z", "Flip", "Foldable", "Android", "5G", "Galaxy AI", "Premium", "Camera"],
    colors: [
      { value: "Silver Shadow", slug: "silver-shadow" },
      { value: "Yellow", slug: "yellow" },
      { value: "Blue", slug: "blue" },
      { value: "Mint", slug: "mint" },
    ],
    storage: [
      { value: "256GB", priceAdd: 0 },
      { value: "512GB", priceAdd: 400 },
    ],
    spec: {
      coverDisplay: "3.4\" Super AMOLED, 720 × 748, FlexWindow",
      mainDisplay: "6.7\" FHD+ Dynamic AMOLED 2X, 120Hz, 2640 × 1080",
      brightness: "2600 nits",
      visionBooster: C.visionBooster,
      chip: "Snapdragon 8 Gen 3 for Galaxy",
      gpu: "Adreno 750",
      ram: "12GB",
      storageLabel: "256GB / 512GB",
      rearCamera: "50MP רחבה",
      ultraWide: "12MP אולטרה‑רחבה",
      telephoto: null,
      frontCamera: "10MP",
      underDisplayCamera: null,
      video: "4K @ 60fps",
      battery: "4000mAh",
      fastCharge: "טעינה מהירה 25W",
      wirelessCharging: C.wireless,
      reverseCharging: C.reverse,
      bluetooth: "Bluetooth 5.3",
      wifi: "Wi‑Fi 6E",
      nfc: C.nfc,
      gps: C.gps,
      usbc: "USB‑C 2.0",
      fiveG: C.fiveG,
      dualSim: C.dualSim,
      esim: C.esim,
      knox: C.knox,
      galaxyAi: true,
      android: "Android 15",
      oneUi: "One UI 7",
      fingerprint: C.finger,
      ip: "IP48",
      weight: "187 g",
      foldedDim: "85.1 × 71.9 × 14.9 mm",
      unfoldedDim: "165.1 × 71.9 × 6.9 mm",
    },
  },
  {
    key: "samsung-galaxy-z-flip5",
    slug: "samsung-galaxy-z-flip5",
    series: "Galaxy Z Flip",
    form: "flip",
    model: "Galaxy Z Flip5",
    name_en: "Samsung Galaxy Z Flip5",
    name_he: "Samsung Galaxy Z Flip5",
    name_ar: "Samsung Galaxy Z Flip5",
    basePrice: 3999,
    tags: ["Samsung", "Galaxy Z", "Flip", "Foldable", "Android", "5G", "Galaxy AI", "Premium", "Camera"],
    colors: [
      { value: "Mint", slug: "mint" },
      { value: "Graphite", slug: "graphite" },
      { value: "Cream", slug: "cream" },
      { value: "Lavender", slug: "lavender" },
    ],
    storage: [
      { value: "256GB", priceAdd: 0 },
      { value: "512GB", priceAdd: 400 },
    ],
    spec: {
      coverDisplay: "3.4\" Super AMOLED, 720 × 748, Flex Window",
      mainDisplay: "6.7\" FHD+ Dynamic AMOLED 2X, 120Hz, 2640 × 1080",
      brightness: "1750 nits",
      visionBooster: C.visionBooster,
      chip: "Snapdragon 8 Gen 2 for Galaxy",
      gpu: "Adreno 740",
      ram: "8GB",
      storageLabel: "256GB / 512GB",
      rearCamera: "12MP רחבה",
      ultraWide: "12MP אולטרה‑רחבה",
      telephoto: null,
      frontCamera: "10MP",
      underDisplayCamera: null,
      video: "4K @ 60fps",
      battery: "3700mAh",
      fastCharge: "טעינה מהירה 25W",
      wirelessCharging: C.wireless,
      reverseCharging: C.reverse,
      bluetooth: "Bluetooth 5.3",
      wifi: "Wi‑Fi 6E",
      nfc: C.nfc,
      gps: C.gps,
      usbc: "USB‑C 2.0",
      fiveG: C.fiveG,
      dualSim: C.dualSim,
      esim: C.esim,
      knox: C.knox,
      galaxyAi: true,
      android: "Android 15",
      oneUi: "One UI 7",
      fingerprint: C.finger,
      ip: "IPX8",
      weight: "187 g",
      foldedDim: "85.1 × 71.9 × 15.1 mm",
      unfoldedDim: "165.1 × 71.9 × 6.9 mm",
    },
  },
  {
    key: "samsung-galaxy-z-flip4",
    slug: "samsung-galaxy-z-flip4",
    series: "Galaxy Z Flip",
    form: "flip",
    model: "Galaxy Z Flip4",
    name_en: "Samsung Galaxy Z Flip4",
    name_he: "Samsung Galaxy Z Flip4",
    name_ar: "Samsung Galaxy Z Flip4",
    basePrice: 3299,
    tags: ["Samsung", "Galaxy Z", "Flip", "Foldable", "Android", "5G", "Premium", "Camera"],
    colors: [
      { value: "Bora Purple", slug: "bora-purple" },
      { value: "Graphite", slug: "graphite" },
      { value: "Pink Gold", slug: "pink-gold" },
      { value: "Blue", slug: "blue" },
    ],
    storage: [
      { value: "128GB", priceAdd: 0 },
      { value: "256GB", priceAdd: 250 },
      { value: "512GB", priceAdd: 600 },
    ],
    spec: {
      coverDisplay: "1.9\" Super AMOLED, 260 × 512",
      mainDisplay: "6.7\" FHD+ Dynamic AMOLED 2X, 120Hz, 2640 × 1080",
      brightness: "1200 nits",
      visionBooster: C.visionBooster,
      chip: "Snapdragon 8+ Gen 1",
      gpu: "Adreno 730",
      ram: "8GB",
      storageLabel: "128GB / 256GB / 512GB",
      rearCamera: "12MP רחבה",
      ultraWide: "12MP אולטרה‑רחבה",
      telephoto: null,
      frontCamera: "10MP",
      underDisplayCamera: null,
      video: "4K @ 60fps",
      battery: "3700mAh",
      fastCharge: "טעינה מהירה 25W",
      wirelessCharging: C.wireless,
      reverseCharging: C.reverse,
      bluetooth: "Bluetooth 5.2",
      wifi: "Wi‑Fi 6E",
      nfc: C.nfc,
      gps: C.gps,
      usbc: "USB‑C 2.0",
      fiveG: C.fiveG,
      dualSim: C.dualSim,
      esim: C.esim,
      knox: C.knox,
      galaxyAi: false,
      android: "Android 15",
      oneUi: "One UI 7",
      fingerprint: C.finger,
      ip: "IPX8",
      weight: "187 g",
      foldedDim: "84.9 × 71.9 × 17.1 mm",
      unfoldedDim: "165.2 × 71.9 × 6.9 mm",
    },
  },
];
