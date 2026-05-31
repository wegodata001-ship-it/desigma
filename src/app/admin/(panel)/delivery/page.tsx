import { redirect } from "next/navigation";

/** Legacy route — shipping methods live under Store Settings. */
export default function AdminDeliveryRedirectPage() {
  redirect("/admin/settings/shipping");
}
