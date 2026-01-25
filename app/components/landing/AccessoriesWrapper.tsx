import { get_applicator_solution } from "../../api/product";
import AccessoriesSection from "./AccessoriesSection";
import { getServerSideCountry } from "../../util/country";

const AccessoriesWrapper = async () => {
    const country = await getServerSideCountry();
    // get_applicator_solution(limit, offset, country, filter)
    const res = await get_applicator_solution(15, 0, country);

    return <AccessoriesSection initialResponse={res} initialCountry={country} />;
};

export default AccessoriesWrapper;
