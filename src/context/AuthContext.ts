import { createContext } from 'react';

export type AuthContextType = {
    accessToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    setAccessToken: (accessToken: string | null) => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);