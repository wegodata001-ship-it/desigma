"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { AdminSpinner } from "@/components/admin/admin-spinner";
import { saveHomeHero, saveStoreSettings } from "@/app/admin/actions";
import { useAdminI18n } from "@/lib/admin-i18n";
import { uploadAdminAsset } from "@/lib/admin-upload-client";
import { gallerySettingsDebug } from "@/lib/gallery-settings-debug";
import {
  GALLERY_PRESET_CAPS,
  normalizeGalleryPreset,
  type ProductGalleryPreset,
} from "@/lib/product-gallery-display";

export function SettingsAdminClient({
  storeName,
  settings,
  hero,
}: {
  storeName: string;
  settings: {
    logoUrl: string | null;
    primaryColor: string;
    accentColor: string;
    whatsappPhone: string | null;
    supportEmail: string | null;
    languageDefault: string;
    orderNumberPrefix: string;
    currency: string;
    rtlEnabled: boolean;
    secondaryColor: string;
    registrationEnabled: boolean;
    requireEmailVerificationForCheckout: boolean;
    productGalleryPreset: string;
    productGalleryMaxHeightPx: number;
    productGalleryMaxWidthPx: number;
  };
  hero: {
    heroTitle_he: string | null;
    heroTitle_ar: string | null;
    heroTitle_en: string | null;
    heroSubtitle_he: string | null;
    heroSubtitle_ar: string | null;
    heroSubtitle_en: string | null;
  };
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState<string | null>(null);
  const { t } = useAdminI18n();

  const [galleryPreset, setGalleryPreset] = useState<ProductGalleryPreset>(() =>
    normalizeGalleryPreset(settings.productGalleryPreset),
  );
  const [galleryMaxH, setGalleryMaxH] = useState(() => String(settings.productGalleryMaxHeightPx));
  const [galleryMaxW, setGalleryMaxW] = useState(() => String(settings.productGalleryMaxWidthPx));

  const refresh = () => startTransition(() => router.refresh());

  const applyPresetToFormFields = (preset: ProductGalleryPreset) => {
    if (preset === "custom") return;
    const caps = GALLERY_PRESET_CAPS[preset];
    setGalleryMaxH(String(caps.maxHeightPx));
    setGalleryMaxW(String(caps.maxWidthPx));
  };

  useEffect(() => {
    const preset = normalizeGalleryPreset(settings.productGalleryPreset);
    setGalleryPreset(preset);
    setGalleryMaxH(String(settings.productGalleryMaxHeightPx));
    setGalleryMaxW(String(settings.productGalleryMaxWidthPx));
  }, [settings.productGalleryPreset, settings.productGalleryMaxHeightPx, settings.productGalleryMaxWidthPx]);

  return (
    <div className="space-y-8">
      {toast && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm">{toast}</div>}
      <h1 className="text-xl font-semibold text-slate-900">{t("storeSettingsTitle")}</h1>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-800">{t("general")}</h2>
        <form
          className="mt-4 grid max-w-3xl gap-3"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const fd = new FormData(form);
            const fi = form.elements.namedItem("logoFile") as HTMLInputElement;
            if (fi?.files?.[0]) {
              const path = await uploadAdminAsset(fi.files[0], "logo");
              fd.set("logoUrl", path);
            }

            fd.set("productGalleryPreset", galleryPreset);
            fd.set("productGalleryMaxHeightPx", galleryMaxH.trim());
            fd.set("productGalleryMaxWidthPx", galleryMaxW.trim());

            gallerySettingsDebug("client_submit", {
              galleryPreset,
              galleryMaxH: galleryMaxH.trim() || null,
              galleryMaxW: galleryMaxW.trim() || null,
              formPreset: fd.get("productGalleryPreset"),
              formMaxH: fd.get("productGalleryMaxHeightPx"),
              formMaxW: fd.get("productGalleryMaxWidthPx"),
            });

            const res = await saveStoreSettings(fd);
            if (!res.ok) setToast(res.error);
            else {
              if (res.data?.gallery) {
                const g = res.data.gallery;
                gallerySettingsDebug("client_save_result", { gallery: g });
                setGalleryPreset(g.preset);
                setGalleryMaxH(String(g.maxHeightPx));
                setGalleryMaxW(String(g.maxWidthPx));
              }
              setToast(t("savedSuccessfully"));
              refresh();
            }
          }}
        >
          <label className="text-xs font-medium">
            {t("storeNameLabel")}
            <input name="storeName" required defaultValue={storeName} className="ds-input mt-1 text-sm" />
          </label>
          <input type="hidden" name="logoUrl" value={settings.logoUrl ?? ""} />
          <label className="text-xs font-medium">
            {t("logoUpload")}
            <input name="logoFile" type="file" accept="image/*" className="mt-1 text-sm" />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-medium">
              {t("primaryColor")}
              <input name="primaryColor" type="color" defaultValue={settings.primaryColor} className="mt-1 h-10 w-full" />
            </label>
            <label className="text-xs font-medium">
              {t("accentColor")}
              <input name="accentColor" type="color" defaultValue={settings.accentColor} className="mt-1 h-10 w-full" />
            </label>
          </div>
          <input type="hidden" name="secondaryColor" value={settings.secondaryColor} />
          <label className="text-xs font-medium">
            {t("whatsapp")}
            <input name="whatsappPhone" defaultValue={settings.whatsappPhone ?? ""} className="ds-input mt-1 text-sm" />
          </label>
          <label className="text-xs font-medium">
            {t("supportEmail")}
            <input name="supportEmail" type="email" defaultValue={settings.supportEmail ?? ""} className="ds-input mt-1 text-sm" />
          </label>
          <label className="text-xs font-medium">
            {t("defaultLanguage")}
            <input name="languageDefault" defaultValue={settings.languageDefault} className="ds-input mt-1 text-sm" />
          </label>
          <label className="flex gap-2 text-sm">
            <input type="checkbox" name="rtlEnabled" defaultChecked={settings.rtlEnabled} value="on" />
            {t("rtlEnabledLabel")}
          </label>
          <input type="hidden" name="currency" value={settings.currency} />
          <label className="text-xs font-medium">
            {t("orderNumberPrefix")}
            <input name="orderNumberPrefix" defaultValue={settings.orderNumberPrefix} className="ds-input mt-1 font-mono text-sm uppercase" />
          </label>

          <div className="col-span-full border-t border-slate-200 pt-4">
            <h3 className="text-sm font-semibold text-slate-800">{t("productGalleryDisplayTitle")}</h3>
            <p className="mt-1 text-xs text-slate-500">{t("productGalleryDisplayHint")}</p>
            <label className="mt-3 block text-xs font-medium">
              {t("productGalleryPresetLabel")}
              <select
                name="productGalleryPreset"
                value={galleryPreset}
                onChange={(e) => {
                  const next = normalizeGalleryPreset(e.target.value);
                  setGalleryPreset(next);
                  applyPresetToFormFields(next);
                }}
                className="ds-input mt-1 text-sm"
              >
                <option value="small">{t("galleryPresetSmall")}</option>
                <option value="medium">{t("galleryPresetMedium")}</option>
                <option value="large">{t("galleryPresetLarge")}</option>
                <option value="custom">{t("galleryPresetCustom")}</option>
              </select>
            </label>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-medium">
                {t("galleryCustomMaxHeight")}
                <input
                  name="productGalleryMaxHeightPx"
                  type="number"
                  min={100}
                  max={2000}
                  placeholder="520"
                  value={galleryMaxH}
                  onChange={(e) => setGalleryMaxH(e.target.value)}
                  disabled={galleryPreset !== "custom"}
                  className="ds-input mt-1 text-sm disabled:bg-slate-100 disabled:text-slate-500"
                />
              </label>
              <label className="text-xs font-medium">
                {t("galleryCustomMaxWidth")}
                <input
                  name="productGalleryMaxWidthPx"
                  type="number"
                  min={100}
                  max={2000}
                  placeholder="520"
                  value={galleryMaxW}
                  onChange={(e) => setGalleryMaxW(e.target.value)}
                  disabled={galleryPreset !== "custom"}
                  className="ds-input mt-1 text-sm disabled:bg-slate-100 disabled:text-slate-500"
                />
              </label>
            </div>
          </div>

          <div className="col-span-full rounded-xl border border-slate-200 bg-slate-50 p-5">
            <h3 className="text-sm font-semibold text-slate-900">{t("shippingMethodsTitle")}</h3>
            <p className="mt-1 text-xs text-slate-600">{t("shippingMethodsHint")}</p>
            <Link
              href="/admin/settings/shipping"
              className="mt-4 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              {t("shippingMethodsManage")} →
            </Link>
          </div>

          <div className="col-span-full rounded-xl border border-slate-200 bg-slate-50 p-5">
            <h3 className="text-sm font-semibold text-slate-900">ניהול דפים משפטיים</h3>
            <p className="mt-1 text-xs text-slate-600">
              תקנון · פרטיות · ביטולים והחזרים · משלוחים — עורך עשיר, שמירת טיוטה ופרסום.
            </p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <label className="flex items-center gap-2 text-sm text-slate-800">
                <input
                  type="checkbox"
                  name="registrationEnabled"
                  defaultChecked={settings.registrationEnabled}
                  value="on"
                />
                הרשמת לקוחות פעילה
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-800">
                <input
                  type="checkbox"
                  name="requireEmailVerificationForCheckout"
                  defaultChecked={settings.requireEmailVerificationForCheckout}
                  value="on"
                />
                אימות אימייל נדרש לפני הזמנה (לקוח מחובר)
              </label>
            </div>
            <Link
              href="/admin/settings/terms"
              className="mt-4 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              ניהול דפים משפטיים →
            </Link>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-60"
          >
            {pending && <AdminSpinner className="h-4 w-4 border-t-white" />}
            {t("save")}
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-800">{t("homepageHeroOptional")}</h2>
        <form
          className="mt-4 grid gap-3 md:grid-cols-3"
          onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const res = await saveHomeHero(fd);
            if (!res.ok) setToast(res.error);
            else {
              setToast(t("homeHeroSaved"));
              refresh();
            }
          }}
        >
          <label className="text-xs font-medium">
            {t("heroTitleHe")}
            <input name="heroTitle_he" defaultValue={hero.heroTitle_he ?? ""} className="ds-input mt-1 text-sm" />
          </label>
          <label className="text-xs font-medium">
            {t("heroTitleAr")}
            <input name="heroTitle_ar" defaultValue={hero.heroTitle_ar ?? ""} className="ds-input mt-1 text-sm" />
          </label>
          <label className="text-xs font-medium">
            {t("heroTitleEn")}
            <input name="heroTitle_en" defaultValue={hero.heroTitle_en ?? ""} className="ds-input mt-1 text-sm" />
          </label>
          <label className="md:col-span-3 text-xs font-medium">
            {t("heroSubtitleHe")}
            <textarea name="heroSubtitle_he" rows={2} defaultValue={hero.heroSubtitle_he ?? ""} className="ds-textarea mt-1 text-sm" />
          </label>
          <label className="md:col-span-3 text-xs font-medium">
            {t("heroSubtitleAr")}
            <textarea name="heroSubtitle_ar" rows={2} defaultValue={hero.heroSubtitle_ar ?? ""} className="ds-textarea mt-1 text-sm" />
          </label>
          <label className="md:col-span-3 text-xs font-medium">
            {t("heroSubtitleEn")}
            <textarea name="heroSubtitle_en" rows={2} defaultValue={hero.heroSubtitle_en ?? ""} className="ds-textarea mt-1 text-sm" />
          </label>
          <button type="submit" className="md:col-span-3 w-fit rounded-lg bg-slate-900 px-4 py-2 text-sm text-white">
            {t("saveHero")}
          </button>
        </form>
      </section>
    </div>
  );
}
