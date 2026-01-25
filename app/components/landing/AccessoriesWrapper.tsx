import { get_applicator_solution } from "../../api/product";
import AccessoriesSection from "./AccessoriesSection";
import { getServerSideCountry } from "../../util/country";

const AccessoriesWrapper = async () => {
    const country = await getServerSideCountry();
    const res = await get_applicator_solution(country);

    const initialItems = Array.isArray(res.data) ? res.data : [];

    return <AccessoriesSection initialData={initialItems} initialCountry={country} />;
};

export default AccessoriesWrapper;
