// Authentication types and utilities

export interface User {
    id: string
    name: string
    email: string
    avatar?: string
}

export interface AuthState {
    user: User | null
    isLoading: boolean
    isAuthenticated: boolean
}

// Storage keys for persisting auth state
export const AUTH_STORAGE_KEYS = {
    user: 'user',
    accessToken: 'access_token',
    refreshToken: 'refresh_token',
}

// Cookie helpers
export const getCookie = (name: string): string | null => {
    if (typeof window !== 'undefined') {
        const value = `; ${document.cookie}`
        const parts = value.split(`; ${name}=`)
        if (parts.length === 2) return parts.pop()?.split(';').shift() || null
    }
    return null
}

export const deleteCookie = (name: string) => {
    if (typeof window !== 'undefined') {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
    }
}

// Helper functions for localStorage (keeping for backwards compatibility)
export const saveUserToStorage = (user: User) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(user))
    }
}

export const getUserFromStorage = (): User | null => {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(AUTH_STORAGE_KEYS.user)
        return stored ? JSON.parse(stored) : null
    }
    return null
}

export const saveTokensToStorage = (
    accessToken: string,
    refreshToken: string
) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_STORAGE_KEYS.accessToken, accessToken)
        localStorage.setItem(AUTH_STORAGE_KEYS.refreshToken, refreshToken)
    }
}

export const getAccessToken = (): string | null => {
    // Try cookies first, then localStorage
    const cookieToken = getCookie('access_token')
    if (cookieToken) return cookieToken

    if (typeof window !== 'undefined') {
        return localStorage.getItem(AUTH_STORAGE_KEYS.accessToken)
    }
    return null
}

export const getRefreshToken = (): string | null => {
    // Try cookies first, then localStorage
    const cookieToken = getCookie('refresh_token')
    if (cookieToken) return cookieToken

    if (typeof window !== 'undefined') {
        return localStorage.getItem(AUTH_STORAGE_KEYS.refreshToken)
    }
    return null
}

export const removeUserFromStorage = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(AUTH_STORAGE_KEYS.user)
        localStorage.removeItem(AUTH_STORAGE_KEYS.accessToken)
        localStorage.removeItem(AUTH_STORAGE_KEYS.refreshToken)

        // Also delete cookies
        deleteCookie('access_token')
        deleteCookie('refresh_token')
    }
}
