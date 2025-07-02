import { config, getApiUrl } from './config'

// Redirect to Django Google login page
export const initiateGoogleLogin = () => {
    const googleLoginUrl = getApiUrl(config.api.auth.googleLogin)
    if (typeof window !== 'undefined') {
        window.location.href = googleLoginUrl
    }
}
