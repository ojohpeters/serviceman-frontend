'use client';
import { useRouter } from 'next/navigation';
import { useAdmin } from '../../hooks/useAdmin';
import { useAnalytics } from '../../hooks/useAPI';
import AdminGuard from '../../components/admin/AdminGuard';
import Link from 'next/link';

export default function AdminAnalyticsPage() {
  const { isAdmin, isLoading: adminLoading } = useAdmin();
  const router = useRouter();
  const { revenue, topServicemen, topCategories, loading, refetch } = useAnalytics(isAdmin);

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

  return (
    <AdminGuard>
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <Link href="/admin/dashboard" className="btn btn-outline-secondary btn-sm me-2">
              ← Back to Dashboard
            </Link>
            <h1 className="d-inline-block ms-2">Platform Analytics</h1>
          </div>
          <button onClick={refetch} className="btn btn-outline-primary btn-sm">
            <i className="bi bi-arrow-clockwise me-1"></i>
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading analytics...</p>
          </div>
        ) : (
          <>
            {/* Revenue Section */}
            <div className="row mb-4">
              <div className="col-lg-6 mb-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <h5 className="card-title d-flex align-items-center mb-4">
                      <i className="bi bi-cash-stack me-2 text-success fs-3"></i>
                      Revenue Overview
                    </h5>
                    {revenue ? (
                      <div className="row">
                        <div className="col-6">
                          <div className="text-center p-3 bg-light rounded">
                            <p className="text-muted small mb-1">Total Revenue</p>
                            <h2 className="mb-0 text-success">₦{revenue.total_revenue.toLocaleString()}</h2>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="text-center p-3 bg-light rounded">
                            <p className="text-muted small mb-1">This Month</p>
                            <h2 className="mb-0 text-primary">₦{revenue.this_month.toLocaleString()}</h2>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted">No revenue data available</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-lg-6 mb-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <h5 className="card-title d-flex align-items-center mb-4">
                      <i className="bi bi-graph-up me-2 text-info fs-3"></i>
                      Revenue Growth
                    </h5>
                    {revenue ? (
                      <div className="text-center">
                        <p className="text-muted mb-2">Monthly Percentage</p>
                        <h3 className="text-info mb-3">
                          {revenue.total_revenue > 0 
                            ? ((revenue.this_month / revenue.total_revenue) * 100).toFixed(1)
                            : 0}%
                        </h3>
                        <p className="small text-muted">
                          This month represents {revenue.total_revenue > 0 
                            ? ((revenue.this_month / revenue.total_revenue) * 100).toFixed(1)
                            : 0}% of total revenue
                        </p>
                      </div>
                    ) : (
                      <p className="text-muted">No data available</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Top Servicemen Section */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white border-0 py-3">
                <h5 className="mb-0 d-flex align-items-center">
                  <i className="bi bi-star-fill me-2 text-warning"></i>
                  Top Performing Servicemen
                </h5>
              </div>
              <div className="card-body">
                {topServicemen && topServicemen.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead>
                        <tr>
                          <th>Rank</th>
                          <th>Name</th>
                          <th>Rating</th>
                          <th>Completed Jobs</th>
                          <th>Performance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topServicemen.map((serviceman: any, index: number) => (
                          <tr key={serviceman.id}>
                            <td>
                              <span className={`badge ${
                                index === 0 ? 'bg-warning' :
                                index === 1 ? 'bg-secondary' :
                                index === 2 ? 'bg-info' : 'bg-light text-dark'
                              }`}>
                                #{index + 1}
                              </span>
                            </td>
                            <td>
                              <strong>{serviceman.full_name}</strong>
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <i className="bi bi-star-fill text-warning me-1"></i>
                                <strong>{serviceman.rating}</strong>
                              </div>
                            </td>
                            <td>{serviceman.total_jobs_completed} jobs</td>
                            <td>
                              <div className="progress" style={{ height: '8px' }}>
                                <div 
                                  className="progress-bar bg-success" 
                                  style={{ 
                                    width: `${(parseFloat(serviceman.rating) / 5) * 100}%` 
                                  }}
                                ></div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted text-center py-4">No servicemen data available</p>
                )}
              </div>
            </div>

            {/* Top Categories Section */}
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-0 py-3">
                <h5 className="mb-0 d-flex align-items-center">
                  <i className="bi bi-bar-chart-fill me-2 text-primary"></i>
                  Top Categories by Requests
                </h5>
              </div>
              <div className="card-body">
                {topCategories && topCategories.length > 0 ? (
                  <div className="row">
                    {topCategories.map((category: any, index: number) => {
                      const maxRequests = topCategories[0]?.request_count || 1;
                      const percentage = (category.request_count / maxRequests) * 100;
                      
                      return (
                        <div key={category.id} className="col-md-6 col-lg-4 mb-3">
                          <div className="card h-100 border">
                            <div className="card-body">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <h6 className="mb-0">{category.name}</h6>
                                <span className={`badge ${
                                  index === 0 ? 'bg-primary' :
                                  index === 1 ? 'bg-info' :
                                  'bg-secondary'
                                }`}>
                                  #{index + 1}
                                </span>
                              </div>
                              <h4 className="mb-2">{category.request_count}</h4>
                              <p className="text-muted small mb-2">Total Requests</p>
                              <div className="progress" style={{ height: '6px' }}>
                                <div 
                                  className="progress-bar" 
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted text-center py-4">No categories data available</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AdminGuard>
  );
}

