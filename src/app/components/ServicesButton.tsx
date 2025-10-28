"use client";
import React from "react";

const ServicesButton = () => (
  <a
    href="/categories"
    className="btn btn-gradient btn-lg px-5 py-3 d-inline-flex align-items-center gap-2 shadow-lg"
    style={{
      borderRadius: "2rem",
      background: "linear-gradient(90deg, #3454fa 0%, #0dcaf0 100%)",
      color: "#fff",
      fontWeight: 600,
      letterSpacing: "0.03em",
      boxShadow: "0 4px 24px 0 rgba(52,84,250,0.12)",
      border: "none",
      transition: "transform 0.2s, box-shadow 0.2s",
    }}
    onMouseOver={e => {
      e.currentTarget.style.transform = "scale(1.05)";
      e.currentTarget.style.boxShadow = "0 8px 32px 0 rgba(52,84,250,0.18)";
    }}
    onMouseOut={e => {
      e.currentTarget.style.transform = "scale(1)";
      e.currentTarget.style.boxShadow = "0 4px 24px 0 rgba(52,84,250,0.12)";
    }}
  >
    <span>See All Services</span>
    <svg width="22" height="22" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
  </a>
);

export default ServicesButton;