"use client";

import React, { useState } from "react";
import Nav from "../components/common/Nav";
import SecondFooter from "../components/common/SecondFooter";
import { MapPin, Mail, Phone, Send, Facebook, Instagram, Globe } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, just show success message
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 3000);
  };

  return (
    <div className="min-vh-100 bg-light">
      {/* Fixed Nav */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          backgroundColor: "white",
          boxShadow: '0 2px 20px rgba(0,0,0,0.1)',
        }}
      >
        <Nav />
      </div>

      {/* Hero Section */}
      <div className="position-relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-emerald-50" style={{ marginTop: '80px' }}>
        <div className="container py-5">
          <div className="row align-items-center">
            <div className="col-lg-8 mx-auto text-center">
              <h1 className="display-4 fw-bold text-dark mb-4">
                Get in <span className="text-primary">Touch</span>
              </h1>
              <p className="lead text-muted mb-0">
                Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-5" style={{ marginBottom: '80px' }}>
        <div className="row g-4">
          {/* Contact Information */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <h3 className="h5 fw-bold mb-4">Contact Information</h3>
                
                {/* Address */}
                <div className="d-flex gap-3 mb-4">
                  <div className="flex-shrink-0">
                    <div className="rounded-circle bg-primary bg-opacity-10 p-3">
                      <MapPin className="text-primary" size={24} />
                    </div>
                  </div>
                  <div>
                    <h6 className="fw-semibold mb-1">Address</h6>
                    <p className="text-muted mb-0 small">
                      183 George Akume Way,<br />
                      Opp. Wishden Filling Station,<br />
                      Makurdi, Benue State, Nigeria
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="d-flex gap-3 mb-4">
                  <div className="flex-shrink-0">
                    <div className="rounded-circle bg-success bg-opacity-10 p-3">
                      <Mail className="text-success" size={24} />
                    </div>
                  </div>
                  <div>
                    <h6 className="fw-semibold mb-1">Email</h6>
                    <a href="mailto:info@sacscomputers.com" className="text-decoration-none text-muted small d-block mb-1">
                      info@sacscomputers.com
                    </a>
                  </div>
                </div>

                {/* Phone */}
                <div className="d-flex gap-3 mb-4">
                  <div className="flex-shrink-0">
                    <div className="rounded-circle bg-warning bg-opacity-10 p-3">
                      <Phone className="text-warning" size={24} />
                    </div>
                  </div>
                  <div>
                    <h6 className="fw-semibold mb-1">Phone</h6>
                    <a href="tel:+2347058270219" className="text-decoration-none text-muted small d-block mb-1">
                      +234 705 827 0219
                    </a>
                    <a href="tel:+2349066274751" className="text-decoration-none text-muted small d-block">
                      +234 906 627 4751
                    </a>
                  </div>
                </div>

                {/* Social Media */}
                <div className="mt-4 pt-4 border-top">
                  <h6 className="fw-semibold mb-3">Follow Us</h6>
                  <div className="d-flex gap-2">
                    <a 
                      href="https://web.facebook.com/people/SACS-Computers/100057023876823/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-outline-primary rounded-circle p-2"
                      style={{ width: '40px', height: '40px' }}
                    >
                      <Facebook size={20} />
                    </a>
                    <a 
                      href="https://www.instagram.com/sacscomputers" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-outline-danger rounded-circle p-2"
                      style={{ width: '40px', height: '40px' }}
                    >
                      <Instagram size={20} />
                    </a>
                  </div>
                </div>

                {/* Powered By */}
                <div className="mt-4 pt-4 border-top">
                  <div className="text-center">
                    <p className="text-muted small mb-2">Platform Developed By</p>
                    <a 
                      href="https://www.sacscomputers.com/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-decoration-none"
                    >
                      <div className="d-flex align-items-center justify-content-center gap-2 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-3 hover-lift">
                        <Globe className="text-primary" size={20} />
                        <span className="fw-bold text-dark">SACS Computers</span>
                      </div>
                    </a>
                    <p className="text-muted small mt-2 mb-0">
                      Professional IT Solutions & Web Development
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4 p-md-5">
                <h3 className="h4 fw-bold mb-4">Send us a Message</h3>
                
                {submitted && (
                  <div className="alert alert-success d-flex align-items-center mb-4" role="alert">
                    <Send className="me-2" size={20} />
                    <div>
                      Thank you for contacting us! We'll get back to you soon.
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Your Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Email Address</label>
                      <input
                        type="email"
                        className="form-control"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        placeholder="john@example.com"
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold">Subject</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        required
                        placeholder="How can we help you?"
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold">Message</label>
                      <textarea
                        className="form-control"
                        rows={6}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                        placeholder="Tell us more about your inquiry..."
                      ></textarea>
                    </div>
                    <div className="col-12">
                      <button type="submit" className="btn btn-primary btn-lg px-5">
                        <Send className="me-2" size={18} />
                        Send Message
                      </button>
                    </div>
                  </div>
                </form>

                {/* Alternative Contact Methods */}
                <div className="mt-5 pt-4 border-top">
                  <h5 className="fw-semibold mb-3">Prefer to reach us directly?</h5>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <a 
                        href="mailto:info@sacscomputers.com" 
                        className="d-flex align-items-center gap-3 p-3 bg-light rounded-3 text-decoration-none hover-lift"
                      >
                        <Mail className="text-primary" size={24} />
                        <div>
                          <div className="fw-semibold text-dark">Email Us</div>
                          <small className="text-muted">info@sacscomputers.com</small>
                        </div>
                      </a>
                    </div>
                    <div className="col-md-6">
                      <a 
                        href="tel:+2347058270219" 
                        className="d-flex align-items-center gap-3 p-3 bg-light rounded-3 text-decoration-none hover-lift"
                      >
                        <Phone className="text-success" size={24} />
                        <div>
                          <div className="fw-semibold text-dark">Call Us</div>
                          <small className="text-muted">+234 705 827 0219</small>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="row mt-5">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-0" style={{ height: '400px', background: '#e9ecef' }}>
                <div className="d-flex align-items-center justify-content-center h-100">
                  <div className="text-center">
                    <MapPin className="text-muted mb-3" size={48} />
                    <h5 className="text-muted">Visit Us At</h5>
                    <p className="text-muted mb-0">
                      183 George Akume Way, Opp. Wishden Filling Station<br />
                      Makurdi, Benue State, Nigeria
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Footer */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          backgroundColor: "white",
        }}
      >
        <SecondFooter />
      </div>

      <style jsx>{`
        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.12) !important;
        }
      `}</style>
    </div>
  );
}

