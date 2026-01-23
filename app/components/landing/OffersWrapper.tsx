import { get_enabled_offers } from "../../api/offers";
import OffersSlider from "./OffersSlider";

const OffersWrapper = async () => {
    const response = await get_enabled_offers();
    const data = response.status ? response.data : [];

    return <OffersSlider initialData={data} />;
};

export default OffersWrapper;
