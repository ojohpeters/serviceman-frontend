// NairaIcon.tsx
import React from "react";

const NairaIcon = ({ size = 24, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <text x="4" y="19" fontSize="18" fontWeight="bold" fill={color}>₦</text>
  </svg>
);

export default NairaIcon;