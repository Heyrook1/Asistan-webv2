'use client'

import { useState } from 'react'
import { 
  Database, 
  Users, 
  Calendar, 
  MessageSquare, 
  Bell, 
  BarChart3, 
  Settings, 
  FileText,
  Shield,
  Smartphone,
  Building2,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Database schema definition
interface SchemaColumn {
  name: string
  type: string
  pk?: boolean
  fk?: string
  unique?: boolean
  nullable?: boolean
  description?: string
}
interface SchemaTable {
  name: string
  description: string
  columns: SchemaColumn[]
}
interface SchemaGroup {
  name: string
  icon: typeof Database
  color: string
  description: string
  tables: SchemaTable[]
}

const schemaGroups: SchemaGroup[] = [
  {
    name: 'User Management',
    icon: Users,
    color: 'bg-blue-500',
    description: 'Core user authentication and profile management',
    tables: [
      {
        name: 'users',
        description: 'Core user accounts with authentication',
        columns: [
          { name: 'id', type: 'UUID', pk: true, description: 'Primary key, references auth.users' },
          { name: 'email', type: 'TEXT', unique: true, description: 'User email address' },
          { name: 'full_name', type: 'TEXT', description: 'Display name' },
          { name: 'phone', type: 'TEXT', description: 'Phone number' },
          { name: 'avatar_url', type: 'TEXT', description: 'Profile picture URL' },
          { name: 'role', type: 'ENUM', description: 'admin, provider, customer, secretary' },
          { name: 'is_active', type: 'BOOLEAN', description: 'Account status' },
          { name: 'last_login_at', type: 'TIMESTAMP', description: 'Last login timestamp' },
          { name: 'created_at', type: 'TIMESTAMP', description: 'Account creation date' },
        ]
      },
      {
        name: 'customers',
        description: 'Customer-specific profile data',
        columns: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'user_id', type: 'UUID', fk: 'users.id', description: 'Reference to users table' },
          { name: 'date_of_birth', type: 'DATE', description: 'Birth date for age calculation' },
          { name: 'gender', type: 'TEXT', description: 'Gender identity' },
          { name: 'address', type: 'TEXT', description: 'Full address' },
          { name: 'medical_notes', type: 'TEXT', description: 'Health-related notes' },
          { name: 'emergency_contact', type: 'JSONB', description: 'Emergency contact info' },
        ]
      },
      {
        name: 'providers',
        description: 'Service provider/professional profiles',
        columns: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'user_id', type: 'UUID', fk: 'users.id' },
          { name: 'business_name', type: 'TEXT', description: 'Business/clinic name' },
          { name: 'specialty', type: 'TEXT', description: 'Professional specialty' },
          { name: 'bio', type: 'TEXT', description: 'Professional biography' },
          { name: 'license_number', type: 'TEXT', description: 'Professional license' },
          { name: 'hourly_rate', type: 'NUMERIC', description: 'Default consultation rate' },
          { name: 'is_verified', type: 'BOOLEAN', description: 'Verification status' },
          { name: 'rating', type: 'NUMERIC', description: 'Average rating (1-5)' },
          { name: 'total_reviews', type: 'INTEGER', description: 'Total review count' },
        ]
      },
      {
        name: 'user_preferences',
        description: 'Individual user settings and preferences',
        columns: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'user_id', type: 'UUID', fk: 'users.id', unique: true },
          { name: 'push_notifications', type: 'BOOLEAN', description: 'Enable push notifications' },
          { name: 'email_notifications', type: 'BOOLEAN', description: 'Enable email notifications' },
          { name: 'sms_notifications', type: 'BOOLEAN', description: 'Enable SMS notifications' },
          { name: 'language', type: 'TEXT', description: 'Preferred language (tr, en)' },
          { name: 'timezone', type: 'TEXT', description: 'User timezone' },
        ]
      },
    ]
  },
  {
    name: 'Appointments',
    icon: Calendar,
    color: 'bg-emerald-500',
    description: 'Appointment scheduling and management',
    tables: [
      {
        name: 'appointments',
        description: 'Core appointment records',
        columns: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'customer_id', type: 'UUID', fk: 'customers.id' },
          { name: 'provider_id', type: 'UUID', fk: 'providers.id' },
          { name: 'service_id', type: 'UUID', fk: 'services.id' },
          { name: 'scheduled_at', type: 'TIMESTAMP', description: 'Appointment date/time' },
          { name: 'duration_minutes', type: 'INTEGER', description: 'Duration in minutes' },
          { name: 'status', type: 'ENUM', description: 'pending, confirmed, completed, cancelled, no_show' },
          { name: 'appointment_type', type: 'ENUM', description: 'in_person, online, phone' },
          { name: 'price', type: 'NUMERIC', description: 'Appointment cost' },
          { name: 'notes', type: 'TEXT', description: 'Appointment notes' },
          { name: 'cancellation_reason', type: 'TEXT', description: 'Reason if cancelled' },
        ]
      },
      {
        name: 'services',
        description: 'Available services offered by providers',
        columns: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'provider_id', type: 'UUID', fk: 'providers.id' },
          { name: 'name', type: 'TEXT', description: 'Service name' },
          { name: 'description', type: 'TEXT', description: 'Service description' },
          { name: 'duration_minutes', type: 'INTEGER', description: 'Default duration' },
          { name: 'price', type: 'NUMERIC', description: 'Service price' },
          { name: 'category', type: 'TEXT', description: 'Service category' },
          { name: 'is_active', type: 'BOOLEAN', description: 'Availability status' },
        ]
      },
      {
        name: 'working_hours',
        description: 'Provider availability schedule',
        columns: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'provider_id', type: 'UUID', fk: 'providers.id' },
          { name: 'day_of_week', type: 'INTEGER', description: '0-6 (Sunday-Saturday)' },
          { name: 'start_time', type: 'TIME', description: 'Start of working hours' },
          { name: 'end_time', type: 'TIME', description: 'End of working hours' },
          { name: 'is_available', type: 'BOOLEAN', description: 'Working on this day' },
        ]
      },
      {
        name: 'appointment_reminders',
        description: 'Scheduled appointment reminders',
        columns: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'appointment_id', type: 'UUID', fk: 'appointments.id' },
          { name: 'reminder_type', type: 'ENUM', description: 'email, sms, push' },
          { name: 'scheduled_for', type: 'TIMESTAMP', description: 'When to send' },
          { name: 'sent_at', type: 'TIMESTAMP', description: 'When sent' },
          { name: 'status', type: 'ENUM', description: 'pending, sent, failed' },
        ]
      },
    ]
  },
  {
    name: 'Messaging',
    icon: MessageSquare,
    color: 'bg-purple-500',
    description: 'Real-time chat between customers and providers',
    tables: [
      {
        name: 'conversations',
        description: 'Chat threads between users',
        columns: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'customer_id', type: 'UUID', fk: 'customers.id' },
          { name: 'provider_id', type: 'UUID', fk: 'providers.id' },
          { name: 'appointment_id', type: 'UUID', fk: 'appointments.id', nullable: true },
          { name: 'last_message_at', type: 'TIMESTAMP', description: 'Latest message time' },
          { name: 'last_message_preview', type: 'TEXT', description: 'Preview of last message' },
          { name: 'customer_unread_count', type: 'INTEGER', description: 'Unread count for customer' },
          { name: 'provider_unread_count', type: 'INTEGER', description: 'Unread count for provider' },
          { name: 'is_archived', type: 'BOOLEAN', description: 'Archive status' },
        ]
      },
      {
        name: 'messages',
        description: 'Individual chat messages',
        columns: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'conversation_id', type: 'UUID', fk: 'conversations.id' },
          { name: 'sender_id', type: 'UUID', fk: 'users.id' },
          { name: 'sender_type', type: 'ENUM', description: 'customer, provider' },
          { name: 'content', type: 'TEXT', description: 'Message content' },
          { name: 'message_type', type: 'ENUM', description: 'text, image, file, appointment_link' },
          { name: 'attachment_url', type: 'TEXT', description: 'File attachment URL' },
          { name: 'is_read', type: 'BOOLEAN', description: 'Read status' },
          { name: 'read_at', type: 'TIMESTAMP', description: 'When read' },
        ]
      },
    ]
  },
  {
    name: 'Notifications',
    icon: Bell,
    color: 'bg-amber-500',
    description: 'Push notifications and device management',
    tables: [
      {
        name: 'notifications',
        description: 'User notification records',
        columns: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'user_id', type: 'UUID', fk: 'users.id' },
          { name: 'title', type: 'TEXT', description: 'Notification title' },
          { name: 'body', type: 'TEXT', description: 'Notification content' },
          { name: 'type', type: 'ENUM', description: 'appointment, message, reminder, system' },
          { name: 'data', type: 'JSONB', description: 'Additional payload data' },
          { name: 'is_read', type: 'BOOLEAN', description: 'Read status' },
          { name: 'created_at', type: 'TIMESTAMP', description: 'Creation time' },
        ]
      },
      {
        name: 'device_tokens',
        description: 'Mobile device push tokens',
        columns: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'user_id', type: 'UUID', fk: 'users.id' },
          { name: 'token', type: 'TEXT', description: 'Push notification token' },
          { name: 'platform', type: 'ENUM', description: 'ios, android, web' },
          { name: 'device_name', type: 'TEXT', description: 'Device identifier' },
          { name: 'app_version', type: 'TEXT', description: 'App version installed' },
          { name: 'is_active', type: 'BOOLEAN', description: 'Token validity status' },
        ]
      },
    ]
  },
  {
    name: 'Analytics',
    icon: BarChart3,
    color: 'bg-rose-500',
    description: 'Statistics and reporting data',
    tables: [
      {
        name: 'daily_statistics',
        description: 'Daily provider performance metrics',
        columns: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'stat_date', type: 'DATE', description: 'Statistics date' },
          { name: 'provider_id', type: 'UUID', fk: 'providers.id' },
          { name: 'total_appointments', type: 'INTEGER', description: 'Total appointments' },
          { name: 'completed_appointments', type: 'INTEGER', description: 'Completed count' },
          { name: 'cancelled_appointments', type: 'INTEGER', description: 'Cancelled count' },
          { name: 'total_revenue', type: 'NUMERIC', description: 'Daily revenue' },
          { name: 'new_customers', type: 'INTEGER', description: 'New customer count' },
          { name: 'average_rating', type: 'NUMERIC', description: 'Average rating received' },
        ]
      },
      {
        name: 'platform_statistics',
        description: 'Platform-wide metrics for admin',
        columns: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'stat_date', type: 'DATE', unique: true },
          { name: 'total_users', type: 'INTEGER', description: 'Total registered users' },
          { name: 'new_users', type: 'INTEGER', description: 'New registrations' },
          { name: 'active_users', type: 'INTEGER', description: 'Daily active users' },
          { name: 'total_appointments', type: 'INTEGER', description: 'Total appointments' },
          { name: 'approval_rate', type: 'NUMERIC', description: 'Appointment approval %' },
          { name: 'platform_revenue', type: 'NUMERIC', description: 'Platform revenue' },
        ]
      },
      {
        name: 'reviews',
        description: 'Customer reviews and ratings',
        columns: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'appointment_id', type: 'UUID', fk: 'appointments.id' },
          { name: 'customer_id', type: 'UUID', fk: 'customers.id' },
          { name: 'provider_id', type: 'UUID', fk: 'providers.id' },
          { name: 'rating', type: 'INTEGER', description: 'Rating 1-5 stars' },
          { name: 'comment', type: 'TEXT', description: 'Review text' },
          { name: 'is_visible', type: 'BOOLEAN', description: 'Public visibility' },
        ]
      },
    ]
  },
  {
    name: 'Content Management',
    icon: FileText,
    color: 'bg-indigo-500',
    description: 'Blog posts, FAQs, and static content',
    tables: [
      {
        name: 'articles',
        description: 'Blog posts and guides',
        columns: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'slug', type: 'TEXT', unique: true, description: 'URL-friendly identifier' },
          { name: 'title', type: 'TEXT', description: 'Article title' },
          { name: 'excerpt', type: 'TEXT', description: 'Short preview' },
          { name: 'content', type: 'TEXT', description: 'Full article content' },
          { name: 'cover_image_url', type: 'TEXT', description: 'Featured image' },
          { name: 'author_id', type: 'UUID', fk: 'users.id' },
          { name: 'category', type: 'TEXT', description: 'Article category' },
          { name: 'tags', type: 'TEXT[]', description: 'Article tags array' },
          { name: 'is_published', type: 'BOOLEAN', description: 'Publication status' },
          { name: 'view_count', type: 'INTEGER', description: 'View counter' },
        ]
      },
      {
        name: 'faqs',
        description: 'Frequently asked questions',
        columns: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'question', type: 'TEXT', description: 'FAQ question' },
          { name: 'answer', type: 'TEXT', description: 'FAQ answer' },
          { name: 'category', type: 'TEXT', description: 'FAQ category' },
          { name: 'sort_order', type: 'INTEGER', description: 'Display order' },
          { name: 'is_active', type: 'BOOLEAN', description: 'Visibility status' },
        ]
      },
    ]
  },
  {
    name: 'Settings',
    icon: Settings,
    color: 'bg-gray-500',
    description: 'Application configuration',
    tables: [
      {
        name: 'app_settings',
        description: 'Global application settings',
        columns: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'key', type: 'TEXT', unique: true, description: 'Setting key' },
          { name: 'value', type: 'JSONB', description: 'Setting value' },
          { name: 'description', type: 'TEXT', description: 'Setting description' },
          { name: 'category', type: 'TEXT', description: 'Setting category' },
          { name: 'is_public', type: 'BOOLEAN', description: 'Public accessibility' },
          { name: 'updated_by', type: 'UUID', fk: 'users.id' },
        ]
      },
    ]
  },
]

export default function SchemaPage() {
  const [expandedGroups, setExpandedGroups] = useState<string[]>(schemaGroups.map(g => g.name))
  const [expandedTables, setExpandedTables] = useState<string[]>([])

  const toggleGroup = (name: string) => {
    setExpandedGroups(prev => 
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    )
  }

  const toggleTable = (name: string) => {
    setExpandedTables(prev => 
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    )
  }

  return (
    <div className="min-h-screen bg-[#0B1828] text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#1BD1B5] to-[#207FF5] rounded-xl flex items-center justify-center">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Database Schema</h1>
              <p className="text-[#8B9CAF]">Asistan Platform - Unified Data Architecture</p>
            </div>
          </div>
          <p className="text-[#8B9CAF] max-w-3xl">
            Comprehensive database schema supporting both mobile app and web admin panel with real-time 
            synchronization, role-based access control, and scalable data management.
          </p>
        </div>

        {/* Architecture Overview */}
        <Card className="bg-[#0F2137] border-[#1E3A5F] mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#1BD1B5]" />
              System Architecture Overview
            </CardTitle>
            <CardDescription className="text-[#8B9CAF]">
              Single database powering mobile app and web admin with real-time sync
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Mobile App */}
              <div className="bg-[#0B1828] rounded-xl p-6 border border-[#1E3A5F]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Mobile App</h3>
                    <p className="text-xs text-[#8B9CAF]">iOS & Android</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-[#8B9CAF]">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#1BD1B5] rounded-full" />
                    Expert/Provider discovery
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#1BD1B5] rounded-full" />
                    Appointment booking
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#1BD1B5] rounded-full" />
                    Real-time messaging
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#1BD1B5] rounded-full" />
                    Push notifications
                  </li>
                </ul>
              </div>

              {/* API & Database */}
              <div className="bg-gradient-to-br from-[#1BD1B5]/10 to-[#207FF5]/10 rounded-xl p-6 border border-[#1BD1B5]/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#1BD1B5]/20 rounded-lg flex items-center justify-center">
                    <Database className="w-5 h-5 text-[#1BD1B5]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Supabase</h3>
                    <p className="text-xs text-[#8B9CAF]">API + Database + Auth</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-[#8B9CAF]">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#1BD1B5] rounded-full" />
                    PostgreSQL database
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#1BD1B5] rounded-full" />
                    Row Level Security
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#1BD1B5] rounded-full" />
                    Real-time subscriptions
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#1BD1B5] rounded-full" />
                    Edge Functions
                  </li>
                </ul>
              </div>

              {/* Web Admin */}
              <div className="bg-[#0B1828] rounded-xl p-6 border border-[#1E3A5F]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Web Admin</h3>
                    <p className="text-xs text-[#8B9CAF]">Dashboard & Management</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-[#8B9CAF]">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#1BD1B5] rounded-full" />
                    Appointment management
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#1BD1B5] rounded-full" />
                    User/Provider admin
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#1BD1B5] rounded-full" />
                    Analytics dashboard
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#1BD1B5] rounded-full" />
                    Content management
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schema Groups */}
        <div className="space-y-4">
          {schemaGroups.map((group) => (
            <Card key={group.name} className="bg-[#0F2137] border-[#1E3A5F] overflow-hidden">
              <button
                onClick={() => toggleGroup(group.name)}
                className="w-full"
              >
                <CardHeader className="hover:bg-[#1E3A5F]/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${group.color} rounded-lg flex items-center justify-center`}>
                        <group.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <CardTitle className="text-white text-lg">{group.name}</CardTitle>
                        <CardDescription className="text-[#8B9CAF]">
                          {group.description} • {group.tables.length} tables
                        </CardDescription>
                      </div>
                    </div>
                    {expandedGroups.includes(group.name) ? (
                      <ChevronDown className="w-5 h-5 text-[#8B9CAF]" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-[#8B9CAF]" />
                    )}
                  </div>
                </CardHeader>
              </button>

              {expandedGroups.includes(group.name) && (
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {group.tables.map((table) => (
                      <div key={table.name} className="bg-[#0B1828] rounded-lg border border-[#1E3A5F]">
                        <button
                          onClick={() => toggleTable(table.name)}
                          className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#1E3A5F]/20 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <code className="text-[#1BD1B5] font-mono text-sm">{table.name}</code>
                            <span className="text-[#8B9CAF] text-sm">{table.description}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[#5E6A78] bg-[#1E3A5F] px-2 py-1 rounded">
                              {table.columns.length} columns
                            </span>
                            {expandedTables.includes(table.name) ? (
                              <ChevronDown className="w-4 h-4 text-[#8B9CAF]" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-[#8B9CAF]" />
                            )}
                          </div>
                        </button>

                        {expandedTables.includes(table.name) && (
                          <div className="px-4 pb-4">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="text-[#8B9CAF] text-left border-b border-[#1E3A5F]">
                                  <th className="py-2 font-medium">Column</th>
                                  <th className="py-2 font-medium">Type</th>
                                  <th className="py-2 font-medium">Constraints</th>
                                  <th className="py-2 font-medium">Description</th>
                                </tr>
                              </thead>
                              <tbody>
                                {table.columns.map((col) => (
                                  <tr key={col.name} className="border-b border-[#1E3A5F]/50 last:border-0">
                                    <td className="py-2">
                                      <code className="text-white font-mono">{col.name}</code>
                                    </td>
                                    <td className="py-2">
                                      <span className="text-purple-400 font-mono text-xs">{col.type}</span>
                                    </td>
                                    <td className="py-2">
                                      <div className="flex gap-1">
                                        {col.pk && (
                                          <span className="text-xs bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">PK</span>
                                        )}
                                        {col.fk && (
                                          <span className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">FK</span>
                                        )}
                                        {col.unique && (
                                          <span className="text-xs bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded">UQ</span>
                                        )}
                                        {col.nullable && (
                                          <span className="text-xs bg-gray-500/20 text-gray-400 px-1.5 py-0.5 rounded">NULL</span>
                                        )}
                                      </div>
                                    </td>
                                    <td className="py-2 text-[#8B9CAF]">
                                      {col.description}
                                      {col.fk && (
                                        <span className="ml-2 text-xs text-blue-400">→ {col.fk}</span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Security Notes */}
        <Card className="bg-[#0F2137] border-[#1E3A5F] mt-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#1BD1B5]" />
              Security & Access Control
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-white mb-3">Row Level Security (RLS)</h4>
                <ul className="space-y-2 text-sm text-[#8B9CAF]">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-[#1BD1B5] rounded-full mt-1.5" />
                    All tables have RLS enabled with role-based policies
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-[#1BD1B5] rounded-full mt-1.5" />
                    Users can only access their own data
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-[#1BD1B5] rounded-full mt-1.5" />
                    Admins have elevated access for management
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-[#1BD1B5] rounded-full mt-1.5" />
                    Public content is selectively exposed
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-3">User Roles</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 bg-[#0B1828] rounded-lg p-3">
                    <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                      <Shield className="w-4 h-4 text-red-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Admin</p>
                      <p className="text-xs text-[#8B9CAF]">Full platform access</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-[#0B1828] rounded-lg p-3">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Provider</p>
                      <p className="text-xs text-[#8B9CAF]">Manage own business & appointments</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-[#0B1828] rounded-lg p-3">
                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Customer</p>
                      <p className="text-xs text-[#8B9CAF]">Book appointments & message providers</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
