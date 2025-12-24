'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut, Loader2, Zap, Flame, Trophy, Calendar } from 'lucide-react'
import { signOut, getUser, onAuthStateChange } from '@/lib/supabase/auth'
import { getUserStats } from '@/lib/supabase/actions'
import { ActionTracker } from '@/components/ActionTracker'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface UserStats {
    totalDaysTracked: number
    overallCompletion: number
    currentStreak: number
    perfectDays: number
}

export default function Dashboard() {
    const router = useRouter()
    const [user, setUser] = useState<SupabaseUser | null>(null)
    const [loading, setLoading] = useState(true)
    const [loggingOut, setLoggingOut] = useState(false)
    const [stats, setStats] = useState<UserStats | null>(null)

    const fetchStats = useCallback(async (userId: string) => {
        try {
            const userStats = await getUserStats(userId)
            setStats(userStats)
        } catch (error) {
            console.error('Failed to fetch stats:', error)
        }
    }, [])

    useEffect(() => {
        const fetchUser = async () => {
            const currentUser = await getUser()
            setUser(currentUser)
            setLoading(false)
            if (currentUser) {
                fetchStats(currentUser.id)
            }
        }

        fetchUser()

        const { data: { subscription } } = onAuthStateChange((user) => {
            setUser(user as SupabaseUser | null)
            if (user) {
                fetchStats((user as SupabaseUser).id)
            }
        })

        return () => subscription.unsubscribe()
    }, [fetchStats])

    const handleLogout = async () => {
        setLoggingOut(true)
        try {
            await signOut()
            router.push('/login')
        } catch (error) {
            console.error('Logout failed:', error)
        } finally {
            setLoggingOut(false)
        }
    }

    // Callback to refresh stats when actions are updated
    const handleStatsUpdate = useCallback(() => {
        if (user) {
            fetchStats(user.id)
        }
    }, [user, fetchStats])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#09090b]">
                <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#09090b]">
            {/* Gradient orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
                <div className="absolute top-1/2 -right-40 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 left-1/3 w-64 h-64 bg-fuchsia-600/10 rounded-full blur-3xl" />
            </div>

            {/* Grid pattern */}
            <div
                className="fixed inset-0 pointer-events-none opacity-[0.015]"
                style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: '48px 48px'
                }}
            />

            {/* Header */}
            <header className="relative z-10 border-b border-white/5 backdrop-blur-sm">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between h-14">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 via-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40 transition-shadow">
                                <Zap className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-lg font-semibold tracking-tight">Hustle</span>
                        </Link>

                        {/* Right side */}
                        <div className="flex items-center gap-2 sm:gap-4">
                            {/* Streak badge */}
                            {stats && stats.currentStreak > 0 && (
                                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-full">
                                    <Flame className="w-3.5 h-3.5 text-orange-400" />
                                    <span className="text-xs font-medium text-orange-400">{stats.currentStreak} day streak</span>
                                </div>
                            )}

                            <span className="hidden sm:block text-sm text-zinc-500 max-w-[150px] truncate">
                                {user?.email}
                            </span>
                            <button
                                onClick={handleLogout}
                                disabled={loggingOut}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-all disabled:opacity-50"
                            >
                                {loggingOut ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <LogOut className="w-4 h-4" />
                                )}
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                {/* Welcome section */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}
                        </h1>
                        <span className="text-xl sm:text-2xl">👋</span>
                    </div>
                    <p className="text-sm sm:text-base text-zinc-500">
                        Track your habits and build consistency
                    </p>
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/10">
                        <div className="flex items-center gap-1">
                            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                            <span className="text-2xl sm:text-3xl font-bold text-purple-400">
                                {stats?.totalDaysTracked ?? '-'}
                            </span>
                        </div>
                        <div className="text-xs sm:text-sm text-zinc-500">days tracked</div>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/10">
                        <div className="text-2xl sm:text-3xl font-bold text-emerald-400">
                            {stats?.overallCompletion ?? 0}%
                        </div>
                        <div className="text-xs sm:text-sm text-zinc-500">completion</div>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/10">
                        <div className="flex items-center gap-1">
                            <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />
                            <span className="text-2xl sm:text-3xl font-bold text-orange-400">
                                {stats?.currentStreak ?? 0}
                            </span>
                        </div>
                        <div className="text-xs sm:text-sm text-zinc-500">day streak</div>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/10">
                        <div className="flex items-center gap-1">
                            <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
                            <span className="text-2xl sm:text-3xl font-bold text-amber-400">
                                {stats?.perfectDays ?? 0}
                            </span>
                        </div>
                        <div className="text-xs sm:text-sm text-zinc-500">perfect days</div>
                    </div>
                </div>

                {user && <ActionTracker userId={user.id} onStatsUpdate={handleStatsUpdate} />}
            </main>
        </div>
    )
}