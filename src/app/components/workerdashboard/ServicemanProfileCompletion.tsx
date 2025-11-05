import React, { useMemo } from 'react';
import { ServicemanProfile } from '../../services/userProfile';

interface Props {
  profile: ServicemanProfile | null;
}

interface CompletionCheck {
  field: string;
  label: string;
  completed: boolean;
}

export default function ServicemanProfileCompletion({ profile }: Props) {
  const { percentage, missingFields } = useMemo(() => {
    if (!profile) return { percentage: 0, missingFields: [] };

    const checks: CompletionCheck[] = [
      {
        field: 'phone_number',
        label: 'Phone Number',
        completed: Boolean(profile.phone_number && profile.phone_number.trim())
      },
      {
        field: 'category',
        label: 'Category',
        completed: Boolean(profile.category)
      },
      {
        field: 'bio',
        label: 'Bio',
        completed: Boolean(profile.bio && profile.bio.trim())
      },
      {
        field: 'years_of_experience',
        label: 'Experience',
        completed: Boolean(profile.years_of_experience && profile.years_of_experience > 0)
      },
    ];

    const completedCount = checks.filter(c => c.completed).length;
    const percentage = (completedCount / checks.length) * 100;
    const missingFields = checks.filter(c => !c.completed);

    // Debug logging
    console.log('📊 [Profile Completion] Status:', {
      percentage: `${Math.round(percentage)}%`,
      completed: `${completedCount}/${checks.length}`,
      profile: {
        phone_number: profile.phone_number || '(empty)',
        category: profile.category ? 'set' : '(empty)',
        bio: profile.bio ? `${profile.bio.length} chars` : '(empty)',
        years_of_experience: profile.years_of_experience || 0
      },
      missingFields: missingFields.map(f => f.label)
    });

    return { percentage, missingFields };
  }, [profile]);

  if (percentage === 100) return null;

  return (
    <div className="card shadow-sm border-warning mb-4">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center">
          <div className="flex-grow-1">
            <h6 className="card-title text-warning mb-1">
              <i className="bi bi-exclamation-triangle me-2"></i>
              Complete your provider profile
            </h6>
            <p className="text-muted mb-1 small">
              Missing: {missingFields.map(f => f.label).join(', ')}
            </p>
          </div>
          <a href="/profile" className="btn btn-warning btn-sm">
            Complete Profile
          </a>
        </div>
        <div className="mt-3">
          <div className="progress" style={{ height: '8px' }}>
            <div 
              className="progress-bar bg-warning" 
              style={{ width: `${Math.round(percentage)}%` }}
              role="progressbar"
              aria-valuenow={Math.round(percentage)}
              aria-valuemin={0}
              aria-valuemax={100}
            ></div>
          </div>
          <small className="text-muted mt-1 d-block">{Math.round(percentage)}% complete</small>
        </div>
      </div>
    </div>
  );
}


