// ============================================
// ServiceMan Platform - TypeScript Type Definitions
// Version: 2.0.0
// ============================================

// ==================== User Types ====================

export interface User {
  id: number;
  username: string;
  email: string;
  user_type: 'ADMIN' | 'SERVICEMAN' | 'CLIENT';
  is_email_verified: boolean;
  first_name?: string;
  last_name?: string;
}

export interface ClientProfile {
  user: User | number;
  phone_number: string;
  address: string;
  created_at: string;
  updated_at: string;
}

export interface ServicemanProfile {
  user: User | number;
  category: Category | null;
  skills: Skill[];
  rating: string;
  total_jobs_completed: number;
  bio: string;
  years_of_experience: number | null;
  phone_number: string;
  is_available: boolean;
  active_jobs_count: number;
  availability_status: AvailabilityStatus;
  is_approved: boolean;
  approved_by: number | null;
  approved_at: string | null;
  rejection_reason: string;
  created_at: string;
  updated_at: string;
}

// ==================== Skill Types ====================

export type SkillCategory = 'TECHNICAL' | 'MANUAL' | 'CREATIVE' | 'PROFESSIONAL' | 'OTHER';

export interface Skill {
  id: number;
  name: string;
  category: SkillCategory;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSkillData {
  name: string;
  category: SkillCategory;
  description: string;
}

export interface UpdateSkillData {
  name?: string;
  category?: SkillCategory;
  description?: string;
  is_active?: boolean;
}

// ==================== Availability Types ====================

export interface AvailabilityStatus {
  status: 'available' | 'busy';
  label: string;
  message: string;
  can_book: boolean;
  active_jobs?: number;
  warning?: string;
  badge_color?: string;
}

export interface BookingWarning {
  message: string;
  recommendation: string;
  can_still_book: boolean;
  estimated_delay: string;
}

// ==================== Category Types ====================

export interface Category {
  id: number;
  name: string;
  description: string;
  icon_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryData {
  name: string;
  description: string;
  icon_url?: string;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
  icon_url?: string;
  is_active?: boolean;
}

// ==================== Service Request Types ====================

// Complete status enum with all possible states
export enum ServiceRequestStatus {
  // Initial State
  PENDING_ADMIN_ASSIGNMENT = "PENDING_ADMIN_ASSIGNMENT",
  
  // Estimation Phase
  PENDING_ESTIMATION = "PENDING_ESTIMATION",
  ESTIMATION_SUBMITTED = "ESTIMATION_SUBMITTED",
  
  // Client Approval & Payment Phase
  AWAITING_CLIENT_APPROVAL = "AWAITING_CLIENT_APPROVAL",
  PAYMENT_COMPLETED = "PAYMENT_COMPLETED",
  
  // Execution Phase
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  
  // Final State
  CLIENT_REVIEWED = "CLIENT_REVIEWED",
  
  // Cancellation State
  CANCELLED = "CANCELLED",
  
  // Legacy Statuses (Deprecated but still in database)
  ASSIGNED_TO_SERVICEMAN = "ASSIGNED_TO_SERVICEMAN",
  SERVICEMAN_INSPECTED = "SERVICEMAN_INSPECTED",
  NEGOTIATING = "NEGOTIATING",
  AWAITING_PAYMENT = "AWAITING_PAYMENT",
  PAYMENT_CONFIRMED = "PAYMENT_CONFIRMED",
}

export type ServiceRequestStatusType = ServiceRequestStatus | string;

export interface ServiceRequest {
  id: number;
  client: User;
  preferred_serviceman: User | ServicemanProfile | null; // NEW: Client's preferred serviceman
  serviceman: User | null; // Admin-assigned primary serviceman
  backup_serviceman: User | null; // Admin-assigned backup serviceman
  category: Category;
  booking_date: string;
  is_emergency: boolean;
  auto_flagged_emergency: boolean;
  status: ServiceRequestStatus;
  initial_booking_fee: string;
  serviceman_estimated_cost: string | null;
  admin_markup_percentage: string;
  final_cost: string | null;
  client_address: string;
  service_description: string;
  created_at: string;
  updated_at: string;
  inspection_completed_at: string | null;
  work_completed_at: string | null;
}

export interface CreateServiceRequestData {
  payment_reference: string; // REQUIRED: Payment reference from booking fee payment
  category_id: number;
  booking_date: string;
  is_emergency?: boolean;
  client_address: string;
  service_description: string;
  initial_booking_fee: number;
  preferred_serviceman_id?: number; // NEW: Optional preferred serviceman selection
}

// ==================== Payment Types ====================

export type PaymentType = 'INITIAL_BOOKING_FEE' | 'FINAL_PAYMENT' | 'SERVICE_PAYMENT';
export type PaymentStatus = 'PENDING' | 'SUCCESSFUL' | 'FAILED';

export interface Payment {
  id: number;
  service_request: number;
  payment_type: PaymentType;
  amount: string;
  status: PaymentStatus;
  paystack_reference: string;
  paystack_access_code: string;
  paid_at: string | null;
  created_at: string;
}

export interface InitializePaymentData {
  service_request: number;
  payment_type: PaymentType;
  amount: number;
}

export interface InitializePaymentResponse {
  payment: Payment;
  paystack_url: string;
  amount: string;
  reference: string;
  message: string;
}

export interface VerifyPaymentData {
  reference: string;
}

export interface VerifyPaymentResponse {
  status: PaymentStatus;
}

// ==================== Rating Types ====================

export interface Rating {
  id: number;
  service_request: number;
  client: number | User;
  serviceman: number | User;
  rating: number;
  review: string;
  created_at: string;
}

export interface CreateRatingData {
  service_request: number;
  rating: number;
  review: string;
}

// ==================== Negotiation Types ====================

export type NegotiationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COUNTERED';

export interface PriceNegotiation {
  id: number;
  service_request: number;
  proposed_by: User;
  proposed_amount: string;
  message: string;
  status: NegotiationStatus;
  created_at: string;
}

export interface CreateNegotiationData {
  service_request: number;
  proposed_amount: number;
  message: string;
}

export interface CounterNegotiationData {
  proposed_amount: number;
  message: string;
}

// ==================== Notification Types ====================

export interface Notification {
  id: number;
  user: number;
  notification_type: string;
  title: string;
  message: string;
  service_request: number | null;
  is_read: boolean;
  sent_to_email: boolean;
  email_sent_at: string | null;
  created_at: string;
}

export interface SendNotificationData {
  user_id: number;
  title: string;
  message: string;
  notification_type?: string;
  service_request_id?: number;
}

export interface UnreadCountResponse {
  unread_count: number;
}

// ==================== Admin Types ====================

export interface CreateAdminData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
}

export interface PendingServicemenResponse {
  total_pending: number;
  pending_applications: ServicemanProfile[];
}

export interface ApproveServicemanData {
  serviceman_id: number;
  category_id?: number;
  notes?: string;
}

export interface ApproveServicemanResponse {
  detail: string;
  serviceman: {
    id: number;
    username: string;
    full_name: string;
    email: string;
  };
  approved_by: string;
  approved_at: string;
  category?: Category;
}

export interface RejectServicemanData {
  serviceman_id: number;
  rejection_reason: string;
}

export interface RejectServicemanResponse {
  detail: string;
  serviceman: {
    id: number;
    username: string;
    email: string;
  };
  rejected_by: string;
  rejection_reason: string;
}

export interface AssignCategoryData {
  serviceman_id: number;
  category_id: number;
}

export interface AssignCategoryResponse {
  detail: string;
  serviceman: {
    id: number;
    username: string;
    full_name: string;
  };
  previous_category: Category | null;
  new_category: Category;
}

export interface BulkAssignCategoryData {
  serviceman_ids: number[];
  category_id: number;
}

export interface BulkAssignCategoryResponse {
  detail: string;
  category: Category;
  updated_servicemen: Array<{
    id: number;
    username: string;
    full_name: string;
  }>;
  total_updated: number;
  not_found: number;
}

export interface ServicemenByCategoryResponse {
  total_servicemen: number;
  total_categories: number;
  categories: Array<{
    category: Category | null;
    servicemen_count: number;
    servicemen: Array<{
      id: number;
      username: string;
      full_name: string;
      email: string;
      is_available: boolean;
      is_approved: boolean;
      rating: string;
      total_jobs_completed: number;
    }>;
    note?: string;
  }>;
}

// ==================== Analytics Types ====================

export interface RevenueAnalytics {
  total_revenue: number;
  this_month: number;
}

export interface TopServiceman {
  id: number;
  full_name: string;
  rating: string;
  total_jobs_completed: number;
}

export interface TopCategory {
  id: number;
  name: string;
  request_count: number;
}

// ==================== Servicemen List Types ====================

export interface ServicemenStatistics {
  total_servicemen: number;
  available: number;
  busy: number;
}

export interface ServicemenListResponse {
  statistics: ServicemenStatistics;
  results: ServicemanProfile[];
}

export interface ServicemenFilters {
  category?: number;
  is_available?: boolean;
  min_rating?: number;
  search?: string;
  ordering?: string;
  show_all?: boolean;
}

// ==================== Category Servicemen Types ====================

export interface CategoryServicemanSummary {
  id: number;
  full_name: string;
  username: string;
  rating: number;
  total_jobs_completed: number;
  bio: string;
  years_of_experience: number;
  is_available: boolean;
  active_jobs_count: number;
  availability_status: AvailabilityStatus;
  booking_warning?: BookingWarning;
}

export interface CategoryServicemenResponse {
  category_id: number;
  total_servicemen: number;
  available_servicemen: number;
  busy_servicemen: number;
  availability_message: {
    type: string;
    message: string;
  };
  servicemen: CategoryServicemanSummary[];
}

// ==================== Auth Types ====================

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface TokenResponse {
  access: string;
  refresh: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  user_type: 'CLIENT' | 'SERVICEMAN';
  skill_ids?: number[];
}

export interface RefreshTokenData {
  refresh: string;
}

export interface VerifyEmailParams {
  uid: string;
  token: string;
}

export interface ResendVerificationData {
  email: string;
}

export interface PasswordResetData {
  email: string;
}

export interface PasswordResetConfirmData {
  password: string;
}

// ==================== Error Types ====================

export interface APIError {
  detail?: string;
  message?: string;
  [key: string]: unknown;
}

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string | APIError;
  errors?: Record<string, string[]>;
}

// ==================== Update Profile Types ====================

export interface UpdateClientProfileData {
  phone_number?: string;
  address?: string;
}

export interface UpdateServicemanProfileData {
  bio?: string;
  years_of_experience?: number;
  phone_number?: string;
  is_available?: boolean;
  skill_ids?: number[];
}

// ==================== Serviceman Skills Types ====================

export interface ServicemanSkillsResponse {
  serviceman: {
    id: number;
    username: string;
    full_name: string;
  };
  skills: Skill[];
}

export interface AddSkillsData {
  skill_ids: number[];
}

export interface RemoveSkillsData {
  skill_ids: number[];
}

export interface SkillsOperationResponse {
  message: string;
  skills: Skill[];
}

