'use client';

import { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { useSkills } from '../../hooks/useAPI';
import type { Skill } from '../../types/api';

export default function ServicemanProfileEdit() {
  const { servicemanProfile, updateServicemanProfile, user } = useUser();
  const { skills: allSkills, loading: skillsLoading } = useSkills();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    phone_number: '',
    bio: '',
    years_of_experience: 0,
    is_available: true,
    skill_ids: [] as number[]
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Initialize form data when profile loads
  useEffect(() => {
    if (servicemanProfile) {
      const currentSkillIds = Array.isArray(servicemanProfile.skills) 
        ? servicemanProfile.skills.map((skill: any) => skill.id)
        : [];
      
      setFormData({
        phone_number: servicemanProfile.phone_number || '',
        bio: servicemanProfile.bio || '',
        years_of_experience: servicemanProfile.years_of_experience || 0,
        is_available: servicemanProfile.is_available,
        skill_ids: currentSkillIds
      });
    }
  }, [servicemanProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await updateServicemanProfile(formData);
      setMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (error: any) {
      setMessage(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.user_type !== 'SERVICEMAN') {
    return null;
  }

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="card-title mb-0">Serviceman Profile</h5>
          {!isEditing && (
            <button 
              className="btn btn-outline-primary btn-sm"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          )}
        </div>

        {message && (
          <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-danger'}`}>
            {message}
          </div>
        )}

        {!isEditing ? (
          // Display mode
          <div className="row">
            <div className="col-md-6">
              <p><strong>Rating:</strong> ⭐ {servicemanProfile?.rating || 'No ratings yet'}</p>
              <p><strong>Jobs Completed:</strong> {servicemanProfile?.total_jobs_completed || 0}</p>
              <p><strong>Phone:</strong> {servicemanProfile?.phone_number || 'Not set'}</p>
            </div>
            <div className="col-md-6">
              <p><strong>Experience:</strong> {servicemanProfile?.years_of_experience || 0} years</p>
              <p><strong>Status:</strong> 
                <span className={`badge ${servicemanProfile?.is_available ? 'bg-success' : 'bg-danger'} ms-2`}>
                  {servicemanProfile?.is_available ? 'Available' : 'Not Available'}
                </span>
              </p>
            </div>
            <div className="col-12 mt-2">
              <p><strong>Skills:</strong></p>
              {servicemanProfile?.skills && servicemanProfile.skills.length > 0 ? (
                <div className="d-flex flex-wrap gap-2">
                  {servicemanProfile.skills.map((skill: any) => (
                    <span key={skill.id} className="badge bg-info">
                      {skill.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-muted">No skills added yet</p>
              )}
            </div>
            <div className="col-12 mt-3">
              <p><strong>Bio:</strong></p>
              <p className="text-muted">{servicemanProfile?.bio || 'No bio yet'}</p>
            </div>
            {servicemanProfile && (
              <div className="col-12 mt-2">
                <small className="text-muted">
                  Last updated: {new Date(servicemanProfile.updated_at).toLocaleDateString()}
                </small>
              </div>
            )}
          </div>
        ) : (
          // Edit mode
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="phone_number" className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className="form-control"
                  id="phone_number"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="years_of_experience" className="form-label">Years of Experience</label>
                <input
                  type="number"
                  className="form-control"
                  id="years_of_experience"
                  value={formData.years_of_experience}
                  onChange={(e) => setFormData({...formData, years_of_experience: parseInt(e.target.value) || 0})}
                  min="0"
                />
              </div>
              <div className="col-12 mb-3">
                <label htmlFor="bio" className="form-label">Bio</label>
                <textarea
                  className="form-control"
                  id="bio"
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  placeholder="Tell clients about your experience and skills..."
                />
              </div>
              
              {/* Skills Selection */}
              <div className="col-12 mb-3">
                <label className="form-label">Skills</label>
                {skillsLoading ? (
                  <div className="text-center py-3">
                    <div className="spinner-border spinner-border-sm" role="status">
                      <span className="visually-hidden">Loading skills...</span>
                    </div>
                  </div>
                ) : (
                  <div className="border rounded p-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {allSkills.length > 0 ? (
                      <>
                        <small className="text-muted d-block mb-2">
                          Select the skills you have (Ctrl+Click for multiple)
                        </small>
                        <div className="row">
                          {allSkills.map((skill: Skill) => (
                            <div key={skill.id} className="col-md-6 mb-2">
                              <div className="form-check">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id={`skill-${skill.id}`}
                                  checked={formData.skill_ids.includes(skill.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setFormData({
                                        ...formData,
                                        skill_ids: [...formData.skill_ids, skill.id]
                                      });
                                    } else {
                                      setFormData({
                                        ...formData,
                                        skill_ids: formData.skill_ids.filter(id => id !== skill.id)
                                      });
                                    }
                                  }}
                                />
                                <label className="form-check-label" htmlFor={`skill-${skill.id}`}>
                                  {skill.name}
                                  <small className="text-muted ms-2">({skill.category})</small>
                                </label>
                              </div>
                            </div>
                          ))}
                        </div>
                        <small className="text-muted d-block mt-2">
                          Selected: {formData.skill_ids.length} skill(s)
                        </small>
                      </>
                    ) : (
                      <p className="text-muted mb-0">No skills available</p>
                    )}
                  </div>
                )}
              </div>

              <div className="col-12 mb-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="is_available"
                    checked={formData.is_available}
                    onChange={(e) => setFormData({...formData, is_available: e.target.checked})}
                  />
                  <label className="form-check-label" htmlFor="is_available">
                    <strong>Available for new jobs</strong>
                  </label>
                </div>
              </div>
            </div>
            <div className="d-flex gap-2">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button 
                type="button" 
                className="btn btn-outline-secondary"
                onClick={() => {
                  setIsEditing(false);
                  setMessage('');
                  // Reset form data
                  if (servicemanProfile) {
                    const currentSkillIds = Array.isArray(servicemanProfile.skills) 
                      ? servicemanProfile.skills.map((skill: any) => skill.id)
                      : [];
                    
                    setFormData({
                      phone_number: servicemanProfile.phone_number || '',
                      bio: servicemanProfile.bio || '',
                      years_of_experience: servicemanProfile.years_of_experience || 0,
                      is_available: servicemanProfile.is_available,
                      skill_ids: currentSkillIds
                    });
                  }
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}