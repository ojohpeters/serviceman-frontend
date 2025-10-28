import React from 'react';
import { useUser } from '../../contexts/UserContext';

export default function DashboardHeader() {
  const { user, clientProfile, servicemanProfile } = useUser();
  
  // Safe access to user properties with fallbacks
  const displayName = user?.username || "User";
  const greeting = getGreeting();
  const userInitial = displayName.charAt(0).toUpperCase();
  
  const userType = user?.user_type === 'CLIENT' ? 'Client' : 
                  user?.user_type === 'SERVICEMAN' ? 'Service Provider' : 'User';
  
  const subtitle = user?.user_type === 'CLIENT' 
    ? "Overview of your requests and upcoming bookings"
    : "Manage your jobs and earnings";

  const status = servicemanProfile?.is_available ? 'Available' : 
                servicemanProfile ? 'Not Available' : undefined;

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  return (
    <div className="mb-4">
      <div className="d-flex justify-content-between align-items-start flex-wrap">
        <div>
          <h1
            className="fw-bold mb-2"
            style={{ color: "var(--foreground)", fontSize: "2.5rem" }}
          >
            {greeting}, {displayName} 👋
          </h1>
          <p
            className="mb-0 opacity-75"
            style={{ color: "var(--foreground)", fontSize: "1.1rem" }}
          >
            {subtitle}
          </p>
          {status && (
            <span className={`badge ${status === 'Available' ? 'bg-success' : 'bg-secondary'} mt-2`}>
              {status}
            </span>
          )}
        </div>
        
        {/* User info badge - Only show if user exists */}
        {user && (
          <div className="card shadow-sm" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <div className="card-body py-2">
              <div className="d-flex align-items-center gap-2">
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{ 
                    width: '40px', 
                    height: '40px', 
                    background: 'var(--primary)',
                    color: 'white',
                    fontSize: '1.2rem',
                    fontWeight: 'bold'
                  }}
                >
                  {userInitial}
                </div>
                <div>
                  <div className="fw-semibold" style={{ fontSize: '0.9rem' }}>
                    {user.username}
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                    {userType}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}