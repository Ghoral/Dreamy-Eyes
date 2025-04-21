import { useState } from "react";
import DropzoneComponent from "../../components/form/form-elements/DropZone";

const LandingForm = () => {
  const [logo, setLogo] = useState(null);
  const [banner, setBanner] = useState(null);
  return (
    <div className="flex gap-2">
      <div className="w-full h-80">
        <DropzoneComponent label="Logo" file={logo} setFile={setLogo} />
      </div>
      <div className="w-full h-80">
        <DropzoneComponent label="Banner" file={banner} setFile={setBanner} />
      </div>
    </div>
  );
};

export default LandingForm;
