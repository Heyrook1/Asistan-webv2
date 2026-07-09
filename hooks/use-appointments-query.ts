import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Appointment } from '@prisma/client'
import { toast } from 'sonner'

const APPOINTMENTS_QUERY_KEY = ['appointments']
const APPOINTMENT_DETAILS_KEY = (id: string) => [...APPOINTMENTS_QUERY_KEY, id]

/**
 * Hook to fetch appointments for the dashboard
 * Automatically refetches every minute if window is focused
 */
export function useAppointments(options?: { businessId: string; role?: string }) {
  return useQuery({
    queryKey: [...APPOINTMENTS_QUERY_KEY, options?.businessId, options?.role],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (options?.businessId) params.append('businessId', options.businessId)
      if (options?.role) params.append('role', options.role)

      const response = await fetch(`/api/appointments?${params}`)
      if (!response.ok) throw new Error('Failed to fetch appointments')
      return response.json() as Promise<Appointment[]>
    },
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 60 * 1000, // Refetch every minute
    enabled: !!options?.businessId,
  })
}

/**
 * Hook to fetch appointment details
 */
export function useAppointmentDetails(appointmentId: string) {
  return useQuery({
    queryKey: APPOINTMENT_DETAILS_KEY(appointmentId),
    queryFn: async () => {
      const response = await fetch(`/api/appointments/${appointmentId}`)
      if (!response.ok) throw new Error('Failed to fetch appointment')
      return response.json() as Promise<Appointment>
    },
    enabled: !!appointmentId,
  })
}

/**
 * Hook to create or update appointment
 */
export function useAppointmentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<Appointment>) => {
      const response = await fetch('/api/appointments', {
        method: data.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to save appointment')
      return response.json() as Promise<Appointment>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPOINTMENTS_QUERY_KEY })
      toast.success('Randevu kaydedildi')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu')
    },
  })
}

/**
 * Hook to delete appointment
 */
export function useDeleteAppointmentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (appointmentId: string) => {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete appointment')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPOINTMENTS_QUERY_KEY })
      toast.success('Randevu silindi')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu')
    },
  })
}
