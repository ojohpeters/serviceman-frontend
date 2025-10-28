'use client';

import { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';

export default function ClientProfileEdit() {
  const { clientProfile, updateClientProfile, user } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    phone_number: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Initialize form data when profile loads
  useEffect(() => {
    if (clientProfile) {
      setFormData({
        phone_number: clientProfile.phone_number || '',
        address: clientProfile.address || ''
      });
    }
  }, [clientProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await updateClientProfile(formData);
      setMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (error: any) {
      setMessage(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.user_type !== 'CLIENT') {
    return null;
  }

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="card-title mb-0">Client Profile</h5>
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
              <p><strong>Phone Number:</strong> {clientProfile?.phone_number || 'Not set'}</p>
            </div>
            <div className="col-md-6">
              <p><strong>Address:</strong> {clientProfile?.address || 'Not set'}</p>
            </div>
            {clientProfile && (
              <div className="col-12">
                <small className="text-muted">
                  Last updated: {new Date(clientProfile.updated_at).toLocaleDateString()}
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
                <label htmlFor="address" className="form-label">Address</label>
                <input
                  type="text"
                  className="form-control"
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Enter your address"
                />
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
                  if (clientProfile) {
                    setFormData({
                      phone_number: clientProfile.phone_number || '',
                      address: clientProfile.address || ''
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