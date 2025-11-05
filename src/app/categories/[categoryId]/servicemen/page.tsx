"use client";

import React, { useEffect, useMemo, useState } from "react";
import { categoriesService } from "../../../services/categories";
import type { ServicemanProfile } from "../../../types/api";
import ServicemanListItem from "../../../components/servicemen/ServicemanListItem";
import Nav from "../../../components/common/Nav";
import SecondFooter from "../../../components/common/SecondFooter";

interface PageProps {
  params: Promise<{ categoryId: string }>;
}

export default function CategoryServicemenPage({ params }: PageProps) {
  const { categoryId } = React.use(params);
  const numericId = Number(categoryId);

  const [servicemen, setServicemen] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"rating" | "jobs" | "years">("rating");
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await categoriesService.getServicemenByCategory(numericId);
        console.log('📥 Category servicemen data:', data);
        
        // Check if data has servicemen array (new API structure)
        if (data && typeof data === 'object' && 'servicemen' in data) {
          console.log('✅ Using new API structure with servicemen array');
          if (isMounted) {
            setServicemen(data.servicemen || []);
            setCategoryData(data);
          }
        } else if (Array.isArray(data)) {
          // Old structure - direct array
          console.log('✅ Using old API structure - direct array');
          if (isMounted) setServicemen(data);
        } else {
          console.error('❌ Unexpected data structure:', data);
          if (isMounted) setServicemen([]);
        }
      } catch (e: any) {
        console.error('❌ Failed to load servicemen:', e);
        if (isMounted) setError(e?.message || "Failed to load servicemen");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    if (!Number.isNaN(numericId)) load();
    return () => {
      isMounted = false;
    };
  }, [numericId]);

  const filtered = useMemo(() => {
    if (!Array.isArray(servicemen)) {
      console.warn('⚠️ servicemen is not an array:', typeof servicemen);
      return [];
    }
    
    const q = query.trim().toLowerCase();
    return servicemen
      .filter((s: any) =>
        !q ||
        (s.full_name && s.full_name.toLowerCase().includes(q)) ||
        (s.username && s.username.toLowerCase().includes(q)) ||
        (s.bio && s.bio.toLowerCase().includes(q))
      )
      .sort((a: any, b: any) => {
        if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
        if (sortBy === "jobs")
          return (b.total_jobs_completed || 0) - (a.total_jobs_completed || 0);
        return (b.years_of_experience || 0) - (a.years_of_experience || 0);
      });
  }, [servicemen, query, sortBy]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!Array.isArray(servicemen)) {
      return { totalServicemen: 0, averageRating: 0, topRated: null };
    }
    
    const totalServicemen = servicemen.length;
    const averageRating = servicemen.length > 0 
      ? servicemen.reduce((sum: number, s: any) => sum + (s.rating || 0), 0) / servicemen.length 
      : 0;
    const topRated = servicemen.length > 0 
      ? servicemen.reduce((max: any, s: any) => (s.rating || 0) > (max.rating || 0) ? s : max, servicemen[0])
      : null;

    return { totalServicemen, averageRating, topRated };
  }, [servicemen]);

  // Add Bootstrap Icons
  React.useEffect(() => {
    if (!document.querySelector('link[href*="bootstrap-icons"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css';
      document.head.appendChild(link);
    }
  }, []);

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
          backdropFilter: 'blur(10px)'
        }}
      >
        <Nav />
      </div>

      {/* Main Content */}
      <div className="container py-4" style={{ marginTop: '80px', marginBottom: '80px' }}>
        
        {/* Header Section */}
        <div className="row align-items-center mb-5">
          <div className="col-12 col-md-6">
            <nav aria-label="breadcrumb" className="mb-3">
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <a href="/categories" className="text-decoration-none text-primary">
                    <i className="bi bi-arrow-left me-2"></i>
                    Categories
                  </a>
                </li>
                <li className="breadcrumb-item active text-dark" aria-current="page">
                  Servicemen
                </li>
              </ol>
            </nav>
            <h1 className="display-6 fw-bold text-dark mb-2">
              Professional Servicemen
            </h1>
            <p className="text-muted mb-0 fs-5">
              Find qualified professionals for your needs
            </p>
          </div>
          <div className="col-12 col-md-6 mt-4 mt-md-0">
            <div className="d-flex flex-column flex-md-row gap-3 align-items-start align-items-md-center justify-content-md-end">
              
              {/* Search Input */}
              <div className="flex-grow-1 w-100" style={{ maxWidth: '400px' }}>
                <div className={`input-group input-group-lg ${searchFocused ? 'shadow' : ''}`} style={{ transition: 'all 0.3s ease' }}>
                  <span className="input-group-text bg-white border-end-0">
                    <i className="bi bi-search text-muted"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 border-end-0"
                    placeholder="Search by name or specialty..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    style={{ borderColor: '#dee2e6' }}
                  />
                  {query && (
                    <button
                      className="input-group-text bg-white border-start-0 text-muted"
                      onClick={() => setQuery('')}
                      style={{ borderColor: '#dee2e6' }}
                    >
                      <i className="bi bi-x"></i>
                    </button>
                  )}
                </div>
              </div>

              {/* Sort Dropdown */}
              <div className="flex-shrink-0">
                <div className="input-group input-group-lg">
                  <span className="input-group-text bg-white border-end-0">
                    <i className="bi bi-sort-down text-muted"></i>
                  </span>
                  <select
                    className="form-select border-start-0"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    style={{ minWidth: '180px', borderColor: '#dee2e6' }}
                  >
                    <option value="rating">Top Rated</option>
                    <option value="jobs">Most Jobs</option>
                    <option value="years">Most Experience</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        {!loading && !error && servicemen.length > 0 && (
          <div className="row mb-4">
            <div className="col-12">
              <div className="d-flex gap-4 flex-wrap">
                <div className="d-flex align-items-center bg-white p-3 rounded border">
                  <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-3">
                    <i className="bi bi-people text-primary"></i>
                  </div>
                  <div>
                    <div className="fw-bold text-dark fs-5">{stats.totalServicemen}</div>
                    <small className="text-muted">Available Professionals</small>
                  </div>
                </div>
                <div className="d-flex align-items-center bg-white p-3 rounded border">
                  <div className="rounded-circle bg-warning bg-opacity-10 p-2 me-3">
                    <i className="bi bi-star text-warning"></i>
                  </div>
                  <div>
                    <div className="fw-bold text-dark fs-5">{stats.averageRating.toFixed(1)}</div>
                    <small className="text-muted">Average Rating</small>
                  </div>
                </div>
                {stats.topRated && (
                  <div className="d-flex align-items-center bg-white p-3 rounded border">
                    <div className="rounded-circle bg-success bg-opacity-10 p-2 me-3">
                      <i className="bi bi-trophy text-success"></i>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div className="fw-bold text-dark fs-6 text-truncate" style={{ maxWidth: '150px' }}>
                        {stats.topRated.full_name}
                      </div>
                      <small className="text-muted">Top Rated ({stats.topRated.rating.toFixed(1)})</small>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <h5 className="text-dark mb-2">Finding Professionals</h5>
            <p className="text-muted">Loading the best servicemen for you...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="alert alert-danger d-flex align-items-center border-0 shadow-sm" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-3 fs-4"></i>
            <div className="flex-grow-1">
              <h6 className="alert-heading mb-1">Unable to Load Servicemen</h6>
              <div className="mb-0">{error}</div>
            </div>
            <button 
              className="btn btn-outline-danger btn-sm ms-3"
              onClick={() => window.location.reload()}
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              Try Again
            </button>
          </div>
        )}

        {/* Servicemen Grid */}
        {!loading && !error && (
          <div className="row g-4">
            {filtered.length === 0 ? (
              <div className="col-12">
                <div className="text-center py-5 bg-white rounded border">
                  <i className="bi bi-search display-1 text-muted opacity-50"></i>
                  <h4 className="mt-4 text-dark">No professionals found</h4>
                  <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '400px' }}>
                    {query 
                      ? "We couldn't find any professionals matching your search. Try adjusting your keywords." 
                      : "No servicemen are currently available in this category."}
                  </p>
                  {query && (
                    <button 
                      className="btn btn-primary px-4"
                      onClick={() => setQuery('')}
                    >
                      <i className="bi bi-arrow-counterclockwise me-2"></i>
                      Clear Search
                    </button>
                  )}
                </div>
              </div>
            ) : (
              filtered.map((s) => (
                <div key={s.id} className="col-12 col-sm-6 col-xl-4">
                  <ServicemanListItem serviceman={s} />
                </div>
              ))
            )}
          </div>
        )}

        {/* Results Count */}
        {!loading && !error && filtered.length > 0 && (
          <div className="row mt-4">
            <div className="col-12">
              <div className="text-center text-muted">
                Showing <strong>{filtered.length}</strong> of <strong>{servicemen.length}</strong> professionals
                {query && (
                  <span> for "<strong>{query}</strong>"</span>
                )}
              </div>
            </div>
          </div>
        )}
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
          boxShadow: '0 -2px 20px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <SecondFooter />
      </div>
    </div>
  );
}