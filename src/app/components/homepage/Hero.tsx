"use client";
import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, TrendingUp, Users, Star, Shield, Clock, CheckCircle } from "lucide-react";
import { categoriesService } from "../../services/categories";

export default function HeroSection() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoriesService.getCategories();
      // Take top 5 categories for suggestions
      setCategories(data.slice(0, 5));
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Navigate to servicemen page with search query
      router.push(`/servicemen?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const features = [
    { icon: <Shield className="w-5 h-5" />, text: "Verified Professionals" },
    { icon: <Clock className="w-5 h-5" />, text: "Quick Response" },
    { icon: <CheckCircle className="w-5 h-5" />, text: "Quality Guaranteed" },
  ];

  return (
    <section className="position-relative min-vh-100 d-flex align-items-center justify-content-center overflow-hidden bg-white">
      {/* Enhanced Background */}
      <div className="position-absolute top-0 start-0 w-100 h-100 pointer-events-none">
        {/* Main gradient background */}
        <div className="position-absolute top-0 start-0 w-100 h-100 bg-gradient-to-br from-blue-50 via-white to-emerald-50" />
        
        {/* Subtle geometric patterns */}
        <div className="position-absolute top-0 start-0 w-100 h-100 opacity-5">
          <div className="position-absolute top-10 start-10 w-32 h-32 border-2 border-blue-200 rounded-full" />
          <div className="position-absolute bottom-20 end-20 w-24 h-24 border-2 border-emerald-200 rounded-full" />
          <div className="position-absolute top-1/3 end-1/4 w-16 h-16 border-2 border-blue-200 rounded-full" />
        </div>

        {/* Subtle gradient orbs */}
        <div className="position-absolute top-10 end-10 w-64 h-64 bg-blue-100 rounded-full opacity-20 blur-3xl" />
        <div className="position-absolute bottom-10 start-10 w-48 h-48 bg-emerald-100 rounded-full opacity-30 blur-3xl" />
        <div className="position-absolute top-1/2 start-1/2 w-32 h-32 bg-purple-100 rounded-full opacity-20 blur-2xl" />
      </div>

      {/* Content */}
      <div className="container position-relative text-center">
        {/* Headline */}
        <div className="mb-5">
          <div className="d-inline-flex align-items-center gap-2 mb-4 px-3 py-2 bg-blue-50 rounded-pill border border-blue-100">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-blue-600 text-sm fw-semibold">
              Trusted by 50,000+ Customers
            </span>
          </div>
          
          <h1 className="display-4 fw-bold mb-4 text-gray-900">
            Find Your Perfect
            <span className="d-block text-gradient mt-2">Service Professional</span>
          </h1>

          {/* Subtitle */}
          <p
            className="lead text-gray-600 mb-5 mx-auto fs-5"
            style={{ maxWidth: "600px", lineHeight: "1.6" }}
          >
            Connect with verified experts for all your home and business needs. 
            Quality service guaranteed, with professionals ready to help.
          </p>
        </div>

        {/* Enhanced Search Bar */}
        <div
          className={`mx-auto mb-6 transition-all duration-300 ${
            isSearchFocused ? "scale-105" : ""
          }`}
          style={{ maxWidth: "600px" }}
        >
          <div className="position-relative">
            <div className="input-group input-group-lg shadow-lg rounded-pill overflow-hidden border-0">
              <span className="input-group-text bg-white border-0 ps-4">
                <Search className="text-gray-400" size={20} />
              </span>
              <input
                type="text"
                className="form-control border-0 ps-0 fs-6"
                placeholder="What service do you need? (e.g., plumber, electrician, cleaner)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
                style={{ 
                  height: "60px",
                  background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)"
                }}
              />
              <button
                onClick={handleSearch}
                className="btn btn-primary px-4 fw-semibold border-0"
                style={{ 
                  background: "linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)",
                  minWidth: "120px"
                }}
                disabled={!searchQuery.trim()}
              >
                Search
              </button>
            </div>
            
            {/* Search suggestions */}
            {isSearchFocused && categories.length > 0 && (
              <div className="position-absolute top-100 start-0 end-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-10">
                <div className="text-start px-3">
                  <div className="text-xs text-gray-500 fw-semibold mb-2 px-3">POPULAR SERVICES</div>
                  {categories.map((category) => (
                    <div 
                      key={category.id}
                      className="px-3 py-2 hover-bg-gray-50 rounded cursor-pointer d-flex align-items-center gap-2"
                      onMouseDown={(e) => {
                        e.preventDefault(); // Prevent blur from firing
                        setSearchQuery(category.name);
                        // Small delay to let the state update, then search
                        setTimeout(() => {
                          router.push(`/servicemen?search=${encodeURIComponent(category.name)}`);
                        }, 100);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <Search className="text-gray-400" size={16} />
                      <span className="text-gray-700">{category.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="d-flex flex-column flex-sm-row justify-content-center gap-3 mb-5">
          <Link 
            href="/categories" 
            className="btn btn-primary btn-lg px-5 py-3 fw-semibold rounded-pill shadow-lg hover-lift"
            style={{ 
              background: "linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)",
              border: "none",
              minWidth: "180px"
            }}
          >
            Book a Service
          </Link>
          <Link 
            href="/auth/register/serviceman" 
            className="btn btn-outline-primary btn-lg px-5 py-3 fw-semibold rounded-pill border-2 hover-lift"
            style={{ minWidth: "180px" }}
          >
            Become a Provider
          </Link>
        </div>

        {/* Trust Indicators - Moved below CTA */}
        <div className="d-flex justify-content-center gap-3 flex-wrap mt-4">
          <div className="d-flex align-items-center gap-2 px-3 py-2 bg-white bg-opacity-80 rounded-pill border border-gray-200">
            <Shield size={18} className="text-blue-600" />
            <span className="text-gray-700" style={{ fontSize: '0.85rem' }}>Verified</span>
          </div>
          <div className="d-flex align-items-center gap-2 px-3 py-2 bg-white bg-opacity-80 rounded-pill border border-gray-200">
            <Clock size={18} className="text-emerald-600" />
            <span className="text-gray-700" style={{ fontSize: '0.85rem' }}>Fast Response</span>
          </div>
          <div className="d-flex align-items-center gap-2 px-3 py-2 bg-white bg-opacity-80 rounded-pill border border-gray-200">
            <CheckCircle size={18} className="text-amber-600" />
            <span className="text-gray-700" style={{ fontSize: '0.85rem' }}>Quality Guaranteed</span>
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
        
        .hover-bg-gray-50:hover {
          background-color: #f9fafb;
        }
        
        .hover-lift {
          transition: all 0.3s ease;
        }
        
        .hover-lift:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 25px rgba(0,0,0,0.15);
        }
        
        .blur-2xl {
          filter: blur(40px);
        }
        
        .blur-3xl {
          filter: blur(60px);
        }
        
        /* Smooth focus states */
        .form-control:focus {
          box-shadow: none;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
        }
        
        /* Custom scrollbar for suggestions */
        .suggestions-container {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 #f1f5f9;
        }
        
        .suggestions-container::-webkit-scrollbar {
          width: 6px;
        }
        
        .suggestions-container::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }
        
        .suggestions-container::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
      `}</style>
    </section>
  );
}