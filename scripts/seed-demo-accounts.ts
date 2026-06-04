/**
 * Demo accounts + ₪1 checkout test product (idempotent).
 *
 *   npm run demo:seed
 *
 * Creates:
 *   • demo-owner@desigma-shop.com  — STORE_OWNER (admin /login-admin)
 *   • demo-customer@desigma-shop.com — CUSTOMER (storefront /login)
 *   • demo@desigma-shop.com — STORE_OWNER (quick admin)
 *   • Product "בדיקת סליקה" in category Demo — ₪1, stock 999
 */
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import bcrypt from "bcryptjs";
import { Prisma, PrismaClient, UserRole } from "@prisma/client";

const STORE_ID = (process.env.NEXT_PUBLIC_STORE_ID ?? "desigma").trim();

const DEMO_OWNER = {
  email: "demo-owner@desigma-shop.com",
  password: "DesigmaOwner2026!",
  name: "Demo Store Owner",
  role: UserRole.STORE_OWNER,
};

const DEMO_CUSTOMER = {
  email: "demo-customer@desigma-shop.com",
  password: "DesigmaCustomer2026!",
  name: "Demo Customer",
  role: UserRole.CUSTOMER,
};

const DEMO_ADMIN_ALT = {
  email: "demo@desigma-shop.com",
  password: "DesigmaDemo2026!",
  name: "Demo Admin",
  role: UserRole.STORE_OWNER,
};

const DEMO_PRODUCT = {
  sku: "DEMO-CHECKOUT-1",
  name_he: "בדיקת סליקה",
  name_ar: "בדיקת סליקה",
  name_en: "Checkout test",
  price: new Prisma.Decimal(1),
  stock: 999,
  tags: ["Demo"],
};

function loadEnvFile() {
  for (const name of [".env", ".env.local"]) {
    const path = join(process.cwd(), name);
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const eq = t.indexOf("=");
      if (eq < 0) continue;
      const key = t.slice(0, eq).trim();
      let val = t.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = val;
    }
  }
}

async function upsertUser(
  prisma: PrismaClient,
  spec: { email: string; password: string; name: string; role: UserRole },
) {
  const email = spec.email.toLowerCase();
  const hash = await bcrypt.hash(spec.password, 12);
  const existing = await prisma.user.findFirst({
    where: { storeId: STORE_ID, email },
  });

  if (spec.role === UserRole.CUSTOMER) {
    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          name: spec.name,
          password: hash,
          role: UserRole.CUSTOMER,
          emailVerified: true,
          emailVerifiedAt: new Date(),
          acceptedTermsAt: existing.acceptedTermsAt ?? new Date(),
        },
      });
      const profile = await prisma.customerProfile.findFirst({
        where: { storeId: STORE_ID, userId: existing.id },
      });
      if (!profile) {
        await prisma.customerProfile.create({
          data: { storeId: STORE_ID, userId: existing.id, pointsBalance: 0 },
        });
      }
      return { email, action: "updated" as const };
    }

    await prisma.user.create({
      data: {
        storeId: STORE_ID,
        name: spec.name,
        email,
        password: hash,
        role: UserRole.CUSTOMER,
        emailVerified: true,
        emailVerifiedAt: new Date(),
        acceptedTermsAt: new Date(),
        customerProfile: {
          create: { storeId: STORE_ID, pointsBalance: 0 },
        },
      },
    });
    return { email, action: "created" as const };
  }

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        name: spec.name,
        password: hash,
        role: spec.role,
        emailVerified: true,
        emailVerifiedAt: new Date(),
        acceptedTermsAt: existing.acceptedTermsAt ?? new Date(),
      },
    });
    return { email, action: "updated" as const };
  }

  await prisma.user.create({
    data: {
      storeId: STORE_ID,
      name: spec.name,
      email,
      password: hash,
      role: spec.role,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      acceptedTermsAt: new Date(),
    },
  });
  return { email, action: "created" as const };
}

async function ensureDemoCategory(prisma: PrismaClient) {
  let cat = await prisma.category.findFirst({
    where: { storeId: STORE_ID, name_en: "Demo" },
  });
  if (!cat) {
    cat = await prisma.category.create({
      data: {
        storeId: STORE_ID,
        name_he: "Demo",
        name_ar: "Demo",
        name_en: "Demo",
        description_he: "מוצרים לבדיקת מערכת בלבד",
        description_en: "Demo / QA products only",
        active: true,
        sortOrder: 999,
      },
    });
    return { id: cat.id, action: "created" as const };
  }
  await prisma.category.update({
    where: { id: cat.id },
    data: { active: true, sortOrder: 999 },
  });
  return { id: cat.id, action: "updated" as const };
}

async function ensureDemoProduct(prisma: PrismaClient, categoryId: string) {
  const desc =
    "מוצר לבדיקת תהליך רכישה וסליקה בלבד (₪1). לא משפיע על קטלוג אמיתי — ניתן למחוק בכל עת.";

  const product = await prisma.product.upsert({
    where: { storeId_sku: { storeId: STORE_ID, sku: DEMO_PRODUCT.sku } },
    create: {
      storeId: STORE_ID,
      categoryId,
      title_he: DEMO_PRODUCT.name_he,
      title_ar: DEMO_PRODUCT.name_ar,
      title_en: DEMO_PRODUCT.name_en,
      name_he: DEMO_PRODUCT.name_he,
      name_ar: DEMO_PRODUCT.name_ar,
      name_en: DEMO_PRODUCT.name_en,
      description_he: desc,
      description_ar: desc,
      description_en: "Demo checkout test product — ₪1",
      price: DEMO_PRODUCT.price,
      stock: DEMO_PRODUCT.stock,
      sku: DEMO_PRODUCT.sku,
      tags: DEMO_PRODUCT.tags,
      active: true,
      featured: false,
    },
    update: {
      categoryId,
      name_he: DEMO_PRODUCT.name_he,
      name_ar: DEMO_PRODUCT.name_ar,
      name_en: DEMO_PRODUCT.name_en,
      description_he: desc,
      price: DEMO_PRODUCT.price,
      stock: DEMO_PRODUCT.stock,
      tags: DEMO_PRODUCT.tags,
      active: true,
      featured: false,
    },
  });

  return { sku: product.sku, id: product.id };
}

async function main() {
  loadEnvFile();
  const prisma = new PrismaClient();

  try {
    const store = await prisma.store.findUnique({ where: { id: STORE_ID } });
    if (!store) {
      throw new Error(`Store "${STORE_ID}" not found. Run npm run db:seed first.`);
    }

    const users = await Promise.all([
      upsertUser(prisma, DEMO_OWNER),
      upsertUser(prisma, DEMO_CUSTOMER),
      upsertUser(prisma, DEMO_ADMIN_ALT),
    ]);

    const category = await ensureDemoCategory(prisma);
    const product = await ensureDemoProduct(prisma, category.id);

    console.log("\n=== DESIGMA demo seed OK ===\n");
    console.log("Store owner (admin — /login-admin):");
    console.log(`  Email:    ${DEMO_OWNER.email}`);
    console.log(`  Password: ${DEMO_OWNER.password}`);
    console.log(`  Alt:      ${DEMO_ADMIN_ALT.email} / ${DEMO_ADMIN_ALT.password}`);
    console.log("\nCustomer (storefront — /login):");
    console.log(`  Email:    ${DEMO_CUSTOMER.email}`);
    console.log(`  Password: ${DEMO_CUSTOMER.password}`);
    console.log("\nCheckout test product:");
    console.log(`  Name:  ${DEMO_PRODUCT.name_he}`);
    console.log(`  Price: ₪1 | Stock: ${DEMO_PRODUCT.stock} | SKU: ${product.sku}`);
    console.log(`  Category: Demo (${category.action})`);
    console.log("\nUsers:", users);
    console.log("\nNote: Login requires a valid email (not username \"demo\").");
    console.log("Flow: /products → add \"בדיקת סליקה\" → checkout → pay.\n");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
