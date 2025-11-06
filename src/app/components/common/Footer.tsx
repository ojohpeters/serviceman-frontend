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
                href="/categories"
                className="text-decoration-none sophisticated-footer-link"
              >
                Browse Categories
              </a>
            </li>
            <li className="mb-2">
              <a
                href="/servicemen"
                className="text-decoration-none sophisticated-footer-link"
              >
                Find Professionals
              </a>
            </li>
            <li className="mb-2">
              <a
                href="/servicemen?is_available=true"
                className="text-decoration-none sophisticated-footer-link"
              >
                Available Now
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
                href="/about"
                className="text-decoration-none sophisticated-footer-link"
              >
                About Us
              </a>
            </li>
            <li className="mb-2">
              <a
                href="/faq"
                className="text-decoration-none sophisticated-footer-link"
              >
                FAQs
              </a>
            </li>
            <li className="mb-2">
              <a
                href="/contact"
                className="text-decoration-none sophisticated-footer-link"
              >
                Contact
              </a>
            </li>
            <li className="mb-2">
              <a
                href="/auth/register/serviceman"
                className="text-decoration-none sophisticated-footer-link"
              >
                Become a Provider
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
                href="/faq"
                className="text-decoration-none sophisticated-footer-link"
              >
                Help Center
              </a>
            </li>
            <li className="mb-2">
              <a
                href="/auth/login"
                className="text-decoration-none sophisticated-footer-link"
              >
                Login
              </a>
            </li>
            <li className="mb-2">
              <a
                href="/auth/register/client"
                className="text-decoration-none sophisticated-footer-link"
              >
                Register
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div
        className="border-top pt-4 mt-4"
        style={{ color: "var(--muted-foreground)" }}
      >
        <div className="row align-items-center">
          <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
            <p className="mb-0">&copy; 2025 ServiceHub. All rights reserved.</p>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <p className="mb-0 small">
              Developed by{" "}
              <a 
                href="https://www.sacscomputers.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-decoration-none fw-semibold"
                style={{ color: "var(--bs-primary)" }}
              >
                SACS Computers
              </a>
              {" "}- IT in your palms
            </p>
          </div>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
