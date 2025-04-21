import { useState } from "react";
import DropzoneComponent from "../../components/form/form-elements/DropZone";
import ComponentCard from "../../components/common/ComponentCard";

const LandingForm = () => {
  const [logo, setLogo] = useState([]);
  const [banner, setBanner] = useState([]);
  return (
    <ComponentCard title="Dashboard">
      <div className="flex gap-2">
        <div className="w-full h-80">
          <DropzoneComponent file={logo} setFile={setLogo} title="Logo" />
        </div>
        <div className="w-full h-80">
          <DropzoneComponent file={banner} setFile={setBanner} title="Banner" />
        </div>
      </div>
    </ComponentCard>
  );
};

export default LandingForm;
