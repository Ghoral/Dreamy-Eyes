import { get_products } from "../../api/product";
import EyeLashesSection from "./EyeLashesSection";
import { getServerSideCountry } from "../../util/country";

const EyeLashesWrapper = async () => {
    const country = await getServerSideCountry();
    // get_products returns an object like { data: { data: productsArray } }
    // The outer 'data' is destructured and renamed to 'response'.
    // So 'response' will be { data: productsArray }.
    const { data: response } = await get_products(10, 0, ["eye_lashes"], country);

    // We then access the inner 'data' property from 'response' to get the actual products array.
    return <EyeLashesSection initialData={response?.data || []} initialTotal={response?.total || 0} initialCountry={country} />;
};

export default EyeLashesWrapper;
