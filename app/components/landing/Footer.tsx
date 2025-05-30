import React from "react";

const Footer = () => {
  return (
    <footer
      style={{ backgroundColor: "#222", color: "#fff", padding: "40px 20px" }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
      >
        {/* Brand and description */}
        <div style={{ flex: "1 1 250px", marginBottom: "20px" }}>
          <h2 style={{ marginBottom: "10px" }}>Dreamy Eyes</h2>
          <p style={{ fontSize: "14px", color: "#bbb" }}>
            Nisi, purus vitae, ultrices nunc. Sit ac sit suscipit hendrerit.
            Gravida massa volutpat aenean odio erat nullam fringilla.
          </p>
        </div>

        {/* Quick Links */}
        <div style={{ flex: "1 1 150px", marginBottom: "20px" }}>
          <h4 style={{ marginBottom: "10px" }}>Quick Links</h4>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              fontSize: "14px",
              color: "#bbb",
            }}
          >
            {["Home", "About", "Shop", "Blogs", "Contact"].map((item) => (
              <li key={item} style={{ marginBottom: "6px" }}>
                <a href="#" style={{ color: "#bbb", textDecoration: "none" }}>
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Help & Info */}
        <div style={{ flex: "1 1 200px", marginBottom: "20px" }}>
          <h4 style={{ marginBottom: "10px" }}>Help & Info</h4>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              fontSize: "14px",
              color: "#bbb",
            }}
          >
            {[
              "Track Your Order",
              "Returns Policies",
              "Shipping + Delivery",
              "Contact Us",
              "FAQs",
            ].map((item) => (
              <li key={item} style={{ marginBottom: "6px" }}>
                <a href="#" style={{ color: "#bbb", textDecoration: "none" }}>
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Info */}
        <div style={{ flex: "1 1 200px", marginBottom: "20px" }}>
          <h4 style={{ marginBottom: "10px" }}>Contact Us</h4>
          <p style={{ fontSize: "14px", color: "#bbb" }}>
            Email:{" "}
            <a
              href="mailto:yourinfo@gmail.com"
              style={{ color: "#bbb", textDecoration: "underline" }}
            >
              yourinfo@gmail.com
            </a>
          </p>
          <p style={{ fontSize: "14px", color: "#bbb" }}>
            Phone:{" "}
            <a
              href="tel:+551112223344"
              style={{ color: "#bbb", textDecoration: "underline" }}
            >
              +55 111 222 333 44
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
