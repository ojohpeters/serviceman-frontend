'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '../../hooks/useAdmin';
import AdminGuard from '../../components/admin/AdminGuard';
import Link from 'next/link';
import api from '../../services/api';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: 'CLIENT' | 'SERVICEMAN' | 'ADMIN';
  phone_number?: string;
  is_email_verified: boolean;
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

interface ServicemanProfile {
  user: User;
  category?: { id: number; name: string };
  skills: { id: number; name: string }[];
  is_approved: boolean;
  is_available: boolean;
  rating: string;
  total_jobs_completed: number;
  years_of_experience: number;
  rejection_reason?: string;
}

export default function AdminUsersPage() {
  const { isAdmin, isLoading: adminLoading } = useAdmin();
  const router = useRouter();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [servicemenProfiles, setServicemenProfiles] = useState<ServicemanProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Redirect if not admin (use useEffect to avoid setState during render)
  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      router.push('/admin/login');
    }
  }, [adminLoading, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) {
      fetchAllUsers();
    }
  }, [isAdmin]);

  const fetchAllUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all users (we'll need to call multiple endpoints)
      const [clientsRes, servicemenRes, adminsRes] = await Promise.allSettled([
        api.get('/users/clients/'),
        api.get('/users/servicemen/?show_all=true'), // Get all servicemen including pending
        api.get('/users/admins/')
      ]);

      const clients = clientsRes.status === 'fulfilled' ? (clientsRes.value.data || []) : [];
      const servicemen = servicemenRes.status === 'fulfilled' ? (servicemenRes.value.data || []) : [];
      const admins = adminsRes.status === 'fulfilled' ? (adminsRes.value.data || []) : [];

      // Store servicemen profiles separately for approval status
      setServicemenProfiles(servicemen);

      // Combine all users
      const allUsersList: User[] = [
        ...clients.map((client: any) => ({
          ...client,
          user_type: 'CLIENT' as const
        })),
        ...servicemen.map((sm: any) => ({
          ...(typeof sm.user === 'object' ? sm.user : sm),
          user_type: 'SERVICEMAN' as const,
          _servicemanProfile: sm
        })),
        ...admins.map((admin: any) => ({
          ...admin,
          user_type: 'ADMIN' as const
        }))
      ];

      setAllUsers(allUsersList);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter and search users
  const filteredUsers = useMemo(() => {
    let filtered = [...allUsers];

    // Filter by role
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.user_type === roleFilter);
      
      // For servicemen, filter to show only approved ones
      if (roleFilter === 'SERVICEMAN') {
        filtered = filtered.filter(user => {
          const profile = (user as any)._servicemanProfile;
          return profile?.is_approved === true;
        });
      }
    }

    // Search by name, email, or username
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.username?.toLowerCase().includes(search) ||
        user.email?.toLowerCase().includes(search) ||
        user.first_name?.toLowerCase().includes(search) ||
        user.last_name?.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [allUsers, roleFilter, searchTerm]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalClients = allUsers.filter(u => u.user_type === 'CLIENT').length;
    const totalServicemen = allUsers.filter(u => u.user_type === 'SERVICEMAN').length;
    const approvedServicemen = servicemenProfiles.filter(sm => sm.is_approved).length;
    const totalAdmins = allUsers.filter(u => u.user_type === 'ADMIN').length;
    const activeUsers = allUsers.filter(u => u.is_active).length;
    const verifiedUsers = allUsers.filter(u => u.is_email_verified).length;

    return {
      totalClients,
      totalServicemen,
      approvedServicemen,
      totalAdmins,
      activeUsers,
      verifiedUsers,
      totalUsers: allUsers.length
    };
  }, [allUsers, servicemenProfiles]);

  const getRoleBadge = (userType: string) => {
    switch (userType) {
      case 'CLIENT':
        return <span className="badge bg-primary">Client</span>;
      case 'SERVICEMAN':
        return <span className="badge bg-success">Serviceman</span>;
      case 'ADMIN':
        return <span className="badge bg-danger">Admin</span>;
      default:
        return <span className="badge bg-secondary">Unknown</span>;
    }
  };

  const getServicemanStatus = (user: any) => {
    const profile = user._servicemanProfile;
    if (!profile) return null;

    if (profile.is_approved) {
      return <span className="badge bg-success ms-2" style={{ fontSize: '10px' }}>Approved</span>;
    } else if (profile.rejection_reason) {
      return <span className="badge bg-danger ms-2" style={{ fontSize: '10px' }}>Rejected</span>;
    } else {
      return <span className="badge bg-warning text-dark ms-2" style={{ fontSize: '10px' }}>Pending</span>;
    }
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  if (adminLoading || loading) {
    return (
      <AdminGuard>
        <div className="container mt-5">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading users...</p>
          </div>
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="container-fluid px-4 py-4">
        {/* Header */}
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
                  User Management
                </h1>
                <p className="text-muted mb-0">Manage all users across the platform</p>
              </div>
              <button onClick={fetchAllUsers} className="btn btn-primary">
                <i className="bi bi-arrow-clockwise me-2"></i>
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row mb-4">
          <div className="col-md-3 col-sm-6 mb-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <i className="bi bi-people fs-1 text-primary mb-2"></i>
                <h3 className="mb-0">{stats.totalUsers}</h3>
                <p className="text-muted small mb-0">Total Users</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6 mb-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <i className="bi bi-person-circle fs-1 text-info mb-2"></i>
                <h3 className="mb-0">{stats.totalClients}</h3>
                <p className="text-muted small mb-0">Clients</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6 mb-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <i className="bi bi-tools fs-1 text-success mb-2"></i>
                <h3 className="mb-0">{stats.approvedServicemen}</h3>
                <p className="text-muted small mb-0">Approved Servicemen</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6 mb-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <i className="bi bi-shield-check fs-1 text-danger mb-2"></i>
                <h3 className="mb-0">{stats.totalAdmins}</h3>
                <p className="text-muted small mb-0">Admins</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label fw-bold">Filter by Role</label>
                <select 
                  className="form-select"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="all">All Users ({stats.totalUsers})</option>
                  <option value="CLIENT">Clients ({stats.totalClients})</option>
                  <option value="SERVICEMAN">Approved Servicemen ({stats.approvedServicemen})</option>
                  <option value="ADMIN">Admins ({stats.totalAdmins})</option>
                </select>
              </div>
              <div className="col-md-8">
                <label className="form-label fw-bold">Search Users</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by name, email, or username..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button 
                      className="btn btn-outline-secondary"
                      onClick={() => setSearchTerm('')}
                    >
                      <i className="bi bi-x-lg"></i>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="alert alert-danger alert-dismissible">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setError(null)}
            ></button>
          </div>
        )}

        {/* Users Table */}
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-primary text-white">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="bi bi-table me-2"></i>
                {roleFilter === 'all' ? 'All Users' : 
                 roleFilter === 'CLIENT' ? 'Clients' :
                 roleFilter === 'SERVICEMAN' ? 'Approved Servicemen' :
                 'Administrators'}
              </h5>
              <span className="badge bg-white text-primary">
                {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'}
              </span>
            </div>
          </div>
          <div className="card-body p-0">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-inbox fs-1 text-muted mb-3"></i>
                <h5 className="text-muted">No users found</h5>
                <p className="text-muted small">
                  {searchTerm ? 'Try a different search term' : 'No users match the selected filter'}
                </p>
                {searchTerm && (
                  <button 
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => setSearchTerm('')}
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="border-0 ps-4">User</th>
                      <th className="border-0">Role</th>
                      <th className="border-0">Contact</th>
                      <th className="border-0">Status</th>
                      <th className="border-0">Joined</th>
                      <th className="border-0 pe-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => {
                      const profile = (user as any)._servicemanProfile;
                      return (
                        <tr key={user.id} className="border-bottom">
                          <td className="ps-4">
                            <div className="d-flex align-items-center">
                              <div 
                                className="avatar-circle text-white me-3"
                                style={{ 
                                  width: '40px', 
                                  height: '40px', 
                                  borderRadius: '50%', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center', 
                                  fontSize: '18px', 
                                  fontWeight: 'bold',
                                  background: user.user_type === 'CLIENT' ? '#0d6efd' :
                                             user.user_type === 'SERVICEMAN' ? '#198754' :
                                             '#dc3545'
                                }}
                              >
                                {user.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || '?'}
                              </div>
                              <div>
                                <div className="fw-bold text-dark">
                                  {user.first_name && user.last_name 
                                    ? `${user.first_name} ${user.last_name}`
                                    : user.username}
                                </div>
                                <div className="text-muted small">
                                  @{user.username}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            {getRoleBadge(user.user_type)}
                            {user.user_type === 'SERVICEMAN' && getServicemanStatus(user)}
                          </td>
                          <td>
                            <div className="small">
                              <div className="text-muted mb-1">
                                <i className="bi bi-envelope me-1"></i>
                                {user.email}
                              </div>
                              {user.phone_number && (
                                <div className="text-muted">
                                  <i className="bi bi-telephone me-1"></i>
                                  {user.phone_number}
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="d-flex flex-column gap-1">
                              {user.is_active ? (
                                <span className="badge bg-success-subtle text-success border border-success" style={{ fontSize: '10px' }}>
                                  <i className="bi bi-check-circle me-1"></i>
                                  Active
                                </span>
                              ) : (
                                <span className="badge bg-secondary" style={{ fontSize: '10px' }}>
                                  <i className="bi bi-x-circle me-1"></i>
                                  Inactive
                                </span>
                              )}
                              {user.is_email_verified ? (
                                <span className="badge bg-info-subtle text-info border border-info" style={{ fontSize: '10px' }}>
                                  <i className="bi bi-envelope-check me-1"></i>
                                  Verified
                                </span>
                              ) : (
                                <span className="badge bg-warning text-dark" style={{ fontSize: '10px' }}>
                                  <i className="bi bi-envelope-x me-1"></i>
                                  Unverified
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="small text-muted">
                              <i className="bi bi-calendar me-1"></i>
                              {new Date(user.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </div>
                            {user.last_login && (
                              <div className="small text-muted mt-1">
                                <i className="bi bi-clock me-1"></i>
                                Last: {new Date(user.last_login).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </div>
                            )}
                          </td>
                          <td className="pe-4">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleViewUser(user)}
                            >
                              <i className="bi bi-eye me-1"></i>
                              View
                            </button>
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

        {/* User Details Modal */}
        {showDetailsModal && selectedUser && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">
                    <i className="bi bi-person-badge me-2"></i>
                    User Details
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowDetailsModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-12 mb-4 text-center">
                      <div 
                        className="avatar-circle text-white mx-auto mb-3"
                        style={{ 
                          width: '80px', 
                          height: '80px', 
                          borderRadius: '50%', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          fontSize: '36px', 
                          fontWeight: 'bold',
                          background: selectedUser.user_type === 'CLIENT' ? '#0d6efd' :
                                     selectedUser.user_type === 'SERVICEMAN' ? '#198754' :
                                     '#dc3545'
                        }}
                      >
                        {selectedUser.username?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <h4 className="mb-1">
                        {selectedUser.first_name && selectedUser.last_name
                          ? `${selectedUser.first_name} ${selectedUser.last_name}`
                          : selectedUser.username}
                      </h4>
                      <div className="mb-2">
                        {getRoleBadge(selectedUser.user_type)}
                        {selectedUser.user_type === 'SERVICEMAN' && getServicemanStatus(selectedUser)}
                      </div>
                    </div>

                    <div className="col-md-6 mb-3">
                      <strong>User ID:</strong>
                      <p className="mb-0">#{selectedUser.id}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <strong>Username:</strong>
                      <p className="mb-0">@{selectedUser.username}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <strong>Email:</strong>
                      <p className="mb-0">{selectedUser.email}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <strong>Phone:</strong>
                      <p className="mb-0">{selectedUser.phone_number || 'Not provided'}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <strong>Account Status:</strong>
                      <p className="mb-0">
                        {selectedUser.is_active ? (
                          <span className="badge bg-success">Active</span>
                        ) : (
                          <span className="badge bg-secondary">Inactive</span>
                        )}
                      </p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <strong>Email Status:</strong>
                      <p className="mb-0">
                        {selectedUser.is_email_verified ? (
                          <span className="badge bg-success">Verified</span>
                        ) : (
                          <span className="badge bg-warning text-dark">Unverified</span>
                        )}
                      </p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <strong>Member Since:</strong>
                      <p className="mb-0">{new Date(selectedUser.created_at).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}</p>
                    </div>
                    {selectedUser.last_login && (
                      <div className="col-md-6 mb-3">
                        <strong>Last Login:</strong>
                        <p className="mb-0">{new Date(selectedUser.last_login).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}</p>
                      </div>
                    )}

                    {/* Serviceman-specific details */}
                    {selectedUser.user_type === 'SERVICEMAN' && (selectedUser as any)._servicemanProfile && (
                      <>
                        <div className="col-12 mt-3">
                          <hr />
                          <h6 className="text-primary">
                            <i className="bi bi-tools me-2"></i>
                            Serviceman Profile
                          </h6>
                        </div>
                        <div className="col-md-6 mb-3">
                          <strong>Category:</strong>
                          <p className="mb-0">
                            {(selectedUser as any)._servicemanProfile.category?.name || 'Not assigned'}
                          </p>
                        </div>
                        <div className="col-md-6 mb-3">
                          <strong>Experience:</strong>
                          <p className="mb-0">
                            {(selectedUser as any)._servicemanProfile.years_of_experience || 0} years
                          </p>
                        </div>
                        <div className="col-md-6 mb-3">
                          <strong>Rating:</strong>
                          <p className="mb-0">
                            <span className="badge bg-warning text-dark">
                              ⭐ {(selectedUser as any)._servicemanProfile.rating || '0.0'}
                            </span>
                          </p>
                        </div>
                        <div className="col-md-6 mb-3">
                          <strong>Jobs Completed:</strong>
                          <p className="mb-0">
                            {(selectedUser as any)._servicemanProfile.total_jobs_completed || 0}
                          </p>
                        </div>
                        <div className="col-md-6 mb-3">
                          <strong>Availability:</strong>
                          <p className="mb-0">
                            {(selectedUser as any)._servicemanProfile.is_available ? (
                              <span className="badge bg-success">Available</span>
                            ) : (
                              <span className="badge bg-secondary">Not Available</span>
                            )}
                          </p>
                        </div>
                        <div className="col-12 mb-3">
                          <strong>Skills:</strong>
                          {(selectedUser as any)._servicemanProfile.skills?.length > 0 ? (
                            <div className="mt-2">
                              {(selectedUser as any)._servicemanProfile.skills.map((skill: any) => (
                                <span key={skill.id} className="badge bg-info me-2 mb-2">
                                  {skill.name}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-muted mb-0 mt-1">No skills listed</p>
                          )}
                        </div>
                        {(selectedUser as any)._servicemanProfile.bio && (
                          <div className="col-12 mb-3">
                            <strong>Bio:</strong>
                            <p className="mb-0 mt-2 p-3 bg-light rounded">
                              {(selectedUser as any)._servicemanProfile.bio}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  {selectedUser.user_type === 'SERVICEMAN' && !(selectedUser as any)._servicemanProfile?.is_approved && (
                    <Link 
                      href="/admin/servicemen"
                      className="btn btn-primary"
                      onClick={() => setShowDetailsModal(false)}
                    >
                      <i className="bi bi-person-check me-1"></i>
                      Review Application
                    </Link>
                  )}
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
      </div>
    </AdminGuard>
  );
}
