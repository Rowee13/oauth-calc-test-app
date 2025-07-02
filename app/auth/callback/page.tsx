'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { useAuth } from '@/components/auth-provider'

export default function AuthCallbackPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { login } = useAuth()
    const [isProcessing, setIsProcessing] = useState(false)

    useEffect(() => {
        const handleCallback = async () => {
            if (isProcessing) return // Prevent multiple processing
            setIsProcessing(true)

            try {
                console.log('Auth callback processing...')
                // Get tokens directly from URL parameters (Django sends them directly)
                const accessToken = searchParams.get('access_token')
                const refreshToken = searchParams.get('refresh_token')
                const error = searchParams.get('error')

                if (error) {
                    console.error('OAuth error:', error)
                    router.push('/')
                    return
                }

                if (accessToken) {
                    console.log('Access token found, saving to cookies...')
                    // Save tokens to cookies
                    document.cookie = `access_token=${accessToken}; path=/; max-age=${7 * 24 * 60 * 60}` // 7 days
                    if (refreshToken) {
                        document.cookie = `refresh_token=${refreshToken}; path=/; max-age=${30 * 24 * 60 * 60}` // 30 days
                    }

                    // Fetch user data with the access token
                    try {
                        console.log('Fetching user profile...')
                        const userResponse = await fetch(
                            `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/profile/`,
                            {
                                method: 'GET',
                                headers: {
                                    Authorization: `Bearer ${accessToken}`,
                                    'Content-Type': 'application/json',
                                },
                            }
                        )

                        if (userResponse.ok) {
                            const apiUserData = await userResponse.json()
                            console.log(
                                'Auth Callback - API User Data:',
                                apiUserData
                            ) // Debug log

                            // Map API data to our User interface
                            const userData = {
                                id:
                                    apiUserData.user.id ||
                                    apiUserData.user.user_id ||
                                    'user',
                                name:
                                    apiUserData.user.full_name ||
                                    apiUserData.user.name ||
                                    apiUserData.user.first_name +
                                        ' ' +
                                        apiUserData.user.last_name ||
                                    'User',
                                email:
                                    apiUserData.user.email ||
                                    'user@example.com',
                                avatar:
                                    apiUserData.user.picture ||
                                    apiUserData.user.avatar ||
                                    undefined,
                            }
                            console.log('Logging in user:', userData)
                            login(userData)
                        }
                    } catch (userError) {
                        console.error('Failed to fetch user data:', userError)
                        // Login anyway with basic info from token if possible
                        login({
                            id: 'user',
                            name: 'User',
                            email: 'user@example.com',
                        })
                    }

                    // Redirect to home after a short delay
                    setTimeout(() => {
                        console.log('Redirecting to home...')
                        router.push('/')
                    }, 500)
                } else {
                    console.log('No access token, redirecting to home')
                    router.push('/')
                }
            } catch (error) {
                console.error('Callback processing failed:', error)
                router.push('/')
            }
        }

        handleCallback()
    }, []) // Removed dependencies to prevent re-runs

    return (
        <section className='flex-grow'>
            <div className='relative isolate px-6 pt-14 lg:px-8'>
                <div className='mx-auto max-w-2xl py-32 sm:py-48 lg:py-56'>
                    <div className='text-center'>
                        <div className='text-lg text-muted-foreground'>
                            Processing authentication...
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
