"use client";

import { useState } from "react";

export default function AdminRegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    secretKey: "", // special code required
  });

  const [status, setStatus] = useState({ error: "", success: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ error: "", success: "" });

    try {
      const res = await fetch("http://localhost:8000/api/register/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus({ success: "Admin account created successfully!", error: "" });
        setFormData({ fullName: "", email: "", password: "", secretKey: "" });
      } else {
        const data = await res.json();
        setStatus({ error: data.message || "Registration failed.", success: "" });
      }
    } catch {
      setStatus({ error: "Something went wrong. Please try again.", success: "" });
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "500px" }}>
      <h2 className="mb-4">Admin Registration</h2>

      {status.error && <div className="alert alert-danger">{status.error}</div>}
      {status.success && (
        <div className="alert alert-success">{status.success}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Full Name</label>
          <input
            type="text"
            className="form-control"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Email address</label>
          <input
            type="email"
            className="form-control"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Secret Key</label>
          <input
            type="text"
            className="form-control"
            name="secretKey"
            value={formData.secretKey}
            onChange={handleChange}
            required
          />
          <div className="form-text">
            Only users with the correct secret key can become Admin.
          </div>
        </div>

        <button type="submit" className="btn btn-danger w-100">
          Register Admin
        </button>
      </form>
    </div>
  );
}
