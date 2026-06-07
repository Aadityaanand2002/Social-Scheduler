import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import api from "../api/axios";

interface User {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    createdAt?: string;
    planType?: string;
    planExpiryDate?: string;
    role?: string;
    profilePicture?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (userData: User, token: string) => void;
    logout: () => void;
    updateUser: (userData: User, token?: string) => void;
    refreshUser: () => Promise<User | null>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const getInitialAuthState = () => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (!storedUser || !storedToken) {
        return { user: null, token: null };
    }

    try {
        return {
            user: JSON.parse(storedUser) as User,
            token: storedToken,
        };
    } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        return { user: null, token: null };
    }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const initialAuthState = useMemo(() => getInitialAuthState(), []);
    const [user, setUser] = useState<User | null>(initialAuthState.user)
    const [token, setToken] = useState<string | null>(initialAuthState.token)
    const isLoading = false

    // Set auth header via effect instead of directly in render body
    useEffect(() => {
        if (token) {
            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        } else {
            delete api.defaults.headers.common["Authorization"];
        }
    }, [token]);

    // Refresh user data on initial load to ensure we have the latest fields (like role)
    useEffect(() => {
        if (token) {
            refreshUser();
        }
    }, []); // Only run once on mount

    const login = useCallback((userData: User, newToken: string) => {
        setUser(userData)
        setToken(newToken)
        localStorage.setItem("user", JSON.stringify(userData))
        localStorage.setItem("token", newToken)
    }, [])

    const updateUser = useCallback((userData: User, newToken?: string) => {
        setUser(userData)
        localStorage.setItem("user", JSON.stringify(userData))

        if (newToken) {
            setToken(newToken)
            localStorage.setItem("token", newToken)
        }
    }, [])

    const refreshUser = useCallback(async (): Promise<User | null> => {
        if (!token) return null

        try {
            const { data } = await api.get("/api/auth/me")
            updateUser(data, data.token)
            return data
        } catch {
            return null
        }
    }, [token, updateUser])

    const logout = useCallback(() => {
        setUser(null)
        setToken(null)
        localStorage.removeItem("user")
        localStorage.removeItem("token")
    }, [])

    const value = useMemo(() => ({
        user, token, isLoading, login, logout, updateUser, refreshUser,
        isAuthenticated: !!token,
    }), [user, token, isLoading, login, logout, updateUser, refreshUser])

    return <AuthContext.Provider value={value}>
        {children}
    </AuthContext.Provider>
}

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    return context;
}
