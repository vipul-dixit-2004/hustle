'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, ArrowRight, ArrowLeft, Check, User, Briefcase, Code, Palette } from 'lucide-react'
import { getUser } from '@/lib/supabase/auth'
import { updateUserDetails, getUserProfile, type UserDetails } from '@/lib/supabase/actions'
import type { User as SupabaseUser } from '@supabase/supabase-js'

const ROLES = [
    { id: 'student', label: 'Student', icon: '🎓', description: 'Currently studying or in school' },
    { id: 'professional', label: 'Working Professional', icon: '💼', description: 'Full-time employed' },
    { id: 'freelancer', label: 'Freelancer', icon: '🚀', description: 'Self-employed or contractor' },
] as const

const ACTIVITIES = [
    { id: 'coding', label: 'Coding', icon: Code, color: 'from-blue-500 to-cyan-500' },
    { id: 'designing', label: 'Designing', icon: Palette, color: 'from-pink-500 to-rose-500' },
    { id: 'content', label: 'Content Creation', icon: Briefcase, color: 'from-amber-500 to-orange-500' },
    { id: 'learning', label: 'Learning', icon: User, color: 'from-emerald-500 to-teal-500' },
]

export default function OnboardingClient() {
    const router = useRouter()
    const [user, setUser] = useState<SupabaseUser | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [step, setStep] = useState(1)
    const [isEditing, setIsEditing] = useState(false)

    // Form state
    const [role, setRole] = useState<UserDetails['role']>()
    const [activities, setActivities] = useState<string[]>([])
    const [platforms, setPlatforms] = useState({
        leetcode: '',
        gfg: '',
        codechef: '',
    })

    useEffect(() => {
        const fetchUserAndProfile = async () => {
            const currentUser = await getUser()
            if (!currentUser) {
                router.push('/login')
                return
            }
            setUser(currentUser)

            // Fetch existing profile to pre-fill form
            const profile = await getUserProfile(currentUser.id)
            if (profile) {
                setIsEditing(profile.onboardingCompleted === true)
                if (profile.role) setRole(profile.role)
                if (profile.activities) setActivities(profile.activities)
                if (profile.platforms) {
                    setPlatforms({
                        leetcode: profile.platforms.leetcode || '',
                        gfg: profile.platforms.gfg || '',
                        codechef: profile.platforms.codechef || '',
                    })
                }
            }

            setLoading(false)
        }
        fetchUserAndProfile()
    }, [router])

    const handleActivityToggle = (activityId: string) => {
        setActivities(prev =>
            prev.includes(activityId)
                ? prev.filter(a => a !== activityId)
                : [...prev, activityId]
        )
    }

    const handleSubmit = async () => {
        if (!user) return

        setSubmitting(true)
        try {
            const details: UserDetails = {
                role,
                activities,
                platforms: activities.includes('coding') ? platforms : undefined,
                onboardingCompleted: true,
                onboardingCompletedAt: new Date().toISOString(),
            }

            await updateUserDetails(user.id, details)
            router.push('/dashboard')
        } catch (error) {
            console.error('Failed to save profile:', error)
        } finally {
            setSubmitting(false)
        }
    }

    const canProceed = () => {
        if (step === 1) return !!role
        if (step === 2) return activities.length > 0
        if (step === 3) return true // Platform usernames are optional
        return false
    }

    const nextStep = () => {
        if (step === 2 && !activities.includes('coding')) {
            // Skip platform step if not coding
            handleSubmit()
        } else if (step === 3) {
            handleSubmit()
        } else {
            setStep(s => s + 1)
        }
    }

    const prevStep = () => setStep(s => s - 1)

    const totalSteps = activities.includes('coding') ? 3 : 2

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#09090b]">
                <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4">
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

            <div className="relative w-full max-w-lg">
                {/* Progress bar */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-zinc-500">Step {step} of {totalSteps}</span>
                        <span className="text-sm text-purple-400">{Math.round((step / totalSteps) * 100)}%</span>
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-purple-500 to-violet-500 transition-all duration-500"
                            style={{ width: `${(step / totalSteps) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Card */}
                <div className="relative bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                    {/* Step 1: Role Selection */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl mb-4 shadow-lg shadow-purple-500/25">
                                    <User className="w-7 h-7 text-white" />
                                </div>
                                <h1 className="text-2xl font-bold text-white mb-2">
                                    {isEditing ? 'Edit Your Profile' : 'Welcome to Hustle!'}
                                </h1>
                                <p className="text-zinc-500">
                                    {isEditing ? 'Update your profile settings' : 'Let\'s personalize your experience. What describes you best?'}
                                </p>
                            </div>

                            <div className="space-y-3">
                                {ROLES.map((r) => (
                                    <button
                                        key={r.id}
                                        onClick={() => setRole(r.id)}
                                        className={`w-full p-4 rounded-xl border transition-all flex items-center gap-4 text-left ${role === r.id
                                            ? 'bg-purple-500/10 border-purple-500/50 shadow-lg shadow-purple-500/10'
                                            : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                                            }`}
                                    >
                                        <span className="text-2xl">{r.icon}</span>
                                        <div className="flex-1">
                                            <div className="font-medium text-white">{r.label}</div>
                                            <div className="text-sm text-zinc-500">{r.description}</div>
                                        </div>
                                        {role === r.id && (
                                            <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                                                <Check className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Activities */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-2xl mb-4 shadow-lg shadow-violet-500/25">
                                    <Briefcase className="w-7 h-7 text-white" />
                                </div>
                                <h1 className="text-2xl font-bold text-white mb-2">What will you be doing?</h1>
                                <p className="text-zinc-500">Select all that apply</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {ACTIVITIES.map((activity) => {
                                    const Icon = activity.icon
                                    const isSelected = activities.includes(activity.id)
                                    return (
                                        <button
                                            key={activity.id}
                                            onClick={() => handleActivityToggle(activity.id)}
                                            className={`p-4 rounded-xl border transition-all text-left ${isSelected
                                                ? 'bg-gradient-to-br ' + activity.color + '/10 border-white/20 shadow-lg'
                                                : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                                                }`}
                                        >
                                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${activity.color} flex items-center justify-center mb-3`}>
                                                <Icon className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="font-medium text-white">{activity.label}</div>
                                            {isSelected && (
                                                <div className="mt-2 w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                                                    <Check className="w-3 h-3 text-white" />
                                                </div>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Coding Platforms */}
                    {step === 3 && activities.includes('coding') && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/25">
                                    <Code className="w-7 h-7 text-white" />
                                </div>
                                <h1 className="text-2xl font-bold text-white mb-2">Coding Profiles</h1>
                                <p className="text-zinc-500">Link your competitive programming profiles (optional)</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-400">LeetCode Username</label>
                                    <input
                                        type="text"
                                        value={platforms.leetcode}
                                        onChange={(e) => setPlatforms(p => ({ ...p, leetcode: e.target.value }))}
                                        placeholder="your-leetcode-username"
                                        className="w-full px-4 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25 transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-400">GeeksForGeeks Username</label>
                                    <input
                                        type="text"
                                        value={platforms.gfg}
                                        onChange={(e) => setPlatforms(p => ({ ...p, gfg: e.target.value }))}
                                        placeholder="your-gfg-username"
                                        className="w-full px-4 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25 transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-400">CodeChef Username</label>
                                    <input
                                        type="text"
                                        value={platforms.codechef}
                                        onChange={(e) => setPlatforms(p => ({ ...p, codechef: e.target.value }))}
                                        placeholder="your-codechef-username"
                                        className="w-full px-4 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/25 transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation buttons */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
                        {step > 1 ? (
                            <button
                                onClick={prevStep}
                                className="flex items-center gap-2 px-4 py-2 text-zinc-400 hover:text-white transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </button>
                        ) : (
                            <div />
                        )}

                        <button
                            onClick={nextStep}
                            disabled={!canProceed() || submitting}
                            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-medium rounded-xl shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : step === totalSteps ? (
                                <>
                                    Complete
                                    <Check className="w-4 h-4" />
                                </>
                            ) : (
                                <>
                                    Continue
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Skip link */}
                <div className="text-center mt-6">
                    <button
                        onClick={handleSubmit}
                        className="text-sm text-zinc-600 hover:text-zinc-400 transition-colors"
                    >
                        Skip for now
                    </button>
                </div>
            </div>
        </div>
    )
}
