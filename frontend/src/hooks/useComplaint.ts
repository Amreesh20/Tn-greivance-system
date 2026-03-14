// src/hooks/useComplaint.ts
import { useState } from 'react'
import { complaintService } from '@/services/complaintService'
import { Complaint, SubmitComplaintData, TrackResponse } from '@/types'

export function useComplaint() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submitComplaint = async (
    data: SubmitComplaintData,
    options?: { imageFile?: File; audioFile?: File }
  ) => {
    setLoading(true)
    setError(null)
    try {
      let response

      // If media files are provided, use multipart form submission
      if (options?.imageFile || options?.audioFile) {
        response = await complaintService.submitWithMedia({
          citizenName: data.citizenName,
          citizenPhone: data.citizenPhone,
          citizenEmail: data.citizenEmail,
          text: data.text,
          districtId: data.districtId,
          image: options.imageFile,
          audio: options.audioFile,
        })
      } else {
        response = await complaintService.submit(data)
      }

      // Map backend response to expected format
      return {
        success: response.success,
        message: response.message,
        complaint: {
          id: response.data.id,
          text: response.data.text,
          category: response.data.category as Complaint['category'],
          districtId: response.data.districtId,
          priority: response.data.priority as Complaint['priority'],
          status: response.data.status as Complaint['status'],
          createdAt: response.data.createdAt,
          // Fill defaults for required fields
          citizenName: data.citizenName,
          citizenPhone: data.citizenPhone,
          citizenEmail: data.citizenEmail,
          slaHours: response.data.slaHours || 24,
          updatedAt: response.data.createdAt,
          mlAnalysis: response.data.mlAnalysis,
          // Add district object for Success page display
          district: response.data.districtName ? {
            id: response.data.districtId,
            name: response.data.districtName
          } : undefined
        } as Complaint
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit complaint')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const trackByPhone = async (phone: string): Promise<TrackResponse> => {
    setLoading(true)
    setError(null)
    try {
      const response = await complaintService.trackByPhone(phone)
      return response
    } catch (err: any) {
      setError(err.message || 'Failed to track complaints')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const getComplaintById = async (id: number): Promise<Complaint> => {
    setLoading(true)
    setError(null)
    try {
      const response = await complaintService.getById(id)
      return response.data
    } catch (err: any) {
      setError(err.message || 'Failed to fetch complaint')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const getStats = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await complaintService.getStats()
      return response.data
    } catch (err: any) {
      setError(err.message || 'Failed to fetch statistics')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const getMlStatus = async () => {
    try {
      return await complaintService.getMlStatus()
    } catch (err) {
      return { status: 'ERROR' }
    }
  }

  return {
    loading,
    error,
    submitComplaint,
    trackByPhone,
    getComplaintById,
    getStats,
    getMlStatus,
  }
}
