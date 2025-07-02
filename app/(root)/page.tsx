'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'

import { useAuth } from '@/components/auth-provider'

interface ConversionResult {
    meters: string
    feet: string
    conversion_id: number
    timestamp: string
    formula_used: string
    message: string
}

interface ConversionHistory {
    id: number
    meters_value: string
    feet_value: string
    timestamp: string
    user_name: string
    user_full_name: string
    conversion_formula: string
    ip_address: string
}

interface HistoryResponse {
    conversions: ConversionHistory[]
    pagination: {
        total_count: number
        limit: number
        offset: number
        has_next: boolean
        has_previous: boolean
    }
    message: string
}

export default function Home() {
    const { user, isAuthenticated, isLoading } = useAuth()
    const router = useRouter()
    const [metersValue, setMetersValue] = useState('')
    const [isConverting, setIsConverting] = useState(false)
    const [conversionResult, setConversionResult] =
        useState<ConversionResult | null>(null)
    const [conversionHistory, setConversionHistory] = useState<
        ConversionHistory[]
    >([])
    const [error, setError] = useState('')

    const handleGetStarted = () => {
        router.push('/auth/login')
    }

    // Function to get auth token from cookies
    const getAuthToken = () => {
        const cookies = document.cookie.split(';')
        const tokenCookie = cookies.find((cookie) =>
            cookie.trim().startsWith('access_token=')
        )
        return tokenCookie ? tokenCookie.split('=')[1] : null
    }

    // Fetch conversion history
    const fetchConversionHistory = useCallback(async () => {
        const token = getAuthToken()
        if (!token) return

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BASE_URL}/api/conversions/history/`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            )

            if (response.ok) {
                const data: HistoryResponse = await response.json()
                setConversionHistory(data.conversions)
            }
        } catch (error) {
            console.error('Failed to fetch conversion history:', error)
        }
    }, [])

    // Load conversion history when user is authenticated
    useEffect(() => {
        if (isAuthenticated) {
            fetchConversionHistory()
        }
    }, [isAuthenticated, fetchConversionHistory])

    const handleConvert = async () => {
        if (!metersValue.trim()) {
            setError('Please enter a value in meters')
            return
        }

        const meters = parseFloat(metersValue)
        if (isNaN(meters)) {
            setError('Please enter a valid number')
            return
        }

        setError('')
        setIsConverting(true)
        setConversionResult(null)

        const token = getAuthToken()
        if (!token) {
            setError('Authentication required')
            setIsConverting(false)
            return
        }

        const startTime = Date.now()
        const minimumDuration = 10000 // 10 seconds in milliseconds

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BASE_URL}/api/conversions/convert/`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ meters: meters }),
                }
            )

            if (response.ok) {
                const result: ConversionResult = await response.json()

                // Calculate remaining time to ensure 10-second minimum
                const elapsedTime = Date.now() - startTime
                const remainingTime = Math.max(0, minimumDuration - elapsedTime)

                // Wait for remaining time if needed
                setTimeout(() => {
                    setConversionResult(result)
                    setIsConverting(false)
                    fetchConversionHistory() // Refresh history after conversion
                }, remainingTime)
            } else {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Conversion failed')
            }
        } catch (error) {
            // Still respect the 10-second minimum for errors
            const elapsedTime = Date.now() - startTime
            const remainingTime = Math.max(0, minimumDuration - elapsedTime)

            setTimeout(() => {
                setError(
                    error instanceof Error ? error.message : 'Conversion failed'
                )
                setIsConverting(false)
            }, remainingTime)
        }
    }

    if (isLoading) {
        return (
            <section className='flex-grow'>
                <div className='relative isolate px-6 pt-14 lg:px-8'>
                    <div className='mx-auto max-w-2xl py-32 sm:py-48 lg:py-56'>
                        <div className='text-center'>
                            <div className='text-lg text-muted-foreground'>
                                Loading...
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section className='flex-grow'>
            <div className='relative isolate px-6 pt-8 lg:px-8'>
                <div className='max-w-7xl mx-auto py-8'>
                    <div className='text-center'>
                        <h1 className='text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl'>
                            <span className='bg-gradient-to-r from-primary to-cyan-500 bg-clip-text font-extrabold text-transparent'>
                                Calculation Oauth Test App
                            </span>{' '}
                        </h1>
                        <p className='mt-6 text-pretty text-base font-medium text-gray-500 sm:text-lg max-w-2xl mx-auto'>
                            A test app for OAuth2.0 authentication with
                            calculation functionality.
                        </p>

                        {!isAuthenticated ? (
                            <div className='mt-8'>
                                <Button
                                    onClick={handleGetStarted}
                                    size='lg'
                                    className='text-lg px-8 py-3'
                                >
                                    Get Started
                                </Button>
                            </div>
                        ) : (
                            <div className='mt-8 space-y-8'>
                                <div className='text-center space-y-2'>
                                    <h2 className='text-3xl font-semibold text-foreground'>
                                        Welcome, {user?.name}!
                                    </h2>
                                    <p className='text-lg text-muted-foreground'>
                                        {user?.email}
                                    </p>
                                </div>

                                {/* Conversion Feature */}
                                <div className='max-w-md mx-auto space-y-6'>
                                    <div className='bg-card border border-border rounded-lg p-6 shadow-sm'>
                                        <h3 className='text-xl font-semibold mb-4 text-center'>
                                            Meters to Feet Converter
                                        </h3>

                                        <div className='space-y-4'>
                                            <div>
                                                <label
                                                    htmlFor='meters'
                                                    className='block text-sm font-medium mb-2'
                                                >
                                                    Enter value in meters:
                                                </label>
                                                <input
                                                    id='meters'
                                                    type='number'
                                                    step='0.01'
                                                    value={metersValue}
                                                    onChange={(e) =>
                                                        setMetersValue(
                                                            e.target.value
                                                        )
                                                    }
                                                    className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
                                                    placeholder='e.g., 10.5'
                                                    disabled={isConverting}
                                                />
                                            </div>

                                            <Button
                                                onClick={handleConvert}
                                                disabled={
                                                    isConverting ||
                                                    !metersValue.trim()
                                                }
                                                className='w-full'
                                                size='lg'
                                            >
                                                {isConverting
                                                    ? 'Converting...'
                                                    : 'Convert'}
                                            </Button>

                                            {error && (
                                                <div className='text-red-500 text-sm text-center'>
                                                    {error}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Progress UI */}
                                    {isConverting && (
                                        <div className='bg-card border border-border rounded-lg p-6 shadow-sm'>
                                            <div className='text-center space-y-4'>
                                                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto'></div>
                                                <p className='text-muted-foreground'>
                                                    Processing conversion
                                                    request...
                                                </p>
                                                <p className='text-sm text-muted-foreground'>
                                                    Backend is calculating the
                                                    conversion
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Conversion Result */}
                                    {conversionResult && !isConverting && (
                                        <div className='bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-6 shadow-sm'>
                                            <h4 className='text-lg font-semibold text-green-800 dark:text-green-200 mb-3'>
                                                Conversion Result
                                            </h4>
                                            <div className='space-y-2 text-green-700 dark:text-green-300'>
                                                <p className='text-xl font-bold'>
                                                    {conversionResult.meters}{' '}
                                                    meters ={' '}
                                                    {conversionResult.feet} feet
                                                </p>
                                                <p className='text-sm'>
                                                    {
                                                        conversionResult.formula_used
                                                    }
                                                </p>
                                                <p className='text-xs text-green-600 dark:text-green-400'>
                                                    {conversionResult.message}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Conversion History */}
                                    {conversionHistory.length > 0 && (
                                        <div className='bg-card border border-border rounded-lg p-6 shadow-sm'>
                                            <h4 className='text-lg font-semibold mb-4'>
                                                Recent Conversions
                                            </h4>
                                            <div className='space-y-3 max-h-60 overflow-y-auto'>
                                                {conversionHistory
                                                    .slice(0, 5)
                                                    .map((conversion) => (
                                                        <div
                                                            key={conversion.id}
                                                            className='flex justify-between items-center p-3 bg-muted/50 rounded-md'
                                                        >
                                                            <div>
                                                                <p className='text-sm font-medium'>
                                                                    {
                                                                        conversion.meters_value
                                                                    }
                                                                    m →{' '}
                                                                    {
                                                                        conversion.feet_value
                                                                    }
                                                                    ft
                                                                </p>
                                                                <p className='text-xs text-muted-foreground'>
                                                                    {new Date(
                                                                        conversion.timestamp
                                                                    ).toLocaleString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}
