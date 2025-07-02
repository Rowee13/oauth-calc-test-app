'use client'

import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'

import { useAuth } from '@/components/auth-provider'

export default function Home() {
    const { user, isAuthenticated, isLoading, logout, login } = useAuth()
    const router = useRouter()

    const handleGetStarted = () => {
        router.push('/auth/login')
    }

    // Test login function for demonstration
    // const handleTestLogin = () => {
    //     const testUser = {
    //         id: 'test-user-123',
    //         name: 'Test User',
    //         email: 'test@example.com',
    //         avatar: 'https://via.placeholder.com/100',
    //     }
    //     login(testUser)
    // }

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
                            <div className='mt-8 space-y-4'>
                                <div>
                                    <Button
                                        onClick={handleGetStarted}
                                        size='lg'
                                        className='text-lg px-8 py-3'
                                    >
                                        Get Started
                                    </Button>
                                </div>
                                {/* <div className='text-sm text-muted-foreground'>
                                    or
                                </div>
                                <div>
                                    <Button
                                        onClick={handleTestLogin}
                                        variant='outline'
                                        size='lg'
                                        className='text-lg px-8 py-3'
                                    >
                                        Test Login (Demo)
                                    </Button>
                                </div> */}
                            </div>
                        ) : (
                            <div className='mt-8 space-y-6'>
                                <div className='bg-card border rounded-lg p-6 max-w-md'>
                                    <div className='space-y-4'>
                                        <div className='flex items-center space-x-4'>
                                            {user?.avatar && (
                                                <img
                                                    src={user.avatar}
                                                    alt={user.name}
                                                    className='w-12 h-12 rounded-full'
                                                />
                                            )}
                                            <div>
                                                <h2 className='text-lg font-semibold text-foreground'>
                                                    Welcome, {user?.name}!
                                                </h2>
                                                <p className='text-muted-foreground text-sm'>
                                                    {user?.email}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <Button
                                        onClick={logout}
                                        variant='outline'
                                        size='lg'
                                    >
                                        Logout
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}
