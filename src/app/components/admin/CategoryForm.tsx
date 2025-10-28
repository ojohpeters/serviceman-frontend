"use client";
import { useState } from "react";
import {
  Category,
  CreateCategoryData,
  UpdateCategoryData,
  categoriesService,
} from "../../services/categories";
import { useAdmin } from "../../hooks/useAdmin";

interface CategoryFormProps {
  category?: Category; // For edit mode
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CategoryForm({
  category,
  onSuccess,
  onCancel,
}: CategoryFormProps) {
  const { isAdmin } = useAdmin();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateCategoryData>({
    name: category?.name || "",
    description: category?.description || "",
    icon_url: category?.icon_url || undefined, // Use undefined instead of empty string
  });

  if (!isAdmin) {
    return (
      <div className="alert alert-warning">
        Admin access required to manage categories.
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  try {
    // Clean the data - remove empty strings for optional fields
    const cleanData: CreateCategoryData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
    };
    
    // Only add icon_url if it has a value
    if (formData.icon_url && formData.icon_url.trim()) {
      cleanData.icon_url = formData.icon_url.trim();
    }
    
    console.log('🔧 Submitting category data:', cleanData);
    console.log('🌐 Full URL:', 'https://serviceman-backend.onrender.com/api/services/categories/');
    console.log('🔑 Auth token present:', !!localStorage.getItem('accessToken'));
    
    let result;
    if (category) {
      console.log('📝 Updating category:', category.id);
      result = await categoriesService.updateCategory(category.id, cleanData);
    } else {
      console.log('➕ Creating new category');
      result = await categoriesService.createCategory(cleanData);
    }
    
    console.log('✅ Operation successful:', result);
    onSuccess?.();
  } catch (err: any) {
    console.error('❌ Category form error:', err);
    console.error('❌ Full error object:', {
      message: err.message,
      code: err.code,
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data,
      headers: err.response?.headers,
    });
    
    // Extract detailed error message
    let errorMessage = 'Something went wrong';
    
    if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
      errorMessage = 'Request timed out. The server might be starting up. Please try again in a moment.';
    } else if (err.response?.status === 500) {
      errorMessage = 'Internal Server Error. This might be a backend issue. Check: 1) Is the backend running? 2) Are you logged in as admin? 3) Check backend logs for details.';
    } else if (err.response?.status === 401) {
      errorMessage = 'Unauthorized. Please log in as admin.';
    } else if (err.response?.status === 403) {
      errorMessage = 'Forbidden. You need admin permissions to create categories.';
    } else if (err.response?.data) {
      // Backend error response
      const data = err.response.data;
      if (typeof data === 'string') {
        errorMessage = data;
      } else if (data.detail) {
        errorMessage = data.detail;
      } else if (data.message) {
        errorMessage = data.message;
      } else if (data.error) {
        errorMessage = data.error;
      } else {
        // Try to extract field errors
        const fieldErrors = Object.entries(data)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join('; ');
        if (fieldErrors) {
          errorMessage = fieldErrors;
        }
      }
    } else if (err.message) {
      errorMessage = err.message;
    }
    
    console.error('📝 Final error message:', errorMessage);
    setError(errorMessage);
  } finally {
    setLoading(false);
  }
};
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="card-title mb-0">
          {category ? "Edit Category" : "Create New Category"}
        </h5>
      </div>
      <div className="card-body">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">
              Category Name *
            </label>
            <input
              type="text"
              className="form-control"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="description" className="form-label">
              Description *
            </label>
            <textarea
              className="form-control"
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="icon_url" className="form-label">
              Icon URL
            </label>
            <input
              type="url"
              className="form-control"
              id="icon_url"
              name="icon_url"
              value={formData.icon_url}
              onChange={handleChange}
              placeholder="https://example.com/icon.png"
              disabled={loading}
            />
          </div>

          <div className="d-flex gap-2">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  {category ? "Updating..." : "Creating..."}
                </>
              ) : category ? (
                "Update Category"
              ) : (
                "Create Category"
              )}
            </button>

            {onCancel && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
