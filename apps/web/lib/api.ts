import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth API
export const authAPI = {
    login: (email: string, password: string) =>
        api.post('/auth/login', { email, password }),
    register: (email: string, password: string) =>
        api.post('/auth/register', { email, password }),
    getProfile: () => api.get('/auth/profile'),
};

// Accounts API
export const accountsAPI = {
    getAccounts: () => api.get('/accounts'),
};

// Orders API
export const ordersAPI = {
    placeOrder: (orderData: any) => api.post('/orders', orderData),
    getOrders: (accountId: string) => api.get(`/orders/${accountId}`),
};

// Portfolio Import API
export const portfolioImportAPI = {
    upload: (accountId: string, file: File) => {
        const formData = new FormData();
        formData.append('image', file);
        return api.post(`/portfolio-import/upload/${accountId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
    getImport: (importId: string) => api.get(`/portfolio-import/${importId}`),
    updatePositions: (importId: string, positions: any[]) =>
        api.put(`/portfolio-import/${importId}`, { positions }),
    confirm: (importId: string) => api.post(`/portfolio-import/${importId}/confirm`),
    getHistory: (accountId: string) => api.get(`/portfolio-import/history/${accountId}`),
};

// Portfolio Chat API
export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface PortfolioPosition {
    symbol: string;
    name: string;
    quantity: number;
    avgPrice: number;
    currentPrice: number;
    assetClass: string;
    positionType?: string;
    pnl: number;
    pnlPercent: number;
    notional: number;
}

export interface PortfolioSummary {
    totalValue: number;
    totalInvested: number;
    totalPnL: number;
    pnlPercent: number;
    positions: PortfolioPosition[];
    byAssetClass: Record<string, { value: number; pnl: number; count: number }>;
}

export const portfolioChatAPI = {
    chat: (message: string, portfolioData: PortfolioSummary, conversationHistory: ChatMessage[] = []) =>
        api.post<{ response: string }>('/portfolio-chat', {
            message,
            portfolioData,
            conversationHistory
        }),
};

