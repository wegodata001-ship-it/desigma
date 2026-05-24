/** DESIGMA smartphone demo catalog — exact prices, colors, storage, images. */

import { phoneColorImage } from "./smartphone-product-images";

const apple = (model: string, color: string) => phoneColorImage("apple", model, color);
const samsung = (model: string, color: string) => phoneColorImage("samsung", model, color);

export type DemoColorOption = {
  value: string;
  image: string;
};

export type DemoStorageOption = {
  value: string;
  priceAdd: number;
};

export type DemoProductSeed = {
  key: string;
  slug: string;
  categoryKey: "iphone" | "samsung";
  name_en: string;
  name_he: string;
  name_ar: string;
  basePrice: number;
  colors: DemoColorOption[];
  storage: DemoStorageOption[];
  tags: string[];
  featured?: boolean;
};

export const DEMO_SMARTPHONE_CATEGORIES = [
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
] as const;

export const DEMO_SMARTPHONE_PRODUCTS: DemoProductSeed[] = [
  {
    key: "iphone-15",
    slug: "iphone15",
    categoryKey: "iphone",
    name_en: "iPhone 15",
    name_he: "iPhone 15",
    name_ar: "iPhone 15",
    basePrice: 3799,
    tags: ["SALE"],
    colors: [
      { value: "Black", image: apple("iphone-15", "Black") },
      { value: "Blue", image: apple("iphone-15", "Blue") },
      { value: "Pink", image: apple("iphone-15", "Pink") },
      { value: "White", image: apple("iphone-15", "White") },
    ],
    storage: [
      { value: "128GB", priceAdd: 0 },
      { value: "256GB", priceAdd: 400 },
      { value: "512GB", priceAdd: 900 },
    ],
  },
  {
    key: "iphone-15-pro",
    slug: "iphone15pro",
    categoryKey: "iphone",
    name_en: "iPhone 15 Pro",
    name_he: "iPhone 15 Pro",
    name_ar: "iPhone 15 Pro",
    basePrice: 4899,
    tags: ["BEST SELLER"],
    colors: [
      { value: "Black Titanium", image: apple("iphone-15-pro", "Black Titanium") },
      { value: "Natural Titanium", image: apple("iphone-15-pro", "Natural Titanium") },
      { value: "Blue Titanium", image: apple("iphone-15-pro", "Blue Titanium") },
      { value: "White Titanium", image: apple("iphone-15-pro", "White Titanium") },
    ],
    storage: [
      { value: "128GB", priceAdd: 0 },
      { value: "256GB", priceAdd: 400 },
      { value: "512GB", priceAdd: 900 },
      { value: "1TB", priceAdd: 1600 },
    ],
  },
  {
    key: "iphone-15-pro-max",
    slug: "iphone15promax",
    categoryKey: "iphone",
    name_en: "iPhone 15 Pro Max",
    name_he: "iPhone 15 Pro Max",
    name_ar: "iPhone 15 Pro Max",
    basePrice: 5499,
    tags: ["BEST SELLER", "SALE"],
    colors: [
      { value: "Black Titanium", image: apple("iphone-15-pro-max", "Black Titanium") },
      { value: "Blue Titanium", image: apple("iphone-15-pro-max", "Blue Titanium") },
      { value: "Natural Titanium", image: apple("iphone-15-pro-max", "Natural Titanium") },
      { value: "White Titanium", image: apple("iphone-15-pro-max", "White Titanium") },
    ],
    storage: [
      { value: "256GB", priceAdd: 0 },
      { value: "512GB", priceAdd: 700 },
      { value: "1TB", priceAdd: 1400 },
    ],
  },
  {
    key: "iphone-16",
    slug: "iphone16",
    categoryKey: "iphone",
    name_en: "iPhone 16",
    name_he: "iPhone 16",
    name_ar: "iPhone 16",
    basePrice: 4299,
    tags: ["NEW"],
    colors: [
      { value: "Black", image: apple("iphone-16", "Black") },
      { value: "Blue", image: apple("iphone-16", "Blue") },
      { value: "Green", image: apple("iphone-16", "Green") },
      { value: "White", image: apple("iphone-16", "White") },
    ],
    storage: [
      { value: "128GB", priceAdd: 0 },
      { value: "256GB", priceAdd: 400 },
      { value: "512GB", priceAdd: 900 },
    ],
  },
  {
    key: "iphone-16-pro",
    slug: "iphone16pro",
    categoryKey: "iphone",
    name_en: "iPhone 16 Pro",
    name_he: "iPhone 16 Pro",
    name_ar: "iPhone 16 Pro",
    basePrice: 5499,
    featured: true,
    tags: ["NEW", "BEST SELLER"],
    colors: [
      { value: "Black Titanium", image: apple("iphone-16-pro", "Black Titanium") },
      { value: "Desert Titanium", image: apple("iphone-16-pro", "Desert Titanium") },
      { value: "Natural Titanium", image: apple("iphone-16-pro", "Natural Titanium") },
      { value: "White Titanium", image: apple("iphone-16-pro", "White Titanium") },
    ],
    storage: [
      { value: "256GB", priceAdd: 0 },
      { value: "512GB", priceAdd: 600 },
      { value: "1TB", priceAdd: 1300 },
    ],
  },
  {
    key: "iphone-16-pro-max",
    slug: "iphone16promax",
    categoryKey: "iphone",
    name_en: "iPhone 16 Pro Max",
    name_he: "iPhone 16 Pro Max",
    name_ar: "iPhone 16 Pro Max",
    basePrice: 6299,
    tags: ["NEW"],
    colors: [
      { value: "Black Titanium", image: apple("iphone-16-pro-max", "Black Titanium") },
      { value: "Desert Titanium", image: apple("iphone-16-pro-max", "Desert Titanium") },
      { value: "Natural Titanium", image: apple("iphone-16-pro-max", "Natural Titanium") },
      { value: "White Titanium", image: apple("iphone-16-pro-max", "White Titanium") },
    ],
    storage: [
      { value: "256GB", priceAdd: 0 },
      { value: "512GB", priceAdd: 700 },
      { value: "1TB", priceAdd: 1500 },
    ],
  },
  {
    key: "iphone-17",
    slug: "iphone17",
    categoryKey: "iphone",
    name_en: "iPhone 17",
    name_he: "iPhone 17",
    name_ar: "iPhone 17",
    basePrice: 4699,
    tags: ["NEW"],
    colors: [
      { value: "Black", image: apple("iphone-17", "Black") },
      { value: "Blue", image: apple("iphone-17", "Blue") },
      { value: "Silver", image: apple("iphone-17", "Silver") },
      { value: "White", image: apple("iphone-17", "White") },
    ],
    storage: [
      { value: "128GB", priceAdd: 0 },
      { value: "256GB", priceAdd: 400 },
      { value: "512GB", priceAdd: 900 },
    ],
  },
  {
    key: "iphone-17-pro",
    slug: "iphone17pro",
    categoryKey: "iphone",
    name_en: "iPhone 17 Pro",
    name_he: "iPhone 17 Pro",
    name_ar: "iPhone 17 Pro",
    basePrice: 5999,
    tags: ["NEW", "BEST SELLER"],
    colors: [
      { value: "Black Titanium", image: apple("iphone-17-pro", "Black Titanium") },
      { value: "Blue Titanium", image: apple("iphone-17-pro", "Blue Titanium") },
      { value: "Natural Titanium", image: apple("iphone-17-pro", "Natural Titanium") },
      { value: "White Titanium", image: apple("iphone-17-pro", "White Titanium") },
    ],
    storage: [
      { value: "256GB", priceAdd: 0 },
      { value: "512GB", priceAdd: 700 },
      { value: "1TB", priceAdd: 1500 },
    ],
  },
  {
    key: "iphone-17-pro-max",
    slug: "iphone17promax",
    categoryKey: "iphone",
    name_en: "iPhone 17 Pro Max",
    name_he: "iPhone 17 Pro Max",
    name_ar: "iPhone 17 Pro Max",
    basePrice: 6599,
    featured: true,
    tags: ["NEW", "BEST SELLER"],
    colors: [
      { value: "Black Titanium", image: apple("iphone-17-pro-max", "Black Titanium") },
      { value: "Blue Titanium", image: apple("iphone-17-pro-max", "Blue Titanium") },
      { value: "Natural Titanium", image: apple("iphone-17-pro-max", "Natural Titanium") },
      { value: "White Titanium", image: apple("iphone-17-pro-max", "White Titanium") },
    ],
    storage: [
      { value: "256GB", priceAdd: 0 },
      { value: "512GB", priceAdd: 700 },
      { value: "1TB", priceAdd: 1500 },
    ],
  },
  {
    key: "galaxy-s24",
    slug: "s24",
    categoryKey: "samsung",
    name_en: "Galaxy S24",
    name_he: "Galaxy S24",
    name_ar: "Galaxy S24",
    basePrice: 3499,
    tags: ["SALE"],
    colors: [
      { value: "Black", image: samsung("galaxy-s24", "Black") },
      { value: "Silver", image: samsung("galaxy-s24", "Silver") },
      { value: "Purple", image: samsung("galaxy-s24", "Purple") },
    ],
    storage: [
      { value: "128GB", priceAdd: 0 },
      { value: "256GB", priceAdd: 300 },
    ],
  },
  {
    key: "galaxy-s24-ultra",
    slug: "s24ultra",
    categoryKey: "samsung",
    name_en: "Galaxy S24 Ultra",
    name_he: "Galaxy S24 Ultra",
    name_ar: "Galaxy S24 Ultra",
    basePrice: 5199,
    tags: ["BEST SELLER", "SALE"],
    colors: [
      { value: "Titanium Black", image: samsung("galaxy-s24-ultra", "Titanium Black") },
      { value: "Titanium Gray", image: samsung("galaxy-s24-ultra", "Titanium Gray") },
      { value: "Titanium Violet", image: samsung("galaxy-s24-ultra", "Titanium Violet") },
    ],
    storage: [
      { value: "256GB", priceAdd: 0 },
      { value: "512GB", priceAdd: 600 },
      { value: "1TB", priceAdd: 1300 },
    ],
  },
  {
    key: "galaxy-s25",
    slug: "s25",
    categoryKey: "samsung",
    name_en: "Galaxy S25",
    name_he: "Galaxy S25",
    name_ar: "Galaxy S25",
    basePrice: 3899,
    tags: ["NEW"],
    colors: [
      { value: "Black", image: samsung("galaxy-s25", "Black") },
      { value: "Blue", image: samsung("galaxy-s25", "Blue") },
      { value: "Silver", image: samsung("galaxy-s25", "Silver") },
    ],
    storage: [
      { value: "128GB", priceAdd: 0 },
      { value: "256GB", priceAdd: 300 },
    ],
  },
  {
    key: "galaxy-s25-ultra",
    slug: "s25ultra",
    categoryKey: "samsung",
    name_en: "Galaxy S25 Ultra",
    name_he: "Galaxy S25 Ultra",
    name_ar: "Galaxy S25 Ultra",
    basePrice: 5699,
    featured: true,
    tags: ["NEW", "BEST SELLER"],
    colors: [
      { value: "Titanium Black", image: samsung("galaxy-s25-ultra", "Titanium Black") },
      { value: "Titanium Blue", image: samsung("galaxy-s25-ultra", "Titanium Blue") },
      { value: "Titanium Silver", image: samsung("galaxy-s25-ultra", "Titanium Silver") },
    ],
    storage: [
      { value: "256GB", priceAdd: 0 },
      { value: "512GB", priceAdd: 700 },
      { value: "1TB", priceAdd: 1500 },
    ],
  },
  {
    key: "galaxy-a55",
    slug: "a55",
    categoryKey: "samsung",
    name_en: "Galaxy A55",
    name_he: "Galaxy A55",
    name_ar: "Galaxy A55",
    basePrice: 1799,
    tags: ["SALE"],
    colors: [
      { value: "Black", image: samsung("galaxy-a55", "Black") },
      { value: "Blue", image: samsung("galaxy-a55", "Blue") },
      { value: "White", image: samsung("galaxy-a55", "White") },
    ],
    storage: [
      { value: "128GB", priceAdd: 0 },
      { value: "256GB", priceAdd: 250 },
    ],
  },
  {
    key: "galaxy-z-fold",
    slug: "zfold",
    categoryKey: "samsung",
    name_en: "Galaxy Z Fold",
    name_he: "Galaxy Z Fold",
    name_ar: "Galaxy Z Fold",
    basePrice: 7299,
    featured: true,
    tags: ["NEW", "BEST SELLER"],
    colors: [
      { value: "Black", image: samsung("galaxy-z-fold", "Black") },
      { value: "Gray", image: samsung("galaxy-z-fold", "Gray") },
    ],
    storage: [
      { value: "256GB", priceAdd: 0 },
      { value: "512GB", priceAdd: 700 },
      { value: "1TB", priceAdd: 1500 },
    ],
  },
  {
    key: "galaxy-z-flip",
    slug: "zflip",
    categoryKey: "samsung",
    name_en: "Galaxy Z Flip",
    name_he: "Galaxy Z Flip",
    name_ar: "Galaxy Z Flip",
    basePrice: 4299,
    tags: ["NEW"],
    colors: [
      { value: "Black", image: samsung("galaxy-z-flip", "Black") },
      { value: "Purple", image: samsung("galaxy-z-flip", "Purple") },
      { value: "Blue", image: samsung("galaxy-z-flip", "Blue") },
    ],
    storage: [
      { value: "256GB", priceAdd: 0 },
      { value: "512GB", priceAdd: 500 },
    ],
  },
];

export function demoGalleryImages(product: DemoProductSeed): { url: string; alt: string; isMain: boolean; sortOrder: number }[] {
  const brand = product.categoryKey === "iphone" ? "apple" : "samsung";
  return product.colors.slice(0, 4).map((c, i) => ({
    url: phoneColorImage(brand, product.key, c.value),
    alt: c.value,
    isMain: i === 0,
    sortOrder: i,
  }));
}

export function allDemoImagePaths(): string[] {
  const paths = new Set<string>();
  for (const p of DEMO_SMARTPHONE_PRODUCTS) {
    for (const c of p.colors) paths.add(c.image);
    for (const g of demoGalleryImages(p)) paths.add(g.url);
  }
  return [...paths];
}

export function buildDemoVariantGroups(product: DemoProductSeed) {
  return [
    {
      name: "Color",
      sortOrder: 0,
      options: product.colors.map((c, i) => ({
        value: c.value,
        priceAdd: 0,
        stock: 15,
        image: c.image,
        isDefault: i === 0,
        sortOrder: i,
      })),
    },
    {
      name: "Storage",
      sortOrder: 1,
      options: product.storage.map((s, i) => ({
        value: s.value,
        priceAdd: s.priceAdd,
        stock: 10,
        isDefault: i === 0,
        sortOrder: i,
      })),
    },
  ];
}

export const DEMO_FEATURED_KEYS = new Set([
  "iphone-17-pro-max",
  "galaxy-s25-ultra",
  "iphone-16-pro",
  "galaxy-z-fold",
]);
