'use client';
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '../../hooks/useAdmin';
import { useServiceRequests } from '../../hooks/useAPI';
import { getStatusConfig } from '../../utils/statusHelpers';
import AdminGuard from '../../components/admin/AdminGuard';
import Link from 'next/link';
import type { ServiceRequest } from '../../types/api';

export default function AdminServiceRequestsPage() {
  const { isAdmin, isLoading: adminLoading } = useAdmin();
  const router = useRouter();
  const { serviceRequests, loading, error, refetch } = useServiceRequests(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmergencyOnly, setShowEmergencyOnly] = useState(false);

  // Redirect if not admin (use useEffect to avoid setState during render)
  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      router.push('/admin/login');
    }
  }, [adminLoading, isAdmin, router]);

  // Filter requests - MUST be called before any early returns
  const filteredRequests = useMemo(() => {
    // Handle undefined/null serviceRequests
    if (!serviceRequests || !Array.isArray(serviceRequests)) {
      return [];
    }

    let filtered = serviceRequests;

    // Filter by emergency
    if (showEmergencyOnly) {
      filtered = filtered.filter((req: ServiceRequest) => req.is_emergency);
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter((req: ServiceRequest) => req.status === filterStatus);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((req: ServiceRequest) => 
        req.id.toString().includes(query) ||
        (typeof req.client === 'object' && req.client?.username?.toLowerCase().includes(query)) ||
        req.service_description?.toLowerCase().includes(query) ||
        (typeof req.category === 'object' && req.category?.name?.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [serviceRequests, filterStatus, searchQuery, showEmergencyOnly]);

  // Calculate statistics
  const stats = useMemo(() => {
    // Handle undefined/null serviceRequests
    if (!serviceRequests || !Array.isArray(serviceRequests)) {
      return {
        total: 0,
        pendingAssignment: 0,
        assigned: 0,
        inspected: 0,
        awaitingApproval: 0,
        negotiating: 0,
        awaitingPayment: 0,
        paymentConfirmed: 0,
        inProgress: 0,
        completed: 0,
        cancelled: 0,
        emergency: 0,
      };
    }

    return {
      total: serviceRequests.length,
      pendingAssignment: serviceRequests.filter((r: ServiceRequest) => r.status === 'PENDING_ADMIN_ASSIGNMENT').length,
      pendingEstimation: serviceRequests.filter((r: ServiceRequest) => r.status === 'PENDING_ESTIMATION').length,
      estimationSubmitted: serviceRequests.filter((r: ServiceRequest) => r.status === 'ESTIMATION_SUBMITTED').length,
      awaitingApproval: serviceRequests.filter((r: ServiceRequest) => r.status === 'AWAITING_CLIENT_APPROVAL').length,
      paymentCompleted: serviceRequests.filter((r: ServiceRequest) => r.status === 'PAYMENT_COMPLETED').length,
      inProgress: serviceRequests.filter((r: ServiceRequest) => r.status === 'IN_PROGRESS').length,
      completed: serviceRequests.filter((r: ServiceRequest) => r.status === 'COMPLETED').length,
      clientReviewed: serviceRequests.filter((r: ServiceRequest) => r.status === 'CLIENT_REVIEWED').length,
      cancelled: serviceRequests.filter((r: ServiceRequest) => r.status === 'CANCELLED').length,
      // Legacy statuses
      assigned: serviceRequests.filter((r: ServiceRequest) => r.status === 'ASSIGNED_TO_SERVICEMAN').length,
      inspected: serviceRequests.filter((r: ServiceRequest) => r.status === 'SERVICEMAN_INSPECTED').length,
      negotiating: serviceRequests.filter((r: ServiceRequest) => r.status === 'NEGOTIATING').length,
      awaitingPayment: serviceRequests.filter((r: ServiceRequest) => r.status === 'AWAITING_PAYMENT').length,
      paymentConfirmed: serviceRequests.filter((r: ServiceRequest) => r.status === 'PAYMENT_CONFIRMED').length,
      emergency: serviceRequests.filter((r: ServiceRequest) => r.is_emergency).length,
    };
  }, [serviceRequests]);

  // Use centralized status configuration
  const getStatusBadgeClass = (status: string) => {
    const config = getStatusConfig(status);
    return config.badgeClass;
  };

  const getStatusLabel = (status: string) => {
    const config = getStatusConfig(status);
    return config.label;
  };

  // Show loading state AFTER all hooks are called
  if (adminLoading) {
    return (
      <div className="container mt-5">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminGuard>
      <div className="container mt-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <Link href="/admin/dashboard" className="btn btn-outline-secondary btn-sm me-2">
              ← Back to Dashboard
            </Link>
            <h1 className="d-inline-block ms-2">Service Requests</h1>
          </div>
          <button onClick={refetch} className="btn btn-outline-primary btn-sm">
            <i className="bi bi-arrow-clockwise me-1"></i>
            Refresh
          </button>
        </div>

        {/* Statistics Cards - Based on API Guide Status Flow */}
        <div className="row mb-4">
          <div className="col-lg-2 col-md-3 col-sm-6 mb-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-3">
                <h4 className="mb-1">{stats.total}</h4>
                <p className="mb-0 small text-muted">Total</p>
              </div>
            </div>
          </div>
          <div className="col-lg-2 col-md-3 col-sm-6 mb-3">
            <div className="card border-0 shadow-sm bg-warning bg-opacity-10">
              <div className="card-body p-3">
                <h4 className="mb-1 text-warning">{stats.pendingAssignment}</h4>
                <p className="mb-0 small text-muted">Need Assign</p>
              </div>
            </div>
          </div>
          <div className="col-lg-2 col-md-3 col-sm-6 mb-3">
            <div className="card border-0 shadow-sm bg-info bg-opacity-10">
              <div className="card-body p-3">
                <h4 className="mb-1 text-info">{stats.pendingEstimation}</h4>
                <p className="mb-0 small text-muted">Need Estimate</p>
              </div>
            </div>
          </div>
          <div className="col-lg-2 col-md-3 col-sm-6 mb-3">
            <div className="card border-0 shadow-sm bg-warning bg-opacity-10">
              <div className="card-body p-3">
                <h4 className="mb-1 text-warning">{stats.awaitingApproval}</h4>
                <p className="mb-0 small text-muted">Client Review</p>
              </div>
            </div>
          </div>
          <div className="col-lg-2 col-md-3 col-sm-6 mb-3">
            <div className="card border-0 shadow-sm bg-primary bg-opacity-10">
              <div className="card-body p-3">
                <h4 className="mb-1 text-primary">{stats.inProgress}</h4>
                <p className="mb-0 small text-muted">Active Jobs</p>
              </div>
            </div>
          </div>
          <div className="col-lg-2 col-md-3 col-sm-6 mb-3">
            <div className="card border-0 shadow-sm bg-success bg-opacity-10">
              <div className="card-body p-3">
                <h4 className="mb-1 text-success">{stats.completed + stats.clientReviewed}</h4>
                <p className="mb-0 small text-muted">Completed</p>
              </div>
            </div>
          </div>
          <div className="col-lg-2 col-md-3 col-sm-6 mb-3">
            <div className="card border-0 shadow-sm border-danger">
              <div className="card-body p-3">
                <h4 className="mb-1 text-danger">{stats.emergency}</h4>
                <p className="mb-0 small text-muted">🚨 Emergency</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <div className="row">
              <div className="col-md-4 mb-3 mb-md-0">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by ID, client, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="col-md-4 mb-3 mb-md-0">
                <select
                  className="form-select"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <optgroup label="— Current Status Flow —">
                    <option value="PENDING_ADMIN_ASSIGNMENT">⏳ Waiting for Assignment</option>
                    <option value="PENDING_ESTIMATION">🧮 Pending Estimation</option>
                    <option value="ESTIMATION_SUBMITTED">📋 Processing Estimate</option>
                    <option value="AWAITING_CLIENT_APPROVAL">⏱️ Awaiting Client Approval</option>
                    <option value="PAYMENT_COMPLETED">💰 Payment Completed</option>
                    <option value="IN_PROGRESS">🔧 Work In Progress</option>
                    <option value="COMPLETED">✅ Completed</option>
                    <option value="CLIENT_REVIEWED">⭐ Client Reviewed</option>
                    <option value="CANCELLED">❌ Cancelled</option>
                  </optgroup>
                  <optgroup label="— Legacy Statuses —">
                    <option value="ASSIGNED_TO_SERVICEMAN">👷 Assigned to Serviceman</option>
                    <option value="SERVICEMAN_INSPECTED">🔍 Inspected</option>
                    <option value="NEGOTIATING">💬 Negotiating</option>
                    <option value="AWAITING_PAYMENT">💳 Awaiting Payment</option>
                    <option value="PAYMENT_CONFIRMED">✅ Payment Confirmed</option>
                  </optgroup>
                </select>
              </div>
              <div className="col-md-4">
                <div className="d-flex gap-2">
                  <button
                    className={`btn ${showEmergencyOnly ? 'btn-danger' : 'btn-outline-danger'} flex-fill`}
                    onClick={() => setShowEmergencyOnly(!showEmergencyOnly)}
                  >
                    <i className="bi bi-lightning-fill me-1"></i>
                    {showEmergencyOnly ? 'Show All' : 'Emergency Only'}
                  </button>
                  <button
                    className="btn btn-outline-secondary flex-fill"
                    onClick={() => {
                      setFilterStatus('all');
                      setSearchQuery('');
                      setShowEmergencyOnly(false);
                    }}
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Service Requests Table */}
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white border-0 py-3">
            <h5 className="mb-0">
              Service Requests ({filteredRequests.length})
            </h5>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : error ? (
              <div className="alert alert-danger">{error}</div>
            ) : filteredRequests.length === 0 ? (
              <p className="text-muted text-center py-5">No service requests found</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead>
                    <tr>
                      <th style={{ width: '80px' }}>ID</th>
                      <th>Client</th>
                      <th>Category</th>
                      <th>Serviceman</th>
                      <th style={{ width: '120px' }}>Booking Date</th>
                      <th style={{ width: '180px' }}>Status</th>
                      <th style={{ width: '100px' }}>Amount</th>
                      <th style={{ width: '90px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((request: ServiceRequest) => (
                      <tr key={request.id}>
                        <td>
                          <strong>#{request.id}</strong>
                          {request.is_emergency && (
                            <span className="badge bg-danger ms-2">
                              <i className="bi bi-lightning-fill"></i> Emergency
                            </span>
                          )}
                        </td>
                        <td>
                          {typeof request.client === 'object' 
                            ? request.client?.username 
                            : `User #${request.client}`}
                        </td>
                        <td>
                          {typeof request.category === 'object' 
                            ? request.category?.name 
                            : 'N/A'}
                        </td>
                        <td>
                          {request.serviceman ? (
                            typeof request.serviceman === 'object'
                              ? request.serviceman.username
                              : `#${request.serviceman}`
                          ) : (
                            <span className="text-muted">Not assigned</span>
                          )}
                        </td>
                        <td>{new Date(request.booking_date).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(request.status)}`}>
                            {getStatusLabel(request.status)}
                          </span>
                        </td>
                        <td>
                          {request.final_cost 
                            ? `₦${parseFloat(request.final_cost).toLocaleString()}`
                            : request.initial_booking_fee
                            ? `₦${parseFloat(request.initial_booking_fee).toLocaleString()}`
                            : 'N/A'}
                        </td>
                        <td>
                          <Link
                            href={`/service-requests/${request.id}`}
                            className="btn btn-sm btn-outline-primary"
                          >
                            <i className="bi bi-eye me-1"></i>
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card border-0 shadow-sm mt-4">
          <div className="card-body">
            <h6 className="mb-3">Quick Filters</h6>
            <div className="d-flex gap-2 flex-wrap">
              <button
                className="btn btn-sm btn-outline-warning"
                onClick={() => setFilterStatus('PENDING_ADMIN_ASSIGNMENT')}
              >
                ⏳ Pending Assignment ({stats.pendingAssignment})
              </button>
              <button
                className="btn btn-sm btn-outline-info"
                onClick={() => setFilterStatus('ASSIGNED_TO_SERVICEMAN')}
              >
                👷 Assigned ({stats.assigned})
              </button>
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => setFilterStatus('AWAITING_PAYMENT')}
              >
                💳 Awaiting Payment ({stats.awaitingPayment})
              </button>
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => setFilterStatus('IN_PROGRESS')}
              >
                🔧 In Progress ({stats.inProgress})
              </button>
              <button
                className="btn btn-sm btn-outline-success"
                onClick={() => setFilterStatus('COMPLETED')}
              >
                ✅ Completed ({stats.completed})
              </button>
              <button
                className="btn btn-sm btn-danger"
                onClick={() => setShowEmergencyOnly(!showEmergencyOnly)}
              >
                <i className="bi bi-lightning-fill me-1"></i>
                Emergency ({stats.emergency})
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}

