import { get_detail } from "../api/detail";
import CheckoutClient from "./CheckoutClient";

export default async function CheckoutPage() {
  const response = await get_detail();

  let initialDeliveryCharges = {
    inside: 0,
    outside: 0,
    inr: 0
  };

  if (response.status && response.data) {
    const data = response.data;
    initialDeliveryCharges = {
      inside: Number(data.delivery_charge_inside_ring_road ?? 0),
      outside: Number(data.delivery_charge_outside_ring_road ?? 0),
      inr: Number(data.deliver_charge_inr ?? 0),
    };
  }

  return <CheckoutClient initialDeliveryCharges={initialDeliveryCharges} />;
}
