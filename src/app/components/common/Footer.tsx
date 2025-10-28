import React from "react";

const Footer = () => (
  <footer
    className="position-relative border-top sophisticated-footer"
    style={{ zIndex: 10 }}
  >
    <div className="sophisticated-footer-bg"></div>
    <div className="container py-5 position-relative">
      <div className="row g-4">
        <div className="col-md-3">
          <h5
            className="fw-semibold mb-3"
            style={{ color: "var(--foreground)" }}
          >
            ServiceHub
          </h5>
          <p style={{ color: "var(--muted-foreground)" }}>
            Connecting you with trusted service providers for all your needs.
          </p>
        </div>
        <div className="col-md-3">
          <h6
            className="fw-semibold mb-3"
            style={{ color: "var(--foreground)" }}
          >
            Services
          </h6>
          <ul className="list-unstyled">
            <li className="mb-2">
              <a
                href="#"
                className="text-decoration-none sophisticated-footer-link"
              >
                Home Services
              </a>
            </li>
            <li className="mb-2">
              <a
                href="#"
                className="text-decoration-none sophisticated-footer-link"
              >
                Business Services
              </a>
            </li>
            <li className="mb-2">
              <a
                href="#"
                className="text-decoration-none sophisticated-footer-link"
              >
                Emergency Services
              </a>
            </li>
          </ul>
        </div>
        <div className="col-md-3">
          <h6
            className="fw-semibold mb-3"
            style={{ color: "var(--foreground)" }}
          >
            Company
          </h6>
          <ul className="list-unstyled">
            <li className="mb-2">
              <a
                href="#"
                className="text-decoration-none sophisticated-footer-link"
              >
                About Us
              </a>
            </li>
            <li className="mb-2">
              <a
                href="#"
                className="text-decoration-none sophisticated-footer-link"
              >
                Contact
              </a>
            </li>
            <li className="mb-2">
              <a
                href="#"
                className="text-decoration-none sophisticated-footer-link"
              >
                Careers
              </a>
            </li>
          </ul>
        </div>
        <div className="col-md-3">
          <h6
            className="fw-semibold mb-3"
            style={{ color: "var(--foreground)" }}
          >
            Support
          </h6>
          <ul className="list-unstyled">
            <li className="mb-2">
              <a
                href="#"
                className="text-decoration-none sophisticated-footer-link"
              >
                Help Center
              </a>
            </li>
            <li className="mb-2">
              <a
                href="#"
                className="text-decoration-none sophisticated-footer-link"
              >
                Safety
              </a>
            </li>
            <li className="mb-2">
              <a
                href="#"
                className="text-decoration-none sophisticated-footer-link"
              >
                Terms of Service
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div
        className="border-top pt-4 mt-4 text-center"
        style={{ color: "var(--muted-foreground)" }}
      >
        <p className="mb-0">&copy; 2025 ServiceHub. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
