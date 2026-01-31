import { get_detail } from "../api/detail";
import CheckoutClient from "./CheckoutClient";

export const dynamic = 'force-dynamic';
export default async function CheckoutPage() {
  const response = await get_detail();

  let initialDeliveryCharges = {
    inside: 0,
    outside: 0,
    inr: 0
  };
  let hasError = false;

  if (response.status && response.data) {
    const data = response.data;
    initialDeliveryCharges = {
      inside: Number(data.deliver_charge_inside_ring_road ?? 0),
      outside: Number(data.deliver_charge_outside_ring_road ?? 0),
      inr: Number(data.deliver_charge_inr ?? 0),
    };
  } else {
    hasError = true;
  }

  return <CheckoutClient initialDeliveryCharges={initialDeliveryCharges} hasError={hasError} />;
}
