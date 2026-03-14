// src/types/index.ts

export interface District {
  id: string
  name: string
  tier: 'tier1' | 'tier2' | 'tier3'
  population?: number
  latitude?: number
  longitude?: number
}

export interface Complaint {
  id: number
  citizenName: string
  citizenPhone: string
  citizenEmail?: string
  text: string
  category: 'PUBLIC_WORKS' | 'WATER_SUPPLY' | 'SANITATION' | 'HEALTH' | 'EDUCATION' | 'GENERAL'
  districtId: string
  latitude?: number
  longitude?: number
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  priorityScore?: number
  status: 'submitted' | 'acknowledged' | 'in_progress' | 'resolved' | 'rejected' | 'closed'
  slaHours: number
  assignedTo?: number
  assignedAt?: string
  resolution?: string
  resolvedAt?: string
  closedAt?: string
  createdAt: string
  updatedAt: string
  district?: District
  officer?: Officer
  statusHistory?: StatusHistory[]
}

export interface Officer {
  id: number
  name: string
  email: string
  phone: string
  department: string
  districtId: string
}

export interface StatusHistory {
  id: number
  complaintId: number
  status: string
  comment?: string
  createdAt: string
  user?: {
    name: string
    role: string
  }
}

export interface TrackResponse {
  success: boolean
  citizenPhone: string
  count: number
  complaints: Complaint[]
}

export interface SubmitComplaintData {
  citizenName: string
  citizenPhone: string
  citizenEmail?: string
  text: string
  districtId: string
  latitude?: number
  longitude?: number
}
