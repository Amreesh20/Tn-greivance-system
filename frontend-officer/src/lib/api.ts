import axios from 'axios';
import type {
    Complaint,
    LoginResponse,
    StatsResponse,
    PaginatedResponse,
    ApiResponse
} from '@/types';

// Create axios instance
const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth interceptor
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('officer_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        config.headers['x-admin-bypass'] = 'dev'; // Dev bypass for testing
    }
    return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('officer_token');
            localStorage.removeItem('officer_user');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authApi = {
    login: async (email: string, password: string): Promise<LoginResponse> => {
        const response = await api.post<LoginResponse>('/admin/login', { email, password });
        return response.data;
    },
};

// Stats API
export const statsApi = {
    getStats: async (): Promise<StatsResponse> => {
        const response = await api.get<StatsResponse>('/admin/officer/stats');
        return response.data;
    },
};

// Complaints API
export const complaintsApi = {
    getAssigned: async (
        officerId: number,
        params?: {
            limit?: number;
            offset?: number;
            status?: string;
            priority?: string;
            sortBy?: string;
            sortOrder?: 'ASC' | 'DESC';
        }
    ): Promise<PaginatedResponse<Complaint>> => {
        const response = await api.get<PaginatedResponse<Complaint>>('/admin/complaints', {
            params: { assignedTo: officerId, ...params },
        });
        return response.data;
    },

    getAll: async (params?: {
        limit?: number;
        offset?: number;
        status?: string;
        priority?: string;
        assignedTo?: number;
    }): Promise<PaginatedResponse<Complaint>> => {
        const response = await api.get<PaginatedResponse<Complaint>>('/admin/complaints', { params });
        return response.data;
    },

    getById: async (id: number): Promise<{ success: boolean; data: Complaint; suggestedOfficers?: unknown[] }> => {
        const response = await api.get(`/admin/complaint/${id}`);
        return response.data;
    },

    updateStatus: async (
        id: number,
        status: string,
        resolution?: string
    ): Promise<ApiResponse<Complaint>> => {
        const response = await api.patch<ApiResponse<Complaint>>(`/complaints/${id}/status`, {
            status,
            resolution
        });
        return response.data;
    },
};

export default api;
