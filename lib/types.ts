// Database types for Asistan

export type UserRole = 'customer' | 'provider' | 'admin'

export type TeamRole = 'Super Admin' | 'Isletme Sahibi' | 'Doktor' | 'Sekreter' | 'Personel'

export type Capability =
  | 'view_appointments'
  | 'edit_appointments'
  | 'manage_customers'
  | 'access_analytics'
  | 'manage_team'

export type AppointmentStatus =
  | 'requested'
  | 'pending_provider_approval'
  | 'confirmed'
  | 'rejected'
  | 'reschedule_requested'
  | 'cancelled_by_customer'
  | 'cancelled_by_provider'
  | 'completed'
  | 'no_show'
  | 'expired'

export type NotificationType =
  | 'appointment_requested'
  | 'appointment_confirmed'
  | 'appointment_rejected'
  | 'appointment_cancelled'
  | 'appointment_completed'
  | 'appointment_reminder'
  | 'review_received'
  | 'system'

export interface User {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  role: UserRole
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  name_tr: string | null
  description: string | null
  icon: string | null
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface Specialty {
  id: string
  category_id: string | null
  name: string
  name_tr: string | null
  description: string | null
  is_active: boolean
  created_at: string
}

export interface Provider {
  id: string
  user_id: string
  business_name: string
  business_description: string | null
  category_id: string | null
  specialty_id: string | null
  address: string | null
  city: string | null
  district: string | null
  latitude: number | null
  longitude: number | null
  phone: string | null
  website: string | null
  instagram: string | null
  working_hours: Record<string, { start: string; end: string; closed?: boolean }> | null
  average_rating: number
  total_reviews: number
  total_appointments: number
  is_verified: boolean
  is_active: boolean
  created_at: string
  updated_at: string
  // Relations
  user?: User
  category?: Category
  specialty?: Specialty
}

export interface Customer {
  id: string
  user_id: string
  date_of_birth: string | null
  gender: string | null
  address: string | null
  city: string | null
  notes: string | null
  total_appointments: number
  is_active: boolean
  created_at: string
  updated_at: string
  // Relations
  user?: User
}

export interface Service {
  id: string
  provider_id: string
  name: string
  description: string | null
  duration_minutes: number
  price: number
  currency: string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface CalendarAvailability {
  id: string
  provider_id: string
  day_of_week: number
  start_time: string
  end_time: string
  is_available: boolean
  created_at: string
  updated_at: string
}

export interface CalendarBlock {
  id: string
  provider_id: string
  block_date: string
  start_time: string | null
  end_time: string | null
  is_full_day: boolean
  reason: string | null
  created_at: string
}

export interface Appointment {
  id: string
  provider_id: string
  customer_id: string
  service_id: string
  appointment_date: string
  start_time: string
  end_time: string
  status: AppointmentStatus
  price: number
  currency: string
  notes: string | null
  customer_notes: string | null
  provider_notes: string | null
  cancelled_by: string | null
  cancellation_reason: string | null
  created_at: string
  updated_at: string
  // Relations
  provider?: Provider
  customer?: Customer
  service?: Service
}

export interface AppointmentStatusHistory {
  id: string
  appointment_id: string
  old_status: AppointmentStatus | null
  new_status: AppointmentStatus
  changed_by: string | null
  notes: string | null
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  data: Record<string, unknown> | null
  is_read: boolean
  read_at: string | null
  created_at: string
}

export interface Review {
  id: string
  appointment_id: string
  provider_id: string
  customer_id: string
  rating: number
  comment: string | null
  provider_response: string | null
  responded_at: string | null
  is_visible: boolean
  created_at: string
  updated_at: string
  // Relations
  customer?: Customer
  appointment?: Appointment
}

export interface AuditLog {
  id: string
  user_id: string | null
  action: string
  table_name: string
  record_id: string | null
  old_data: Record<string, unknown> | null
  new_data: Record<string, unknown> | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export interface TeamMember {
  id: string
  provider_id: string
  user_id: string | null
  full_name: string
  email: string
  role: TeamRole
  status: 'active' | 'inactive'
  permissions: Capability[]
  is_active: boolean
  last_active_at: string | null
  created_at: string
  updated_at: string
}

export interface ActivityLog {
  id: string
  provider_id: string
  actor_id: string | null
  action: string
  entity_type: string
  entity_id: string | null
  details: Record<string, unknown> | null
  created_at: string
}

// Dashboard Stats
export interface DashboardStats {
  totalAppointments: number
  pendingAppointments: number
  todayAppointments: number
  totalCustomers: number
  totalRevenue: number
  averageRating: number
  totalReviews: number
}

// Status labels and colors
export const appointmentStatusLabels: Record<AppointmentStatus, string> = {
  requested: 'Talep Edildi',
  pending_provider_approval: 'Onay Bekliyor',
  confirmed: 'Onaylandı',
  rejected: 'Reddedildi',
  reschedule_requested: 'Yeniden Planlama',
  cancelled_by_customer: 'Müşteri İptali',
  cancelled_by_provider: 'Sağlayıcı İptali',
  completed: 'Tamamlandı',
  no_show: 'Gelmedi',
  expired: 'Süresi Doldu',
}

export const appointmentStatusColors: Record<AppointmentStatus, string> = {
  requested: 'bg-yellow-100 text-yellow-800',
  pending_provider_approval: 'bg-orange-100 text-orange-800',
  confirmed: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  reschedule_requested: 'bg-purple-100 text-purple-800',
  cancelled_by_customer: 'bg-gray-100 text-gray-800',
  cancelled_by_provider: 'bg-gray-100 text-gray-800',
  completed: 'bg-blue-100 text-blue-800',
  no_show: 'bg-red-100 text-red-800',
  expired: 'bg-gray-100 text-gray-800',
}

export const dayOfWeekLabels: Record<number, string> = {
  0: 'Pazar',
  1: 'Pazartesi',
  2: 'Salı',
  3: 'Çarşamba',
  4: 'Perşembe',
  5: 'Cuma',
  6: 'Cumartesi',
}
