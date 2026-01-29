'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/lib/api';

interface User {
    id: string;
    email: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for existing token
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);

            // Sync cookie for middleware
            document.cookie = `auth_token=${storedToken}; path=/; max-age=86400; SameSite=Strict`;

            // Mock auth bypass
            if (storedToken.startsWith('mock_')) {
                document.cookie = `auth_token=${storedToken}; path=/; max-age=86400; SameSite=Strict`;

                setUser({
                    id: 'mock-user-id',
                    email: localStorage.getItem('user_email') || 'demo@example.com',
                    role: 'user'
                });
                setIsLoading(false);
                return;
            }

            // Fetch user profile
            authAPI.getProfile()
                .then((res) => setUser(res.data))
                .catch(() => {
                    localStorage.removeItem('token');
                    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                    setToken(null);
                })
                .finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, []);

    const login = async (email: string, password: string) => {
        // Mock login
        // const access_token = 'mock_token_' + Date.now();
        // const userData = {
        //     id: 'mock-user-id',
        //     email,
        //     role: 'user',
        // };
        
        // localStorage.setItem('token', access_token);
        // localStorage.setItem('user_email', email);
        // setToken(access_token);
        // setUser(userData);
        
        const response = await authAPI.login(email, password);
        const { access_token, user: userData } = response.data;
        localStorage.setItem('token', access_token);
        // Set cookie for middleware
        document.cookie = `auth_token=${access_token}; path=/; max-age=86400; SameSite=Strict`;
        setToken(access_token);
        setUser(userData);
    };

    const register = async (email: string, password: string) => {
        // Mock register
        // const access_token = 'mock_token_' + Date.now();
        // const userData = {
        //     id: 'mock-user-id',
        //     email,
        //     role: 'user',
        // };
        
        // localStorage.setItem('token', access_token);
        // localStorage.setItem('user_email', email);
        // setToken(access_token);
        // setUser(userData);

        const response = await authAPI.register(email, password);
        const { access_token, user: userData } = response.data;
        localStorage.setItem('token', access_token);
        // Set cookie for middleware
        document.cookie = `auth_token=${access_token}; path=/; max-age=86400; SameSite=Strict`;
        setToken(access_token);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        // Remove cookie
        document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
