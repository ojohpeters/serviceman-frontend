"use client";
import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTA(): React.ReactElement {
  
  return (
    <section className="position-relative py-5" style={{ zIndex: 10 }}>
          <div className="sophisticated-cta-bg"></div>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <div className="sophisticated-cta-card text-center p-5 position-relative overflow-hidden">
                  <div className="sophisticated-cta-overlay-1"></div>
                  <div className="sophisticated-cta-overlay-2"></div>
                  <div className="sophisticated-cta-overlay-3"></div>

                  <div className="position-relative" style={{ zIndex: 10 }}>
                    <h2
                      className="display-4 fw-bold mb-4"
                      style={{ color: "var(--foreground)" }}
                    >
                      Ready to Get Started?
                    </h2>
                    <p
                      className="lead mb-4"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      Join thousands of satisfied customers who found their
                      perfect service provider
                    </p>
                    <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                      <Link href="/servicemen" className="btn btn-primary btn-lg px-4 py-3">
                        Find a Service Provider
                        <ArrowRight
                          className="ms-2"
                          style={{ width: "1.25rem", height: "1.25rem" }}
                        />
                      </Link>
                      <Link href="/auth/register/serviceman" className="btn btn-outline-primary btn-lg px-4 py-3 sophisticated-outline-btn">
                        Become a Provider
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
  );
}