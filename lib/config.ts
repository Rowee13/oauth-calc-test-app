// Configuration for API endpoints and environment variables
export const config = {
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8000',
    api: {
        auth: {
            googleLogin: '/api/auth/google/login/', // User clicks here to see Google login
            googleCallback: '/api/auth/google/callback/', // Google responds here
            googleManage: '/api/auth/google/', // Frontend manages OAuth here
        },
    },
} as const

// Helper to get full API URL
export const getApiUrl = (endpoint: string) => {
    return `${config.baseUrl}${endpoint}`
}
