export type FrontDeskStep =
  | 'idle'
  | 'awaiting_service'
  | 'awaiting_date'
  | 'awaiting_slot'
  | 'awaiting_name'
  | 'confirming'
  | 'done'

export type FrontDeskDraft = {
  serviceId?: string
  serviceName?: string
  doctorId?: string
  doctorName?: string
  date?: string
  startTime?: string
  endTime?: string
  fullName?: string
  slotOptions?: Array<{ startTime: string; endTime: string }>
  serviceOptions?: Array<{ id: string; name: string }>
}

export const FRONT_DESK_SESSION_TTL_MS = 2 * 60 * 60 * 1000

export function emptyDraft(): FrontDeskDraft {
  return {}
}
