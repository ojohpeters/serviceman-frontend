// ============================================
// Serviceman Job History Service
// Handles serviceman job history and statistics
// ============================================

import api from './api';
import { ServiceRequest } from '../types/api';

export interface ServicemanJobHistoryResponse {
  serviceman: {
    id: number;
    username: string;
    email: string;
    full_name: string;
  };
  statistics: {
    total_jobs: number;
    completed_jobs: number;
    in_progress_jobs: number;
    completion_rate: number;
    total_earnings: string;
    average_job_value: string;
  };
  filters_applied: {
    status: string | null;
    year: number | null;
    month: number | null;
    limit: number;
  };
  jobs: ServiceRequest[];
  retrieved_at: string;
}

export const servicemanJobHistoryService = {
  /**
   * Get serviceman job history with statistics
   * @param filters - Optional filters (status, year, month, limit)
   */
  getJobHistory: async (filters?: {
    status?: string;
    year?: number;
    month?: number;
    limit?: number;
  }): Promise<ServicemanJobHistoryResponse> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    
    const url = params.toString() ? `/services/serviceman/job-history/?${params.toString()}` : '/services/serviceman/job-history/';
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Get job statistics only
   */
  getJobStatistics: async (): Promise<ServicemanJobHistoryResponse['statistics']> => {
    const response = await servicemanJobHistoryService.getJobHistory({ limit: 1 });
    return response.statistics;
  },

  /**
   * Get completed jobs only
   */
  getCompletedJobs: async (limit?: number): Promise<ServiceRequest[]> => {
    const response = await servicemanJobHistoryService.getJobHistory({ 
      status: 'COMPLETED',
      limit: limit || 50
    });
    return response.jobs;
  },

  /**
   * Get jobs by year
   */
  getJobsByYear: async (year: number, limit?: number): Promise<ServicemanJobHistoryResponse> => {
    return servicemanJobHistoryService.getJobHistory({ 
      year,
      limit: limit || 50
    });
  },

  /**
   * Get jobs by month
   */
  getJobsByMonth: async (year: number, month: number, limit?: number): Promise<ServicemanJobHistoryResponse> => {
    return servicemanJobHistoryService.getJobHistory({ 
      year,
      month,
      limit: limit || 50
    });
  },
};

export default servicemanJobHistoryService;
