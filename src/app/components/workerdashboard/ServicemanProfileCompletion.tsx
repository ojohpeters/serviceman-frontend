import React from 'react';
import { ServicemanProfile } from '../../services/userProfile';

interface Props {
  profile: ServicemanProfile | null;
}

export default function ServicemanProfileCompletion({ profile }: Props) {
  const completionPercentage = calculateCompletion(profile);

  function calculateCompletion(p: ServicemanProfile | null): number {
    if (!p) return 0;
    let completed = 0;
    const checks = [
      Boolean(p.phone_number),
      Boolean(p.category),
      Boolean(p.bio),
      Boolean(p.years_of_experience && p.years_of_experience > 0),
    ];
    completed = checks.filter(Boolean).length;
    const total = checks.length;
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
              Complete your provider profile
            </h6>
            <p className="text-muted mb-0 small">
              Add phone, category, bio, and experience to improve matches
            </p>
          </div>
          <a href="#" className="btn btn-warning btn-sm">
            Complete Profile
          </a>
        </div>
        <div className="mt-2">
          <div className="progress" style={{ height: '6px' }}>
            <div className="progress-bar bg-warning" style={{ width: `${Math.round(completionPercentage)}%` }}></div>
          </div>
          <small className="text-muted">{Math.round(completionPercentage)}% complete</small>
        </div>
      </div>
    </div>
  );
}


