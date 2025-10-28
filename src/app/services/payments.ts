// ============================================
// Payments Service
// Handles all payment-related API operations (Paystack integration)
// ============================================

import api from './api';
import {
  InitializePaymentData,
  InitializePaymentResponse,
  VerifyPaymentData,
  VerifyPaymentResponse,
  Payment
} from '../types/api';

export const paymentsService = {
  /**
   * Initialize booking fee payment (MUST be called before creating service request)
   * @param isEmergency - Whether this is an emergency booking (₦5,000) or normal (₦2,000)
   * @returns Payment object and Paystack checkout URL
   */
  initializeBookingFee: async (isEmergency: boolean = false): Promise<InitializePaymentResponse> => {
    console.log('💳 [Payment] Initializing booking fee payment (Emergency:', isEmergency + ')');
    const response = await api.post('/payments/initialize-booking-fee/', {
      is_emergency: isEmergency
    });
    console.log('✅ [Payment] Booking fee initialized:', response.data);
    return response.data;
  },

  /**
   * Initialize payment with Paystack
   * @param paymentData - Payment initialization data
   * @returns Payment object and Paystack checkout URL
   */
  initializePayment: async (paymentData: InitializePaymentData): Promise<InitializePaymentResponse> => {
    const response = await api.post('/payments/initialize/', paymentData);
    return response.data;
  },

  /**
   * Verify payment status
   * @param reference - Paystack payment reference
   * @returns Payment verification status
   */
  verifyPayment: async (reference: string): Promise<VerifyPaymentResponse> => {
    console.log('🔍 [Payment] Verifying payment:', reference);
    const response = await api.post('/payments/verify/', { reference });
    console.log('✅ [Payment] Verification result:', response.data.status);
    return response.data;
  },

  /**
   * Get payment details by ID
   * @param paymentId - Payment ID
   */
  getPaymentById: async (paymentId: number): Promise<Payment> => {
    const response = await api.get(`/payments/${paymentId}/`);
    return response.data;
  },

  /**
   * Helper: Redirect to Paystack checkout
   * @param paystackUrl - Paystack checkout URL from initialize payment response
   */
  redirectToPaystack: (paystackUrl: string): void => {
    if (typeof window !== 'undefined') {
      window.location.href = paystackUrl;
    }
  },

  /**
   * Helper: Complete payment flow - initialize and redirect
   * @param paymentData - Payment initialization data
   */
  completePaymentFlow: async (paymentData: InitializePaymentData): Promise<void> => {
    const response = await paymentsService.initializePayment(paymentData);
    paymentsService.redirectToPaystack(response.paystack_url);
  },
};

export default paymentsService;

