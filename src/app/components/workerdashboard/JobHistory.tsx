'use client';

import React, { useState, useMemo } from 'react';
import { useServicemanJobHistory } from '../../hooks/useAPI';

interface JobHistoryProps {
  className?: string;
}

export default function JobHistory({ className = '' }: JobHistoryProps) {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());
  
  // Get job history data
  const { 
    jobHistory, 
    loading, 
    error, 
    fetchJobHistory 
  } = useServicemanJobHistory(true, {
    status: filterStatus === 'all' ? undefined : filterStatus,
    year: filterYear,
    limit: 50
  });

  // Normalize jobHistory to always be an array
  const jobHistoryArray = useMemo(() => {
    if (!jobHistory) return [];
    if (Array.isArray(jobHistory)) return jobHistory;
    if (jobHistory.results && Array.isArray(jobHistory.results)) return jobHistory.results;
    return [];
  }, [jobHistory]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!jobHistoryArray || jobHistoryArray.length === 0) {
      return {
        totalJobs: 0,
        completedJobs: 0,
        inProgressJobs: 0,
        totalEarnings: 0,
        averageRating: 0
      };
    }

    const totalJobs = jobHistoryArray.length;
    const completedJobs = jobHistoryArray.filter((job: any) => job.status === 'COMPLETED').length;
    const inProgressJobs = jobHistoryArray.filter((job: any) => job.status === 'IN_PROGRESS').length;
    const totalEarnings = jobHistoryArray
      .filter((job: any) => job.final_cost)
      .reduce((sum: number, job: any) => sum + parseFloat(job.final_cost || 0), 0);
    
    // Calculate average rating if available
    const jobsWithRating = jobHistoryArray.filter((job: any) => job.rating);
    const averageRating = jobsWithRating.length > 0 
      ? jobsWithRating.reduce((sum: number, job: any) => sum + (job.rating || 0), 0) / jobsWithRating.length
      : 0;

    return {
      totalJobs,
      completedJobs,
      inProgressJobs,
      totalEarnings,
      averageRating
    };
  }, [jobHistoryArray]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-success text-white';
      case 'IN_PROGRESS':
        return 'bg-primary text-white';
      case 'CANCELLED':
        return 'bg-secondary text-white';
      case 'AWAITING_PAYMENT':
        return 'bg-warning text-dark';
      default:
        return 'bg-info text-white';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  return (
    <div className={`card border-0 shadow-sm ${className}`}>
      <div className="card-header bg-white border-0 py-3">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="bi bi-clock-history me-2"></i>
            Job History
          </h5>
          <button 
            onClick={() => fetchJobHistory()} 
            className="btn btn-outline-primary btn-sm"
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            Refresh
          </button>
        </div>
      </div>

      <div className="card-body">
        {/* Statistics Cards */}
        <div className="row mb-4">
          <div className="col-lg-3 col-md-6 mb-3">
            <div className="card border-0 bg-primary bg-opacity-10">
              <div className="card-body p-3 text-center">
                <h4 className="mb-1 text-primary">{stats.totalJobs}</h4>
                <p className="mb-0 small text-muted">Total Jobs</p>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 mb-3">
            <div className="card border-0 bg-success bg-opacity-10">
              <div className="card-body p-3 text-center">
                <h4 className="mb-1 text-success">{stats.completedJobs}</h4>
                <p className="mb-0 small text-muted">Completed</p>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 mb-3">
            <div className="card border-0 bg-warning bg-opacity-10">
              <div className="card-body p-3 text-center">
                <h4 className="mb-1 text-warning">{stats.inProgressJobs}</h4>
                <p className="mb-0 small text-muted">In Progress</p>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 mb-3">
            <div className="card border-0 bg-info bg-opacity-10">
              <div className="card-body p-3 text-center">
                <h4 className="mb-1 text-info">{formatCurrency(stats.totalEarnings)}</h4>
                <p className="mb-0 small text-muted">Total Earnings</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label small">Filter by Status</label>
            <select 
              className="form-select form-select-sm" 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="COMPLETED">Completed</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="AWAITING_PAYMENT">Awaiting Payment</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label small">Filter by Year</label>
            <select 
              className="form-select form-select-sm" 
              value={filterYear}
              onChange={(e) => setFilterYear(parseInt(e.target.value))}
            >
              <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
              <option value={new Date().getFullYear() - 1}>{new Date().getFullYear() - 1}</option>
              <option value={new Date().getFullYear() - 2}>{new Date().getFullYear() - 2}</option>
            </select>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="alert alert-warning d-flex align-items-center mb-3">
            <i className="bi bi-wifi-off me-2"></i>
            <div className="flex-grow-1">
              {error}
            </div>
            <button 
              onClick={() => fetchJobHistory()} 
              className="btn btn-warning btn-sm"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading job history...</span>
            </div>
          </div>
        )}

        {/* Job History Table */}
        {!loading && !error && (
          <>
            {jobHistoryArray.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-clock-history fs-1 text-muted mb-3"></i>
                <h6 className="text-muted">No job history found</h6>
                <p className="text-muted small">
                  Your completed jobs and earnings will appear here.
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Job ID</th>
                      <th>Client</th>
                      <th>Service</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Earnings</th>
                      <th>Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobHistoryArray.map((job: any) => (
                      <tr key={job.id}>
                        <td>
                          <span className="fw-medium">#{job.id}</span>
                        </td>
                        <td>
                          <div>
                            <div className="fw-medium">
                              {typeof job.client === 'object' ? job.client.username : 'N/A'}
                            </div>
                            <small className="text-muted">
                              {typeof job.client === 'object' ? job.client.email : ''}
                            </small>
                          </div>
                        </td>
                        <td>
                          <div>
                            <div className="fw-medium">
                              {typeof job.category === 'object' ? job.category.name : 'General Service'}
                            </div>
                            <small className="text-muted">
                              {job.service_description?.substring(0, 50)}
                              {job.service_description?.length > 50 ? '...' : ''}
                            </small>
                          </div>
                        </td>
                        <td>
                          <div>
                            <div>{formatDate(job.created_at)}</div>
                            {job.completed_at && (
                              <small className="text-muted">
                                Completed: {formatDate(job.completed_at)}
                              </small>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(job.status)}`}>
                            {job.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td>
                          <div className="fw-medium">
                            {job.final_cost ? formatCurrency(parseFloat(job.final_cost)) : 'Pending'}
                          </div>
                        </td>
                        <td>
                          {job.rating ? (
                            <div className="d-flex align-items-center">
                              <span className="me-1">{job.rating}</span>
                              <i className="bi bi-star-fill text-warning"></i>
                            </div>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
