// src/services/api.ts
import axios, { AxiosError } from 'axios'

// Create React App uses process.env.REACT_APP_*
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api'

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add timestamp for cache busting
    config.params = {
      ...config.params,
      _t: Date.now(),
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError) => {
    // Handle errors
    const message = 
      (error.response?.data as any)?.error || 
      error.message || 
      'An unexpected error occurred'
    
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message,
    })

    return Promise.reject({
      message,
      status: error.response?.status,
      data: error.response?.data,
    })
  }
)

export default api
