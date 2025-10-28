"use client";
import Nav from "./components/common/Nav";
import Footer from "./components/common/Footer";
import Hero from "./components/homepage/Hero";
import PopularServices from "./components/homepage/PopularServices";
import Features from "./components/homepage/Features";
import HowItWorks from "./components/homepage/HowItWorks";

export default function HomePage() {
  return (
    <div className="min-h-screen position-relative overflow-hidden bg-slate-50">
      {/* Modern Animated Geometric Background */}
      <div
        className="position-fixed w-full h-full overflow-hidden pointer-events-none"
        style={{ zIndex: 0, top: 0, left: 0 }}
      >
        {/* Base Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 opacity-80" />
        
        {/* Animated Grid System */}
        <div className="absolute inset-0 opacity-20">
          <svg
            className="w-full h-full animate-pulse-slow"
            viewBox="0 0 1200 800"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="hexGrid"
                patternUnits="userSpaceOnUse"
                width="100"
                height="86.6"
                patternTransform="rotate(0)"
              >
                <path
                  d="M50,0 L100,25 L100,75 L50,100 L0,75 L0,25 Z"
                  fill="none"
                  stroke="#64748b"
                  strokeWidth="0.3"
                  opacity="0.4"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hexGrid)" />
          </svg>
        </div>

        {/* Floating Geometric Orbs */}
        <div className="absolute top-1/4 -left-10 w-60 h-60 opacity-30 animate-float-slow">
          <div className="w-full h-full bg-gradient-to-r from-blue-200 to-purple-200 rounded-full blur-xl" />
        </div>

        <div className="absolute bottom-1/3 -right-16 w-80 h-80 opacity-20 animate-float-slower">
          <div className="w-full h-full bg-gradient-to-r from-cyan-200 to-blue-200 rounded-full blur-2xl" />
        </div>

        <div className="absolute top-1/2 left-1/3 w-40 h-40 opacity-25 animate-float-delayed">
          <div className="w-full h-full bg-gradient-to-r from-indigo-200 to-violet-200 rounded-full blur-lg" />
        </div>

        {/* Dynamic Line Network */}
        <div className="absolute inset-0 opacity-15">
          <svg
            className="w-full h-full"
            viewBox="0 0 1200 800"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
                <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.5" />
              </linearGradient>
            </defs>
            {/* Main connection lines */}
            <path
              d="M200,100 C400,150 600,50 800,200 C1000,350 1000,500 900,650"
              stroke="url(#lineGradient)"
              strokeWidth="1.5"
              fill="none"
              opacity="0.6"
            />
            <path
              d="M100,300 C300,200 500,400 700,300 C900,200 1100,400 1000,600"
              stroke="url(#lineGradient)"
              strokeWidth="1"
              fill="none"
              opacity="0.4"
            />
            {/* Intersection nodes */}
            <circle cx="400" cy="150" r="3" fill="#3b82f6" opacity="0.6" />
            <circle cx="700" cy="300" r="3" fill="#8b5cf6" opacity="0.6" />
            <circle cx="900" cy="450" r="3" fill="#06b6d4" opacity="0.6" />
          </svg>
        </div>

        {/* Subtle Pattern Overlay */}
        <div className="absolute inset-0 opacity-5">
          <svg
            className="w-full h-full"
            viewBox="0 0 1200 800"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="dotPattern"
                patternUnits="userSpaceOnUse"
                width="20"
                height="20"
              >
                <circle cx="10" cy="10" r="0.5" fill="#64748b" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dotPattern)" />
          </svg>
        </div>

        {/* Corner Accents */}
        <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <path
              d="M0,0 L200,0 L200,200 Z"
              fill="url(#lineGradient)"
              opacity="0.3"
            />
          </svg>
        </div>

        <div className="absolute bottom-0 left-0 w-48 h-48 opacity-10">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <path
              d="M0,200 L0,0 L200,200 Z"
              fill="url(#lineGradient)"
              opacity="0.3"
            />
          </svg>
        </div>

        {/* Animated Scan Lines */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full bg-repeat-y bg-scroll"
            style={{
              backgroundImage: `linear-gradient(to bottom, transparent 50%, rgba(100, 116, 139, 0.1) 50%)`,
              backgroundSize: '100% 4px',
              animation: 'scan 8s linear infinite'
            }}
          />
        </div>
      </div>

      {/* Main content */}
      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Fixed Nav */}
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          zIndex: 1000,
          backgroundColor: 'white' 
        }}>
          <Nav />
        </div>
        
        <div style={{ paddingTop: '70px' }}> 
          <Hero />
          <PopularServices />
          <Features />
          <HowItWorks />
          <Footer />
        </div>
      </div>

      {/* Global animations */}
      <style jsx global>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          33% { transform: translateY(-20px) translateX(10px); }
          66% { transform: translateY(10px) translateX(-10px); }
        }
        
        @keyframes float-slower {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-15px) translateX(-15px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-25px) translateX(5px); }
          75% { transform: translateY(5px) translateX(-25px); }
        }
        
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.3; }
        }
        
        .animate-float-slow {
          animation: float-slow 15s ease-in-out infinite;
        }
        
        .animate-float-slower {
          animation: float-slower 20s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 18s ease-in-out infinite;
          animation-delay: 2s;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}