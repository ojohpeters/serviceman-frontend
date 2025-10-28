import React from 'react';

interface ServiceRequestStatsProps {
  totalRequests: number;
  ongoingServices: number;
  completedServices: number;
}

export default function ServiceRequestStats({ 
  totalRequests, 
  ongoingServices, 
  completedServices 
}: ServiceRequestStatsProps) {
  const stats = [
    {
      title: "Total Requests",
      value: totalRequests,
      icon: "bi bi-inbox",
      color: "var(--primary)",
      description: "All service requests you've made"
    },
    {
      title: "Ongoing Services",
      value: ongoingServices,
      icon: "bi bi-clock",
      color: "var(--warning)",
      description: "Services currently in progress"
    },
    {
      title: "Completed",
      value: completedServices,
      icon: "bi bi-check-circle",
      color: "var(--success)",
      description: "Services successfully completed"
    }
  ];

  return (
    <div className="row g-3 mb-4">
      {stats.map((stat, index) => (
        <div key={index} className="col-md-4">
          <div 
            className="card shadow-sm h-100 border-0"
            style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="card-subtitle mb-2 text-muted">{stat.title}</h6>
                  <h3 className="fw-bold mb-1" style={{ color: stat.color }}>
                    {stat.value}
                  </h3>
                  <small className="text-muted">{stat.description}</small>
                </div>
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{ 
                    width: '50px', 
                    height: '50px', 
                    background: `${stat.color}20`,
                    color: stat.color
                  }}
                >
                  <i className={stat.icon} style={{ fontSize: '1.2rem' }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}