// ============================================
// Negotiations Service
// Handles all price negotiation-related API operations
// ============================================

import api from './api';
import {
  PriceNegotiation,
  CreateNegotiationData,
  CounterNegotiationData
} from '../types/api';

export const negotiationsService = {
  /**
   * List negotiations for a service request
   * @param requestId - Service request ID (required)
   */
  getNegotiations: async (requestId: number): Promise<PriceNegotiation[]> => {
    const response = await api.get(`/negotiations/?request_id=${requestId}`);
    return response.data;
  },

  /**
   * Get negotiation by ID
   * @param negotiationId - Negotiation ID
   */
  getNegotiationById: async (negotiationId: number): Promise<PriceNegotiation> => {
    const response = await api.get(`/negotiations/${negotiationId}/`);
    return response.data;
  },

  /**
   * Create a new negotiation
   * @param negotiationData - Negotiation data including service request, proposed amount, and message
   */
  createNegotiation: async (negotiationData: CreateNegotiationData): Promise<PriceNegotiation> => {
    const response = await api.post('/negotiations/create/', negotiationData);
    return response.data;
  },

  /**
   * Accept a negotiation
   * @param negotiationId - Negotiation ID
   */
  acceptNegotiation: async (negotiationId: number): Promise<{ status: string }> => {
    const response = await api.post(`/negotiations/${negotiationId}/accept/`);
    return response.data;
  },

  /**
   * Counter a negotiation with a new offer
   * @param negotiationId - Negotiation ID
   * @param counterData - Counter offer data including proposed amount and message
   */
  counterNegotiation: async (
    negotiationId: number,
    counterData: CounterNegotiationData
  ): Promise<PriceNegotiation> => {
    const response = await api.post(`/negotiations/${negotiationId}/counter/`, counterData);
    return response.data;
  },

  /**
   * Reject a negotiation
   * @param negotiationId - Negotiation ID
   */
  rejectNegotiation: async (negotiationId: number): Promise<{ status: string }> => {
    const response = await api.post(`/negotiations/${negotiationId}/reject/`);
    return response.data;
  },
};

export default negotiationsService;

