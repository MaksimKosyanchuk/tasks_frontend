import {
    useEffect,
    useState,
} from "react";

import { refreshAccessToken } from "../api/auth.api";
import { AuthContext, type User } from "./AuthContext";

export function AuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [accessToken, setAccessToken] =
        useState<string | null>(null);

    const [user, setUser] =
        useState<User | null>(null);

    const [isLoading, setIsLoading] =
        useState(true);

    useEffect(() => {
        refreshAccessToken()
            .then(({ accessToken, user }) => {
                setAccessToken(accessToken);
                setUser(user);
            })
            .catch(() => {
                setAccessToken(null);
                setUser(null);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    return (
        <AuthContext.Provider
            value={{
                accessToken,
                user,
                isAuthenticated: !!accessToken,
                isLoading,
                setAccessToken,
                setUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}