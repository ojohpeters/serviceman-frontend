'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '../../hooks/useAdmin';
import { usePendingServicemen } from '../../hooks/useAPI';
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

  const [selectedServiceman, setSelectedServiceman] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [viewingApplication, setViewingApplication] = useState<any>(null);
  const [modalType, setModalType] = useState<'approve' | 'reject'>('approve');
  const [categoryId, setCategoryId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Redirect if not admin
  if (!adminLoading && !isAdmin) {
    router.push('/admin/login');
    return null;
  }

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
      await approveServiceman(
        selectedServiceman.user,
        categoryId ? parseInt(categoryId) : undefined,
        notes
      );
      setShowModal(false);
      setSelectedServiceman(null);
      setCategoryId('');
      setNotes('');
      alert('Serviceman approved successfully!');
    } catch (error: any) {
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
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <Link href="/admin/dashboard" className="btn btn-outline-secondary btn-sm me-2">
              ← Back to Dashboard
            </Link>
            <h1 className="d-inline-block ms-2">Manage Servicemen</h1>
          </div>
          <button onClick={refetch} className="btn btn-outline-primary btn-sm">
            <i className="bi bi-arrow-clockwise me-1"></i>
            Refresh
          </button>
        </div>

        {/* Pending Applications Section */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-warning text-dark">
            <h5 className="mb-0">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              Pending Applications ({totalPending})
            </h5>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : totalPending === 0 ? (
              <p className="text-muted text-center py-4">No pending applications</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Phone</th>
                        <th>Skills</th>
                        <th>Experience</th>
                        <th>Bio</th>
                        <th>Applied</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingApplications.map((application: any) => (
                        <tr key={application.user}>
                          <td>
                            <strong>#{application.user}</strong>
                            {application.is_available && (
                              <span className="badge bg-success ms-1">Available</span>
                            )}
                          </td>
                          <td>{application.phone_number || 'N/A'}</td>
                          <td>
                            {application.skills && application.skills.length > 0 ? (
                              <div className="d-flex flex-wrap gap-1">
                                {application.skills.slice(0, 3).map((skill: any) => (
                                  <span key={skill.id} className="badge bg-info">
                                    {skill.name}
                                  </span>
                                ))}
                                {application.skills.length > 3 && (
                                  <span className="badge bg-secondary">
                                    +{application.skills.length - 3}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted small">No skills</span>
                            )}
                          </td>
                          <td>
                            <strong>{application.years_of_experience || 0}</strong> years
                          </td>
                          <td>
                            <div style={{ maxWidth: '250px' }} className="text-truncate" title={application.bio}>
                              {application.bio || 'No bio provided'}
                            </div>
                          </td>
                          <td>
                            <small>{new Date(application.created_at).toLocaleDateString()}</small>
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-outline-primary"
                                onClick={() => handleViewDetails(application)}
                                title="View full details"
                              >
                                <i className="bi bi-eye"></i>
                              </button>
                              <button
                                className="btn btn-success"
                                onClick={() => handleApproveClick(application)}
                                title="Approve application"
                              >
                                <i className="bi bi-check-circle"></i>
                              </button>
                              <button
                                className="btn btn-danger"
                                onClick={() => handleRejectClick(application)}
                                title="Reject application"
                              >
                                <i className="bi bi-x-circle"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
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
                      <p className="mb-0">#{viewingApplication.user}</p>
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
                      <p>Approve serviceman #{selectedServiceman?.user}?</p>
                      <div className="mb-3">
                        <label className="form-label">Category ID (Optional)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={categoryId}
                          onChange={(e) => setCategoryId(e.target.value)}
                          placeholder="Enter category ID"
                        />
                        <small className="text-muted">Leave empty to assign later</small>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Notes (Optional)</label>
                        <textarea
                          className="form-control"
                          rows={3}
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Add any notes..."
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <p>Reject application from serviceman #{selectedServiceman?.user}?</p>
                      <div className="mb-3">
                        <label className="form-label">Rejection Reason *</label>
                        <textarea
                          className="form-control"
                          rows={3}
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Provide a reason for rejection..."
                          required
                        />
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

