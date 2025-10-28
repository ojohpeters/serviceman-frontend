"use client";
import React from "react";
import { Star, Shield, Clock, Users, CheckCircle, Headphones } from "lucide-react";

export default function Features(): React.ReactElement {
  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Verified Professionals",
      description: "All service providers are background-checked and verified for your safety and peace of mind",
      gradient: "from-green-500 to-emerald-500",
      color: "text-green-600",
      benefits: ["Background checked", "ID verified", "Skill validated", "Insurance covered"]
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: "Quality Guaranteed",
      description: "Read authentic reviews and ratings from real customers to make informed decisions",
      gradient: "from-amber-500 to-orange-500",
      color: "text-amber-600",
      benefits: ["Real customer reviews", "Transparent ratings", "Quality assurance", "Satisfaction guarantee"]
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Quick Booking",
      description: "Get instantly matched with available providers in your area within minutes",
      gradient: "from-blue-500 to-cyan-500",
      color: "text-blue-600",
      benefits: ["Instant matching", "Real-time availability", "Fast response", "Same-day service"]
    },
  ];

  return (
    <section className="position-relative py-5 overflow-hidden bg-white">
      {/* Clean Background */}
      <div className="position-absolute top-0 start-0 w-100 h-100 pointer-events-none">
        {/* Subtle gradient */}
        <div className="position-absolute top-0 start-0 w-100 h-100 bg-gradient-to-br from-gray-50 via-white to-blue-50" />
        
        {/* Minimal decorative elements */}
        <div className="position-absolute top-10 end-10 w-6 h-6 bg-green-100 rounded-full opacity-40" />
        <div className="position-absolute bottom-20 start-10 w-4 h-4 bg-amber-100 rounded-full opacity-30" />
        <div className="position-absolute top-1/3 start-1/4 w-3 h-3 bg-blue-100 rounded-full opacity-25" />
        
        {/* Subtle dot pattern */}
        <div 
          className="position-absolute top-0 start-0 w-100 h-100 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0)`,
            backgroundSize: '30px 30px'
          }}
        />
      </div>

      <div className="container position-relative z-1">
        {/* Section Header */}
        <div className="text-center mb-5">
          <div className="d-inline-flex align-items-center gap-2 mb-4 px-4 py-2 bg-blue-50 rounded-pill border border-blue-100">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-blue-600 text-sm fw-semibold uppercase tracking-wide">
              Why Choose Us
            </span>
          </div>
          
          <h2 className="fw-bold display-5 mb-3 text-gray-900">
            Built for <span className="text-gradient">Trust & Quality</span>
          </h2>
          <p className="text-gray-600 fs-5 mx-auto" style={{ maxWidth: "600px" }}>
            We've designed every aspect of our platform to ensure your complete satisfaction and peace of mind
          </p>
        </div>

        {/* Features Grid */}
        <div className="row g-4">
          {features.map((feature, index) => (
            <div key={index} className="col-md-4">
              <div 
                className="card h-100 border-0 position-relative overflow-hidden transition-all duration-500 features-card group"
                style={{ 
                  minHeight: "320px",
                  background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "20px",
                  boxShadow: "0 8px 30px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.03)",
                  border: "1px solid rgba(255,255,255,0.8)",
                }}
              >
                {/* Animated Gradient Border */}
                <div 
                  className={`position-absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-2xl gradient-border`}
                  style={{ padding: '2px' }}
                >
                  <div className="w-100 h-100 bg-white rounded-2xl" />
                </div>

                <div className="card-body p-5 d-flex flex-column position-relative z-2">
                  {/* Icon */}
                  <div 
                    className="mx-auto mb-4 rounded-2xl d-flex align-items-center justify-content-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
                    style={{
                      width: "80px",
                      height: "80px",
                      background: "linear-gradient(135deg, rgba(248,250,252,0.9) 0%, rgba(241,245,249,0.7) 100%)",
                      boxShadow: "0 8px 25px rgba(0,0,0,0.1), inset 0 1px 1px rgba(255,255,255,0.8)",
                      border: "1px solid rgba(255,255,255,0.6)"
                    }}
                  >
                    <div 
                      className="transition-all duration-500 group-hover:scale-110"
                      style={{
                        background: `linear-gradient(to right, ${feature.gradient.replace('from-', '').replace('to-', '').split(' ')[0]}, ${feature.gradient.replace('from-', '').replace('to-', '').split(' ')[1]})`,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent"
                      }}
                    >
                      {feature.icon}
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="h4 fw-bold mb-3 text-gray-900 text-center">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 text-center leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Benefits List */}
                  <div className="mt-auto">
                    {feature.benefits && (
                      <div className="text-start">
                        {feature.benefits.map((benefit, benefitIndex) => (
                          <div key={benefitIndex} className="d-flex align-items-center mb-2">
                            <CheckCircle className="w-4 h-4 text-green-500 me-2 flex-shrink-0" />
                            <span className="text-gray-600 small">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Stats Section */}
        <div className="row mt-5 pt-4">
          <div className="col-12">
            <div 
              className="card border-0 p-5 rounded-3"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)",
                backdropFilter: "blur(10px)",
                boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
                border: "1px solid rgba(255,255,255,0.8)"
              }}
            >
              <div className="row align-items-center text-center">
                <div className="col-md-3 border-end border-gray-200 py-3">
                  <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <h4 className="fw-bold text-gray-900 mb-0">10,000+</h4>
                  </div>
                  <p className="text-gray-600 mb-0 small">Happy Customers</p>
                </div>
                <div className="col-md-3 border-end border-gray-200 py-3">
                  <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    <h4 className="fw-bold text-gray-900 mb-0">500+</h4>
                  </div>
                  <p className="text-gray-600 mb-0 small">Verified Providers</p>
                </div>
                <div className="col-md-3 border-end border-gray-200 py-3">
                  <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-amber-600" />
                    <h4 className="fw-bold text-gray-900 mb-0">4.9/5</h4>
                  </div>
                  <p className="text-gray-600 mb-0 small">Average Rating</p>
                </div>
                <div className="col-md-3 py-3">
                  <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                    <Headphones className="w-5 h-5 text-purple-600" />
                    <h4 className="fw-bold text-gray-900 mb-0">24/7</h4>
                  </div>
                  <p className="text-gray-600 mb-0 small">Customer Support</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="row mt-4">
          <div className="col-12">
            <div className="text-center">
              <div className="d-flex flex-wrap justify-content-center gap-4 align-items-center">
                <div className="d-flex align-items-center gap-2 text-gray-500 small">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Secure Payments
                </div>
                <div className="d-flex align-items-center gap-2 text-gray-500 small">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Satisfaction Guarantee
                </div>
                <div className="d-flex align-items-center gap-2 text-gray-500 small">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Instant Support
                </div>
                <div className="d-flex align-items-center gap-2 text-gray-500 small">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Quality Assured
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .text-gradient {
          background: linear-gradient(135deg, #0d6efd 0%, #20c997 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .features-card {
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .features-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.06) !important;
        }
        
        .gradient-border {
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
        }
        
        @media (max-width: 768px) {
          .border-end {
            border-right: none !important;
            border-bottom: 1px solid rgba(0,0,0,0.1);
            padding-bottom: 1.5rem;
            margin-bottom: 1.5rem;
          }
          
          .border-end:last-child {
            border-bottom: none;
            padding-bottom: 0;
            margin-bottom: 0;
          }
        }
      `}</style>
    </section>
  );
}