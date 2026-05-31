"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/components/cart-context";
import { CART_REMOVAL_TOAST_HE } from "@/lib/cart/availability";
import { EmailConfirmFields } from "@/components/storefront/email-confirm-fields";
import { useStoreI18n } from "@/components/storefront/store-i18n";
import { validateEmailConfirmPair } from "@/lib/email-confirm-validation";
import {
  deliveryDisplayName,
  deliveryEtaLabel,
  deliveryUiBehavior,
  formatStructuredAddress,
  type DeliveryOptionDto,
} from "@/lib/shipping/delivery-behavior";

const EMPTY_ADDRESS = {
  city: "",
  street: "",
  houseNumber: "",
  apartment: "",
  postalCode: "",
};

export function CheckoutForm() {
  const router = useRouter();
  const { items, cartCount, clear, validateForCheckout, syncing } = useCart();
  const { t, dir, lang } = useStoreI18n();
  const locale = lang === "ar" ? "ar" : lang === "en" ? "en" : "he";

  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOptionDto[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [deliveryId, setDeliveryId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [confirmCustomerEmail, setConfirmCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [addressFields, setAddressFields] = useState(EMPTY_ADDRESS);
  const [pickupPointId, setPickupPointId] = useState("");
  const [notes, setNotes] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [redeemPoints, setRedeemPoints] = useState(0);
  const [pointsBalance, setPointsBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifyHint, setVerifyHint] = useState<string | null>(null);
  const [emailTouched, setEmailTouched] = useState({ email: false, confirmEmail: false });
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  const selectedOption = useMemo(
    () => deliveryOptions.find((o) => o.id === deliveryId) ?? null,
    [deliveryOptions, deliveryId],
  );

  const uiBehavior = selectedOption ? deliveryUiBehavior(selectedOption.type) : null;

  const emailMessages = useMemo(
    () => ({
      emailRequired: t("emailRequired"),
      emailInvalid: t("emailInvalid"),
      confirmRequired: t("confirmEmailRequired"),
      mismatch: t("emailMismatch"),
    }),
    [t],
  );

  const emailValidation = useMemo(
    () => validateEmailConfirmPair(customerEmail, confirmCustomerEmail, emailMessages),
    [customerEmail, confirmCustomerEmail, emailMessages],
  );

  const emailLabels = useMemo(
    () => ({
      email: t("emailLabel"),
      confirmEmail: t("confirmEmailLabel"),
      matchOk: t("emailsMatchOk"),
      matchFail: t("emailsMatchFail"),
    }),
    [t],
  );

  useEffect(() => {
    setOptionsLoading(true);
    fetch("/api/delivery-options")
      .then((r) => r.json())
      .then((d: { options: DeliveryOptionDto[] }) => {
        setDeliveryOptions(d.options ?? []);
        if (d.options?.[0]) setDeliveryId(d.options[0].id);
      })
      .finally(() => setOptionsLoading(false));

    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/store/public").then((r) => r.json()),
    ]).then(
      ([
        me,
        pub,
      ]: [
        { user: { name?: string; email?: string; pointsBalance?: number | null; emailVerified?: boolean } | null },
        { requireEmailVerificationForCheckout?: boolean },
      ]) => {
        if (me.user) {
          const accountEmail = me.user.email ?? "";
          setCustomerName(me.user.name ?? "");
          setCustomerEmail(accountEmail);
          setConfirmCustomerEmail(accountEmail);
          setPointsBalance(me.user.pointsBalance ?? null);
          const needVerify = pub.requireEmailVerificationForCheckout !== false;
          if (needVerify && me.user.emailVerified === false) {
            setVerifyHint(
              "יש לאמת את כתובת האימייל לפני השלמת הזמנה. בדקו את תיבת הדואר או התחברו מחדש לאחר לחיצה על קישור האימות.",
            );
          }
        }
      },
    );
  }, []);

  useEffect(() => {
    if (items.length > 0) void validateForCheckout();
  }, [items.length, validateForCheckout]);

  function updateAddress(field: keyof typeof EMPTY_ADDRESS, value: string) {
    setAddressFields((prev) => ({ ...prev, [field]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEmailSubmitted(true);

    const emailCheck = validateEmailConfirmPair(customerEmail, confirmCustomerEmail, emailMessages);
    if (!emailCheck.isValid) {
      setError(emailCheck.confirmEmailError ?? emailCheck.emailError ?? t("emailMismatch"));
      return;
    }

    const cartCheck = await validateForCheckout();
    if (!cartCheck.ok) {
      setError(cartCheck.error ?? CART_REMOVAL_TOAST_HE);
      return;
    }

    if (!selectedOption) {
      setError("יש לבחור אופן משלוח.");
      return;
    }

    const behavior = deliveryUiBehavior(selectedOption.type);
    let address: string | undefined;
    let orderNotes = notes.trim();

    if (behavior === "full_address") {
      if (
        !addressFields.city.trim() ||
        !addressFields.street.trim() ||
        !addressFields.houseNumber.trim()
      ) {
        setError("יש למלא עיר, רחוב ומספר בית למשלוח.");
        return;
      }
      address = formatStructuredAddress(addressFields);
    } else if (behavior === "pickup_point") {
      if (!pickupPointId.trim()) {
        setError("יש לבחור נקודת איסוף.");
        return;
      }
      const pointLine = `נקודת איסוף: ${pickupPointId}`;
      orderNotes = orderNotes ? `${orderNotes}\n${pointLine}` : pointLine;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerEmail: emailCheck.normalizedEmail,
          confirmCustomerEmail: emailCheck.normalizedEmail,
          customerPhone,
          deliveryOptionId: deliveryId,
          address,
          addressCity: addressFields.city || undefined,
          addressStreet: addressFields.street || undefined,
          addressHouseNumber: addressFields.houseNumber || undefined,
          addressApartment: addressFields.apartment || undefined,
          addressPostalCode: addressFields.postalCode || undefined,
          pickupPointId: pickupPointId || undefined,
          notes: orderNotes || undefined,
          couponCode: couponCode || undefined,
          redeemPoints: redeemPoints || undefined,
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            optionIds: i.optionIds,
          })),
        }),
      });
      const raw = await res.text();
      let data: { error?: string; orderId?: string } = {};
      try {
        data = raw ? (JSON.parse(raw) as typeof data) : {};
      } catch {
        data = {};
      }
      if (!res.ok) {
        const errMsg = typeof data.error === "string" ? data.error : "";
        if (res.status === 403 && errMsg.includes("אימייל")) {
          setError("נדרש אימות אימייל לפני ביצוע הזמנה. בדקו את המייל לאחר ההרשמה.");
        } else {
          setError(errMsg || "לא ניתן להשלים את הפעולה. בדקו את הפרטים ונסו שוב.");
        }
        return;
      }
      if (!data.orderId) {
        setError("לא ניתן להשלים את הפעולה. נסו שוב.");
        return;
      }
      clear();
      router.push(`/checkout/payment/${data.orderId}`);
    } finally {
      setLoading(false);
    }
  }

  if (!syncing && cartCount === 0) {
    return (
      <div dir={dir} className="mx-auto max-w-lg px-4 py-12 text-center">
        <p className="text-zinc-500">{t("emptyCart")}</p>
        <Link href="/products" className="mt-4 inline-block text-orange-400 hover:underline">
          המשך קנייה
        </Link>
      </div>
    );
  }

  return (
    <div dir={dir} className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-2xl font-black text-white">תשלום</h1>
      {verifyHint && (
        <div className="mt-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          {verifyHint}
        </div>
      )}
      <form
        onSubmit={submit}
        className="mt-6 space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 shadow-xl backdrop-blur-sm"
      >
        <div>
          <label className="ds-label">שם מלא</label>
          <input
            required
            className="ds-input mt-1.5"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </div>
        <EmailConfirmFields
          dir={dir}
          idPrefix="checkout"
          email={customerEmail}
          confirmEmail={confirmCustomerEmail}
          onEmailChange={setCustomerEmail}
          onConfirmEmailChange={setConfirmCustomerEmail}
          onEmailBlur={() => setEmailTouched((s) => ({ ...s, email: true }))}
          onConfirmBlur={() => setEmailTouched((s) => ({ ...s, confirmEmail: true }))}
          labels={emailLabels}
          emailError={emailValidation.emailError}
          confirmEmailError={emailValidation.confirmEmailError}
          showEmailError={emailSubmitted || emailTouched.email}
          showConfirmError={emailSubmitted || emailTouched.confirmEmail}
        />
        <div>
          <label className="ds-label">טלפון</label>
          <input
            required
            className="ds-input mt-1.5"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
          />
        </div>

        <div>
          <label className="ds-label">אופן משלוח</label>
          {optionsLoading ? (
            <p className="mt-2 text-sm text-zinc-400">טוען אפשרויות משלוח…</p>
          ) : deliveryOptions.length === 0 ? (
            <p className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
              לא הוגדרו אפשרויות משלוח. צרו קשר עם החנות.
            </p>
          ) : (
            <select
              required
              className="ds-select mt-1.5"
              value={deliveryId}
              onChange={(e) => {
                setDeliveryId(e.target.value);
                setPickupPointId("");
              }}
            >
              {deliveryOptions.map((o) => {
                const name = deliveryDisplayName(o, locale);
                const eta = deliveryEtaLabel(o, locale);
                return (
                  <option key={o.id} value={o.id}>
                    {name}
                    {eta ? ` (${eta})` : ""} — ₪{Number(o.price).toFixed(2)}
                  </option>
                );
              })}
            </select>
          )}
        </div>

        {uiBehavior === "full_address" && (
          <div className="space-y-3 rounded-xl border border-zinc-700/80 bg-zinc-950/40 p-4">
            <p className="text-sm font-medium text-orange-400">כתובת למשלוח</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="ds-label">עיר</label>
                <input
                  required
                  className="ds-input mt-1.5"
                  value={addressFields.city}
                  onChange={(e) => updateAddress("city", e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="ds-label">רחוב</label>
                <input
                  required
                  className="ds-input mt-1.5"
                  value={addressFields.street}
                  onChange={(e) => updateAddress("street", e.target.value)}
                />
              </div>
              <div>
                <label className="ds-label">מספר בית</label>
                <input
                  required
                  className="ds-input mt-1.5"
                  value={addressFields.houseNumber}
                  onChange={(e) => updateAddress("houseNumber", e.target.value)}
                />
              </div>
              <div>
                <label className="ds-label">דירה</label>
                <input
                  className="ds-input mt-1.5"
                  value={addressFields.apartment}
                  onChange={(e) => updateAddress("apartment", e.target.value)}
                  placeholder="אופציונלי"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="ds-label">מיקוד</label>
                <input
                  className="ds-input mt-1.5"
                  value={addressFields.postalCode}
                  onChange={(e) => updateAddress("postalCode", e.target.value)}
                  placeholder="אופציונלי"
                />
              </div>
            </div>
          </div>
        )}

        {uiBehavior === "pickup_notice" && (
          <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-3 text-sm leading-relaxed text-orange-50">
            איסוף יתבצע בתיאום מראש לאחר ביצוע ההזמנה.
          </div>
        )}

        {uiBehavior === "pickup_point" && (
          <div>
            <label className="ds-label">נקודת איסוף</label>
            <select
              required
              className="ds-select mt-1.5"
              value={pickupPointId}
              onChange={(e) => setPickupPointId(e.target.value)}
            >
              <option value="">בחרו נקודת איסוף</option>
              <option value="placeholder-tel-aviv">נקודת איסוף — תל אביב (דוגמה)</option>
              <option value="placeholder-haifa">נקודת איסוף — חיפה (דוגמה)</option>
              <option value="placeholder-jerusalem">נקודת איסוף — ירושלים (דוגמה)</option>
            </select>
            <p className="mt-2 text-xs text-zinc-500">בקרוב: חיבור לרשימת נקודות איסוף חיות.</p>
          </div>
        )}

        <div>
          <label className="ds-label">הערות</label>
          <textarea
            className="ds-textarea mt-1.5"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <div>
          <label className="ds-label">קופון</label>
          <input
            className="ds-input mt-1.5"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            placeholder="אופציונלי"
          />
        </div>
        {pointsBalance !== null && pointsBalance > 0 && (
          <div>
            <label className="ds-label">מימוש נקודות (יתרה: {pointsBalance})</label>
            <input
              type="number"
              min={0}
              max={pointsBalance}
              className="ds-input mt-1.5"
              value={redeemPoints}
              onChange={(e) => setRedeemPoints(Number(e.target.value))}
            />
          </div>
        )}
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={
            loading ||
            syncing ||
            cartCount === 0 ||
            optionsLoading ||
            deliveryOptions.length === 0 ||
            !emailValidation.isValid
          }
          className="flex min-h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 py-3 font-medium text-white shadow-lg shadow-orange-900/30 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "שולח…" : "צור הזמנה והמשך לתשלום"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-zinc-400">
        יש לך חשבון?{" "}
        <Link href="/login" className="text-orange-400 hover:underline">
          התחבר
        </Link>{" "}
        למימוש נקודות.
      </p>
    </div>
  );
}
