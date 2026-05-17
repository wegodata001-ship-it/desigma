import { prisma } from "@/lib/prisma";
import { STORE_ID } from "@/lib/store";
import { requireAdminSession } from "@/lib/admin-auth";
import { SettingsAdminClient } from "@/components/admin/settings-admin-client";
import { loadGalleryDisplayForStore } from "@/lib/gallery-settings-load";
import { safeQuery } from "@/lib/server/safe-query";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdminSession();
  const storeId = STORE_ID;

  const payload = await safeQuery(
    "admin.settings",
    async () => {
      const store = await prisma.store.findUnique({ where: { id: storeId } });
      if (!store) return null;

      const gallery = await loadGalleryDisplayForStore(storeId);

      let settings = await prisma.storeSettings.findUnique({
        where: { storeId },
        select: {
          logoUrl: true,
          primaryColor: true,
          accentColor: true,
          secondaryColor: true,
          whatsappPhone: true,
          supportEmail: true,
          languageDefault: true,
          orderNumberPrefix: true,
          currency: true,
          rtlEnabled: true,
          registrationEnabled: true,
          requireEmailVerificationForCheckout: true,
          heroTitle_he: true,
          heroTitle_ar: true,
          heroTitle_en: true,
          heroSubtitle_he: true,
          heroSubtitle_ar: true,
          heroSubtitle_en: true,
        },
      });
      if (!settings) {
        settings = await prisma.storeSettings.create({
          data: {
            storeId,
            productGalleryPreset: gallery.preset,
            productGalleryMaxHeightPx: gallery.maxHeightPx,
            productGalleryMaxWidthPx: gallery.maxWidthPx,
          },
          select: {
            logoUrl: true,
            primaryColor: true,
            accentColor: true,
            secondaryColor: true,
            whatsappPhone: true,
            supportEmail: true,
            languageDefault: true,
            orderNumberPrefix: true,
            currency: true,
            rtlEnabled: true,
            registrationEnabled: true,
            requireEmailVerificationForCheckout: true,
            heroTitle_he: true,
            heroTitle_ar: true,
            heroTitle_en: true,
            heroSubtitle_he: true,
            heroSubtitle_ar: true,
            heroSubtitle_en: true,
          },
        });
      }

      return { store, settings, gallery };
    },
    null,
    { timeoutMs: 25_000 },
  );

  if (!payload) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-950 shadow-sm">
        <p className="font-medium">Unable to load store settings right now.</p>
        <p className="mt-2 text-sm text-amber-900/90">Please refresh the page or try again in a moment.</p>
      </div>
    );
  }

  const { store, settings, gallery } = payload;

  return (
    <SettingsAdminClient
      storeName={store.name}
      settings={{
        logoUrl: settings.logoUrl,
        primaryColor: settings.primaryColor,
        accentColor: settings.accentColor,
        secondaryColor: settings.secondaryColor,
        whatsappPhone: settings.whatsappPhone,
        supportEmail: settings.supportEmail,
        languageDefault: settings.languageDefault,
        orderNumberPrefix: settings.orderNumberPrefix,
        currency: settings.currency,
        rtlEnabled: settings.rtlEnabled,
        registrationEnabled: settings.registrationEnabled,
        requireEmailVerificationForCheckout: settings.requireEmailVerificationForCheckout,
        productGalleryPreset: gallery.preset,
        productGalleryMaxHeightPx: gallery.maxHeightPx,
        productGalleryMaxWidthPx: gallery.maxWidthPx,
      }}
      hero={{
        heroTitle_he: settings.heroTitle_he,
        heroTitle_ar: settings.heroTitle_ar,
        heroTitle_en: settings.heroTitle_en,
        heroSubtitle_he: settings.heroSubtitle_he,
        heroSubtitle_ar: settings.heroSubtitle_ar,
        heroSubtitle_en: settings.heroSubtitle_en,
      }}
    />
  );
}
