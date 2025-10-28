"use client";

import React from "react";
import type { Category } from "../../services/categories";

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const { id, name, description, icon_url, is_active } = category;

  return (
    <div className="card h-100 shadow-sm border-0 hover-effect">
      <a 
        href={`/categories/${id}/servicemen`} 
        className="text-decoration-none text-reset d-block h-100"
        style={{ transition: 'all 0.3s ease' }}
      >
        <div className="card-body d-flex flex-column p-4">
          {/* Header with Icon and Status */}
          <div className="d-flex align-items-start mb-3">
            <div className="flex-shrink-0">
              {icon_url ? (
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center p-3"
                  style={{ 
                    width: 60, 
                    height: 60, 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white'
                  }}
                >
                  <img 
                    src={icon_url} 
                    alt={name} 
                    width={24} 
                    height={24} 
                    className="filter-white"
                    style={{ filter: 'brightness(0) invert(1)' }}
                  />
                </div>
              ) : (
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center p-3"
                  style={{ 
                    width: 60, 
                    height: 60, 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1.2rem'
                  }}
                >
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            <div className="flex-grow-1 ms-3">
              <div className="d-flex align-items-center justify-content-between">
                <h5 className="mb-1 fw-bold text-dark">{name}</h5>
                <span className={`badge ${is_active ? 'bg-success' : 'bg-secondary'} rounded-pill`}>
                  {is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <small className="text-muted">
                {is_active ? 'Available for booking' : 'Temporarily unavailable'}
              </small>
            </div>
          </div>

          {/* Description */}
          <p className="text-muted flex-grow-1" style={{ fontSize: "0.95rem", lineHeight: "1.5" }}>
            {description || `Explore professional ${name.toLowerCase()} services`}
          </p>

          {/* Footer with CTA */}
          <div className="mt-auto pt-3">
            <div className="d-flex align-items-center justify-content-between">
              <span className="text-primary fw-medium" style={{ fontSize: "0.9rem" }}>
                View Services
              </span>
              <div 
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{ 
                  width: 32, 
                  height: 32, 
                  background: '#f8f9fa',
                  transition: 'all 0.3s ease'
                }}
              >
                <i className="bi bi-arrow-right-short text-primary"></i>
              </div>
            </div>
          </div>
        </div>
      </a>

      <style jsx>{`
        .hover-effect:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
          border-color: #667eea !important;
        }
        .hover-effect {
          transition: all 0.3s ease;
          border: 1px solid #e9ecef;
        }
        .hover-effect:hover .text-primary {
          color: #667eea !important;
        }
      `}</style>
    </div>
  );
}