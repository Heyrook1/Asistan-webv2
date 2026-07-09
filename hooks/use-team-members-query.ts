import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { TeamMember } from '@prisma/client'
import { toast } from 'sonner'

const TEAM_MEMBERS_QUERY_KEY = ['team-members']
const TEAM_MEMBER_DETAILS_KEY = (id: string) => [...TEAM_MEMBERS_QUERY_KEY, id]

/**
 * Hook to fetch team members for the business
 */
export function useTeamMembers(options?: { businessId: string; role?: string }) {
  return useQuery({
    queryKey: [...TEAM_MEMBERS_QUERY_KEY, options?.businessId, options?.role],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (options?.businessId) params.append('businessId', options.businessId)
      if (options?.role) params.append('role', options.role)

      const response = await fetch(`/api/team-members?${params}`)
      if (!response.ok) throw new Error('Failed to fetch team members')
      return response.json() as Promise<TeamMember[]>
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!options?.businessId,
  })
}

/**
 * Hook to fetch team member details
 */
export function useTeamMemberDetails(memberId: string) {
  return useQuery({
    queryKey: TEAM_MEMBER_DETAILS_KEY(memberId),
    queryFn: async () => {
      const response = await fetch(`/api/team-members/${memberId}`)
      if (!response.ok) throw new Error('Failed to fetch team member')
      return response.json() as Promise<TeamMember>
    },
    enabled: !!memberId,
  })
}

/**
 * Hook to create or update team member
 */
export function useTeamMemberMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<TeamMember>) => {
      const response = await fetch('/api/team-members', {
        method: data.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to save team member')
      return response.json() as Promise<TeamMember>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEAM_MEMBERS_QUERY_KEY })
      toast.success('Takım üyesi kaydedildi')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu')
    },
  })
}

/**
 * Hook to delete team member
 */
export function useDeleteTeamMemberMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (memberId: string) => {
      const response = await fetch(`/api/team-members/${memberId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete team member')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEAM_MEMBERS_QUERY_KEY })
      toast.success('Takım üyesi silindi')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu')
    },
  })
}
