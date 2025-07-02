'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { LogOut } from 'lucide-react'

import { Button } from '@/components/ui/button'
import DarkModeButton from '@/components/ui/buttons/dark-mode-btn'

import { useAuth } from '@/components/auth-provider'

import { NAV_LINKS } from '@/constant/nav-links'

const MainHeader = () => {
    const pathname = usePathname()
    const { isAuthenticated, logout } = useAuth()

    const handleLogout = async () => {
        try {
            // Call Django logout endpoint
            await fetch(
                `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/logout/`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${document.cookie.split('access_token=')[1]?.split(';')[0]}`,
                    },
                }
            )
        } catch (error) {
            console.error('Logout API call failed:', error)
        } finally {
            // Always clear local state regardless of API response
            logout()
        }
    }

    return (
        <header className='sticky top-0 bg-background/90 backdrop-blur-sm z-10'>
            <div className='max-w-7xl mx-auto flex flex-row justify-between items-center px-4 py-8 z-50'>
                <div>
                    <Link
                        href='/'
                        className='text-3xl font-[family-name:var(--font-bebas-neue)] font-bold'
                    >
                        Calculation Oauth Test App
                    </Link>
                </div>
                <nav>
                    <ul className='flex flex-row space-x-6 items-center'>
                        {NAV_LINKS.map((link) => (
                            <li
                                key={link.href}
                                className={`px-2 py-1 ${pathname === link.href ? 'font-bold text-primary' : 'hover:underline'} `}
                            >
                                <Link href={link.href}>{link.label}</Link>
                            </li>
                        ))}
                        <li>
                            <DarkModeButton />
                        </li>
                        {isAuthenticated && (
                            <li>
                                <Button
                                    onClick={handleLogout}
                                    variant='outline'
                                    size='sm'
                                    className='gap-2'
                                >
                                    <LogOut className='w-4 h-4' />
                                    Sign Out
                                </Button>
                            </li>
                        )}
                    </ul>
                </nav>
            </div>
        </header>
    )
}

export default MainHeader
