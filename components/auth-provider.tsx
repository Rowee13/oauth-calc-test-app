'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

import {
    AuthState,
    User,
    getAccessToken,
    getUserFromStorage,
    removeUserFromStorage,
    saveUserToStorage,
} from '@/lib/auth'

interface AuthContextType extends AuthState {
    login: (user: User) => void
    logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        isLoading: true,
        isAuthenticated: false,
    })

    // Load user from storage/cookies on mount
    useEffect(() => {
        const storedUser = getUserFromStorage()
        const accessToken = getAccessToken()

        // If we have a token but no user, try to fetch user data
        if (accessToken && !storedUser) {
            fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/user/`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            })
                .then((response) => response.json())
                .then((userData) => {
                    saveUserToStorage(userData)
                    setAuthState({
                        user: userData,
                        isLoading: false,
                        isAuthenticated: true,
                    })
                })
                .catch(() => {
                    setAuthState({
                        user: null,
                        isLoading: false,
                        isAuthenticated: false,
                    })
                })
        } else {
            setAuthState({
                user: storedUser,
                isLoading: false,
                isAuthenticated: !!storedUser && !!accessToken,
            })
        }
    }, [])

    const login = (user: User) => {
        saveUserToStorage(user)
        setAuthState({
            user,
            isLoading: false,
            isAuthenticated: true,
        })
    }

    const logout = () => {
        removeUserFromStorage()
        setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
        })
    }

    const value: AuthContextType = {
        ...authState,
        login,
        logout,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
