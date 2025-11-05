'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '../../hooks/useAdmin';
import { usePendingServicemen, useCategories } from '../../hooks/useAPI';
import AdminGuard from '../../components/admin/AdminGuard';
import Link from 'next/link';

export default function AdminServicemenPage() {
  const { isAdmin, isLoading: adminLoading } = useAdmin();
  const router = useRouter();
  const { 
    pendingApplications, 
    totalPending, 
    approveServiceman, 
    rejectServiceman,
    loading,
    refetch 
  } = usePendingServicemen(isAdmin);
  
  // Fetch categories for the approval dropdown
  const { categories } = useCategories();

  const [selectedServiceman, setSelectedServiceman] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [viewingApplication, setViewingApplication] = useState<any>(null);
  const [modalType, setModalType] = useState<'approve' | 'reject'>('approve');
  const [categoryId, setCategoryId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Debug: Log the data structure when applications load
  React.useEffect(() => {
    if (pendingApplications && pendingApplications.length > 0) {
      const sample = pendingApplications[0];
      const isUserExpanded = typeof sample.user === 'object';
      
      console.log('📊 [Admin Servicemen] Sample application data:', sample);
      console.log('📊 [Admin Servicemen] User field type:', typeof sample.user);
      console.log('📊 [Admin Servicemen] User field value:', sample.user);
      
      if (!isUserExpanded) {
        console.warn(`
┌─────────────────────────────────────────────────────────────────┐
│ ⚠️  BACKEND API ISSUE DETECTED                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ENDPOINT: /api/users/admin/pending-servicemen/                 │
│ ISSUE: User field returns ID only (number), not full object    │
│                                                                 │
│ CURRENT RESPONSE:                                               │
│   user: ${sample.user} ❌                                                  │
│                                                                 │
│ EXPECTED RESPONSE (per API docs v2.0):                          │
│   user: {                                                       │
│     id: ${sample.user},                                                    │
│     username: "john_plumber",                                   │
│     email: "john@example.com",                                  │
│     full_name: "John Doe"                                       │
│   } ✅                                                           │
│                                                                 │
│ IMPACT:                                                         │
│ • Username/email cannot be displayed                            │
│ • Shows "User #${sample.user}" instead of actual name                     │
│ • Admin UX degraded                                             │
│                                                                 │
│ DJANGO BACKEND FIX NEEDED:                                      │
│ 1. Update ServicemanProfileSerializer to use UserBasicSerializer│
│ 2. Add select_related('user') to queryset                      │
│ 3. Add prefetch_related('skills') for performance              │
│                                                                 │
│ REFERENCE: See API_DOCUMENTATION_V2.md for implementation      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
        `);
      } else {
        console.log('✅ [Admin Servicemen] User object properly expanded!');
      }
    }
  }, [pendingApplications]);

  // Helper function to get approval status
  const getApprovalStatus = (application: any) => {
    if (application.is_approved) {
      return {
        status: 'approved',
        label: 'Approved',
        badgeClass: 'bg-success',
        icon: 'check-circle-fill'
      };
    } else if (application.rejection_reason) {
      return {
        status: 'rejected',
        label: 'Rejected',
        badgeClass: 'bg-danger',
        icon: 'x-circle-fill'
      };
    } else {
      return {
        status: 'pending',
        label: 'Pending Review',
        badgeClass: 'bg-warning text-dark',
        icon: 'clock-fill'
      };
    }
  };

  // Redirect if not admin (use useEffect to avoid setState during render)
  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      router.push('/admin/login');
    }
  }, [adminLoading, isAdmin, router]);

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

  const handleApproveClick = (serviceman: any) => {
    setSelectedServiceman(serviceman);
    setModalType('approve');
    // Pre-populate category if exists
    if (serviceman.category && typeof serviceman.category === 'object') {
      setCategoryId(serviceman.category.id.toString());
    } else if (typeof serviceman.category === 'number') {
      setCategoryId(serviceman.category.toString());
    } else {
      setCategoryId('');
    }
    setShowModal(true);
  };

  const handleRejectClick = (serviceman: any) => {
    setSelectedServiceman(serviceman);
    setModalType('reject');
    setShowModal(true);
  };

  const handleViewDetails = (application: any) => {
    setViewingApplication(application);
    setShowDetailsModal(true);
  };

  const handleApprove = async () => {
    if (!selectedServiceman) return;
    
    setActionLoading(true);
    try {
      const servicemanId = typeof selectedServiceman.user === 'object' 
        ? selectedServiceman.user.id 
        : selectedServiceman.user;

      console.log('🔧 Approving serviceman:', {
        servicemanId,
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        notes
      });

      await approveServiceman(
        servicemanId,
        categoryId ? parseInt(categoryId) : undefined,
        notes
      );
      
      setShowModal(false);
      setSelectedServiceman(null);
      setCategoryId('');
      setNotes('');
      alert('Serviceman approved successfully!');
    } catch (error: any) {
      console.error('❌ Approval error:', error);
      alert(error.response?.data?.detail || 'Failed to approve serviceman');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedServiceman || !rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    
    setActionLoading(true);
    try {
      await rejectServiceman(selectedServiceman.user, rejectionReason);
      setShowModal(false);
      setSelectedServiceman(null);
      setRejectionReason('');
      alert('Serviceman application rejected');
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to reject serviceman');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminGuard>
      <div className="container-fluid px-4 py-4">
        {/* Header Section */}
        <div className="row mb-4">
          <div className="col">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <Link href="/admin/dashboard" className="btn btn-outline-secondary btn-sm mb-2">
                  <i className="bi bi-arrow-left me-2"></i>
                  Back to Dashboard
                </Link>
                <h1 className="h2 mb-0 mt-2">
                  <i className="bi bi-people-fill me-2 text-primary"></i>
                  Manage Servicemen
                </h1>
                <p className="text-muted mb-0">Review and approve serviceman applications</p>
              </div>
              <button onClick={refetch} className="btn btn-primary">
                <i className="bi bi-arrow-clockwise me-2"></i>
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Backend API Warning Banner (only show if user data is not expanded) */}
        {pendingApplications && pendingApplications.length > 0 && typeof pendingApplications[0].user === 'number' && (
          <div className="row mb-3">
            <div className="col">
              <div className="alert alert-warning alert-dismissible fade show" role="alert">
                <div className="d-flex align-items-start">
                  <i className="bi bi-exclamation-triangle-fill me-3 fs-4"></i>
                  <div className="flex-grow-1">
                    <h5 className="alert-heading mb-2">
                      <i className="bi bi-server me-2"></i>
                      Backend API Issue Detected
                    </h5>
                    <p className="mb-2">
                      The <code>/api/users/admin/pending-servicemen/</code> endpoint is returning user IDs instead of full user objects.
                      Serviceman names and emails are displaying as <strong>"User #ID"</strong> and <strong>"N/A"</strong> in the table below.
                    </p>
                    <hr />
                    <div className="row small">
                      <div className="col-md-4">
                        <strong>Impact:</strong> Admin UX degraded
                      </div>
                      <div className="col-md-4">
                        <strong>Fix Required:</strong> Backend serializer update
                      </div>
                      <div className="col-md-4">
                        <strong>Reference:</strong> <code>API_DOCUMENTATION_V2.md</code>
                      </div>
                    </div>
                    <p className="mb-0 mt-2 small text-muted">
                      <i className="bi bi-info-circle me-1"></i>
                      Check browser console for detailed diagnostic information and implementation guide.
                    </p>
                  </div>
                </div>
                <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Summary */}
        <div className="row mb-4">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <div className="display-4 text-warning mb-2">
                  <i className="bi bi-hourglass-split"></i>
                </div>
                <h3 className="h2 mb-0">{totalPending}</h3>
                <p className="text-muted mb-0">Pending Review</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <div className="display-4 text-success mb-2">
                  <i className="bi bi-check-circle-fill"></i>
                </div>
                <h3 className="h2 mb-0">{pendingApplications.filter((app: any) => app.is_approved).length}</h3>
                <p className="text-muted mb-0">Approved</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <div className="display-4 text-danger mb-2">
                  <i className="bi bi-x-circle-fill"></i>
                </div>
                <h3 className="h2 mb-0">{pendingApplications.filter((app: any) => app.rejection_reason).length}</h3>
                <p className="text-muted mb-0">Rejected</p>
              </div>
            </div>
          </div>
        </div>

        {/* All Servicemen Section */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-gradient" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0 text-white">
                <i className="bi bi-people-fill me-2"></i>
                All Servicemen Applications
              </h5>
              <span className="badge bg-white text-primary fs-6">{pendingApplications.length} total</span>
            </div>
          </div>
          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted">Loading applications...</p>
              </div>
            ) : totalPending === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-check-circle fs-1 text-success mb-3"></i>
                <h5 className="text-muted">No Pending Applications</h5>
                <p className="text-muted small">All applications have been reviewed</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th className="border-0 ps-4">Serviceman</th>
                        <th className="border-0">Skills & Experience</th>
                        <th className="border-0">Status</th>
                        <th className="border-0">Bio</th>
                        <th className="border-0">Applied</th>
                        <th className="border-0 pe-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingApplications.map((application: any) => {
                        const approvalStatus = getApprovalStatus(application);
                        return (
                        <tr key={typeof application.user === 'object' ? application.user.id : application.user} className="border-bottom">
                          <td className="ps-4">
                            <div className="d-flex align-items-center">
                              <div className="avatar-circle bg-primary text-white me-3" style={{ width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold' }}>
                                {(() => {
                                  // Try multiple sources for username
                                  const username = application.user?.username || application.username || '';
                                  return username ? username.charAt(0).toUpperCase() : '#';
                                })()}
                              </div>
                              <div>
                                <div className="fw-bold text-dark mb-1">
                                  {(() => {
                                    // Try multiple sources for username display
                                    const username = application.user?.username || application.username;
                                    const userId = typeof application.user === 'object' ? application.user?.id : application.user;
                                    return username || `User #${userId}`;
                                  })()}
                                  {application.is_available && (
                                    <span className="badge bg-success ms-2" style={{ fontSize: '10px' }}>Available</span>
                                  )}
                                </div>
                                <div className="text-muted small">
                                  <i className="bi bi-envelope me-1"></i>
                                  {(() => {
                                    // Try multiple sources for email
                                    const email = application.user?.email || application.email;
                                    return email || 'N/A';
                                  })()}
                                </div>
                                {(application.phone_number || application.user?.phone_number) && (
                                  <div className="text-muted small">
                                    <i className="bi bi-telephone me-1"></i>
                                    {application.phone_number || application.user?.phone_number}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="mb-2">
                              <span className="badge bg-info me-1">
                                <i className="bi bi-briefcase me-1"></i>
                                {application.years_of_experience || 0} yrs
                              </span>
                              <span className="badge bg-secondary">
                                <i className="bi bi-star me-1"></i>
                                {application.rating || '0.0'}
                              </span>
                            </div>
                            {application.skills && application.skills.length > 0 ? (
                              <div className="d-flex flex-wrap gap-1">
                                {application.skills.slice(0, 2).map((skill: any) => (
                                  <span key={skill.id} className="badge bg-light text-dark border">
                                    {skill.name}
                                  </span>
                                ))}
                                {application.skills.length > 2 && (
                                  <span className="badge bg-light text-primary border">
                                    +{application.skills.length - 2} more
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted small">No skills listed</span>
                            )}
                          </td>
                          <td>
                            <div>
                              <span className={`badge ${approvalStatus.badgeClass}`}>
                                <i className={`bi bi-${approvalStatus.icon} me-1`}></i>
                                {approvalStatus.label}
                              </span>
                              {application.rejection_reason && (
                                <div className="small text-danger mt-1" style={{ maxWidth: '150px' }}>
                                  <i className="bi bi-info-circle me-1"></i>
                                  {application.rejection_reason.length > 50 
                                    ? `${application.rejection_reason.substring(0, 50)}...`
                                    : application.rejection_reason}
                                </div>
                              )}
                              {application.approved_at && (
                                <div className="small text-muted mt-1">
                                  {new Date(application.approved_at).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            <div style={{ maxWidth: '300px', minWidth: '200px' }}>
                              <p className="mb-0 text-muted small" style={{ 
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}>
                                {application.bio || 'No bio provided'}
                              </p>
                            </div>
                          </td>
                          <td>
                            <div className="text-muted small">
                              <i className="bi bi-calendar me-1"></i>
                              {new Date(application.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </div>
                          </td>
                          <td className="pe-4">
                            <div className="d-flex justify-content-center gap-2">
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleViewDetails(application)}
                                title="View full details"
                              >
                                <i className="bi bi-eye"></i>
                              </button>
                              {approvalStatus.status === 'pending' && (
                                <>
                                  <button
                                    className="btn btn-sm btn-success"
                                    onClick={() => handleApproveClick(application)}
                                    title="Approve application"
                                  >
                                    <i className="bi bi-check-lg"></i>
                                  </button>
                                  <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleRejectClick(application)}
                                    title="Reject application"
                                  >
                                    <i className="bi bi-x-lg"></i>
                                  </button>
                                </>
                              )}
                              {approvalStatus.status === 'approved' && (
                                <span className="badge bg-success-subtle text-success border border-success">
                                  <i className="bi bi-check-circle me-1"></i>
                                  Already Approved
                                </span>
                              )}
                              {approvalStatus.status === 'rejected' && (
                                <span className="badge bg-danger-subtle text-danger border border-danger">
                                  <i className="bi bi-x-circle me-1"></i>
                                  Already Rejected
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Details Modal */}
        {showDetailsModal && viewingApplication && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className="bi bi-person-badge me-2"></i>
                    Serviceman Application Details
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowDetailsModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <strong>User ID:</strong>
                      <p className="mb-0">#{typeof viewingApplication.user === 'object' ? viewingApplication.user.id : viewingApplication.user}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <strong>Username:</strong>
                      <p className="mb-0">{typeof viewingApplication.user === 'object' ? viewingApplication.user.username : 'N/A'}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <strong>Email:</strong>
                      <p className="mb-0">{typeof viewingApplication.user === 'object' ? viewingApplication.user.email : 'N/A'}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <strong>Phone:</strong>
                      <p className="mb-0">{viewingApplication.phone_number || 'Not provided'}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <strong>Experience:</strong>
                      <p className="mb-0">{viewingApplication.years_of_experience || 0} years</p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <strong>Availability:</strong>
                      <p className="mb-0">
                        <span className={`badge ${viewingApplication.is_available ? 'bg-success' : 'bg-secondary'}`}>
                          {viewingApplication.is_available ? 'Available' : 'Not Available'}
                        </span>
                      </p>
                    </div>
                    <div className="col-12 mb-3">
                      <strong>Skills:</strong>
                      {viewingApplication.skills && viewingApplication.skills.length > 0 ? (
                        <div className="mt-2">
                          {viewingApplication.skills.map((skill: any) => (
                            <span key={skill.id} className="badge bg-info me-2 mb-2">
                              {skill.name}
                              {skill.category && (
                                <small className="ms-1 opacity-75">({skill.category})</small>
                              )}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted mb-0">No skills listed</p>
                      )}
                    </div>
                    <div className="col-12 mb-3">
                      <strong>Bio:</strong>
                      <p className="mb-0 mt-2 p-3 bg-light rounded">
                        {viewingApplication.bio || 'No bio provided'}
                      </p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <strong>Applied:</strong>
                      <p className="mb-0">{new Date(viewingApplication.created_at).toLocaleString()}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <strong>Last Updated:</strong>
                      <p className="mb-0">{new Date(viewingApplication.updated_at).toLocaleString()}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <strong>Rating:</strong>
                      <p className="mb-0">{viewingApplication.rating || '0.00'} ⭐</p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <strong>Jobs Completed:</strong>
                      <p className="mb-0">{viewingApplication.total_jobs_completed || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-danger"
                    onClick={() => {
                      setShowDetailsModal(false);
                      handleRejectClick(viewingApplication);
                    }}
                  >
                    <i className="bi bi-x-circle me-1"></i>
                    Reject
                  </button>
                  <button
                    className="btn btn-success"
                    onClick={() => {
                      setShowDetailsModal(false);
                      handleApproveClick(viewingApplication);
                    }}
                  >
                    <i className="bi bi-check-circle me-1"></i>
                    Approve
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowDetailsModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Approve/Reject Modal */}
        {showModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {modalType === 'approve' ? 'Approve Serviceman' : 'Reject Application'}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                    disabled={actionLoading}
                  ></button>
                </div>
                <div className="modal-body">
                  {modalType === 'approve' ? (
                    <>
                      <div className="alert alert-success border-0 mb-3">
                        <div className="d-flex align-items-center">
                          <i className="bi bi-person-check-fill fs-4 me-3"></i>
                          <div>
                            <strong>Approving:</strong> {typeof selectedServiceman?.user === 'object' ? selectedServiceman.user.username : `Serviceman #${selectedServiceman?.user}`}
                            <div className="small text-muted">
                              {typeof selectedServiceman?.user === 'object' && selectedServiceman.user.email}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Current Skills */}
                      {selectedServiceman?.skills && selectedServiceman.skills.length > 0 && (
                        <div className="mb-3">
                          <label className="form-label fw-bold">Current Skills:</label>
                          <div className="d-flex flex-wrap gap-1">
                            {selectedServiceman.skills.map((skill: any) => (
                              <span key={skill.id} className="badge bg-info">
                                {skill.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Category Selection */}
                      <div className="mb-3">
                        <label className="form-label fw-bold">
                          Assign Category (Optional)
                        </label>
                        <select
                          className="form-select"
                          value={categoryId}
                          onChange={(e) => setCategoryId(e.target.value)}
                        >
                          <option value="">-- Select Category --</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                        <small className="text-muted">
                          <i className="bi bi-info-circle me-1"></i>
                          Serviceman's primary expertise area
                        </small>
                      </div>

                      {/* Experience Display */}
                      {selectedServiceman?.years_of_experience && (
                        <div className="mb-3">
                          <span className="badge bg-info me-2">
                            <i className="bi bi-briefcase me-1"></i>
                            {selectedServiceman.years_of_experience} years experience
                          </span>
                          <span className="badge bg-secondary">
                            <i className="bi bi-star me-1"></i>
                            {selectedServiceman.rating || '0.0'} rating
                          </span>
                        </div>
                      )}

                      {/* Admin Notes */}
                      <div className="mb-3">
                        <label className="form-label fw-bold">Admin Notes (Optional)</label>
                        <textarea
                          className="form-control"
                          rows={3}
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Add internal notes about this approval..."
                        />
                        <small className="text-muted">These notes are for admin reference only</small>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="alert alert-danger border-0 mb-3">
                        <div className="d-flex align-items-center">
                          <i className="bi bi-exclamation-triangle-fill fs-4 me-3"></i>
                          <div>
                            <strong>Rejecting:</strong> {typeof selectedServiceman?.user === 'object' ? selectedServiceman.user.username : `Serviceman #${selectedServiceman?.user}`}
                            <div className="small">This action will notify the serviceman</div>
                          </div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label fw-bold">Rejection Reason <span className="text-danger">*</span></label>
                        <textarea
                          className="form-control"
                          rows={4}
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Provide a clear reason for rejection. This will be sent to the serviceman."
                          required
                        />
                        <small className="text-muted">Be specific and professional. This helps servicemen understand and improve.</small>
                      </div>

                      {/* Quick Reason Templates */}
                      <div className="mb-3">
                        <label className="form-label small text-muted">Quick Reasons:</label>
                        <div className="d-flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => setRejectionReason('Insufficient experience for the category')}
                          >
                            Insufficient Experience
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => setRejectionReason('Incomplete profile information')}
                          >
                            Incomplete Profile
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => setRejectionReason('Skills do not match the selected category')}
                          >
                            Skills Mismatch
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={`btn ${modalType === 'approve' ? 'btn-success' : 'btn-danger'}`}
                    onClick={modalType === 'approve' ? handleApprove : handleReject}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Processing...
                      </>
                    ) : (
                      modalType === 'approve' ? 'Approve' : 'Reject'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}

