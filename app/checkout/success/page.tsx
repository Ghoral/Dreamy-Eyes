"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function CheckoutSuccessPage() {
  const [orderNumber, setOrderNumber] = useState("");

  useEffect(() => {
    // Generate a random order number
    const randomOrder = Math.random().toString(36).substr(2, 9).toUpperCase();
    setOrderNumber(randomOrder);
  }, []);

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{ backgroundColor: "#f8f9fa" }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card border-0 shadow-sm text-center">
              <div className="card-body p-5">
                {/* Success Icon */}
                <div className="mb-4">
                  <div
                    className="bg-success rounded-circle d-inline-flex align-items-center justify-content-center"
                    style={{ width: "80px", height: "80px" }}
                  >
                    <i
                      className="bi bi-check-lg text-white"
                      style={{ fontSize: "2.5rem" }}
                    ></i>
                  </div>
                </div>

                {/* Success Message */}
                <h2 className="fw-bold text-success mb-3">Order Confirmed!</h2>
                <p className="text-muted fs-5 mb-4">
                  Thank you for your purchase. Your order has been successfully
                  placed.
                </p>

                {/* Order Details */}
                <div className="bg-light rounded p-4 mb-4">
                  <h6 className="fw-semibold mb-3">Order Details</h6>
                  <div className="row text-center">
                    <div className="col-6">
                      <small className="text-muted d-block">Order Number</small>
                      <span className="fw-bold">{orderNumber}</span>
                    </div>
                    <div className="col-6">
                      <small className="text-muted d-block">Date</small>
                      <span className="fw-bold">
                        {new Date().toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Next Steps */}
                <div className="mb-4">
                  <h6 className="fw-semibold mb-3">What's Next?</h6>
                  <div className="row g-3 text-start">
                    <div className="col-12">
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white"
                          style={{
                            width: "30px",
                            height: "30px",
                            minWidth: "30px",
                          }}
                        >
                          <span className="fw-bold">1</span>
                        </div>
                        <div>
                          <small className="fw-semibold">
                            Order Confirmation Email
                          </small>
                          <p className="text-muted mb-0 small">
                            You'll receive a confirmation email shortly
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white"
                          style={{
                            width: "30px",
                            height: "30px",
                            minWidth: "30px",
                          }}
                        >
                          <span className="fw-bold">2</span>
                        </div>
                        <div>
                          <small className="fw-semibold">
                            Order Processing
                          </small>
                          <p className="text-muted mb-0 small">
                            We'll start processing your order within 24 hours
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white"
                          style={{
                            width: "30px",
                            height: "30px",
                            minWidth: "30px",
                          }}
                        >
                          <span className="fw-bold">3</span>
                        </div>
                        <div>
                          <small className="fw-semibold">
                            Shipping Updates
                          </small>
                          <p className="text-muted mb-0 small">
                            Track your order with the tracking number we'll send
                            you
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="d-grid gap-3">
                  <Link href="/shop" className="btn btn-primary btn-lg">
                    Continue Shopping
                  </Link>
                  <Link href="/" className="btn btn-outline-secondary">
                    Back to Home
                  </Link>
                </div>

                {/* Contact Info */}
                <div className="mt-4 pt-4 border-top">
                  <p className="text-muted mb-2">
                    Need help? Contact our support team
                  </p>
                  <div className="d-flex justify-content-center gap-4">
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-envelope text-primary"></i>
                      <small>support@dreamyeyes.com</small>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-telephone text-primary"></i>
                      <small>+1 (555) 123-4567</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
