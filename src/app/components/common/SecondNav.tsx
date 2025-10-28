"use client";

import React from "react";

const SecondNav = () => (
  <nav
    className="position-relative border-bottom sophisticated-nav"
    style={{ zIndex: 10 }}
  >
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center py-3">
        <div className="d-flex align-items-center">
          <h1
            className="h2 fw-bold mb-0"
            style={{ color: "var(--foreground)" }}
          >
            ServiceHub
          </h1>
        </div>
      </div>
    </div>
  </nav>
);

export default SecondNav;
