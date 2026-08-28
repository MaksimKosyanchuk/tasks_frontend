import {
    useEffect,
    useState,
} from "react";

import { refreshAccessToken } from "../api/auth.api";
import { AuthContext } from "./AuthContext";

export function AuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [accessToken, setAccessToken] =
        useState<string | null>(null);

    const [isLoading, setIsLoading] =
        useState(true);

    useEffect(() => {
        refreshAccessToken()
            .then(({ accessToken }) =>{
                setAccessToken(accessToken);
            })
            .catch(() => {
                setAccessToken(null);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    return (
        <AuthContext.Provider
            value={{
                accessToken,
                isAuthenticated: !!accessToken,
                isLoading,
                setAccessToken,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}