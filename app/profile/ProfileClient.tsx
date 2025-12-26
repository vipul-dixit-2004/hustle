'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    Loader2, ArrowLeft, User, Briefcase, Code, ExternalLink,
    AlertCircle, Edit3, Zap
} from 'lucide-react'
import { getUser } from '@/lib/supabase/auth'
import { getUserProfile, type UserDetails } from '@/lib/supabase/actions'
import type { User as SupabaseUser } from '@supabase/supabase-js'

const ROLE_LABELS: Record<string, { label: string; icon: string }> = {
    student: { label: 'Student', icon: '🎓' },
    professional: { label: 'Working Professional', icon: '💼' },
    freelancer: { label: 'Freelancer', icon: '🚀' },
}

const ACTIVITY_LABELS: Record<string, string> = {
    coding: 'Coding',
    designing: 'Designing',
    content: 'Content Creation',
    learning: 'Learning',
}

export default function ProfileClient() {
    const router = useRouter()
    const [user, setUser] = useState<SupabaseUser | null>(null)
    const [profile, setProfile] = useState<UserDetails | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchUserAndProfile = async () => {
            const currentUser = await getUser()
            if (!currentUser) {
                router.push('/login')
                return
            }
            setUser(currentUser)

            const userProfile = await getUserProfile(currentUser.id)
            setProfile(userProfile)
            setLoading(false)
        }
        fetchUserAndProfile()
    }, [router])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#09090b]">
                <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
            </div>
        )
    }

    const hasCompletedOnboarding = profile?.onboardingCompleted === true

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
                <div className="max-w-4xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between h-14">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/dashboard"
                                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span className="hidden sm:inline">Back to Dashboard</span>
                            </Link>
                        </div>

                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 via-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40 transition-shadow">
                                <Zap className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-lg font-semibold tracking-tight">Hustle</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8">
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Profile</h1>
                    <p className="text-zinc-500">Manage your account and preferences</p>
                </div>

                {/* Email Card with Role Badge */}
                <div className="mb-6 p-6 rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/10">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                            <User className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                                <div className="text-white font-medium">{user?.email}</div>
                                {profile?.role && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-gradient-to-r from-purple-500/20 to-violet-500/20 border border-purple-500/30 rounded-full text-xs font-medium text-purple-300">
                                        <span>{ROLE_LABELS[profile.role]?.icon || '👤'}</span>
                                        {ROLE_LABELS[profile.role]?.label || profile.role}
                                    </span>
                                )}
                            </div>
                            <div className="text-sm text-zinc-500">Account</div>
                        </div>
                        <Link
                            href="/onboarding"
                            className="flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                        >
                            <Edit3 className="w-4 h-4" />
                            Edit
                        </Link>
                    </div>
                </div>

                {/* Onboarding Status - Only show if NOT completed */}
                {!hasCompletedOnboarding && (
                    <div className="mb-6 p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/25">
                                <AlertCircle className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <div className="text-amber-400 font-medium mb-1">Complete Your Profile</div>
                                <p className="text-zinc-400 text-sm mb-4">
                                    Complete the onboarding to get personalized recommendations and unlock additional features.
                                </p>
                                <Link
                                    href="/onboarding"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-medium rounded-xl shadow-lg shadow-amber-500/20 transition-all"
                                >
                                    <Edit3 className="w-4 h-4" />
                                    Complete Onboarding
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Profile Details - Show if ANY data exists */}
                {profile && (
                    <div className="space-y-4">
                        {/* Activities */}
                        {profile.activities && profile.activities.length > 0 && (
                            <div className="p-6 rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/10">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                                        <Briefcase className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm text-zinc-500 mb-2">Activities</div>
                                        <div className="flex flex-wrap gap-2">
                                            {profile.activities.map((activity) => (
                                                <span
                                                    key={activity}
                                                    className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm text-zinc-300"
                                                >
                                                    {ACTIVITY_LABELS[activity] || activity}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Coding Platforms */}
                        {profile.platforms && (profile.platforms.leetcode || profile.platforms.gfg || profile.platforms.codechef) && (
                            <div className="p-6 rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/10">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                                        <Code className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm text-zinc-500 mb-3">Coding Profiles</div>
                                        <div className="space-y-3">
                                            {profile.platforms.leetcode && (
                                                <a
                                                    href={`https://leetcode.com/${profile.platforms.leetcode}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded-xl hover:bg-zinc-900/80 transition-colors group"
                                                >
                                                    <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
                                                        <span className="text-amber-400 font-bold text-sm">LC</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="text-sm text-zinc-400">LeetCode</div>
                                                        <div className="text-white">{profile.platforms.leetcode}</div>
                                                    </div>
                                                    <ExternalLink className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                                                </a>
                                            )}
                                            {profile.platforms.gfg && (
                                                <a
                                                    href={`https://auth.geeksforgeeks.org/user/${profile.platforms.gfg}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded-xl hover:bg-zinc-900/80 transition-colors group"
                                                >
                                                    <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                                                        <span className="text-emerald-400 font-bold text-sm">GFG</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="text-sm text-zinc-400">GeeksForGeeks</div>
                                                        <div className="text-white">{profile.platforms.gfg}</div>
                                                    </div>
                                                    <ExternalLink className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                                                </a>
                                            )}
                                            {profile.platforms.codechef && (
                                                <a
                                                    href={`https://www.codechef.com/users/${profile.platforms.codechef}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded-xl hover:bg-zinc-900/80 transition-colors group"
                                                >
                                                    <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                                                        <span className="text-orange-400 font-bold text-sm">CC</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="text-sm text-zinc-400">CodeChef</div>
                                                        <div className="text-white">{profile.platforms.codechef}</div>
                                                    </div>
                                                    <ExternalLink className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    )
}
