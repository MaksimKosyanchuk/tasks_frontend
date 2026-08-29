import { createContext } from 'react';

export type User = {
    id: string;
    email: string;
    nickName: string;
};

export type AuthContextType = {
    accessToken: string | null;
    user: User | null;
    setUser: (user: User | null) => void;
    isAuthenticated: boolean;
    isLoading: boolean;
    setAccessToken: (accessToken: string | null) => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);