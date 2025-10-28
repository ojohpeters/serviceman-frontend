import { useState, useCallback } from 'react';
import { ServiceRequest, CreateServiceRequestData, serviceRequestsService } from '../services/serviceRequests';

export const useServiceRequests = () => {
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create service request
  const createServiceRequest = useCallback(async (requestData: CreateServiceRequestData) => {
    setLoading(true);
    setError(null);
    try {
      const newRequest = await serviceRequestsService.createServiceRequest(requestData);
      setServiceRequests(prev => [...prev, newRequest]);
      return newRequest;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create service request');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all service requests
  const fetchServiceRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const requests = await serviceRequestsService.getServiceRequests();
      setServiceRequests(requests);
      return requests;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch service requests');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch single service request
  const fetchServiceRequestById = useCallback(async (requestId: number) => {
    setLoading(true);
    setError(null);
    try {
      const request = await serviceRequestsService.getServiceRequestById(requestId);
      return request;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch service request');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    serviceRequests,
    loading,
    error,
    createServiceRequest,
    fetchServiceRequests,
    fetchServiceRequestById,
  };
};