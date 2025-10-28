'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Category, categoriesService } from '../../services/categories';
import { useAdmin } from '../../hooks/useAdmin';
import CategoryForm from '../../components/admin/CategoryForm';
import AdminGuard from '../../components/admin/AdminGuard';
import Link from 'next/link';

export default function AdminCategoriesPage() {
  const { isAdmin, isLoading } = useAdmin();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/admin/login');
    }
  }, [isAdmin, isLoading, router]);

  const loadCategories = async () => {
  try {
    setLoading(true);
    setError(null);
    const data = await categoriesService.getCategories();
    setCategories(data);
  } catch (err: any) {
    setError(err.message || 'Failed to load categories');
  } finally {
    setLoading(false);
  }
};
  useEffect(() => {
    if (isAdmin) {
      loadCategories();
    }
  }, [isAdmin]);

  const handleCreateSuccess = () => {
  setShowForm(false);
  // Force a reload and clear any cached data
  setCategories([]); 
  loadCategories(); 
};
  const handleEditSuccess = () => {
    setEditingCategory(null);
    loadCategories();
  };

  const handleDelete = async (categoryId: number) => {
    if (!confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      await categoriesService.deleteCategory(categoryId);
      loadCategories();
    } catch (err: any) {
      setError(err.message || 'Failed to delete category');
    }
  };

  return (
    <AdminGuard>
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <Link href="/admin/dashboard" className="btn btn-outline-secondary btn-sm me-2">
              ← Back to Dashboard
            </Link>
            <h1 className="d-inline-block ms-2">Manage Categories</h1>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
            disabled={showForm || !!editingCategory}
          >
            + Add Category
          </button>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {showForm && (
          <div className="mb-4">
            <CategoryForm
              onSuccess={handleCreateSuccess}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {editingCategory && (
          <div className="mb-4">
            <CategoryForm
              category={editingCategory}
              onSuccess={handleEditSuccess}
              onCancel={() => setEditingCategory(null)}
            />
          </div>
        )}

        <div className="card">
          <div className="card-header">
            <h5 className="card-title mb-0">Categories</h5>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="text-center">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : categories.length === 0 ? (
              <p className="text-muted">No categories found.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category) => (
                      <tr key={category.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            {category.icon_url && (
                              <img
                                src={category.icon_url}
                                alt={category.name}
                                className="rounded me-2"
                                style={{ width: '30px', height: '30px', objectFit: 'cover' }}
                              />
                            )}
                            <strong>{category.name}</strong>
                          </div>
                        </td>
                        <td>{category.description}</td>
                        <td>
                          <span className={`badge ${category.is_active ? 'bg-success' : 'bg-secondary'}`}>
                            {category.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => setEditingCategory(category)}
                              disabled={!!editingCategory}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => handleDelete(category.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}