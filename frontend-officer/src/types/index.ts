// Officer / User types
export interface Officer {
    id: number;
    name: string;
    email: string;
    phone: string;
    role: 'officer' | 'admin';
    department: string;
    district: {
        id: string;
        name: string;
    } | null;
}

// Complaint types
export type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type Status = 'submitted' | 'acknowledged' | 'in_progress' | 'resolved' | 'rejected' | 'closed';

export interface Complaint {
    id: number;
    text: string;
    category: string;
    priority: Priority;
    status: Status;
    citizenName: string;
    citizenPhone: string;
    districtId: string;
    district: {
        id: string;
        name: string;
    } | null;
    latitude: number | null;
    longitude: number | null;
    slaHours: number;
    assignedTo: number | null;
    assignedAt: string | null;
    createdAt: string;
    updatedAt: string;
    resolvedAt: string | null;
    resolution: string | null;
    imagePath: string | null;
    audioPath: string | null;
    voiceTranscript: string | null;
    mlResults: {
        classification?: { confidence: number };
        priority?: { components: Record<string, number> };
        image?: { description: string; severity: number };
    } | null;
    officer?: Officer | null;
}

// Dashboard stats
export interface DashboardStats {
    total: number;
    pendingReview: number;
    inProgress: number;
    resolved: number;
    critical: number;
    todayCount: number;
    weekCount: number;
    resolutionRate: number;
}

// API Response types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    success: boolean;
    count: number;
    data: T[];
    pagination: {
        total: number;
        limit: number;
        offset: number;
        pages: number;
    };
}

export interface LoginResponse {
    success: boolean;
    message: string;
    user: Officer;
    token: string;
}

export interface StatsResponse {
    success: boolean;
    stats: DashboardStats;
    distributions: {
        byCategory: Array<{ category: string; count: number }>;
        byStatus: Array<{ status: string; count: number }>;
        byPriority: Array<{ priority: string; count: number }>;
    };
}
