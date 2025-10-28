// ============================================
// Categories Service
// Handles all category-related API operations
// ============================================

import api from './api';
import {
  Category,
  CreateCategoryData,
  UpdateCategoryData,
  CategoryServicemenResponse
} from '../types/api';

export const categoriesService = {
  /**
   * Get all categories
   */
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get('/services/categories/');
    return response.data;
  },

  /**
   * Get category by ID
   * @param categoryId - Category ID
   */
  getCategoryById: async (categoryId: number): Promise<Category> => {
    const response = await api.get(`/services/categories/${categoryId}/`);
    return response.data;
  },
  
  /**
   * Get servicemen in a category with availability details
   * @param categoryId - Category ID
   */
  getServicemenByCategory: async (categoryId: number): Promise<CategoryServicemenResponse> => {
    const response = await api.get(`/services/categories/${categoryId}/servicemen/`);
    return response.data;
  },

  // ==================== Admin Functions ====================

  /**
   * Create new category (Admin only)
   * @param categoryData - Category data
   */
  createCategory: async (categoryData: CreateCategoryData): Promise<Category> => {
    console.log('🔧 [DEBUG] Creating category with data:', categoryData);
    console.log('🔧 [DEBUG] Endpoint: /services/categories/');
    
    let retries = 3;
    let lastError;
    
    while (retries > 0) {
      try {
        const response = await api.post('/services/categories/', categoryData);
        console.log('✅ [DEBUG] Create category success:', response);
        return response.data;
      } catch (error: any) {
        lastError = error;
        retries--;
        
        console.error(`❌ [DEBUG] Create category error (attempt ${4 - retries}/3):`, {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          code: error.code,
          message: error.message,
        });
        
        if (error.code === 'ECONNABORTED' && retries > 0) {
          console.log(`🔄 [DEBUG] Timeout, ${retries} retries left...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
        
        // If it's not a timeout, don't retry
        if (error.response?.status) {
          throw error;
        }
      }
    }
    
    throw lastError;
  },

  /**
   * Update category (Admin only)
   * @param categoryId - Category ID
   * @param categoryData - Updated category data
   */
  updateCategory: async (categoryId: number, categoryData: UpdateCategoryData): Promise<Category> => {
    const response = await api.patch(`/services/categories/${categoryId}/`, categoryData);
    return response.data;
  },

  /**
   * Delete category (Admin only)
   * @param categoryId - Category ID
   */
  deleteCategory: async (categoryId: number): Promise<void> => {
    await api.delete(`/services/categories/${categoryId}/`);
  },
};

export default categoriesService;