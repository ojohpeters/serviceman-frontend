import React from 'react';
import { ClientProfile } from '../../services/userProfile';

interface ProfileCompletionProps {
  clientProfile: ClientProfile | null;
}

export default function ProfileCompletion({ clientProfile }: ProfileCompletionProps) {
  const completionPercentage = calculateCompletion(clientProfile);

  function calculateCompletion(profile: ClientProfile | null): number {
    if (!profile) return 0;
    
    let completed = 0;
    const total = 2; // phone_number and address
    
    if (profile.phone_number) completed++;
    if (profile.address) completed++;
    
    return (completed / total) * 100;
  }

  if (completionPercentage === 100) return null;

  return (
    <div className="card shadow-sm border-warning mb-4">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h6 className="card-title text-warning mb-1">
              <i className="bi bi-exclamation-triangle me-2"></i>
              Complete your profile
            </h6>
            <p className="text-muted mb-0 small">
              Add your phone number and address to get better service matches
            </p>
          </div>
          <a href="/profile" className="btn btn-warning btn-sm">
            Complete Profile
          </a>
        </div>
        <div className="mt-2">
          <div className="progress" style={{ height: '6px' }}>
            <div 
              className="progress-bar bg-warning" 
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          <small className="text-muted">{Math.round(completionPercentage)}% complete</small>
        </div>
      </div>
    </div>
  );
}