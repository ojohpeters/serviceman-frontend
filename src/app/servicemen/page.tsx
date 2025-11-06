'use client';
import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Nav from '../components/common/Nav';
import SecondFooter from '../components/common/SecondFooter';
import { useServicemen, useCategories } from '../hooks/useAPI';
import type { ServicemanProfile } from '../types/api';

function ServicemenContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { categories } = useCategories();
  const [filters, setFilters] = useState({
    category: undefined as number | undefined,
    is_available: undefined as boolean | undefined,
    min_rating: undefined as number | undefined,
    search: '',
    ordering: '-rating'
  });

  // Read search query from URL on mount
  useEffect(() => {
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      setFilters(prev => ({ ...prev, search: searchQuery }));
    }
  }, [searchParams]);

  // Fetch servicemen without search filter (let client-side handle search)
  const backendFilters = {
    category: filters.category,
    is_available: filters.is_available,
    min_rating: filters.min_rating,
    ordering: filters.ordering
  };

  const { servicemen: allServicemen, statistics, loading, error } = useServicemen(backendFilters);

  // Client-side filtering for partial search matching
  const servicemen = useMemo(() => {
    // If no search term, return all servicemen
    if (!filters.search) {
      return allServicemen;
    }

    // If no servicemen to filter, return empty array
    if (!allServicemen.length) {
      return [];
    }

    const searchLower = filters.search.toLowerCase().trim();
    
    return allServicemen.filter((serviceman: ServicemanProfile) => {
      // Extract user details
      const user = typeof serviceman.user === 'object' ? serviceman.user : null;
      const fullName = ((user as any)?.full_name || '').toLowerCase();
      const username = (user?.username || '').toLowerCase();
      const firstName = (user?.first_name || '').toLowerCase();
      const lastName = (user?.last_name || '').toLowerCase();
      
      // Extract category
      const categoryName = (typeof serviceman.category === 'object' && serviceman.category !== null)
        ? (serviceman.category.name || '').toLowerCase() 
        : '';
      
      // Extract skills
      const skillNames = (serviceman.skills || [])
        .map((skill: any) => typeof skill === 'object' ? (skill.name || '').toLowerCase() : '')
        .join(' ');
      
      const bio = (serviceman.bio || '').toLowerCase();

      // Check if search term is found in any field (partial match)
      return fullName.includes(searchLower) ||
             username.includes(searchLower) ||
             firstName.includes(searchLower) ||
             lastName.includes(searchLower) ||
             categoryName.includes(searchLower) ||
             skillNames.includes(searchLower) ||
             bio.includes(searchLower);
    });
  }, [allServicemen, filters.search]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: undefined,
      is_available: undefined,
      min_rating: undefined,
      search: '',
      ordering: '-rating'
    });
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
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

      <div style={{ paddingTop: '80px', paddingBottom: '120px', minHeight: '100vh' }} className="bg-light">
        <div className="container mt-4">
          {/* Header */}
          <div className="mb-4">
            <h1 className="mb-2">Find Service Providers</h1>
            <p className="text-muted">Browse and connect with verified service professionals</p>
          </div>

          {/* Statistics */}
          {statistics && (
            <div className="row mb-4">
              <div className="col-md-4 mb-3">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <h3 className="mb-1">{statistics.total_servicemen}</h3>
                    <p className="mb-0 text-muted">Total Servicemen</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4 mb-3">
                <div className="card border-0 shadow-sm bg-success bg-opacity-10">
                  <div className="card-body">
                    <h3 className="mb-1 text-success">{statistics.available}</h3>
                    <p className="mb-0 text-muted">Available Now</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4 mb-3">
                <div className="card border-0 shadow-sm bg-warning bg-opacity-10">
                  <div className="card-body">
                    <h3 className="mb-1 text-warning">{statistics.busy}</h3>
                    <p className="mb-0 text-muted">Busy</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <div className="row">
                <div className="col-md-3 mb-3 mb-md-0">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by name, skill, or category..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                  />
                </div>
                <div className="col-md-2 mb-3 mb-md-0">
                  <select
                    className="form-select"
                    value={filters.category || ''}
                    onChange={(e) => handleFilterChange('category', e.target.value ? parseInt(e.target.value) : undefined)}
                  >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2 mb-3 mb-md-0">
                  <select
                    className="form-select"
                    value={filters.is_available === undefined ? '' : filters.is_available.toString()}
                    onChange={(e) => handleFilterChange('is_available', e.target.value === '' ? undefined : e.target.value === 'true')}
                  >
                    <option value="">All Status</option>
                    <option value="true">Available Only</option>
                    <option value="false">Busy</option>
                  </select>
                </div>
                <div className="col-md-2 mb-3 mb-md-0">
                  <select
                    className="form-select"
                    value={filters.min_rating || ''}
                    onChange={(e) => handleFilterChange('min_rating', e.target.value ? parseFloat(e.target.value) : undefined)}
                  >
                    <option value="">Any Rating</option>
                    <option value="4.5">4.5+ Stars</option>
                    <option value="4.0">4+ Stars</option>
                    <option value="3.5">3.5+ Stars</option>
                  </select>
                </div>
                <div className="col-md-2 mb-3 mb-md-0">
                  <select
                    className="form-select"
                    value={filters.ordering}
                    onChange={(e) => handleFilterChange('ordering', e.target.value)}
                  >
                    <option value="-rating">Top Rated</option>
                    <option value="-total_jobs_completed">Most Jobs</option>
                    <option value="years_of_experience">Most Experience</option>
                    <option value="-created_at">Newest</option>
                  </select>
                </div>
                <div className="col-md-1">
                  <button onClick={clearFilters} className="btn btn-outline-secondary w-100" title="Clear filters">
                    <i className="bi bi-x-lg"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Servicemen List */}
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : servicemen.length === 0 ? (
            <div className="text-center py-5">
              <div className="card border-0 shadow-sm p-5">
                <i className="bi bi-search fs-1 text-muted mb-3"></i>
                <h5 className="mb-3">No servicemen found</h5>
                <p className="text-muted mb-4">
                  {filters.search && (
                    <>
                      No results for "<strong>{filters.search}</strong>". 
                      <br />
                      <small>We searched across names, categories, skills, and bios. Try a different keyword or browse by category.</small>
                    </>
                  )}
                  {!filters.search && "Try adjusting your filters or browse all servicemen."}
                </p>
                <div className="d-flex gap-2 justify-content-center">
                  <button onClick={clearFilters} className="btn btn-primary">
                    Clear All Filters
                  </button>
                  <a href="/categories" className="btn btn-outline-primary">
                    Browse by Category
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="row">
              {servicemen.map((serviceman: ServicemanProfile) => (
                <div key={typeof serviceman.user === 'object' ? serviceman.user.id : serviceman.user} className="col-md-6 col-lg-4 mb-4">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="flex-grow-1" style={{ minWidth: 0 }}>
                          <h5 className="mb-1 text-truncate">
                            {typeof serviceman.user === 'object' 
                              ? (serviceman.user as any).full_name || serviceman.user.username 
                              : `Serviceman #${serviceman.user}`}
                          </h5>
                          {serviceman.category && (
                            <small className="text-muted">
                              {typeof serviceman.category === 'object' ? serviceman.category.name : ''}
                            </small>
                          )}
                        </div>
                        <span className={`badge ${serviceman.is_available ? 'bg-success' : 'bg-secondary'} flex-shrink-0 ms-2`}>
                          {serviceman.availability_status?.label || (serviceman.is_available ? 'Available' : 'Busy')}
                        </span>
                      </div>

                      {/* Rating */}
                      <div className="mb-2">
                        <span className="text-warning">
                          {'⭐'.repeat(Math.floor(parseFloat(serviceman.rating) || 0))}
                        </span>
                        <strong className="ms-2">{serviceman.rating}</strong>
                        <small className="text-muted ms-2">
                          ({serviceman.total_jobs_completed} jobs)
                        </small>
                      </div>

                      {/* Skills */}
                      {serviceman.skills && serviceman.skills.length > 0 && (
                        <div className="mb-3">
                          <small className="text-muted d-block mb-1">Skills:</small>
                          <div className="d-flex flex-wrap gap-1">
                            {serviceman.skills.slice(0, 3).map((skill: any) => (
                              <span key={skill.id} className="badge bg-info bg-opacity-75">
                                {skill.name}
                              </span>
                            ))}
                            {serviceman.skills.length > 3 && (
                              <span className="badge bg-secondary">+{serviceman.skills.length - 3}</span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Bio */}
                      <p className="text-muted small mb-3" style={{ 
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {serviceman.bio || 'No bio available'}
                      </p>

                      {/* Experience */}
                      {serviceman.years_of_experience && (
                        <small className="text-muted">
                          <i className="bi bi-briefcase me-1"></i>
                          {serviceman.years_of_experience} years experience
                        </small>
                      )}

                      {/* Booking Warning for Busy Servicemen */}
                      {!serviceman.is_available && serviceman.active_jobs_count > 0 && (
                        <div className="alert alert-warning py-2 px-3 mb-3 small">
                          <i className="bi bi-exclamation-triangle me-1"></i>
                          <strong>Currently busy</strong> with {serviceman.active_jobs_count} active job{serviceman.active_jobs_count !== 1 ? 's' : ''}
                          <br />
                          <small className="text-muted">Service may be delayed. Consider choosing an available serviceman.</small>
                        </div>
                      )}

                      {/* Action Button */}
                      <div className="mt-3">
                        <button
                          onClick={() => {
                            const userId = typeof serviceman.user === 'object' ? serviceman.user.id : serviceman.user;
                            router.push(`/servicemen/${userId}`);
                          }}
                          className="btn btn-primary w-100"
                        >
                          {serviceman.is_available ? (
                            <>
                              <i className="bi bi-calendar-check me-1"></i>
                              View Profile & Book Now
                            </>
                          ) : (
                            <>
                              <i className="bi bi-eye me-1"></i>
                              View Profile
                            </>
                          )}
                        </button>
                        {!serviceman.is_available && serviceman.availability_status?.can_book && (
                          <small className="text-muted d-block mt-2 text-center">
                            Can still book, but may experience delays
                          </small>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        zIndex: 1000,
        backgroundColor: 'white'
      }}>
        <SecondFooter />
      </div>
    </div>
  );
}

export default function ServicemenListPage() {
  return (
    <Suspense fallback={
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    }>
      <ServicemenContent />
    </Suspense>
  );
}

