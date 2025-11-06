"use client";

import React from "react";
import Nav from "../components/common/Nav";
import SecondFooter from "../components/common/SecondFooter";
import { Shield, Users, Target, Award, Heart, Zap } from "lucide-react";

export default function AboutPage() {
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
                About <span className="text-primary">ServiceHub</span>
              </h1>
              <p className="lead text-muted mb-0">
                Connecting clients with verified, skilled professionals for all their service needs
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-5">
        
        {/* Mission & Vision */}
        <div className="row mb-5">
          <div className="col-lg-6 mb-4 mb-lg-0">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body p-4">
                <div className="d-flex align-items-center mb-3">
                  <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                    <Target className="text-primary" size={28} />
                  </div>
                  <h3 className="h4 mb-0 fw-bold">Our Mission</h3>
                </div>
                <p className="text-muted mb-0">
                  To revolutionize how people find and hire service professionals by creating a transparent, 
                  efficient, and trustworthy platform that benefits both clients and service providers. We believe 
                  quality service should be accessible, affordable, and reliable for everyone.
                </p>
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body p-4">
                <div className="d-flex align-items-center mb-3">
                  <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                    <Zap className="text-success" size={28} />
                  </div>
                  <h3 className="h4 mb-0 fw-bold">Our Vision</h3>
                </div>
                <p className="text-muted mb-0">
                  To become the leading platform connecting service professionals with clients across the region, 
                  empowering skilled workers while ensuring customers receive exceptional service every time. 
                  We envision a future where finding trusted help is just a few clicks away.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-5">
          <h2 className="h3 fw-bold text-center mb-4">Our Core Values</h2>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm hover-lift">
                <div className="card-body text-center p-4">
                  <div className="rounded-circle bg-blue-50 d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                    <Shield className="text-blue-600" size={36} />
                  </div>
                  <h5 className="fw-bold mb-3">Trust & Safety</h5>
                  <p className="text-muted small mb-0">
                    All professionals are verified and vetted to ensure your safety and peace of mind.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm hover-lift">
                <div className="card-body text-center p-4">
                  <div className="rounded-circle bg-emerald-50 d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                    <Award className="text-emerald-600" size={36} />
                  </div>
                  <h5 className="fw-bold mb-3">Quality Service</h5>
                  <p className="text-muted small mb-0">
                    We maintain high standards through ratings, reviews, and continuous quality monitoring.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm hover-lift">
                <div className="card-body text-center p-4">
                  <div className="rounded-circle bg-amber-50 d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                    <Heart className="text-amber-600" size={36} />
                  </div>
                  <h5 className="fw-bold mb-3">Customer First</h5>
                  <p className="text-muted small mb-0">
                    Your satisfaction is our priority. We're here to ensure you get the best service experience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-3 shadow-sm p-5 mb-5">
          <h2 className="h3 fw-bold text-center mb-5">How ServiceHub Works</h2>
          <div className="row g-4">
            <div className="col-md-3">
              <div className="text-center">
                <div className="rounded-circle bg-primary bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                  <span className="fw-bold text-primary fs-4">1</span>
                </div>
                <h6 className="fw-bold mb-2">Search & Browse</h6>
                <p className="text-muted small">Find professionals by category or search for specific services</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="text-center">
                <div className="rounded-circle bg-primary bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                  <span className="fw-bold text-primary fs-4">2</span>
                </div>
                <h6 className="fw-bold mb-2">Book Service</h6>
                <p className="text-muted small">Select your preferred professional and pay a small booking fee</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="text-center">
                <div className="rounded-circle bg-primary bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                  <span className="fw-bold text-primary fs-4">3</span>
                </div>
                <h6 className="fw-bold mb-2">Get Estimate</h6>
                <p className="text-muted small">Serviceman reviews your request and provides a cost estimate</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="text-center">
                <div className="rounded-circle bg-success bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                  <span className="fw-bold text-success fs-4">4</span>
                </div>
                <h6 className="fw-bold mb-2">Service Delivered</h6>
                <p className="text-muted small">Approve the price, pay, and enjoy professional service</p>
              </div>
            </div>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="mb-5">
          <h2 className="h3 fw-bold text-center mb-4">Why Choose ServiceHub?</h2>
          <div className="row g-4">
            <div className="col-md-6">
              <div className="d-flex gap-3 p-4 bg-white rounded-3 shadow-sm h-100">
                <div className="flex-shrink-0">
                  <div className="rounded bg-primary bg-opacity-10 p-2">
                    <Shield className="text-primary" size={24} />
                  </div>
                </div>
                <div>
                  <h6 className="fw-bold mb-2">Verified Professionals</h6>
                  <p className="text-muted small mb-0">
                    Every serviceman on our platform is vetted, verified, and approved by our admin team to ensure quality and reliability.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex gap-3 p-4 bg-white rounded-3 shadow-sm h-100">
                <div className="flex-shrink-0">
                  <div className="rounded bg-success bg-opacity-10 p-2">
                    <Award className="text-success" size={24} />
                  </div>
                </div>
                <div>
                  <h6 className="fw-bold mb-2">Transparent Pricing</h6>
                  <p className="text-muted small mb-0">
                    Get detailed estimates before work begins. Know exactly what you're paying for with no hidden fees.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex gap-3 p-4 bg-white rounded-3 shadow-sm h-100">
                <div className="flex-shrink-0">
                  <div className="rounded bg-amber bg-opacity-10 p-2">
                    <Users className="text-amber-600" size={24} />
                  </div>
                </div>
                <div>
                  <h6 className="fw-bold mb-2">Secure Payments</h6>
                  <p className="text-muted small mb-0">
                    All payments are processed securely through Paystack. Your financial information is always protected.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex gap-3 p-4 bg-white rounded-3 shadow-sm h-100">
                <div className="flex-shrink-0">
                  <div className="rounded bg-blue bg-opacity-10 p-2">
                    <Heart className="text-danger" size={24} />
                  </div>
                </div>
                <div>
                  <h6 className="fw-bold mb-2">Customer Support</h6>
                  <p className="text-muted small mb-0">
                    Our admin team monitors all service requests and is ready to help resolve any issues promptly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center py-5">
          <div className="card border-0 shadow-sm p-5 bg-gradient-to-br from-blue-50 to-emerald-50">
            <h2 className="h3 fw-bold mb-3">Ready to Get Started?</h2>
            <p className="text-muted mb-4">
              Join thousands of satisfied customers who found their perfect service provider
            </p>
            <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
              <a href="/servicemen" className="btn btn-primary btn-lg px-5">
                Find a Service Provider
              </a>
              <a href="/auth/register/serviceman" className="btn btn-outline-primary btn-lg px-5">
                Become a Provider
              </a>
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

