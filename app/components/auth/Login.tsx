import React, { useState } from "react";
import "./style.css";

const LoginComponent = () => {
  const [isRegister, setIsRegister] = useState(false);

  const onToggle = (value: boolean) => {
    setIsRegister(value);
  };
  return (
    <div
      style={{
        backgroundColor: "#fff",
        minHeight: "100vh",
        width: "100%",
        backgroundImage: "url(/images/banner-image-bg-1.jpg)",
      }}
    >
      <div className="container-fluid px-1 px-md-5 px-lg-1 px-xl-5 py-5 mx-auto">
        <div className="card border-0">
          <div className="row d-flex flex-column-reverse flex-lg-row">
            {" "}
            {/* Responsive stacking */}
            <div className="col-lg-6">
              <div className="card1 pb-5">
                <div className="row">
                  {/* <Image
                    src="https://i.imgur.com/CXQmsmF.png"
                    className="logo"
                    alt="Logo"
                    width={200}
                    height={80}
                    priority
                  /> */}
                </div>
                <div className="row px-3 justify-content-center mt-4 mb-5 border-line">
                  {/* <Image
                    src="https://i.imgur.com/uNGdWHi.png"
                    className="image img-fluid"
                    alt="Illustration"
                    width={400}
                    height={300}
                    style={{
                      width: "100%",
                      height: "auto",
                    }}
                  /> */}
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="card2 card border-0 px-4 py-5">
                <div className="row mb-4 px-3">
                  <h6 className="mb-0 mr-4 mt-2">Sign in with</h6>
                  <div className="facebook text-center mr-3">
                    <div className="fa fa-facebook"></div>
                  </div>
                  <div className="twitter text-center mr-3">
                    <div className="fa fa-twitter"></div>
                  </div>
                  <div className="linkedin text-center mr-3">
                    <div className="fa fa-linkedin"></div>
                  </div>
                </div>
                <div className="row px-3 mb-4">
                  <div className="line"></div>
                  <small className="or text-center">Or</small>
                  <div className="line"></div>
                </div>
                {!isRegister ? (
                  <>
                    {" "}
                    <div className="row px-3">
                      <label className="mb-1">
                        <h6 className="mb-0 text-sm">Email Address</h6>
                      </label>
                      <input
                        className="mb-4"
                        type="text"
                        name="email"
                        placeholder="Enter a valid email address"
                      />
                    </div>
                    <div className="row px-3">
                      <label className="mb-1">
                        <h6 className="mb-0 text-sm">Password</h6>
                      </label>
                      <input
                        type="password"
                        name="password"
                        placeholder="Enter password"
                      />
                    </div>
                    <div className="row px-3 mb-4">
                      <div className="custom-control custom-checkbox custom-control-inline">
                        <input
                          id="chk1"
                          type="checkbox"
                          name="chk"
                          className="custom-control-input"
                        />
                        <label
                          htmlFor="chk1"
                          className="custom-control-label text-sm"
                        >
                          Remember me
                        </label>
                      </div>
                      <a href="#" className="ml-auto mb-0 text-sm">
                        Forgot Password?
                      </a>
                    </div>
                    <div className="row mb-3 px-3">
                      <button
                        type="submit"
                        className="btn btn-blue text-center"
                      >
                        Login
                      </button>
                    </div>
                    <div className="row mb-4 px-3">
                      <small className="font-weight-bold">
                        {/* eslint-disable-next-line react/no-unescaped-entities */}
                        Don't have an account?{" "}
                        <button
                          className="link-button"
                          onClick={() => onToggle(true)}
                        >
                          Register
                        </button>
                      </small>
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginComponent;
