// src/services/complaintService.ts
import api from './api'
import { Complaint, SubmitComplaintData, TrackResponse } from '@/types'

export const complaintService = {
  /**
   * Submit a new complaint
   * POST /api/complaints/submit
   */
  async submit(data: SubmitComplaintData): Promise<{
    success: boolean
    message: string
    complaintId: number
    data: {
      id: number
      text: string
      category: string
      districtId: string
      districtName?: string
      priority: string
      status: string
      createdAt: string
      slaHours?: number
      mlAnalysis?: any
    }
  }> {
    return api.post('/complaints/submit', data)
  },

  /**
   * Submit a complaint with media files (image/audio)
   * POST /api/complaints/submit (multipart/form-data)
   */
  async submitWithMedia(data: {
    citizenName: string
    citizenPhone: string
    citizenEmail?: string
    text?: string
    districtId?: string
    image?: File
    audio?: File
  }): Promise<{
    success: boolean
    message: string
    complaintId: number
    data: {
      id: number
      text: string
      category: string
      districtId: string
      districtName?: string
      priority: string
      status: string
      createdAt: string
      slaHours?: number
      mlAnalysis?: any
    }
  }> {
    const formData = new FormData()
    formData.append('citizenName', data.citizenName)
    formData.append('citizenPhone', data.citizenPhone)
    if (data.citizenEmail) formData.append('citizenEmail', data.citizenEmail)
    if (data.text) formData.append('text', data.text)
    if (data.districtId) formData.append('districtId', data.districtId)
    if (data.image) formData.append('image', data.image)
    if (data.audio) formData.append('audio', data.audio)

    // Post with multipart content type
    return api.post('/complaints/submit', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  /**
   * Track complaints by phone number (no auth required)
   * GET /api/complaints/track/:phone
   */
  async trackByPhone(phone: string): Promise<TrackResponse> {
    const response: any = await api.get(`/complaints/track/${phone}`)
    // Backend returns { success, count, data } - map to { success, count, complaints }
    return {
      success: response.success,
      citizenPhone: phone,
      count: response.count || 0,
      complaints: response.data || [],
    }
  },

  /**
   * Get complaint details by ID (auth required)
   * GET /api/complaints/:id
   */
  async getById(id: number): Promise<{
    success: boolean
    data: Complaint
  }> {
    return api.get(`/complaints/${id}`)
  },

  /**
   * Get all complaints (with filters) - auth required
   * GET /api/complaints
   */
  async getAll(params?: {
    status?: string
    districtId?: string
    category?: string
    priority?: string
    limit?: number
    offset?: number
    sortBy?: string
    sortOrder?: string
  }): Promise<{
    success: boolean
    count: number
    data: Complaint[]
    pagination: {
      total: number
      limit: number
      offset: number
      pages: number
    }
  }> {
    return api.get('/complaints', { params })
  },

  /**
   * Update complaint status (officers only)
   * PATCH /api/complaints/:id/status
   */
  async updateStatus(
    id: number,
    data: {
      status: string
      resolution?: string
    }
  ): Promise<{
    success: boolean
    message: string
    data: Complaint
  }> {
    return api.patch(`/complaints/${id}/status`, data)
  },

  /**
   * Get ML service health
   * GET /api/complaints/ml/status
   */
  async getMlStatus(): Promise<{
    status: string
    services?: {
      text_classifier: boolean
      speech_processor: boolean
      image_analyzer: boolean
    }
  }> {
    return api.get('/complaints/ml/status')
  },

  /**
   * Get complaint statistics
   * GET /api/complaints/stats/summary
   */
  async getStats(params?: {
    districtId?: string
    category?: string
    startDate?: string
    endDate?: string
  }): Promise<{
    success: boolean
    data: {
      total: number
      byStatus: {
        submitted: number
        inProgress: number
        resolved: number
      }
      byPriority: {
        critical: number
        high: number
        medium: number
        low: number
      }
      resolutionRate: number | string
    }
  }> {
    return api.get('/complaints/stats/summary', { params })
  },
}

export default complaintService
