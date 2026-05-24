/** Shared smartphone catalog definitions for seed + admin presets. */

export const STORAGE_OPTIONS = [
  { value: "128GB", priceAdd: 0 },
  { value: "256GB", priceAdd: 400 },
  { value: "512GB", priceAdd: 900 },
  { value: "1TB", priceAdd: 1600 },
] as const;

export const IMPORT_TYPES = [
  { value: "Official Importer", priceAdd: 0 },
  { value: "Parallel Import", priceAdd: -250 },
  { value: "Refurbished", priceAdd: -700 },
  { value: "Brand New", priceAdd: 0 },
] as const;

export const APPLE_COLORS = [
  "Black",
  "White",
  "Blue",
  "Titanium",
  "Natural Titanium",
] as const;

export const SAMSUNG_COLORS = [
  "Phantom Black",
  "Silver",
  "Purple",
  "Blue",
  "Gray",
] as const;

export const PRODUCT_TAGS = ["NEW", "SALE", "BEST SELLER"] as const;

export type SmartphoneBrand = "apple" | "samsung";

export type CategorySeed = {
  key: string;
  parentKey?: string;
  name_he: string;
  name_ar: string;
  name_en: string;
  sortOrder: number;
  imageUrl?: string;
};

export type ProductSeed = {
  key: string;
  categoryKey: string;
  name_en: string;
  name_he: string;
  name_ar: string;
  basePrice: number;
  brand: SmartphoneBrand;
  tags: string[];
  featured?: boolean;
  imageUrl?: string;
};

export type VariantOptionInput = {
  value: string;
  priceAdd: number;
  stock?: number | null;
  isDefault?: boolean;
  sortOrder?: number;
};

export type VariantGroupInput = {
  name: string;
  sortOrder: number;
  options: VariantOptionInput[];
};

export function buildSmartphoneVariantGroups(brand: SmartphoneBrand): VariantGroupInput[] {
  const colors = brand === "apple" ? APPLE_COLORS : SAMSUNG_COLORS;
  return [
    {
      name: "Color",
      sortOrder: 0,
      options: colors.map((c, i) => ({
        value: c,
        priceAdd: 0,
        stock: 12,
        isDefault: i === 0,
        sortOrder: i,
      })),
    },
    {
      name: "Storage",
      sortOrder: 1,
      options: STORAGE_OPTIONS.map((s, i) => ({
        value: s.value,
        priceAdd: s.priceAdd,
        stock: 8,
        isDefault: i === 0,
        sortOrder: i,
      })),
    },
    {
      name: "Import Type",
      sortOrder: 2,
      options: IMPORT_TYPES.map((t, i) => ({
        value: t.value,
        priceAdd: t.priceAdd,
        stock: 6,
        isDefault: i === 0,
        sortOrder: i,
      })),
    },
  ];
}

export const SMARTPHONE_CATEGORIES: CategorySeed[] = [
  {
    key: "smartphones",
    name_he: "סמארטפונים",
    name_ar: "الهواتف الذكية",
    name_en: "Smartphones",
    sortOrder: 10,
    imageUrl: "demo/electronics/phones/smartphones-main.svg",
  },
  {
    key: "iphone",
    parentKey: "smartphones",
    name_he: "iPhone",
    name_ar: "iPhone",
    name_en: "iPhone",
    sortOrder: 11,
  },
  {
    key: "samsung",
    parentKey: "smartphones",
    name_he: "Samsung",
    name_ar: "Samsung",
    name_en: "Samsung",
    sortOrder: 12,
  },
  {
    key: "iphone-15-series",
    parentKey: "apple",
    name_he: "iPhone 15 Series",
    name_ar: "iPhone 15 Series",
    name_en: "iPhone 15 Series",
    sortOrder: 20,
  },
  {
    key: "iphone-16-series",
    parentKey: "apple",
    name_he: "iPhone 16 Series",
    name_ar: "iPhone 16 Series",
    name_en: "iPhone 16 Series",
    sortOrder: 21,
  },
  {
    key: "iphone-17-series",
    parentKey: "apple",
    name_he: "iPhone 17 Series",
    name_ar: "iPhone 17 Series",
    name_en: "iPhone 17 Series",
    sortOrder: 22,
  },
  {
    key: "galaxy-s",
    parentKey: "samsung",
    name_he: "Galaxy S Series",
    name_ar: "Galaxy S Series",
    name_en: "Galaxy S Series",
    sortOrder: 30,
  },
  {
    key: "galaxy-a",
    parentKey: "samsung",
    name_he: "Galaxy A Series",
    name_ar: "Galaxy A Series",
    name_en: "Galaxy A Series",
    sortOrder: 31,
  },
  {
    key: "galaxy-z",
    parentKey: "samsung",
    name_he: "Galaxy Z Series",
    name_ar: "Galaxy Z Series",
    name_en: "Galaxy Z Series",
    sortOrder: 32,
  },
];

const phoneImg = "demo/electronics/phones/device-phone.svg";
const phoneAlt = "demo/electronics/phones/device-phone-alt.svg";

export const SMARTPHONE_PRODUCTS: ProductSeed[] = [
  { key: "iphone-15", categoryKey: "iphone-15-series", name_en: "iPhone 15", name_he: "iPhone 15", name_ar: "iPhone 15", basePrice: 3499, brand: "apple", tags: ["New", "Recommended"], imageUrl: phoneImg },
  { key: "iphone-15-plus", categoryKey: "iphone-15-series", name_en: "iPhone 15 Plus", name_he: "iPhone 15 Plus", name_ar: "iPhone 15 Plus", basePrice: 3899, brand: "apple", tags: ["New"], imageUrl: phoneImg },
  { key: "iphone-15-pro", categoryKey: "iphone-15-series", name_en: "iPhone 15 Pro", name_he: "iPhone 15 Pro", name_ar: "iPhone 15 Pro", basePrice: 4299, brand: "apple", tags: ["Pro Model", "AI Camera"], featured: true, imageUrl: phoneAlt },
  { key: "iphone-15-pro-max", categoryKey: "iphone-15-series", name_en: "iPhone 15 Pro Max", name_he: "iPhone 15 Pro Max", name_ar: "iPhone 15 Pro Max", basePrice: 4899, brand: "apple", tags: ["Pro Model", "Best Seller"], imageUrl: phoneAlt },
  { key: "iphone-16", categoryKey: "iphone-16-series", name_en: "iPhone 16", name_he: "iPhone 16", name_ar: "iPhone 16", basePrice: 3999, brand: "apple", tags: ["New", "Recommended"], imageUrl: phoneImg },
  { key: "iphone-16-plus", categoryKey: "iphone-16-series", name_en: "iPhone 16 Plus", name_he: "iPhone 16 Plus", name_ar: "iPhone 16 Plus", basePrice: 4399, brand: "apple", tags: ["New"], imageUrl: phoneImg },
  { key: "iphone-16-pro", categoryKey: "iphone-16-series", name_en: "iPhone 16 Pro", name_he: "iPhone 16 Pro", name_ar: "iPhone 16 Pro", basePrice: 4699, brand: "apple", tags: ["Pro Model", "AI Camera"], featured: true, imageUrl: phoneAlt },
  { key: "iphone-16-pro-max", categoryKey: "iphone-16-series", name_en: "iPhone 16 Pro Max", name_he: "iPhone 16 Pro Max", name_ar: "iPhone 16 Pro Max", basePrice: 5299, brand: "apple", tags: ["Pro Model", "Best Seller"], imageUrl: phoneAlt },
  { key: "iphone-17", categoryKey: "iphone-17-series", name_en: "iPhone 17", name_he: "iPhone 17", name_ar: "iPhone 17", basePrice: 4499, brand: "apple", tags: ["New"], imageUrl: phoneImg },
  { key: "iphone-17-air", categoryKey: "iphone-17-series", name_en: "iPhone 17 Air", name_he: "iPhone 17 Air", name_ar: "iPhone 17 Air", basePrice: 4799, brand: "apple", tags: ["New", "Recommended"], imageUrl: phoneImg },
  { key: "iphone-17-pro", categoryKey: "iphone-17-series", name_en: "iPhone 17 Pro", name_he: "iPhone 17 Pro", name_ar: "iPhone 17 Pro", basePrice: 5099, brand: "apple", tags: ["Pro Model", "AI Camera"], featured: true, imageUrl: phoneAlt },
  { key: "iphone-17-pro-max", categoryKey: "iphone-17-series", name_en: "iPhone 17 Pro Max", name_he: "iPhone 17 Pro Max", name_ar: "iPhone 17 Pro Max", basePrice: 5699, brand: "apple", tags: ["Pro Model", "Best Seller"], imageUrl: phoneAlt },
  { key: "galaxy-s24", categoryKey: "galaxy-s", name_en: "Galaxy S24", name_he: "Galaxy S24", name_ar: "Galaxy S24", basePrice: 3299, brand: "samsung", tags: ["Sale", "Recommended"], imageUrl: phoneImg },
  { key: "galaxy-s24-ultra", categoryKey: "galaxy-s", name_en: "Galaxy S24 Ultra", name_he: "Galaxy S24 Ultra", name_ar: "Galaxy S24 Ultra", basePrice: 4299, brand: "samsung", tags: ["Pro Model", "AI Camera"], featured: true, imageUrl: phoneAlt },
  { key: "galaxy-s25", categoryKey: "galaxy-s", name_en: "Galaxy S25", name_he: "Galaxy S25", name_ar: "Galaxy S25", basePrice: 3699, brand: "samsung", tags: ["New"], imageUrl: phoneImg },
  { key: "galaxy-s25-ultra", categoryKey: "galaxy-s", name_en: "Galaxy S25 Ultra", name_he: "Galaxy S25 Ultra", name_ar: "Galaxy S25 Ultra", basePrice: 4699, brand: "samsung", tags: ["New", "Best Seller"], featured: true, imageUrl: phoneAlt },
  { key: "galaxy-a35", categoryKey: "galaxy-a", name_en: "Galaxy A35", name_he: "Galaxy A35", name_ar: "Galaxy A35", basePrice: 1299, brand: "samsung", tags: ["Recommended"], imageUrl: phoneImg },
  { key: "galaxy-a55", categoryKey: "galaxy-a", name_en: "Galaxy A55", name_he: "Galaxy A55", name_ar: "Galaxy A55", basePrice: 1699, brand: "samsung", tags: ["Sale"], imageUrl: phoneImg },
  { key: "galaxy-a75", categoryKey: "galaxy-a", name_en: "Galaxy A75", name_he: "Galaxy A75", name_ar: "Galaxy A75", basePrice: 2199, brand: "samsung", tags: ["New"], imageUrl: phoneImg },
  { key: "galaxy-z-fold", categoryKey: "galaxy-z", name_en: "Galaxy Z Fold", name_he: "Galaxy Z Fold", name_ar: "Galaxy Z Fold", basePrice: 6499, brand: "samsung", tags: ["Pro Model"], featured: true, imageUrl: phoneAlt },
  { key: "galaxy-z-flip", categoryKey: "galaxy-z", name_en: "Galaxy Z Flip", name_he: "Galaxy Z Flip", name_ar: "Galaxy Z Flip", basePrice: 3999, brand: "samsung", tags: ["New", "Recommended"], imageUrl: phoneAlt },
];

export function collectDescendantCategoryIds(
  categories: { id: string; parentId: string | null }[],
  rootId: string,
): string[] {
  const ids = new Set<string>([rootId]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const c of categories) {
      if (c.parentId && ids.has(c.parentId) && !ids.has(c.id)) {
        ids.add(c.id);
        changed = true;
      }
    }
  }
  return [...ids];
}

export function minSmartphonePrice(basePrice: number): number {
  const minStorage = Math.min(...STORAGE_OPTIONS.map((s) => s.priceAdd));
  const minImport = Math.min(...IMPORT_TYPES.map((t) => t.priceAdd));
  return Math.max(0, basePrice + minStorage + minImport);
}

export function adminVariantGroupsFromPreset(brand: SmartphoneBrand) {
  const ts = Date.now();
  return buildSmartphoneVariantGroups(brand).map((g, gi) => ({
    id: `preset-g-${ts}-${gi}`,
    name: g.name,
    sortOrder: g.sortOrder,
    options: g.options.map((o, oi) => ({
      id: `preset-o-${ts}-${gi}-${oi}`,
      value: o.value,
      priceAdd: o.priceAdd,
      stock: o.stock ?? 10,
      sku: null,
      image: null,
      isDefault: o.isDefault ?? oi === 0,
      sortOrder: o.sortOrder ?? oi,
    })),
  }));
}

export function colorOptionsFromGroups(
  groups: { name: string; options: { value: string }[] }[],
): string[] {
  const colorGroup = groups.find((g) => g.name.toLowerCase() === "color");
  return colorGroup?.options.map((o) => o.value) ?? [];
}
