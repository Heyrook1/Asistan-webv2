import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Patient } from '@prisma/client'
import { toast } from 'sonner'

const PATIENTS_QUERY_KEY = ['patients']
const PATIENT_DETAILS_KEY = (id: string) => [...PATIENTS_QUERY_KEY, id]

/**
 * Hook to fetch patients for the business
 */
export function usePatients(options?: { businessId: string; search?: string }) {
  return useQuery({
    queryKey: [...PATIENTS_QUERY_KEY, options?.businessId, options?.search],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (options?.businessId) params.append('businessId', options.businessId)
      if (options?.search) params.append('search', options.search)

      const response = await fetch(`/api/patients?${params}`)
      if (!response.ok) throw new Error('Failed to fetch patients')
      return response.json() as Promise<Patient[]>
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!options?.businessId,
  })
}

/**
 * Hook to fetch patient details
 */
export function usePatientDetails(patientId: string) {
  return useQuery({
    queryKey: PATIENT_DETAILS_KEY(patientId),
    queryFn: async () => {
      const response = await fetch(`/api/patients/${patientId}`)
      if (!response.ok) throw new Error('Failed to fetch patient')
      return response.json() as Promise<Patient>
    },
    enabled: !!patientId,
  })
}

/**
 * Hook to create or update patient
 */
export function usePatientMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<Patient>) => {
      const response = await fetch('/api/patients', {
        method: data.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to save patient')
      return response.json() as Promise<Patient>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PATIENTS_QUERY_KEY })
      toast.success('Hasta kaydedildi')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu')
    },
  })
}

/**
 * Hook to delete patient
 */
export function useDeletePatientMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (patientId: string) => {
      const response = await fetch(`/api/patients/${patientId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete patient')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PATIENTS_QUERY_KEY })
      toast.success('Hasta silindi')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu')
    },
  })
}
