import { get_enabled_offers } from "@/app/api/offers";
import OffersDisplay from "./OffersCarousel";

export const dynamic = "force-dynamic";

const OffersDisplayWrapper = async () => {
  try {
    const response = await get_enabled_offers();
    
    // Only show if there are enabled offers
    if (!response.status || !response.data || response.data.length === 0) {
      return null;
    }

    // Filter to only show enabled offers
    const enabledOffers = response.data.filter((offer: any) => offer.is_enabled === true);

    if (enabledOffers.length === 0) {
      return null;
    }

    return <OffersDisplay offers={enabledOffers} />;
  } catch (error) {
    console.error("Error loading offers:", error);
    return null;
  }
};

export default OffersDisplayWrapper;
