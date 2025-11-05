import React from "react";
import { ServiceRequest } from "../../services/serviceRequests";
import { ServicemanProfile } from "../../services/userProfile";

interface WorkerStatsProps {
  serviceRequests: ServiceRequest[];
  servicemanProfile: ServicemanProfile | null;
}

export default function WorkerStats({ serviceRequests, servicemanProfile }: WorkerStatsProps): React.ReactElement {
  // Calculate stats from real data
  const calculateStats = () => {
    const completedJobs = serviceRequests.filter(request => 
      request.status === 'COMPLETED'
    ).length;

    const pendingRequests = serviceRequests.filter(request => 
      request.status === 'PENDING_ESTIMATION' || 
      request.status === 'ESTIMATION_SUBMITTED'
    ).length;

    // Calculate earnings from completed jobs (using final_cost or serviceman_estimated_cost)
    const earnings = serviceRequests
      .filter(request => request.status === 'COMPLETED')
      .reduce((total, request) => {
        const amount = request.final_cost || request.serviceman_estimated_cost || 0;
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        return total + numAmount;
      }, 0);

    // Safely handle rating - ensure it's a number
    const averageRating = servicemanProfile?.rating ? Number(servicemanProfile.rating) : 0;

    return { completedJobs, pendingRequests, earnings, averageRating };
  };

  const stats = calculateStats();

  const statCards = [
    {
      title: "Jobs Completed",
      value: stats.completedJobs,
      description: "Successfully completed services",
      icon: "bi bi-check-circle",
      color: "var(--success)"
    },
    {
      title: "Pending Requests", 
      value: stats.pendingRequests,
      description: "Jobs awaiting your response",
      icon: "bi bi-clock",
      color: "var(--warning)"
    },
    {
      title: "Total Earnings",
      value: `₦${stats.earnings.toLocaleString()}`,
      description: "From completed services",
      icon: "bi bi-currency-exchange",
      color: "var(--primary)"
    },
    {
      title: "Average Rating",
      value: `⭐ ${stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '0.0'}`,
      description: "Based on client reviews",
      icon: "bi bi-star",
      color: "var(--info)"
    }
  ];

  return (
    <div className="row g-4 mb-4">
      {statCards.map((stat, index) => (
        <div key={index} className="col-md-3">
          <div className="card shadow-sm h-100 border-0">
            <div className="card-body text-center p-3">
              <div 
                className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                style={{ 
                  width: '60px', 
                  height: '60px', 
                  background: `${stat.color}15`,
                  color: stat.color
                }}
              >
                <i className={stat.icon} style={{ fontSize: '1.5rem' }}></i>
              </div>
              <h4 className="fw-bold mb-1" style={{ color: stat.color }}>
                {stat.value}
              </h4>
              <h6 className="fw-semibold mb-1" style={{ color: "var(--foreground)" }}>
                {stat.title}
              </h6>
              <small className="text-muted">{stat.description}</small>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}