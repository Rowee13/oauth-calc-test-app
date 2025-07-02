'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

import { useAuth } from '@/components/auth-provider'

export default function CallbackPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { login } = useAuth()

    useEffect(() => {
        const handleCallback = async () => {
            try {
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
                    // Save tokens to cookies
                    document.cookie = `access_token=${accessToken}; path=/; max-age=${7 * 24 * 60 * 60}` // 7 days
                    if (refreshToken) {
                        document.cookie = `refresh_token=${refreshToken}; path=/; max-age=${30 * 24 * 60 * 60}` // 30 days
                    }

                    // Fetch user data with the access token
                    try {
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
                            console.log('API User Data:', apiUserData) // Debug log

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
                            login(userData)
                        }
                    } catch (userError) {
                        console.error('Failed to fetch user data:', userError)
                        // Login anyway with basic info
                        login({
                            id: 'user',
                            name: 'User',
                            email: 'user@example.com',
                        })
                    }

                    // Redirect to home
                    router.push('/')
                } else {
                    // No access token, redirect to home
                    router.push('/')
                }
            } catch (error) {
                console.error('Callback processing failed:', error)
                router.push('/')
            }
        }

        handleCallback()
    }, [router, searchParams, login])

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
