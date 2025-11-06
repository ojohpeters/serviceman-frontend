"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  Search,
  Users,
  Calendar,
  UserPlus,
  Mail,
  DollarSign,
} from "lucide-react";

export default function HowItWorks() {
  const [activeTab, setActiveTab] = useState<"users" | "providers">("users");
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  interface Step {
    icon: React.ReactNode;
    title: string;
    desc: string;
    features?: string[];
  }

  const userSteps: Step[] = [
    {
      icon: <Search size={24} />,
      title: "Describe Your Need",
      desc: "Tell us what service you need, your location, and any specific requirements.",
      features: ["Service details", "Location", "Budget range", "Timeline"],
    },
    {
      icon: <Users size={24} />,
      title: "Get Matched",
      desc: "Our matching engine connects you with qualified, vetted providers in your area.",
      features: ["Smart matching", "Verified providers", "Instant quotes", "Compare options"],
    },
    {
      icon: <Calendar size={24} />,
      title: "Book & Pay",
      desc: "Choose a provider, schedule the service, and pay securely through the platform.",
      features: ["Secure booking", "Flexible scheduling", "Safe payments", "Real-time updates"],
    },
  ];

  const providerSteps: Step[] = [
    {
      icon: <UserPlus size={24} />,
      title: "Create Your Profile",
      desc: "Showcase your skills, portfolio, and availability to attract clients.",
      features: ["Portfolio showcase", "Skill verification", "Service catalog", "Availability setup"],
    },
    {
      icon: <Mail size={24} />,
      title: "Receive Requests",
      desc: "Get notified about matching requests from nearby clients in real time.",
      features: ["Smart notifications", "Lead matching", "Client preferences", "Instant alerts"],
    },
    {
      icon: <DollarSign size={24} />,
      title: "Accept & Earn",
      desc: "Accept jobs, complete services, and receive secure payments to your account.",
      features: ["Secure payments", "Job management", "Earnings tracking", "Client reviews"],
    },
  ];

  const steps = activeTab === "users" ? userSteps : providerSteps;

  return (
    <section className="position-relative py-5 howitworks-section">
      <div className="container position-relative z-1">
        {/* Section header */}
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center gap-2 mb-3 px-3 py-1 rounded-pill small-pill">
            <span className="dot" />
            <span className="text-primary small fw-semibold text-uppercase">Simple process</span>
          </div>

          <h2 className="fw-bold display-6 mb-2">
            How It <span className="text-gradient">Works</span>
          </h2>
          <p className="text-muted mb-0" style={{ maxWidth: 640, margin: "0 auto" }}>
            {activeTab === "users"
              ? "Connect with the right professionals in three simple steps."
              : "Grow your business and reach new clients with minimal effort."}
          </p>
        </div>

        {/* Tabs - Pill style */}
        <div className="d-flex justify-content-center mb-5">
          <div className="p-1 bg-white border rounded-pill shadow-sm d-inline-flex tab-pill-wrapper">
            <button
              aria-pressed={activeTab === "users"}
              className={`btn rounded-pill px-4 py-2 fw-semibold d-flex align-items-center gap-2 ${
                activeTab === "users" ? "active-pill" : "inactive-pill"
              }`}
              onClick={() => setActiveTab("users")}
              type="button"
            >
              <Users size={16} />
              For Clients
            </button>

            <button
              aria-pressed={activeTab === "providers"}
              className={`btn rounded-pill px-4 py-2 fw-semibold d-flex align-items-center gap-2 ${
                activeTab === "providers" ? "active-pill" : "inactive-pill"
              }`}
              onClick={() => setActiveTab("providers")}
              type="button"
            >
              <UserPlus size={16} />
              For Providers
            </button>
          </div>
        </div>

        {/* Steps grid */}
        <div className="row g-4">
          {steps.map((step, index) => (
            <div key={index} className="col-12 col-md-6 col-lg-4">
              <article
                className={`card h-100 border-0 card-step ${hoveredStep === index ? "is-hovered" : ""}`}
                onMouseEnter={() => setHoveredStep(index)}
                onMouseLeave={() => setHoveredStep(null)}
              >
                <div className="card-body text-center p-4">
                  <div
                    className="icon-wrapper mb-3 d-inline-flex align-items-center justify-content-center"
                    aria-hidden
                  >
                    <div className="icon-bg d-flex align-items-center justify-content-center">
                      <div className="icon-gradient">{step.icon}</div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center justify-content-center mb-2">
                    <div className="step-badge me-2">{index + 1}</div>
                    <h5 className="card-title h6 mb-0 fw-bold text-dark">{step.title}</h5>
                  </div>

                  <p className="text-muted small my-3">{step.desc}</p>

                  {step.features && (
                    <ul className="list-unstyled small text-start mx-auto" style={{ maxWidth: 280 }}>
                      {step.features.map((f, fi) => (
                        <li key={fi} className="d-flex align-items-center mb-1">
                          <CheckCircle size={14} className="me-2 text-success" />
                          <span className="text-muted">{f}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-3">
                    <a href="/faq" className="btn btn-sm btn-link text-decoration-none learn-more">
                      Learn more <ArrowRight size={14} className="ms-1" />
                    </a>
                  </div>
                </div>
              </article>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-5">
          <Link
            href={activeTab === "users" ? "/servicemen" : "/auth/register/serviceman"}
            className="btn btn-primary btn-lg px-5 py-2 rounded-pill fw-semibold cta-btn"
          >
            {activeTab === "users" ? "Find a Service Provider" : "Become a Provider"}
            <ArrowRight size={16} className="ms-2" />
          </Link>
        </div>
      </div>

      {/* Scoped styles */}
      <style jsx>{`
        .howitworks-section {
          background: linear-gradient(180deg, #fbfcfe 0%, #f8fafc 100%);
        }

        .small-pill {
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(15, 23, 42, 0.04);
          padding-left: 0.9rem;
          padding-right: 0.9rem;
        }

        .dot {
          width: 8px;
          height: 8px;
          background: #4f46e5;
          border-radius: 50%;
          display: inline-block;
          box-shadow: 0 6px 18px rgba(79, 70, 229, 0.18);
        }

        .text-gradient {
          background: linear-gradient(90deg, #4f46e5 0%, #06b6d4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* Tab pill wrapper */
        .tab-pill-wrapper .btn {
          min-width: 150px;
          border: none;
          font-size: 0.95rem;
          transition: all 0.22s ease;
        }
        .active-pill {
          background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
          color: #fff !important;
          box-shadow: 0 8px 24px rgba(99, 102, 241, 0.12);
        }
        .inactive-pill {
          background: transparent;
          color: #6b7280;
        }
        .inactive-pill:hover {
          color: #374151;
          background: rgba(15, 23, 42, 0.03);
        }

        /* Cards */
        .card-step {
          border-radius: 14px;
          transition: transform 0.28s ease, box-shadow 0.28s ease;
          background: #ffffff;
          box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);
          overflow: visible;
        }

        .card-step.is-hovered {
          transform: translateY(-8px);
          box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
        }

        .icon-wrapper .icon-bg {
          width: 72px;
          height: 72px;
          border-radius: 16px;
          background: linear-gradient(180deg, rgba(99,102,241,0.08), rgba(6,182,212,0.04));
          display: inline-flex;
        }

        .icon-gradient {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #374151;
        }

        .step-badge {
          min-width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(90deg, rgba(99,102,241,0.12), rgba(6,182,212,0.06));
          color: #111827;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }

        .learn-more {
          color: #4f46e5;
          font-weight: 600;
          padding: 0.25rem 0.5rem;
        }

        .learn-more:hover {
          text-decoration: none;
          opacity: 0.95;
        }

        /* Primary CTA */
        .btn-primary {
          background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
          border: none;
        }

        .btn-primary:hover {
          background: linear-gradient(135deg, #4338ca 0%, #4f46e5 100%);
        }

        /* Responsive tweaks */
        @media (max-width: 991px) {
          .tab-pill-wrapper .btn {
            min-width: 130px;
            padding-left: 1rem;
            padding-right: 1rem;
          }
        }
      `}</style>
    </section>
  );
}
