import { CheckoutForm } from "@/components/storefront/checkout-form";
import { loadCheckoutBootstrap } from "@/lib/server/checkout-bootstrap";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const bootstrap = await loadCheckoutBootstrap();
  return <CheckoutForm bootstrap={bootstrap} />;
}
