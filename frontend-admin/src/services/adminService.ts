// frontend-admin/src/services/adminService.ts
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Add dev bypass header for development
const api = axios.create({
    baseURL: API_BASE,
    headers: {
        'x-admin-bypass': 'dev'
    }
});

export interface Complaint {
    id: number;
    citizenName: string;
    citizenPhone: string;
    citizenEmail?: string;
    text: string;
    category: string;
    districtId: string;
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    status: 'submitted' | 'acknowledged' | 'in_progress' | 'resolved' | 'rejected' | 'closed';
    needsReview: boolean;
    categoryConfidence?: number;
    suggestedDistrict?: string;
    suggestedDistrictName?: string;
    assignedTo?: number;
    assignedAt?: string;
    createdAt: string;
    updatedAt: string;
    district?: { id: string; name: string };
    officer?: { id: number; name: string; department: string };
    // Media attachments
    audioPath?: string;
    imagePath?: string;
    // ML Analysis fields
    slaHours?: number;
    priorityScore?: number;
    mlUsed?: boolean;
    voiceTranscript?: string;
    voiceSentiment?: number;
    voiceUrgency?: number;
    imageSeverity?: number;
    imageIssues?: any;
}

export interface Officer {
    id: number;
    name: string;
    email: string;
    phone: string;
    department: string;
    districtId: string;
    isActive: boolean;
    currentWorkload: number;
    district?: { id: string; name: string };
}

export interface Stats {
    total: number;
    pendingReview: number;
    inProgress: number;
    resolved: number;
    critical: number;
    todayCount: number;
    weekCount: number;
    resolutionRate: number;
}

export interface AdminStats {
    stats: Stats;
    distributions: {
        byCategory: { category: string; count: number }[];
        byStatus: { status: string; count: number }[];
        byPriority: { priority: string; count: number }[];
        byDistrict: { districtId: string; count: number; district: { name: string } }[];
        officerWorkload: { assignedTo: number; count: number; officer: { name: string; department: string } }[];
    };
}

export interface AuthUser {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'officer';
    department?: string;
    district?: { id: string; name: string };
    phone?: string;
}

// Auth token management
let authToken: string | null = localStorage.getItem('adminToken');

export const setAuthToken = (token: string | null) => {
    authToken = token;
    if (token) {
        localStorage.setItem('adminToken', token);
    } else {
        localStorage.removeItem('adminToken');
    }
};

export const getAuthToken = () => authToken;

// Add token to requests if available
api.interceptors.request.use((config) => {
    if (authToken) {
        config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
});

// Login
export const login = async (email: string, password: string): Promise<{
    success: boolean;
    user: AuthUser;
    token: string;
    message?: string;
}> => {
    const res = await api.post('/admin/login', { email, password });
    if (res.data.success && res.data.token) {
        setAuthToken(res.data.token);
    }
    return res.data;
};

// Logout
export const logout = () => {
    setAuthToken(null);
    localStorage.removeItem('adminUser');
};

// Get current user from localStorage
export const getCurrentUser = (): AuthUser | null => {
    const userStr = localStorage.getItem('adminUser');
    if (userStr) {
        try {
            return JSON.parse(userStr);
        } catch {
            return null;
        }
    }
    return null;
};

// Save user to localStorage
export const setCurrentUser = (user: AuthUser | null) => {
    if (user) {
        localStorage.setItem('adminUser', JSON.stringify(user));
    } else {
        localStorage.removeItem('adminUser');
    }
};

// Stats
export const getStats = async (): Promise<AdminStats> => {
    const res = await api.get('/admin/stats');
    return res.data;
};

// Pending complaints
export const getPendingComplaints = async (params?: {
    limit?: number;
    offset?: number;
}): Promise<{ count: number; data: Complaint[] }> => {
    const res = await api.get('/admin/pending', { params });
    return res.data;
};

// All complaints
export const getComplaints = async (params?: {
    limit?: number;
    offset?: number;
    status?: string;
    category?: string;
    priority?: string;
    districtId?: string;
    needsReview?: boolean;
}): Promise<{ count: number; data: Complaint[] }> => {
    const res = await api.get('/admin/complaints', { params });
    return res.data;
};

// Single complaint
export const getComplaint = async (id: number): Promise<{
    data: Complaint;
    suggestedOfficers: Officer[];
}> => {
    const res = await api.get(`/admin/complaint/${id}`);
    return res.data;
};

// Officers
export const getOfficers = async (params?: {
    department?: string;
    districtId?: string;
    isActive?: boolean;
}): Promise<{ count: number; data: Officer[] }> => {
    const res = await api.get('/admin/officers', { params });
    return res.data;
};

// Assign officer
export const assignOfficer = async (complaintId: number, officerId: number): Promise<{
    success: boolean;
    message: string;
}> => {
    const res = await api.post(`/admin/assign/${complaintId}`, { officerId });
    return res.data;
};

// Verify and update category
export const verifyComplaint = async (
    complaintId: number,
    data: { category: string; officerId?: number; notes?: string }
): Promise<{ success: boolean; message: string }> => {
    const res = await api.post(`/admin/verify/${complaintId}`, data);
    return res.data;
};

export default {
    login,
    logout,
    getCurrentUser,
    setCurrentUser,
    getAuthToken,
    getStats,
    getPendingComplaints,
    getComplaints,
    getComplaint,
    getOfficers,
    assignOfficer,
    verifyComplaint,
};
