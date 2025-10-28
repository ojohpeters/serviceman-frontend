"use client";
import React, { useState, useEffect } from "react";
import { 
  Droplets, 
  Lightbulb, 
  Sparkles, 
  Sprout, 
  Palette, 
  Drill,
  ArrowRight,
  Star
} from "lucide-react";
import ServicesButton from "../ServicesButton";

export default function PopularServices(): React.ReactElement {
  const [isMounted, setIsMounted] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const services = [
    { 
      name: "Plumbing", 
      icon: <Droplets className="w-6 h-6" />, 
      providers: 150,
      rating: 4.8,
      color: "text-blue-600",
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
      darkGradient: "from-blue-600 to-cyan-600"
    },
    { 
      name: "Electrical", 
      icon: <Lightbulb className="w-6 h-6" />, 
      providers: 120,
      rating: 4.9,
      color: "text-yellow-600",
      gradient: "from-yellow-500 to-amber-500",
      bgGradient: "from-yellow-50 to-amber-50",
      darkGradient: "from-yellow-600 to-amber-600"
    },
    { 
      name: "Cleaning", 
      icon: <Sparkles className="w-6 h-6" />, 
      providers: 200,
      rating: 4.7,
      color: "text-teal-600",
      gradient: "from-teal-500 to-emerald-500",
      bgGradient: "from-teal-50 to-emerald-50",
      darkGradient: "from-teal-600 to-emerald-600"
    },
    { 
      name: "Gardening", 
      icon: <Sprout className="w-6 h-6" />, 
      providers: 80,
      rating: 4.6,
      color: "text-green-600",
      gradient: "from-green-500 to-lime-500",
      bgGradient: "from-green-50 to-lime-50",
      darkGradient: "from-green-600 to-lime-600"
    },
    { 
      name: "Painting", 
      icon: <Palette className="w-6 h-6" />, 
      providers: 95,
      rating: 4.8,
      color: "text-purple-600",
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50",
      darkGradient: "from-purple-600 to-pink-600"
    },
    { 
      name: "Carpentry", 
      icon: <Drill className="w-6 h-6" />, 
      providers: 110,
      rating: 4.9,
      color: "text-amber-600",
      gradient: "from-amber-500 to-orange-500",
      bgGradient: "from-amber-50 to-orange-50",
      darkGradient: "from-amber-600 to-orange-600"
    },
  ];

  return (
    <section className="position-relative py-5 overflow-hidden bg-white">
      {/* Clean, Subtle Background */}
      <div className="position-absolute top-0 start-0 w-100 h-100 pointer-events-none">
        {/* Very subtle gradient overlay */}
        <div 
          className="position-absolute top-0 start-0 w-100 h-100 bg-gradient-to-br from-gray-50 to-white opacity-70"
        />
        
        {/* Minimal decorative elements */}
        <div className="position-absolute top-10 end-10 w-4 h-4 bg-blue-100 rounded-full opacity-40" />
        <div className="position-absolute bottom-20 start-10 w-3 h-3 bg-green-100 rounded-full opacity-30" />
        <div className="position-absolute top-1/3 start-1/4 w-2 h-2 bg-purple-100 rounded-full opacity-25" />
        
        {/* Subtle grid lines */}
        <div 
          className="position-absolute top-0 start-0 w-100 h-100 opacity-3"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <div className="container position-relative z-1">
        {/* Section Header */}
        <div className="text-center mb-5">
          <div className="d-inline-flex align-items-center gap-2 mb-3">
            <div className="w-4 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
              Featured Services
            </span>
            <div className="w-4 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" />
          </div>
          <h2 className="fw-bold display-5 mb-3 text-gray-900">
            Popular <span className="text-gradient">Services</span>
          </h2>
          <p className="text-muted fs-5 mx-auto" style={{ maxWidth: '600px' }}>
            Discover our most trusted service categories with verified professionals ready to help
          </p>
        </div>

        {/* Services Grid */}
        <div className="row g-4 justify-content-center">
          {services.map((service, index) => (
            <div key={index} className="col-6 col-md-4 col-lg-2">
              <div 
                className="card h-100 border-0 position-relative overflow-hidden transition-all duration-500 popular-service-card"
                style={{ 
                  minHeight: "240px",
                  background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)",
                  backdropFilter: "blur(10px)",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
                  border: "1px solid rgba(255,255,255,0.6)",
                  transform: hoveredCard === index ? "translateY(-12px) scale(1.02)" : "translateY(0) scale(1)"
                }}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Gradient Overlay on Hover */}
                <div 
                  className={`position-absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 transition-all duration-500 rounded-2xl ${
                    hoveredCard === index ? 'opacity-5' : ''
                  }`}
                />

                {/* Animated Border */}
                <div 
                  className={`position-absolute inset-0 bg-gradient-to-r ${service.gradient} opacity-0 transition-all duration-500 rounded-2xl border-animation ${
                    hoveredCard === index ? 'opacity-100' : ''
                  }`}
                  style={{
                    padding: '2px',
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude'
                  }}
                />

                <div className="card-body text-center p-4 d-flex flex-column justify-content-between position-relative z-1">
                  {/* Icon Section */}
                  <div className="flex-grow-1 d-flex flex-column justify-content-center">
                    <div 
                      className={`mx-auto rounded-2xl d-flex align-items-center justify-content-center mb-4 transition-all duration-500 ${
                        hoveredCard === index ? 'scale-110 rotate-6' : ''
                      }`}
                      style={{
                        width: "70px",
                        height: "70px",
                        background: hoveredCard === index 
                          ? `linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to))`
                          : "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)",
                        boxShadow: hoveredCard === index 
                          ? "0 8px 32px rgba(0,0,0,0.15), inset 0 1px 1px rgba(255,255,255,0.8)"
                          : "0 4px 20px rgba(0,0,0,0.08), inset 0 1px 1px rgba(255,255,255,0.8)",
                        border: "1px solid rgba(255,255,255,0.4)"
                      }}
                    >
                      <div 
                        className={`transition-all duration-500 ${
                          hoveredCard === index ? 'scale-110 text-white' : service.color
                        }`}
                      >
                        {service.icon}
                      </div>
                    </div>

                    {/* Content */}
                    <h5 
                      className="card-title fw-semibold mb-2 transition-colors duration-300"
                      style={{ 
                        fontSize: "1rem",
                        color: hoveredCard === index ? '#1f2937' : '#374151'
                      }}
                    >
                      {service.name}
                    </h5>
                    
                    {/* Rating */}
                    <div className="d-flex align-items-center justify-content-center gap-1 mb-2">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <small className="fw-semibold text-gray-700">{service.rating}</small>
                    </div>

                    <p 
                      className="card-text small transition-colors duration-300 mb-3"
                      style={{
                        color: hoveredCard === index ? '#6b7280' : '#9ca3af'
                      }}
                    >
                      {service.providers}+ providers
                    </p>
                  </div>

                  {/* CTA Button */}
                  <div className="mt-auto">
                    <button 
                      className={`btn btn-sm w-100 border-0 transition-all duration-300 ${
                        hoveredCard === index 
                          ? `bg-gradient-to-r ${service.gradient} text-white shadow-lg` 
                          : 'bg-gray-100 text-gray-600'
                      }`}
                      style={{
                        fontSize: '0.75rem',
                        borderRadius: '12px',
                        padding: '8px 12px'
                      }}
                    >
                      <span className="d-flex align-items-center justify-content-center gap-1">
                        Explore
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </button>
                  </div>
                </div>

                {/* Floating particles */}
                {isMounted && hoveredCard === index && (
                  <div className="position-absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute rounded-full opacity-0 animate-float-particle"
                        style={{
                          width: '8px',
                          height: '8px',
                          background: `linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.4) 100%)`,
                          top: `${20 + i * 30}%`,
                          left: `${20 + i * 20}%`,
                          animationDelay: `${i * 0.3}s`,
                          animationDuration: '3s'
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-5 pt-3">
          <div className="position-relative d-inline-block">
            <ServicesButton />
          </div>
          <p className="text-muted small mt-3">
            Join thousands of satisfied customers
          </p>
        </div>
      </div>

      {/* Enhanced CSS Styles */}
      <style jsx global>{`
        @keyframes float-particle {
          0% { transform: translateY(0px) rotate(0deg); opacity: 0; }
          50% { transform: translateY(-15px) rotate(180deg); opacity: 1; }
          100% { transform: translateY(-30px) rotate(360deg); opacity: 0; }
        }
        
        .animate-float-particle { animation: float-particle 3s ease-in-out infinite; }
        
        .text-gradient {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .popular-service-card {
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .popular-service-card:hover {
          box-shadow: 0 20px 40px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.06) !important;
        }
        
        .border-animation {
          animation: borderPulse 2s ease-in-out infinite;
        }
        
        @keyframes borderPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </section>
  );
}