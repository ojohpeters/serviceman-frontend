import { ServiceRequestStatus } from "../types/api";

// ============================================
// Service Request Status Helper Functions
// ============================================

export interface StatusConfig {
  label: string;
  description: string;
  color: string;
  badgeClass: string;
  icon: string;
  canCancel: boolean;
  isActionRequired: boolean;
  requiresPayment?: boolean;
  requiresReview?: boolean;
  isFinal?: boolean;
  progressPercent: number;
  nextStatus?: string[];
}

// Status configuration map
const statusConfigs: Record<string, StatusConfig> = {
  // Initial State
  [ServiceRequestStatus.PENDING_ADMIN_ASSIGNMENT]: {
    label: "Waiting for Assignment",
    description: "Waiting for admin to assign a serviceman",
    color: "yellow",
    badgeClass: "bg-yellow-100 text-yellow-800",
    icon: "clock",
    canCancel: true,
    isActionRequired: false,
    progressPercent: 0,
  },
  
  // Estimation Phase
  [ServiceRequestStatus.PENDING_ESTIMATION]: {
    label: "Pending Estimation",
    description: "Serviceman is preparing your estimate",
    color: "blue",
    badgeClass: "bg-blue-100 text-blue-800",
    icon: "calculator",
    canCancel: true,
    isActionRequired: false,
    progressPercent: 12,
  },
  
  [ServiceRequestStatus.ESTIMATION_SUBMITTED]: {
    label: "Processing Estimate",
    description: "Admin is adding platform fees",
    color: "orange",
    badgeClass: "bg-orange-100 text-orange-800",
    icon: "document",
    canCancel: true,
    isActionRequired: false,
    progressPercent: 25,
  },
  
  // Client Approval & Payment Phase
  [ServiceRequestStatus.AWAITING_CLIENT_APPROVAL]: {
    label: "Awaiting Your Approval",
    description: "Please review and pay the final amount",
    color: "amber",
    badgeClass: "bg-amber-100 text-amber-800",
    icon: "credit-card",
    canCancel: true,
    isActionRequired: true,
    requiresPayment: true,
    progressPercent: 37,
  },
  
  [ServiceRequestStatus.PAYMENT_COMPLETED]: {
    label: "Ready to Start",
    description: "Payment received. Serviceman will begin work soon",
    color: "green",
    badgeClass: "bg-green-100 text-green-800",
    icon: "check-circle",
    canCancel: false,
    isActionRequired: false,
    progressPercent: 50,
  },
  
  // Execution Phase
  [ServiceRequestStatus.IN_PROGRESS]: {
    label: "Work in Progress",
    description: "Service is currently being performed",
    color: "indigo",
    badgeClass: "bg-indigo-100 text-indigo-800",
    icon: "wrench",
    canCancel: false,
    isActionRequired: false,
    progressPercent: 62,
  },
  
  [ServiceRequestStatus.COMPLETED]: {
    label: "Service Completed",
    description: "Please rate your experience",
    color: "green",
    badgeClass: "bg-green-100 text-green-800",
    icon: "check-badge",
    canCancel: false,
    isActionRequired: true,
    requiresReview: true,
    progressPercent: 75,
  },
  
  // Final State
  [ServiceRequestStatus.CLIENT_REVIEWED]: {
    label: "All Done!",
    description: "Thank you for using ServiceMan",
    color: "purple",
    badgeClass: "bg-purple-100 text-purple-800",
    icon: "sparkles",
    canCancel: false,
    isActionRequired: false,
    isFinal: true,
    progressPercent: 100,
  },
  
  // Cancellation State
  [ServiceRequestStatus.CANCELLED]: {
    label: "Cancelled",
    description: "This request was cancelled",
    color: "gray",
    badgeClass: "bg-gray-100 text-gray-800",
    icon: "x-circle",
    canCancel: false,
    isActionRequired: false,
    progressPercent: 0,
  },
  
  // Legacy Statuses
  [ServiceRequestStatus.ASSIGNED_TO_SERVICEMAN]: {
    label: "Assigned",
    description: "Serviceman has been assigned",
    color: "blue",
    badgeClass: "bg-blue-100 text-blue-800",
    icon: "user-check",
    canCancel: true,
    isActionRequired: false,
    progressPercent: 12,
  },
  
  [ServiceRequestStatus.SERVICEMAN_INSPECTED]: {
    label: "Inspected",
    description: "Site inspection completed",
    color: "cyan",
    badgeClass: "bg-cyan-100 text-cyan-800",
    icon: "eye",
    canCancel: true,
    isActionRequired: false,
    progressPercent: 25,
  },
  
  [ServiceRequestStatus.NEGOTIATING]: {
    label: "Negotiating",
    description: "Price negotiation in progress",
    color: "amber",
    badgeClass: "bg-amber-100 text-amber-800",
    icon: "chat",
    canCancel: true,
    isActionRequired: false,
    progressPercent: 25,
  },
  
  [ServiceRequestStatus.AWAITING_PAYMENT]: {
    label: "Awaiting Payment",
    description: "Payment pending",
    color: "orange",
    badgeClass: "bg-orange-100 text-orange-800",
    icon: "credit-card",
    canCancel: true,
    isActionRequired: true,
    requiresPayment: true,
    progressPercent: 37,
  },
  
  [ServiceRequestStatus.PAYMENT_CONFIRMED]: {
    label: "Payment Confirmed",
    description: "Payment has been confirmed",
    color: "green",
    badgeClass: "bg-green-100 text-green-800",
    icon: "check-circle",
    canCancel: false,
    isActionRequired: false,
    progressPercent: 50,
  },
};

/**
 * Get status configuration for a given status
 */
export const getStatusConfig = (status: string): StatusConfig => {
  return statusConfigs[status] || statusConfigs[ServiceRequestStatus.CANCELLED];
};

/**
 * Check if request can be cancelled based on status
 */
export const canCancelRequest = (status: string): boolean => {
  const config = getStatusConfig(status);
  return config.canCancel;
};

/**
 * Check if user action is required based on status and role
 */
export const requiresUserAction = (
  status: string,
  userRole: 'CLIENT' | 'SERVICEMAN' | 'ADMIN'
): boolean => {
  const config = getStatusConfig(status);
  
  if (!config.isActionRequired) return false;
  
  // Map status to required role for action
  const roleActionMap: Record<string, ('CLIENT' | 'SERVICEMAN' | 'ADMIN')[]> = {
    [ServiceRequestStatus.AWAITING_CLIENT_APPROVAL]: ['CLIENT'],
    [ServiceRequestStatus.COMPLETED]: ['CLIENT'],
    [ServiceRequestStatus.PENDING_ESTIMATION]: ['SERVICEMAN'],
    [ServiceRequestStatus.PENDING_ADMIN_ASSIGNMENT]: ['ADMIN'],
    [ServiceRequestStatus.ESTIMATION_SUBMITTED]: ['ADMIN'],
    [ServiceRequestStatus.AWAITING_PAYMENT]: ['CLIENT'],
    [ServiceRequestStatus.IN_PROGRESS]: ['SERVICEMAN'],
  };
  
  const requiredRoles = roleActionMap[status];
  return requiredRoles?.includes(userRole) || false;
};

/**
 * Get progress percentage for status
 */
export const getProgressPercent = (status: string): number => {
  return getStatusConfig(status).progressPercent;
};

/**
 * Get status color
 */
export const getStatusColor = (status: string): string => {
  return getStatusConfig(status).color;
};

/**
 * Get badge class for status
 */
export const getStatusBadgeClass = (status: string): string => {
  return getStatusConfig(status).badgeClass;
};

/**
 * Check if status requires payment
 */
export const requiresPayment = (status: string): boolean => {
  return getStatusConfig(status).requiresPayment || false;
};

/**
 * Check if status requires review
 */
export const requiresReview = (status: string): boolean => {
  return getStatusConfig(status).requiresReview || false;
};

/**
 * Check if status is final (completed)
 */
export const isFinalStatus = (status: string): boolean => {
  return getStatusConfig(status).isFinal || false;
};

/**
 * Get icon name for status
 */
export const getStatusIcon = (status: string): string => {
  return getStatusConfig(status).icon;
};

/**
 * Get all status transitions for a given status
 */
export const getNextStatuses = (currentStatus: string): string[] => {
  const nextStatusMap: Record<string, string[]> = {
    [ServiceRequestStatus.PENDING_ADMIN_ASSIGNMENT]: [
      ServiceRequestStatus.PENDING_ESTIMATION,
      ServiceRequestStatus.CANCELLED,
    ],
    [ServiceRequestStatus.PENDING_ESTIMATION]: [
      ServiceRequestStatus.ESTIMATION_SUBMITTED,
      ServiceRequestStatus.CANCELLED,
    ],
    [ServiceRequestStatus.ESTIMATION_SUBMITTED]: [
      ServiceRequestStatus.AWAITING_CLIENT_APPROVAL,
      ServiceRequestStatus.CANCELLED,
    ],
    [ServiceRequestStatus.AWAITING_CLIENT_APPROVAL]: [
      ServiceRequestStatus.PAYMENT_COMPLETED,
      ServiceRequestStatus.CANCELLED,
    ],
    [ServiceRequestStatus.PAYMENT_COMPLETED]: [
      ServiceRequestStatus.IN_PROGRESS,
    ],
    [ServiceRequestStatus.IN_PROGRESS]: [
      ServiceRequestStatus.COMPLETED,
    ],
    [ServiceRequestStatus.COMPLETED]: [
      ServiceRequestStatus.CLIENT_REVIEWED,
    ],
    [ServiceRequestStatus.CLIENT_REVIEWED]: [],
    [ServiceRequestStatus.CANCELLED]: [],
    
    // Legacy mappings
    [ServiceRequestStatus.ASSIGNED_TO_SERVICEMAN]: [
      ServiceRequestStatus.SERVICEMAN_INSPECTED,
      ServiceRequestStatus.CANCELLED,
    ],
    [ServiceRequestStatus.SERVICEMAN_INSPECTED]: [
      ServiceRequestStatus.NEGOTIATING,
      ServiceRequestStatus.AWAITING_PAYMENT,
      ServiceRequestStatus.CANCELLED,
    ],
    [ServiceRequestStatus.NEGOTIATING]: [
      ServiceRequestStatus.AWAITING_PAYMENT,
      ServiceRequestStatus.CANCELLED,
    ],
    [ServiceRequestStatus.AWAITING_PAYMENT]: [
      ServiceRequestStatus.PAYMENT_CONFIRMED,
      ServiceRequestStatus.CANCELLED,
    ],
    [ServiceRequestStatus.PAYMENT_CONFIRMED]: [
      ServiceRequestStatus.IN_PROGRESS,
    ],
  };
  
  return nextStatusMap[currentStatus] || [];
};

/**
 * Get status display info with icon
 */
export const getStatusDisplayInfo = (status: string) => {
  const config = getStatusConfig(status);
  return {
    ...config,
    iconName: config.icon,
  };
};

