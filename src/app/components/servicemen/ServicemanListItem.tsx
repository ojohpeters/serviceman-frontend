"use client";

import React from "react";
import type { ServicemanProfile } from "../../types/api";
import { useRouter } from "next/navigation";

interface Props {
  serviceman: ServicemanProfile;
}

export default function ServicemanListItem({ serviceman }: Props) {
  const router = useRouter();
  
  // Extract user details - handle both flattened structure (from category endpoint) and nested structure
  const user = typeof serviceman.user === 'object' ? serviceman.user : null;
  
  // For flattened structure (category endpoint), use serviceman.id directly
  // For nested structure, extract from user object
  const userId = (serviceman as any).user_id || // Check for user_id field first
                 (serviceman as any).id || // Then check for direct id
                 (typeof serviceman.user === 'object' ? serviceman.user.id : serviceman.user);
  
  const full_name = (serviceman as any).full_name || // Flattened structure
                    (user as any)?.full_name || // Nested structure
                    (user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : '') ||
                    (serviceman as any).username || // Flattened structure
                    user?.username || // Nested structure
                    'Service Professional';
  
  const rating = parseFloat(serviceman.rating) || 0;
  const total_jobs_completed = serviceman.total_jobs_completed || 0;
  const years_of_experience = serviceman.years_of_experience || 0;
  const bio = serviceman.bio || '';

  const handleCardClick = () => {
    console.log('🔍 Serviceman data:', { serviceman, userId, full_name });
    router.push(`/servicemen/${userId}`);
  };

  // Generate a color based on rating
  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "success";
    if (rating >= 4.0) return "primary";
    if (rating >= 3.5) return "warning";
    return "secondary";
  };

  // Generate star icons based on rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={i} className="bi bi-star-fill text-warning"></i>);
    }
    
    if (hasHalfStar) {
      stars.push(<i key="half" className="bi bi-star-half text-warning"></i>);
    }
    
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className="bi bi-star text-warning"></i>);
    }
    
    return stars;
  };

  // Safe years of experience display
  const displayYears = years_of_experience ?? 0;
  const isExperienced = displayYears >= 5;

  return (
    <div 
      className="card h-100 shadow-sm border-0 hover-effect serviceman-card"
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="card-body d-flex flex-column p-4">
        {/* Header with Profile and Basic Info */}
        <div className="d-flex align-items-start mb-3">
          {/* Profile Picture Placeholder */}
          <div className="flex-shrink-0">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{ 
                width: 64, 
                height: 64, 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontWeight: 700,
                fontSize: '1.25rem',
                border: '3px solid #f8f9fa'
              }}
            >
              {full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
            </div>
          </div>

          {/* Name and Rating */}
          <div className="flex-grow-1 ms-3" style={{ minWidth: 0 }}>
            <div className="d-flex align-items-center justify-content-between mb-1">
              <h5 className="mb-0 fw-bold text-dark text-truncate me-2" style={{ maxWidth: '200px' }}>
                {full_name}
              </h5>
              <span className={`badge bg-${getRatingColor(rating)} rounded-pill rating-badge flex-shrink-0`}>
                {rating.toFixed(1)} ★
              </span>
            </div>
            
            {/* Star Rating */}
            <div className="d-flex align-items-center mb-2">
              <div className="me-2">
                {renderStars(rating)}
              </div>
              <small className="text-muted">({rating.toFixed(1)})</small>
            </div>

            {/* Experience and Jobs */}
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <div className="d-flex align-items-center">
                <i className="bi bi-briefcase me-1 text-primary"></i>
                <small className="text-muted">
                  <strong className="text-dark">{displayYears}</strong> yrs exp
                </small>
              </div>
              <div className="d-flex align-items-center">
                <i className="bi bi-check-circle me-1 text-success"></i>
                <small className="text-muted">
                  <strong className="text-dark">{total_jobs_completed}</strong> jobs
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="mb-3 flex-grow-1">
          <p className="text-muted mb-0" style={{ fontSize: "0.95rem", lineHeight: "1.5" }}>
            {bio || `${full_name} is an experienced professional committed to delivering quality service.`}
          </p>
        </div>

        {/* Footer with Action Buttons */}
        <div className="mt-auto pt-3 border-top">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex gap-2">
              <span className="badge bg-light text-dark border">
                <i className="bi bi-award me-1 text-warning"></i>
                {rating >= 4.5 ? "Expert" : rating >= 4.0 ? "Pro" : "Professional"}
              </span>
              {isExperienced && (
                <span className="badge bg-light text-dark border">
                  <i className="bi bi-shield-check me-1 text-success"></i>
                  Experienced
                </span>
              )}
            </div>
            
            <span className="btn btn-outline-primary btn-sm rounded-pill px-3">
              View Profile
              <i className="bi bi-arrow-right ms-1"></i>
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hover-effect:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
          border-color: #667eea !important;
        }
        .hover-effect {
          transition: all 0.3s ease;
          border: 1px solid #e9ecef;
        }
        .serviceman-card:hover .btn-outline-primary {
          background-color: #667eea;
          border-color: #667eea;
          color: white;
        }
        .rating-badge {
          font-size: 0.75rem;
          padding: 0.35em 0.65em;
        }
      `}</style>
    </div>
  );
}