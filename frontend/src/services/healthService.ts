// src/services/healthService.ts
import api from './api'

export const healthService = {
  /**
   * Check API health status
   */
  async check(): Promise<{
    status: string
    database: string
    timestamp: string
    stats?: {
      users: number
      districts: number
      complaints: number
      activeComplaints: number
    }
  }> {
    return api.get('/health')
  },
}

export default healthService
