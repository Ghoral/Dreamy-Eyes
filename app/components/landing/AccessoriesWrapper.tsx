import { get_applicators, get_solutions } from "../../api/product";
import AccessoriesSection from "./AccessoriesSection";
import { getServerSideCountry } from "../../util/country";

const AccessoriesWrapper = async () => {
    const country = await getServerSideCountry();
    const [applicatorsRes, solutionsRes] = await Promise.all([
        get_applicators(50, 0, country),
        get_solutions(50, 0, country),
    ]);

    const applicators = (Array.isArray(applicatorsRes.data) ? applicatorsRes.data : []).map((i: any) => ({ ...i, type: "applicator" as const }));
    const solutions = (Array.isArray(solutionsRes.data) ? solutionsRes.data : []).map((i: any) => ({ ...i, type: "solution" as const }));

    const initialItems = [...applicators, ...solutions];

    return <AccessoriesSection initialData={initialItems} initialCountry={country} />;
};

export default AccessoriesWrapper;
