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
    const [hasInitialized, setHasInitialized] = useState(false)

    // Load user from storage/cookies on mount
    useEffect(() => {
        if (hasInitialized) return // Prevent multiple initializations

        const storedUser = getUserFromStorage()
        const accessToken = getAccessToken()
        console.log(
            'Auth Provider Init - Stored User:',
            storedUser,
            'Token:',
            !!accessToken
        )

        // If we have a token but no user, try to fetch user data
        if (accessToken && !storedUser) {
            console.log('Fetching user profile...')
            fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/profile/`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            })
                .then((response) => response.json())
                .then((apiUserData) => {
                    console.log('Auth Provider - API User Data:', apiUserData) // Debug log

                    // Map API data to our User interface
                    const userData = {
                        id:
                            apiUserData.user.id ||
                            apiUserData.user.user_id ||
                            'user',
                        name:
                            apiUserData.user.full_name ||
                            apiUserData.user.name ||
                            `${apiUserData.user.first_name || ''} ${apiUserData.user.last_name || ''}`.trim() ||
                            'User',
                        email: apiUserData.user.email || 'user@example.com',
                        avatar:
                            apiUserData.user.picture ||
                            apiUserData.user.avatar ||
                            undefined,
                    }

                    saveUserToStorage(userData)
                    setAuthState({
                        user: userData,
                        isLoading: false,
                        isAuthenticated: true,
                    })
                    setHasInitialized(true)
                })
                .catch((error) => {
                    console.error('Failed to fetch user profile:', error)
                    setAuthState({
                        user: null,
                        isLoading: false,
                        isAuthenticated: false,
                    })
                    setHasInitialized(true)
                })
        } else {
            setAuthState({
                user: storedUser,
                isLoading: false,
                isAuthenticated: !!storedUser && !!accessToken,
            })
            setHasInitialized(true)
        }
    }, [hasInitialized])

    const login = (user: User) => {
        saveUserToStorage(user)
        setAuthState({
            user,
            isLoading: false,
            isAuthenticated: true,
        })
    }

    const logout = async () => {
        try {
            const accessToken = getAccessToken()

            if (accessToken) {
                // Call Django logout endpoint
                await fetch(
                    `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/logout/`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${accessToken}`,
                        },
                    }
                )
            }
        } catch (error) {
            console.error('Logout API call failed:', error)
        } finally {
            // Always clean up local state
            removeUserFromStorage()
            setAuthState({
                user: null,
                isLoading: false,
                isAuthenticated: false,
            })
        }
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
