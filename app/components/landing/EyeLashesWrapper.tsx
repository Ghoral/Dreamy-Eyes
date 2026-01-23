import { get_eye_lashes } from "../../api/product";
import EyeLashesSection from "./EyeLashesSection";
import { getServerSideCountry } from "../../util/country";

const EyeLashesWrapper = async () => {
    const country = await getServerSideCountry();
    const { data } = await get_eye_lashes(10, 0, country);

    return <EyeLashesSection initialData={data} initialCountry={country} />;
};

export default EyeLashesWrapper;
