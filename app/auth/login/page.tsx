'use client'

import Link from 'next/link'
import { useState } from 'react'

import { ArrowLeft, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { initiateGoogleLogin } from '@/lib/google-auth'

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false)

    const handleGoogleLogin = () => {
        setIsLoading(true)
        // Django handles the complete OAuth flow
        initiateGoogleLogin()
    }

    return (
        <section className='flex-grow'>
            <div className='relative isolate px-6 pt-8 lg:px-8'>
                <div className='max-w-md mx-auto py-16'>
                    {/* Back button */}
                    <div className='mb-8'>
                        <Link href='/'>
                            <Button variant='ghost' size='sm' className='gap-2'>
                                <ArrowLeft className='w-4 h-4' />
                                Back to Home
                            </Button>
                        </Link>
                    </div>

                    {/* Login Card */}
                    <div className='bg-card border rounded-lg p-8'>
                        <div className='text-center space-y-6'>
                            <div>
                                <h1 className='text-2xl font-semibold text-foreground'>
                                    Welcome Back
                                </h1>
                                <p className='text-muted-foreground mt-2'>
                                    Sign in to your account to continue
                                </p>
                            </div>

                            <div className='space-y-4'>
                                <Button
                                    onClick={handleGoogleLogin}
                                    disabled={isLoading}
                                    size='lg'
                                    className='w-full text-lg py-3 gap-3'
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className='w-5 h-5 animate-spin' />
                                            Connecting...
                                        </>
                                    ) : (
                                        <>
                                            <svg
                                                className='w-5 h-5'
                                                viewBox='0 0 24 24'
                                                fill='currentColor'
                                            >
                                                <path
                                                    d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                                                    fill='#4285F4'
                                                />
                                                <path
                                                    d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                                                    fill='#34A853'
                                                />
                                                <path
                                                    d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                                                    fill='#FBBC05'
                                                />
                                                <path
                                                    d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                                                    fill='#EA4335'
                                                />
                                            </svg>
                                            Continue with Google
                                        </>
                                    )}
                                </Button>
                            </div>

                            <div className='text-xs text-muted-foreground'>
                                By continuing, you agree to our Terms of Service
                                and Privacy Policy
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
