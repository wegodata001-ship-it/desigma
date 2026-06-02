import type { DeliveryOptionDto } from "@/lib/shipping/delivery-behavior";

export type CheckoutBootstrapData = {
  deliveryOptions: DeliveryOptionDto[];
  requireEmailVerificationForCheckout: boolean;
  customer: {
    name: string;
    email: string;
    pointsBalance: number | null;
    emailVerified: boolean;
  } | null;
};
