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

// Raw position data - the aggregator does all the math
export interface RawPosition {
    symbol: string;
    name: string;
    quantity: number;
    avgPrice: number;
    currentPrice: number;
    assetClass: string;
    positionType?: string;
    leverage?: number;
}

export interface ChatRequest {
    message: string;
    positions: RawPosition[];
    userName?: string;
    riskProfile?: 'Conservative' | 'Moderate' | 'Aggressive';
    cashBalance?: number;
    conversationHistory?: ChatMessage[];
}

export const portfolioChatAPI = {
    chat: (request: ChatRequest) =>
        api.post<{ response: string }>('/portfolio-chat', request),
};

// Portfolio Analyst API
export interface AnalysisPosition {
    symbol: string;
    name: string;
    quantity: number;
    avgPrice: number;
    currentPrice: number;
    assetClass: string;
    leverage?: number;
    broker?: string;
    pnl?: number;
    pnlPercent?: number;
}

export interface RiskAlert {
    symbol: string;
    level: 'low' | 'medium' | 'high' | 'critical';
    reason: string;
    suggestion?: string;
}

export interface NewsAlert {
    symbol: string;
    headline: string;
    impact: 'low' | 'medium' | 'high';
    timeframe?: string;
}

export interface OvertradingWarning {
    symbol?: string;
    warning: string;
    suggestion: string;
}

export interface PortfolioAnalysisReport {
    overallScore: number;
    scoreLabel: 'Poor' | 'Fair' | 'Good' | 'Excellent';
    riskAlerts: RiskAlert[];
    newsAlerts: NewsAlert[];
    overtradingWarnings: OvertradingWarning[];
    recommendations: string[];
    summary: string;
    generatedAt: string;
}

export const portfolioAnalystAPI = {
    analyze: (positions: AnalysisPosition[]) =>
        api.post<PortfolioAnalysisReport>('/portfolio-analyst/analyze', { positions }),
};
