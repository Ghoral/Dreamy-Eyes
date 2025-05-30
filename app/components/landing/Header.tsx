import React from "react";
import Navbar from "./Navbar";

const Header = () => {
  return (
    <header id="header" className="site-header">
      <div className="top-info border-bottom d-none d-md-block ">
        <div className="container-fluid">
          <div className="row g-0">
            <div className="col-md-4">
              <p className="fs-6 my-2 text-center">
                Need any help? Call us <span>112233344455</span>
              </p>
            </div>
            <div className="col-md-4 border-start border-end">
              <p className="fs-6 my-2 text-center">
                Summer sale discount off 60% off! Shop Now
              </p>
            </div>
            <div className="col-md-4">
              <p className="fs-6 my-2 text-center">
                2-3 business days delivery & free returns
              </p>
            </div>
          </div>
        </div>
      </div>
      <Navbar />
    </header>
  );
};

export default Header;
