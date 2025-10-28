"use client";

import React, { useEffect, useMemo, useState } from "react";
import { categoriesService, type Category } from "../services/categories";
import CategoryCard from "../components/categories/CategoryCard";
import Nav from "../components/common/Nav";
import SecondFooter from "../components/common/SecondFooter";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [activeOnly, setActiveOnly] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await categoriesService.getCategories();
        if (isMounted) setCategories(data);
      } catch (e: any) {
        if (isMounted) setError(e?.message || "Failed to load categories");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return categories.filter(c => {
      const matchesQ = !q || c.name.toLowerCase().includes(q) || (c.description || "").toLowerCase().includes(q);
      const matchesActive = !activeOnly || c.is_active;
      return matchesQ && matchesActive;
    });
  }, [categories, query, activeOnly]);

  // Add Bootstrap Ions CDN in your layout or _document.tsx
  React.useEffect(() => {
    // Add Bootstrap Icons if not already included
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
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        zIndex: 1000,
        backgroundColor: 'white',
        boxShadow: '0 2px 20px rgba(0,0,0,0.1)',
        backdropFilter: 'blur(10px)'
      }}>
        <Nav />
      </div>
      
      {/* Main Content */}
      <div className="container py-4" style={{ marginTop: '80px', marginBottom: '80px' }}>
        {/* Header Section */}
        <div className="row align-items-center mb-5">
          <div className="col-12 col-md-6">
            <h1 className="display-6 fw-bold text-dark mb-2">Service Categories</h1>
            <p className="text-muted mb-0 fs-5">
              Discover professional services tailored to your needs
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
                    placeholder="Search categories..."
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

              {/* Active Only Toggle */}
              <div className="form-check form-switch bg-white p-3 rounded border">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="activeOnly"
                  checked={activeOnly}
                  onChange={(e) => setActiveOnly(e.target.checked)}
                  style={{ width: '2.5em', height: '1.25em' }}
                />
                <label className="form-check-label fw-medium text-dark" htmlFor="activeOnly">
                  Show Active Only
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex gap-4 flex-wrap">
              <div className="d-flex align-items-center bg-white p-3 rounded border">
                <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-3">
                  <i className="bi bi-grid-3x3 text-primary"></i>
                </div>
                <div>
                  <div className="fw-bold text-dark fs-5">{categories.length}</div>
                  <small className="text-muted">Total Categories</small>
                </div>
              </div>
              <div className="d-flex align-items-center bg-white p-3 rounded border">
                <div className="rounded-circle bg-success bg-opacity-10 p-2 me-3">
                  <i className="bi bi-check-circle text-success"></i>
                </div>
                <div>
                  <div className="fw-bold text-dark fs-5">
                    {categories.filter(c => c.is_active).length}
                  </div>
                  <small className="text-muted">Active Now</small>
                </div>
              </div>
              <div className="d-flex align-items-center bg-white p-3 rounded border">
                <div className="rounded-circle bg-info bg-opacity-10 p-2 me-3">
                  <i className="bi bi-eye text-info"></i>
                </div>
                <div>
                  <div className="fw-bold text-dark fs-5">{filtered.length}</div>
                  <small className="text-muted">Currently Showing</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <h5 className="text-dark mb-2">Loading Categories</h5>
            <p className="text-muted">Discovering amazing services for you...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="alert alert-danger d-flex align-items-center border-0 shadow-sm" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-3 fs-4"></i>
            <div className="flex-grow-1">
              <h6 className="alert-heading mb-1">Unable to Load Categories</h6>
              <div className="mb-0">{error}</div>
            </div>
            <button 
              className="btn btn-outline-danger btn-sm ms-3"
              onClick={() => window.location.reload()}
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              Retry
            </button>
          </div>
        )}

        {/* Categories Grid */}
        {!loading && !error && (
          <div className="row g-4">
            {filtered.length === 0 ? (
              <div className="col-12">
                <div className="text-center py-5 bg-white rounded border">
                  <i className="bi bi-search display-1 text-muted opacity-50"></i>
                  <h4 className="mt-4 text-dark">No categories found</h4>
                  <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '400px' }}>
                    {query || activeOnly 
                      ? "We couldn't find any categories matching your criteria. Try adjusting your search or filters." 
                      : "No categories are currently available. Please check back later."}
                  </p>
                  {(query || activeOnly) && (
                    <button 
                      className="btn btn-primary px-4"
                      onClick={() => {
                        setQuery('');
                        setActiveOnly(false);
                      }}
                    >
                      <i className="bi bi-arrow-counterclockwise me-2"></i>
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
            ) : (
              filtered.map((cat) => (
                <div key={cat.id} className="col-12 col-sm-6 col-xl-4">
                  <CategoryCard category={cat} />
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Fixed Footer */}
      <div style={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        zIndex: 1000,
        backgroundColor: 'white',
        boxShadow: '0 -2px 20px rgba(0,0,0,0.1)',
        backdropFilter: 'blur(10px)'
      }}>
        <SecondFooter />
      </div>
    </div>
  );
}