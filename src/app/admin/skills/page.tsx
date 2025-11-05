'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '../../hooks/useAdmin';
import { useSkills } from '../../hooks/useAPI';
import { skillsService } from '../../services/skills';
import AdminGuard from '../../components/admin/AdminGuard';
import Link from 'next/link';
import type { Skill, SkillCategory } from '../../types/api';

export default function AdminSkillsPage() {
  const { isAdmin, isLoading: adminLoading } = useAdmin();
  const router = useRouter();
  const { skills, loading, refetch } = useSkills(undefined, isAdmin);
  
  const [showForm, setShowForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'TECHNICAL' as SkillCategory,
    description: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Redirect if not admin (use useEffect to avoid setState during render)
  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      router.push('/admin/login');
    }
  }, [adminLoading, isAdmin, router]);

  if (adminLoading) {
    return (
      <div className="container mt-5">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    try {
      if (editingSkill) {
        await skillsService.updateSkill(editingSkill.id, formData);
      } else {
        await skillsService.createSkill(formData);
      }
      setShowForm(false);
      setEditingSkill(null);
      setFormData({ name: '', category: 'TECHNICAL', description: '' });
      refetch();
      alert(`Skill ${editingSkill ? 'updated' : 'created'} successfully!`);
    } catch (error: any) {
      setFormError(error.response?.data?.detail || 'Operation failed');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (skill: Skill) => {
    setEditingSkill(skill);
    setFormData({
      name: skill.name,
      category: skill.category,
      description: skill.description
    });
    setShowForm(true);
  };

  const handleDelete = async (skillId: number) => {
    if (!confirm('Are you sure you want to delete this skill?')) return;

    try {
      await skillsService.deleteSkill(skillId);
      refetch();
      alert('Skill deleted successfully!');
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Delete failed');
    }
  };

  // Group skills by category
  const groupedSkills = skills.reduce((acc: any, skill: Skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {});

  return (
    <AdminGuard>
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <Link href="/admin/dashboard" className="btn btn-outline-secondary btn-sm me-2">
              ← Back
            </Link>
            <h1 className="d-inline-block ms-2">Manage Skills</h1>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingSkill(null);
              setFormData({ name: '', category: 'TECHNICAL', description: '' });
              setShowForm(true);
            }}
          >
            <i className="bi bi-plus-circle me-1"></i>
            Add Skill
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">{editingSkill ? 'Edit' : 'Create'} Skill</h5>
            </div>
            <div className="card-body">
              {formError && <div className="alert alert-danger">{formError}</div>}
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Skill Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Category *</label>
                    <select
                      className="form-select"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as SkillCategory })}
                      required
                    >
                      <option value="TECHNICAL">Technical</option>
                      <option value="MANUAL">Manual</option>
                      <option value="CREATIVE">Creative</option>
                      <option value="PROFESSIONAL">Professional</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div className="col-12 mb-3">
                    <label className="form-label">Description *</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary" disabled={formLoading}>
                    {formLoading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowForm(false)}
                    disabled={formLoading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Skills List */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" role="status"></div>
          </div>
        ) : (
          Object.entries(groupedSkills).map(([category, categorySkills]: [string, any]) => (
            <div key={category} className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-light">
                <h5 className="mb-0">
                  <i className="bi bi-tag me-2"></i>
                  {category} ({categorySkills.length})
                </h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categorySkills.map((skill: Skill) => (
                        <tr key={skill.id}>
                          <td><strong>{skill.name}</strong></td>
                          <td>{skill.description}</td>
                          <td>
                            <span className={`badge ${skill.is_active ? 'bg-success' : 'bg-secondary'}`}>
                              {skill.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-outline-primary"
                                onClick={() => handleEdit(skill)}
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button
                                className="btn btn-outline-danger"
                                onClick={() => handleDelete(skill.id)}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </AdminGuard>
  );
}

